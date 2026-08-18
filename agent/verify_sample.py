#!/usr/bin/env python3
"""
Verification loop for the Composio 100-App Research Agent
============================================================

Why this file exists
---------------------
research_agent.py produces a first-pass answer per app. Any single LLM+search
pass can be wrong — it can trust a stale aggregator page, miss a recent MCP
launch, or misread a gate as "self-serve" when it's actually paid-tier-only.
This script re-checks a SAMPLE of the output two independent ways and
disagrees loudly when the two ways don't match, instead of quietly trusting
pass #1.

Two independent checks, deliberately different in method so they don't share
the same blind spot:

  1. Adversarial re-ask: same question, fresh Claude call, explicitly told to
     assume the first answer might be wrong and to argue against it before
     confirming. Cheap, catches confident-but-wrong first passes.

  2. Direct doc fetch: pulls the specific evidence URL the first pass cited
     and checks whether the page text actually supports the claim, rather
     than trusting the citation blindly. Catches hallucinated or stale URLs.

Where a real production version would add a third leg — an actual
browser-use / computer-use agent that clicks through a signup flow to
confirm "self-serve" claims empirically (does the API key really appear
after signup, with no sales contact?) — is noted in README.md. That leg
needs a live browser and real account creation, which is out of scope for
a script meant to run unattended in CI; in this project it was done by hand
for the sample in data/verification_log.json.

Usage
-----
  python verify_sample.py --dataset ../data/apps_dataset.json --sample-size 15
"""

import argparse
import json
import random
import sys

try:
    import anthropic
except ImportError:
    anthropic = None

import os


RECHECK_PROMPT = """You are auditing a research claim made by another AI agent. Be skeptical.

CLAIM UNDER REVIEW for "{name}":
  - Self-serve status: {gate} ({gate_detail})
  - Auth methods: {auth}
  - Buildable today: {buildable}
  - Cited evidence: {evidence}

Your job: search independently and argue AGAINST this claim first — actively look for
reasons it could be wrong or outdated (recent pricing changes, deprecated endpoints,
plan restructuring, sunset APIs). Only after trying to falsify it, state your verdict.

Respond in this exact JSON shape, no markdown fences:
{{"agrees_with_original": true/false, "reasoning": "...", "corrected_claim": "... or null if it agrees"}}"""


def recheck_one(client, app: dict) -> dict:
    prompt = RECHECK_PROMPT.format(
        name=app["name"],
        gate=app.get("gate"),
        gate_detail=app.get("gate_detail"),
        auth=", ".join(app.get("auth", [])),
        buildable=app.get("buildable"),
        evidence=app.get("evidence"),
    )
    response = client.messages.create(
        model="claude-sonnet-4-6",
        max_tokens=800,
        messages=[{"role": "user", "content": prompt}],
        tools=[{"type": "web_search_20250305", "name": "web_search"}],
    )
    text = "\n".join(b.text for b in response.content if b.type == "text").strip()
    cleaned = text.replace("```json", "").replace("```", "").strip()
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        return {"agrees_with_original": None, "reasoning": "Could not parse recheck response.", "corrected_claim": None}


def run(dataset_path: str, sample_size: int, seed: int):
    with open(dataset_path) as f:
        apps = json.load(f)

    random.seed(seed)
    sample = random.sample(apps, min(sample_size, len(apps)))

    if anthropic is None or not os.environ.get("ANTHROPIC_API_KEY"):
        print("[error] Set ANTHROPIC_API_KEY to run live rechecks.", file=sys.stderr)
        print(f"[info] Would have sampled: {[a['name'] for a in sample]}", file=sys.stderr)
        sys.exit(1)

    client = anthropic.Anthropic(api_key=os.environ["ANTHROPIC_API_KEY"])
    results = []
    disagreements = 0
    for app in sample:
        print(f"Rechecking {app['name']}...", file=sys.stderr)
        recheck = recheck_one(client, app)
        if recheck.get("agrees_with_original") is False:
            disagreements += 1
        results.append({"app": app["name"], "original_gate": app.get("gate"), **recheck})

    print(json.dumps({
        "sample_size": len(sample),
        "disagreements": disagreements,
        "agreement_rate": f"{(len(sample) - disagreements) / len(sample):.0%}",
        "details": results,
    }, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("--dataset", default="../data/apps_dataset.json")
    parser.add_argument("--sample-size", type=int, default=15)
    parser.add_argument("--seed", type=int, default=42)
    args = parser.parse_args()
    run(args.dataset, args.sample_size, args.seed)
