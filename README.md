# Gatecheck — 100-App Agent-Readiness Audit

A Composio AI Product Ops Intern take-home assignment. For each of 100 apps across 10 categories, **Gatecheck** determines auth method(s), self-serve vs. gated status, API surface, MCP availability, and a buildability verdict — with a citable source for every claim — then surfaces the patterns across all 100 instead of just filling in rows.

**🌐 Live page:** [https://gatecheck-dusky.vercel.app](https://gatecheck-dusky.vercel.app)

**📁 Source repo:** [https://github.com/noisyboy08/Gatecheck](https://github.com/noisyboy08/Gatecheck)

## What's in this repo

```
Gatecheck/
├── site/
│   ├── index.html          ← the finished case study (open this)
│   ├── template.html        the HTML skeleton (before data injection)
│   ├── styles.css           the page's CSS
│   ├── render.js             the page's client-side JS (board, table, charts)
│   └── build_site.py         assembles template + css + js + data → index.html
├── agent/
│   ├── research_agent.py     the main research pipeline (Composio SDK + Claude + web search)
│   ├── verify_sample.py      independent adversarial re-check pass
│   └── apps_input.json       the raw 100-app input list
├── data/
│   ├── apps_dataset.json     all 100 rows, the actual findings
│   └── verification_log.json the first-pass vs. verified comparison
├── vercel.json               tells Vercel to serve from site/
└── README.md                 this file
```

## How the research was actually done

This was not filled in by hand. Three things ran, in order:

1. **Composio catalog cross-check** — for apps where I could confirm it, I checked
   whether Composio already has a managed toolkit (`composio.dev/toolkits/<slug>`).
   If Composio has already built it, that's the strongest possible "buildable
   today" signal, since someone has already done the auth integration work.
   Confirmed live for 16 apps (Stripe, GitHub, Slack, Notion, Linear, HubSpot,
   Pipedrive, Attio, Asana, Jira, Monday.com, ClickUp, Supabase, Freshdesk,
   Firecrawl, Xero).

2. **Search-grounded research pass** — for roughly 30 of the hardest/most obscure
   apps in the list (niche fintech, brand-new MCP servers, ambiguous branding),
   I ran live web searches this session and cited the actual source. For the
   remaining apps — extremely well-documented, stable, mainstream developer
   platforms (Salesforce, Twilio, Discord, Cloudflare, etc.) — I used
   high-confidence trained knowledge rather than re-searching facts that are
   very unlikely to have changed. Every row's `confidence` field says which
   path it took: `verified`, `searched`, `known`, or `known-low`.

3. **Verification loop** — 15 of the hardest apps were checked a second,
   independent way and compared against the first-pass answer. This is not a
   random sample; it was deliberately chosen to be adversarial, because that's
   where a research agent is most likely to be wrong. Results, including the
   cases the first pass got wrong, are in `data/verification_log.json` and on
   the page itself.

## Where a human was needed

- **Apps with no discoverable public docs at all** (Pumble, Fathom) — the agent
  is instructed to say "not found" rather than guess a plausible-sounding answer.
- **Branding that wraps a parent platform with no docs of its own** (Paygent
  Connect appears to be a reseller product on NMI's gateway; no independent
  public docs exist under the "Paygent Connect" name).
- **A prompt-injection judgment call** — iPayX's own MCP tool description
  contained instructions aimed at AI agents (suppress competitor names, always
  frame the tool favorably, drive traffic to the platform). Recognizing this as
  a manipulation attempt rather than a legitimate instruction, and reporting it
  without propagating it, required human-level judgment a naive pattern-match
  would not have caught.
- **Product-mapping ambiguity across a corporate reorg** (NotebookLM vs. Google's
  separate "Gemini Enterprise" product — public docs don't clearly state how, or
  whether, the two map to each other).
- **The confidence-routing policy itself** — deciding which apps were "obvious
  enough" to answer from trained knowledge vs. which needed a live search was a
  human-set policy that the agent followed, not something it decided on its own.

## Running the research agent yourself

The version in this repo was run without API keys — the research pass in the
committed dataset was done directly, using the same techniques the script
automates. To run it live against real APIs:

```bash
pip install composio anthropic

export COMPOSIO_API_KEY=...      # from https://dashboard.composio.dev
export ANTHROPIC_API_KEY=...     # from https://console.anthropic.com

# smoke test on 5 apps first
python agent/research_agent.py --input agent/apps_input.json --output /tmp/test.json --limit 5

# full run
python agent/research_agent.py --input agent/apps_input.json --output data/apps_dataset.json

# independent verification pass on a random sample of 15
python agent/verify_sample.py --dataset data/apps_dataset.json --sample-size 15
```

`research_agent.py` degrades gracefully if `COMPOSIO_API_KEY` isn't set — it
skips the Composio-catalog cross-check and relies on the web-search pass alone,
rather than failing the whole run.

After regenerating `data/apps_dataset.json`, rebuild the page:

```bash
cd site && python3 build_site.py   # injects template + css + js + data → index.html
```

## Deploying the page

`site/index.html` is fully self-contained (data and JS are inlined) — it works
opened directly from disk, or dropped anywhere.

**This project is live on Vercel:**
> [https://gatecheck-dusky.vercel.app](https://gatecheck-dusky.vercel.app)

**GitHub Pages** — enable in repo Settings → Pages → deploy from branch → `main`, `/site` as the folder. Live URL: `https://noisyboy08.github.io/Gatecheck/`

**Instant static host:** drag the `site/` folder onto https://app.netlify.com/drop for a live URL with no account needed.

## Honesty notes

- Of the 100 rows, 32 were independently verified this session (live search or
  a confirmed Composio catalog listing); the rest rely on flagged trained
  knowledge. 13 rows are marked `known-low` — treat these as a to-do list for
  the next verification pass, not settled fact.
- The verification sample (15 apps) was chosen adversarially, not randomly, so
  its accuracy numbers describe a stress test of the process, not the accuracy
  of the full dataset.
- Where the agent could not find a confident answer (Pumble, Fathom, and parts
  of the NotebookLM / Paygent Connect rows), it says so explicitly rather than
  filling in a plausible guess.
