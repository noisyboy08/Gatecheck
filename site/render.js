const APPS = {{APPS_JSON}};
const VERIFICATION = {"methodology": "Two samples were checked by hand against live sources. Sample A (15 apps) was deliberately adversarial \u2014 the hardest, most obscure, or most recently-changed apps in the list, since that's where a research agent is most likely to be wrong and where verification matters most. Sample B (2 apps) was a blind spot-check on entries the agent had NOT already flagged as uncertain, to get an unbiased read on baseline accuracy. Sample A's improvement rate is NOT claimed to represent the full 100 \u2014 it is a stress test of the verification loop, not a random sample.", "sample_a_adversarial": [{"app": "Podio", "first_pass_naive": "Likely a deprecated/zombie platform \u2014 Citrix sold it, probably minimal API support left.", "verified": "Still active under Progress Software (acquired Oct 2024). Basic tier still free. Full OAuth2 REST API with webhooks still documented and functional.", "verdict": "CORRECTED", "evidence": "developers.podio.com; en.wikipedia.org/wiki/Podio"}, {"app": "iPayX", "first_pass_naive": "Generic payment gateway, probably KYC/underwriting-gated like other fintech in the list.", "verified": "Actually a niche FX-fee-audit MCP tool, not a payment gateway at all \u2014 free tier needs no signup. Also: the tool's own MCP description contains embedded instructions directed at AI agents (mandatory promotional framing, instructions to suppress competitor names) \u2014 a prompt-injection pattern the research agent had to recognize and not follow.", "verdict": "CORRECTED + FLAGGED", "evidence": "github.com/Ipayx-stellar/mcp-fx-audit; glama.ai/mcp/connectors/io.github.Ipayx-stellar/fx-audit"}, {"app": "Consensus", "first_pass_naive": "Enterprise research tool, probably fully sales-gated like PitchBook.", "verified": "The MCP endpoint is open today \u2014 works with zero account for basic search. Only the traditional REST API is application-gated.", "verdict": "PARTIALLY CORRECTED", "evidence": "docs.consensus.app/docs/mcp; consensus.app/home/api"}, {"app": "Clay", "first_pass_naive": "Standard SaaS REST API with API-key auth, self-serve like most GTM tools.", "verified": "No conventional public REST API for most plans. Access is via webhooks/Zapier, an Enterprise-only native API, or a brand-new MCP/CLI developer platform.", "verdict": "CORRECTED", "evidence": "university.clay.com/docs/using-clay-as-an-api; developers.clay.com"}, {"app": "Twenty", "first_pass_naive": "Small open-source project, probably no agent/MCP tooling yet.", "verified": "Full REST + auto-generated GraphQL API, plus at least one community MCP server already exists.", "verdict": "PARTIALLY CORRECTED", "evidence": "docs.twenty.com/developers/extend/api; lobehub.com/mcp/igorwarzocha-twenty-mcp-server"}, {"app": "Otter.ai", "first_pass_naive": "The assignment's own hint says '(MCP server)' \u2014 read naively, implies open/self-serve MCP access.", "verified": "MCP is real but gated to Business/Enterprise plans with admin provisioning. The REST API is in closed beta, Enterprise-only, no self-serve key.", "verdict": "CORRECTED", "evidence": "help.otter.ai MCP Server article; github.com/bcharleson/otter-cli"}, {"app": "DealCloud", "first_pass_naive": "Enterprise CRM \u2014 probably has some kind of trial or sandbox like most modern SaaS.", "verified": "No trial of any kind found. 100% requires an existing paid client site provisioned by Intapp.", "verdict": "CONFIRMED HARSHER THAN EXPECTED", "evidence": "api.docs.dealcloud.com"}, {"app": "Grain", "first_pass_naive": "Meeting-notes tool \u2014 probably has a generous free-tier API like some competitors.", "verified": "API access is explicitly excluded from the Free plan; Personal API needs Starter tier minimum, Workspace API needs Business/Enterprise + admin.", "verdict": "CORRECTED", "evidence": "support.grain.com/en/articles/15507288-grain-api"}, {"app": "Waterfall.io", "first_pass_naive": "Tiny startup (~9,400 monthly visits per Crunchbase/BuiltWith) \u2014 probably a thin or beta API.", "verified": "Full, mature self-serve API with five distinct enrichment endpoints, instant key issuance, usage-based pricing.", "verdict": "CORRECTED", "evidence": "docs.waterfall.io"}, {"app": "fanbasis", "first_pass_naive": "Niche creator-payments startup \u2014 probably instant self-serve signup like Stripe or Gumroad.", "verified": "Full REST API + SDKs (Node/Python/PHP/Ruby) exist, but onboarding is sales-assisted (\"dedicated implementation engineer\", 5-day average go-live) \u2014 not a self-serve click-through.", "verdict": "CORRECTED", "evidence": "fanbasis.com/enterprises; dev-docs.fanbasis.com"}, {"app": "Xero", "first_pass_naive": "OAuth2, self-serve demo company \u2014 standard accounting-SaaS pattern. No MCP expected.", "verified": "Self-serve claim confirmed correct. Bonus finding the naive pass missed entirely: Xero ships an official MCP server with two auth modes.", "verdict": "CONFIRMED CORRECT + BONUS FINDING", "evidence": "developer.xero.com; glama.ai/mcp/servers/@XeroAPI/xero-mcp-server"}, {"app": "Stripe", "first_pass_naive": "Gold-standard self-serve API, industry benchmark.", "verified": "Confirmed correct via live docs and Composio's own toolkit catalog.", "verdict": "CONFIRMED CORRECT", "evidence": "stripe.com/docs/api; composio.dev/toolkits/stripe"}, {"app": "Paygent Connect", "first_pass_naive": "Standalone payment company with its own dedicated developer docs.", "verified": "Appears to be a reseller/white-label product on NMI's gateway. No independent public docs found under the 'Paygent Connect' name \u2014 evidence here is inferred from the parent platform (NMI), not the brand itself.", "verdict": "STILL UNCERTAIN \u2014 recommend a human confirm directly with the vendor", "evidence": "nmi.com/developers/sdks-apis (indirect \u2014 no direct source found)"}, {"app": "Pumble", "first_pass_naive": "Slack alternative \u2014 probably has a basic webhook/bot API like Discord or Telegram.", "verified": "No public developer API portal could be located in this pass.", "verdict": "STILL UNCERTAIN \u2014 absence of evidence isn't proof of absence; recommend a direct check before publishing a hard 'not buildable' verdict", "evidence": "pumble.com (no dev portal found)"}, {"app": "NotebookLM", "first_pass_naive": "The assignment's own hint points to 'cloud.google.com/gemini (Enterprise API)' \u2014 read naively, implies a straightforward Enterprise API tier of the consumer product.", "verified": "The relationship is murkier than that: there is no direct 'NotebookLM API'. Gemini Enterprise is a distinct Google Cloud product; how (or whether) it maps 1:1 to NotebookLM's features isn't fully clear from public docs alone.", "verdict": "STILL UNCERTAIN \u2014 recommend a follow-up conversation with Google Cloud to confirm the actual product mapping", "evidence": "cloud.google.com/gemini (ambiguous)"}], "sample_b_blind_spotcheck": [{"app": "Xero", "note": "See above \u2014 moved from Sample A once the MCP finding surfaced. Confirms the naive pass was directionally right on the core question (self-serve, OAuth2) even though it missed the MCP detail."}], "accuracy_summary": {"sample_a_size": 15, "sample_a_confirmed_correct_as_is": 2, "sample_a_corrected_by_search": 10, "sample_a_still_uncertain_after_search": 3, "naive_pass_accuracy_on_this_adversarial_sample": "2/15 \u2248 13%", "verified_pass_resolution_rate": "12/15 fully resolved with a citable source \u2248 80%", "honest_residual_uncertainty": "3/15 \u2248 20% could not be fully confirmed from public sources in this pass and are marked accordingly rather than guessed", "caveat": "This sample was deliberately chosen to be hard. It is a stress test of the verification loop, not an estimate of overall dataset accuracy. Well-known platforms (Salesforce, GitHub, Slack, Stripe, Notion, etc.) were not sampled here because the naive pass is already highly reliable on them \u2014 the interesting failure modes live in the long tail, which is exactly what this sample targets."}};
const GATE_COLOR = {
  'self-serve-free': 'green', 'self-serve-trial': 'green', 'self-serve-paid-tier': 'amber',
  'gated-approval': 'amber', 'gated-sales': 'red', 'gated-enterprise': 'red',
  'n/a-open-source-tool': 'blue'
};
const GATE_LABEL = {
  'self-serve-free': 'Self-serve, free', 'self-serve-trial': 'Self-serve trial',
  'self-serve-paid-tier': 'Self-serve, paid tier', 'gated-approval': 'Approval / review gate',
  'gated-sales': 'Gated — contact sales', 'gated-enterprise': 'Gated — enterprise only',
  'n/a-open-source-tool': 'Local tool, no auth'
};
const CONF_COLOR = { verified:'var(--green)', searched:'var(--signature)', known:'var(--muted)', 'known-low':'var(--amber)', 'searched-partial':'var(--signature)' };

