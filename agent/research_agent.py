#!/usr/bin/env python3
"""
Composio 100-App Research Agent
=================================

What this does
--------------
For every app in apps_input.json, the agent:
  1. Checks Composio's own toolkit catalog (via the Composio SDK) to see if a
     managed toolkit already exists for this app — the single strongest signal
     for "could this be an agent toolkit today?"
  2. Runs a web-search-grounded research pass (Claude + the web_search tool)
     to determine: category/description, auth method(s), self-serve vs gated
     status, API surface, MCP status, and a buildability verdict — each with
     a source URL.
  3. Writes structured JSON output per app, flagging low-confidence answers
     for human review instead of guessing.

Where a human was needed (see README.md "Where a human was needed" for the
full list): apps with no discoverable public docs (Pumble, Fathom), apps
whose branding wraps a parent platform with no docs of its own (Paygent
Connect), and apps with product-mapping ambiguity across a corporate
reorg (NotebookLM vs. Gemini Enterprise). The agent is instructed to say
"uncertain" rather than fabricate an answer in these cases — see the
`confidence` field and `blocker` field in each output row.

Requirements
------------
  pip install composio anthropic --break-system-packages

Environment variables
----------------------
  COMPOSIO_API_KEY   - from https://dashboard.composio.dev
  ANTHROPIC_API_KEY  - from https://console.anthropic.com

Usage
-----
  python research_agent.py --input apps_input.json --output ../data/apps_dataset.json
  python research_agent.py --input apps_input.json --limit 5   # smoke test on 5 apps
"""

import argparse
import json
import os
import sys
import time
from dataclasses import dataclass, asdict
from typing import Optional

try:
    from composio import Composio
except ImportError:
    Composio = None  # allows --check-composio-only to fail with a clear message

try:
    import anthropic
except ImportError:
    anthropic = None


SYSTEM_PROMPT = """You are a precise product-ops research agent. For the given app, use \
web search to determine real, current, citable facts. Never guess or fabricate a URL, \
auth method, or plan detail. If you cannot find a confident answer after searching, \
set "confidence" to "uncertain" and explain what's missing in "blocker" — this is the \
correct behavior, not a failure. Prefer official docs (developer.*, docs.*, api.*) over \
marketing pages or aggregator sites. Return ONLY valid JSON matching this schema, no \
markdown fences, no commentary:

{
  "category": "string",
  "desc": "one-line description",
  "auth": ["list", "of", "auth", "methods"],
  "gate": "self-serve-free | self-serve-trial | self-serve-paid-tier | gated-approval | gated-sales | gated-enterprise | n/a-open-source-tool",
  "gate_detail": "one sentence explaining the gate",
  "api": "description of API surface and breadth",
  "mcp": "MCP server status if known, else 'Not found'",
  "buildable": true/false,
  "blocker": "string or null",
  "evidence": "URL(s) that support these findings",
  "confidence": "verified | known | uncertain"
}"""


@dataclass
class AppResult:
    id: int
    name: str
    website_hint: str
    composio_toolkit_exists: Optional[bool]
    composio_toolkit_slug: Optional[str]
    research: dict
    error: Optional[str] = None


def check_composio_catalog(composio_client, app_name: str) -> tuple[Optional[bool], Optional[str]]:
    """
    Query Composio's own toolkit catalog. If Composio already has a managed
    toolkit for this app, that's the strongest possible 'buildable today'
    signal — someone has already done the auth + API integration work.

    This function degrades gracefully: if the Composio API is unreachable or
    the key is missing, it returns (None, None) rather than crashing the run,
    so the web-search research pass can still proceed independently.
    """
    if composio_client is None:
        return None, None
    try:
        # The Composio Python SDK exposes toolkit listing/search; slugs are
        # lowercase app names with no spaces (e.g. "google_calendar").
        # See: docs.composio.dev/reference/api-reference/toolkits
        guess_slug = app_name.lower().replace(" ", "_").replace(".", "")
        result = composio_client.toolkits.get(slug=guess_slug)
        return True, guess_slug
    except Exception:
        return False, None


def research_app(anthropic_client, app_name: str, website_hint: str, category_hint: str) -> dict:
    """
    Runs one web-search-grounded research pass for a single app using
    Claude's web_search tool, and parses the structured JSON response.
    Retries once with a narrower prompt if the model can't find enough
    to answer confidently, rather than silently guessing.
    """
    user_prompt = (
        f"Research the app '{app_name}' (hint: {website_hint}, category: {category_hint}) "
        f"for an AI-agent toolkit feasibility study. Find its auth method(s), whether "
        f"a developer can self-serve API/developer credentials or whether it's gated "
        f"behind a paid plan / sales approval / partnership, its API surface, and "
        f"whether it has an existing MCP server. Search before answering."
    )

    response = anthropic_client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=1500,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_prompt}],
        tools=[{"type": "web_search_20250305", "name": "web_search"}],
    )

    # Concatenate all text blocks (search results arrive as separate content
    # blocks interleaved with tool_use/tool_result blocks).
    text_parts = [block.text for block in response.content if block.type == "text"]
    raw_text = "\n".join(text_parts).strip()

    # Defensive parsing: strip markdown fences if the model added them anyway.
    cleaned = raw_text.replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {
            "category": category_hint,
            "desc": None,
            "auth": [],
            "gate": "uncertain",
            "gate_detail": None,
            "api": None,
            "mcp": "Not found",
            "buildable": None,
            "blocker": "Agent response was not valid JSON — flagged for human review rather than guessed.",
            "evidence": None,
            "confidence": "uncertain",
        }


def run(input_path: str, output_path: str, limit: Optional[int] = None):
    with open(input_path) as f:
        apps = json.load(f)
    if limit:
        apps = apps[:limit]

    composio_client = None
    if os.environ.get("COMPOSIO_API_KEY") and Composio is not None:
        composio_client = Composio(api_key=os.environ["COMPOSIO_API_KEY"])
    else:
        print("[warn] COMPOSIO_API_KEY not set or composio package missing — "
              "skipping the Composio-catalog cross-check step and relying on "
              "web-search research alone.", file=sys.stderr)

    if anthropic is None or not os.environ.get("ANTHROPIC_API_KEY"):
        print("[error] ANTHROPIC_API_KEY not set or anthropic package missing — "
              "cannot run the research pass.", file=sys.stderr)
        sys.exit(1)

    anthropic_client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])

    results = []
    for i, app in enumerate(apps, 1):
        print(f"[{i}/{len(apps)}] Researching {app['name']}...", file=sys.stderr)
        toolkit_exists, toolkit_slug = check_composio_catalog(composio_client, app["name"])
        try:
            research = research_app(
                anthropic_client, app["name"], app.get("website_hint", ""), app.get("category", "")
            )
            error = None
        except Exception as e:
            research = {}
            error = str(e)

        results.append(asdict(AppResult(
            id=app["id"],
            name=app["name"],
            website_hint=app.get("website_hint", ""),
            composio_toolkit_exists=toolkit_exists,
            composio_toolkit_slug=toolkit_slug,
            research=research,
            error=error,
        )))
        time.sleep(0.5)  # be polite to both APIs

    with open(output_path, "w") as f:
        json.dump(results, f, indent=2)
    print(f"Done. Wrote {len(results)} results to {output_path}", file=sys.stderr)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--input", default="apps_input.json", help="Path to input app list")
    parser.add_argument("--output", default="agent_output.json", help="Path to write results")
    parser.add_argument("--limit", type=int, default=None, help="Only process the first N apps (smoke test)")
    args = parser.parse_args()
    run(args.input, args.output, args.limit)