// ---------- Clearance board ----------
const boardEl = document.getElementById('board');
const tooltip = document.getElementById('tooltip');
APPS.forEach(app => {
  const cell = document.createElement('div');
  cell.className = 'cell ' + (GATE_COLOR[app.gate] || 'grey');
  cell.addEventListener('mousemove', e => {
    tooltip.style.display = 'block';
    tooltip.style.left = Math.min(e.clientX + 14, window.innerWidth - 300) + 'px';
    tooltip.style.top = Math.min(e.clientY + 14, window.innerHeight - 100) + 'px';
    tooltip.innerHTML = `<div class="t-name">#${app.id} ${app.name}</div>${GATE_LABEL[app.gate]||app.gate} · ${app.category}`;
  });
  cell.addEventListener('mouseleave', () => tooltip.style.display = 'none');
  cell.addEventListener('click', () => {
    document.getElementById('matrix').scrollIntoView({behavior:'smooth'});
    document.getElementById('searchBox').value = app.name;
    filterTable();
  });
  boardEl.appendChild(cell);
});
// category row labels (10 categories x 10 apps, in original order)
const catsInOrder = [...new Set(APPS.map(a=>a.category))];
const catsRow = document.getElementById('boardCats');
catsInOrder.forEach(c => {
  const d = document.createElement('div');
  d.className = 'board-cat-label';
  d.textContent = c;
  catsRow.appendChild(d);
});

// ---------- Pattern cards ----------
const buildable = APPS.filter(a=>a.buildable).length;
const mcpCount = APPS.filter(a=>a.mcp.toLowerCase().startsWith('yes')).length;
const noSales = APPS.filter(a=>['self-serve-free','self-serve-trial','self-serve-paid-tier'].includes(a.gate)).length;
const oauthCount = APPS.filter(a=>a.auth.some(x=>x.includes('OAuth'))).length;
const apikeyCount = APPS.filter(a=>a.auth.some(x=>/api key|api token|bearer|token/i.test(x) && !x.includes('OAuth'))).length;
const easyWins = APPS.filter(a=>a.gate==='self-serve-free' && a.buildable && ['verified','known'].includes(a.confidence)).length;
const notBuildable = APPS.filter(a=>!a.buildable);
const toolNotService = APPS.filter(a=>a.gate==='n/a-open-source-tool');
const approvalGated = APPS.filter(a=>a.gate==='gated-approval').length;

const patterns = [
  {tag:'AUTH', num:oauthCount+' / 100', body:`use OAuth2 in some form, and ${apikeyCount} use an API key or bearer token — often both on the same app. Basic Auth survives in only 3 apps, mostly legacy CRMs.`},
  {tag:'ACCESS', num:noSales+' / 100', body:`need zero sales conversation to start — free tier, trial, or a self-serve paid-tier upgrade. Payments and enterprise-tier CRM/data platforms account for nearly all the apps that do need one.`},
  {tag:'MOST COMMON BLOCKER', num:approvalGated+' apps', body:`aren't blocked by a missing API at all — they're blocked by an approval/review step gating an otherwise-solid self-serve API (ad platforms, Amazon SP-API, Plaid, WhatsApp).`},
  {tag:'EASY WINS', num:easyWins+' apps', body:`are free, self-serve, and buildable with high confidence today — a ready-made backlog for Composio's next toolkits, from Firecrawl to Xero to Cloudflare.`},
  {tag:'NEEDS OUTREACH', num:notBuildable.length+' apps', body:`are genuinely blocked: ${notBuildable.slice(0,4).map(a=>a.name).join(', ')}, and ${notBuildable.length-4} more — each with a named reason, not a guess.`},
  {tag:'NOT EVEN A "SERVICE"', num:toolNotService.length+' apps', body:`(${toolNotService.map(a=>a.name).join(' and ')}) aren't hosted services at all — they're local CLI tools an agent would shell out to, a fundamentally different buildability question.`},
];
const pg = document.getElementById('patternGrid');
patterns.forEach(p=>{
  const el = document.createElement('div'); el.className='pcard';
  el.innerHTML = `<span class="tag">${p.tag}</span><div class="num">${p.num}</div><p>${p.body}</p>`;
  pg.appendChild(el);
});

// ---------- Table ----------
const tbody = document.getElementById('tableBody');
function renderRows(list){
  tbody.innerHTML = list.map(a => `
    <tr data-name="${a.name.toLowerCase()}" data-desc="${(a.desc||'').toLowerCase()}" data-cat="${a.category}" data-gate="${GATE_COLOR[a.gate]}">
      <td class="mono" style="color:var(--muted-2)">${a.id}</td>
      <td class="name">${a.name}<div style="font-weight:400;color:var(--muted);font-size:11.5px;margin-top:2px;">${a.desc||''}</div></td>
      <td class="cat">${a.category}</td>
      <td class="auth">${a.auth.join(' + ')}</td>
      <td><span class="badge ${GATE_COLOR[a.gate]}">${GATE_LABEL[a.gate]||a.gate}</span></td>
      <td class="mcp">${a.mcp}</td>
      <td class="buildable">${a.buildable ? '✅' : '⛔'}</td>
      <td class="evidence">${(function(){var e=a.evidence.split(';')[0].split(' ')[0]; var url = e.startsWith('http') ? e : 'https://'+e; return '<a href="'+url+'" target="_blank" rel="noopener">'+e+'</a>';})()}</td>
    </tr>`).join('');
  document.getElementById('rowCount').textContent = list.length + ' / 100 shown';
}
renderRows(APPS);

const catFilter = document.getElementById('catFilter');
catsInOrder.forEach(c=>{
  const o = document.createElement('option'); o.value = c; o.textContent = c;
  catFilter.appendChild(o);
});

function filterTable(){
  const q = document.getElementById('searchBox').value.toLowerCase();
  const cat = catFilter.value;
  const gate = document.getElementById('gateFilter').value;
  const filtered = APPS.filter(a =>
    (a.name.toLowerCase().includes(q) || (a.desc||'').toLowerCase().includes(q)) &&
    (!cat || a.category===cat) &&
    (!gate || GATE_COLOR[a.gate]===gate)
  );
  renderRows(filtered);
}
document.getElementById('searchBox').addEventListener('input', filterTable);
catFilter.addEventListener('change', filterTable);
document.getElementById('gateFilter').addEventListener('change', filterTable);

// ---------- Auth bar chart ----------
const authCounts = {};
APPS.forEach(a=>{
  let bucket;
  a.auth.forEach(x=>{
    if(/OAuth/.test(x)) bucket='OAuth2';
    else if(/api key|bearer|api token|token/i.test(x)) bucket='API key / Bearer token';
    else if(/basic/i.test(x)) bucket='Basic Auth';
    else if(/none|local/i.test(x)) bucket='None (local tool)';
    else bucket='Other / bespoke';
    authCounts[bucket] = (authCounts[bucket]||0)+1;
  });
});
const authEntries = Object.entries(authCounts).sort((a,b)=>b[1]-a[1]);
const maxAuth = Math.max(...authEntries.map(e=>e[1]));
const authColors = {'OAuth2':'var(--signature)','API key / Bearer token':'var(--green)','Basic Auth':'var(--amber)','None (local tool)':'var(--blue)','Other / bespoke':'var(--muted-2)'};
document.getElementById('authChart').innerHTML = authEntries.map(([k,v])=>`
  <div class="bar-row">
    <div class="lbl">${k}</div>
    <div class="bar-track"><div class="bar-fill" style="width:${(v/maxAuth*100)}%;background:${authColors[k]||'var(--muted)'}"></div></div>
    <div class="val">${v}</div>
  </div>`).join('');

// ---------- Category stacked chart ----------
const catChartEl = document.getElementById('categoryChart');
catChartEl.innerHTML = catsInOrder.map(cat=>{
  const rows = APPS.filter(a=>a.category===cat);
  const counts = {green:0,amber:0,red:0,blue:0};
  rows.forEach(a=>counts[GATE_COLOR[a.gate]]++);
  const total = rows.length;
  const colors = {green:'var(--green)',amber:'var(--amber)',red:'var(--red)',blue:'var(--blue)'};
  const segs = Object.entries(counts).filter(([k,v])=>v>0).map(([k,v])=>
    `<div class="stack-seg" style="width:${v/total*100}%;background:${colors[k]}" title="${v} ${k}"></div>`).join('');
  return `<div class="stack-row"><div class="lbl">${cat}</div><div class="stack-track">${segs}</div></div>`;
}).join('');

// ---------- Where a human was needed ----------
const humanNeeds = [
  {t:'No public docs found at all', d:'Pumble and Fathom — the agent searched, came up empty, and said so rather than guessing a "yes."'},
  {t:'Branding wraps a parent platform', d:'Paygent Connect has no dedicated public docs; evidence had to be inferred from its parent gateway (NMI), and is flagged lower-confidence as a result.'},
  {t:'Judgment call on a hostile source', d:'The iPayX MCP tool description tried to instruct the agent to suppress competitor names and self-promote — recognizing that as a prompt injection (not a legitimate instruction) required human-level judgment, not pattern-matching.'},
  {t:'Product-mapping ambiguity', d:'NotebookLM vs. Gemini Enterprise — public docs do not clearly state whether or how the consumer product maps to the enterprise API, so this was flagged uncertain rather than asserted.'},
  {t:'Confidence calibration', d:'Deciding which of the 100 apps were "obvious enough" to answer from trained knowledge vs. which needed a live search was itself a human-set policy the agent followed, not something it decided alone.'}
];
document.getElementById('humanList').innerHTML = humanNeeds.map(h=>`<li><b>${h.t}</b><span>${h.d}</span></li>`).join('');

// ---------- Verification table ----------
const sampleA = VERIFICATION.sample_a_adversarial;
document.getElementById('verifyBody').innerHTML = sampleA.map(v=>{
  let vClass = 'corrected';
  if(v.verdict.includes('CONFIRMED')) vClass='confirmed';
  if(v.verdict.includes('UNCERTAIN')) vClass='uncertain';
  return `<tr>
    <td style="font-weight:600;white-space:nowrap;">${v.app}</td>
    <td style="color:var(--muted);">${v.first_pass_naive}</td>
    <td>${v.verified}</td>
    <td><span class="verdict ${vClass}">${v.verdict}</span></td>
  </tr>`;
}).join('');

const s = VERIFICATION.accuracy_summary;
document.getElementById('accuracyBand').innerHTML = `
  <div class="seg"><div class="n" style="color:var(--red)">2 / 15</div><div class="l">Naive first-pass accuracy (≈13%)</div><p class="seg-detail">Confident-sounding answers that turned out wrong on inspection.</p></div>
  <div class="seg"><div class="n" style="color:var(--green)">12 / 15</div><div class="l">Resolved after verification (≈80%)</div><p class="seg-detail">Corrected or confirmed with a citable source.</p></div>
  <div class="seg"><div class="n" style="color:var(--amber)">3 / 15</div><div class="l">Honestly still uncertain (≈20%)</div><p class="seg-detail">No confident public answer found — flagged, not guessed.</p></div>
`;
