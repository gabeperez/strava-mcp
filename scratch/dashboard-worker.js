const API_ORIGIN = 'https://poke-agent-bridge.perez-jg22.workers.dev';
const HTML = String.raw`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Poke Agent Dashboard</title>
<style>
:root{--bg:#2449d1;--overlay:rgba(70,105,230,.42);--card:rgba(255,255,255,.09);--card2:rgba(255,255,255,.07);--line:rgba(255,255,255,.16);--text:#fff;--muted:rgba(255,255,255,.66);--green:#5dffb0;--yellow:#ffe07a;--red:#ff6b6b;--font:'SF Mono','Fira Mono','Consolas',monospace}
*{box-sizing:border-box}html,body{margin:0;min-height:100%;background:var(--bg);color:var(--text);font-family:var(--font)}
body{overflow-x:hidden}
body::before{content:'';position:fixed;inset:0;pointer-events:none;background-image:radial-gradient(rgba(255,255,255,.14) 1px,transparent 1px);background-size:26px 26px;opacity:.5;mix-blend-mode:screen}
canvas,.ascii{position:fixed;inset:0;pointer-events:none}
.ascii{white-space:pre;color:rgba(255,255,255,.05);background:var(--overlay);font-size:11px;line-height:1.32;animation:flicker 4s steps(1) infinite}
@keyframes flicker{0%,100%{opacity:.26}25%{opacity:.18}50%{opacity:.3}75%{opacity:.11}}
.shell{position:relative;z-index:2;min-height:100vh;display:flex;flex-direction:column}
.top{display:flex;justify-content:space-between;gap:16px;align-items:flex-start;padding:24px 28px 10px}
.brand{display:flex;align-items:flex-start;gap:12px}.dot{width:18px;height:18px;border-radius:999px;background:#fff;box-shadow:0 0 0 10px rgba(255,255,255,.12),0 0 24px rgba(255,255,255,.5);margin-top:4px}
.kicker{font-size:10px;letter-spacing:4px;color:rgba(255,255,255,.65);text-transform:uppercase}.title{font-size:18px;letter-spacing:1.5px}.sub{color:var(--muted);font-size:12px;max-width:72ch;line-height:1.6;margin-top:8px}
.statusline{display:flex;align-items:center;gap:10px;color:var(--muted);font-size:12px;flex-wrap:wrap}.pill{border:1px solid var(--line);padding:5px 9px;border-radius:999px;background:rgba(255,255,255,.04)}
.main{display:grid;gap:18px;padding:10px 28px 32px;max-width:1280px;width:100%}
.hero{display:grid;grid-template-columns:1.15fr .85fr;gap:18px;align-items:stretch}
.card{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:20px;backdrop-filter:blur(8px);box-shadow:0 18px 60px rgba(0,0,0,.12)}
.card.alt{background:var(--card2)}
.h{font-size:12px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,.62);margin:0 0 14px}
.big{font-size:38px;line-height:1.06;letter-spacing:-.02em;margin:0 0 10px}.lead{color:var(--muted);line-height:1.7;font-size:13px;max-width:52ch}
.asciiBox{margin-top:20px;border:1px dashed rgba(255,255,255,.22);border-radius:16px;padding:16px;background:rgba(255,255,255,.04);white-space:pre;line-height:1.35;color:rgba(255,255,255,.82)}
.authLanding{margin:0 0 14px;color:rgba(255,255,255,.78);font-size:13px;line-height:1.7;max-width:66ch}.authLanding h2{margin:0 0 4px;font-size:26px;letter-spacing:-.02em}.authLanding p{margin:0}.authPanels{display:grid;gap:18px}.panel{display:flex;flex-direction:column;gap:14px;background:rgba(255,255,255,.05);border:1px solid var(--line);border-radius:18px;padding:18px}.swapLink{display:inline-flex;align-items:center;gap:6px;color:rgba(255,255,255,.72);font-size:12px;text-decoration:none}.swapLink:hover{color:#fff;text-decoration:underline}.panelFooter{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
.panel h2{margin:0;font-size:22px;letter-spacing:-.02em}.panel p{margin:0;color:var(--muted);font-size:12px;line-height:1.6}.panelTop{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.stack{display:flex;flex-direction:column;gap:12px}.row{display:grid;grid-template-columns:1fr 1fr;gap:12px}.row3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
label{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,.7);display:block;margin-bottom:6px}
input,textarea,select,button{width:100%;border-radius:12px;border:1px solid var(--line);background:rgba(255,255,255,.06);color:#fff;font:inherit;padding:12px 14px;outline:none}
textarea{min-height:100px;resize:vertical}input::placeholder,textarea::placeholder{color:rgba(255,255,255,.4)}
button{cursor:pointer;background:rgba(255,255,255,.1);transition:transform .12s ease,background .12s ease,border-color .12s ease}button:hover{transform:translateY(-1px);background:rgba(255,255,255,.16);border-color:rgba(255,255,255,.28)}button.primary{background:#fff;color:#2040c6;border-color:#fff}button.primary:hover{background:#edf2ff}button.ghost{background:transparent}.small{padding:9px 12px;font-size:12px;border-radius:10px}
.muted{color:var(--muted);font-size:12px;line-height:1.6}.error{color:#ffd0d0}.ok{color:#d9ffe9}.danger{color:#ffd7d7}
.divider{display:flex;align-items:center;gap:10px;color:rgba(255,255,255,.5);font-size:11px;letter-spacing:2px;text-transform:uppercase}.divider::before,.divider::after{content:'';flex:1;height:1px;background:rgba(255,255,255,.14)}
.hidden{display:none!important}
.tabsShell{display:flex;flex-direction:column;gap:18px}
.tabsBar{display:flex;flex-wrap:wrap;gap:10px;padding:8px;border:1px solid var(--line);border-radius:18px;background:rgba(255,255,255,.04);backdrop-filter:blur(8px)}
.tabBtn{width:auto;min-width:120px;padding:11px 14px;border-radius:999px;border:1px solid transparent;background:transparent;color:rgba(255,255,255,.7)}
.tabBtn.active{background:#fff;color:#2040c6;border-color:#fff}
.tabPanel{display:flex;flex-direction:column;gap:18px}
.dashGrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:18px}
.spanFull{grid-column:1/-1}
.metrics{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.metric{border:1px solid var(--line);border-radius:14px;padding:14px;background:rgba(255,255,255,.05);display:flex;flex-direction:column;gap:8px}.metric span{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.62)}.metric strong{font-size:28px;line-height:1}
.kanbanGrid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:14px}.kanbanCol{border:1px solid var(--line);border-radius:16px;padding:14px;background:rgba(255,255,255,.05);display:flex;flex-direction:column;gap:12px;min-height:240px}.kanbanHeader{display:flex;align-items:center;justify-content:space-between;gap:10px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:rgba(255,255,255,.72)}.kanbanList{display:flex;flex-direction:column;gap:10px}
.feed{display:grid;gap:10px}.feedItem{border:1px solid var(--line);border-radius:14px;padding:14px;background:rgba(255,255,255,.05)}
.item{border:1px solid var(--line);border-radius:14px;padding:14px;background:rgba(255,255,255,.05)}.itemhead{display:flex;justify-content:space-between;gap:12px;align-items:flex-start}.agent{font-weight:700}.badge{font-size:11px;text-transform:uppercase;letter-spacing:2px;border:1px solid var(--line);padding:4px 8px;border-radius:999px}.meta{margin-top:8px;color:var(--muted);font-size:12px;white-space:pre-wrap;line-height:1.6}.tag{font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:rgba(255,255,255,.58);border:1px solid var(--line);padding:4px 8px;border-radius:999px}
.dangerBtn{width:100%;border-radius:12px;border:1px solid rgba(255,120,120,.35);background:rgba(255,90,90,.16);color:#fff;font:inherit;padding:12px 14px;outline:none;cursor:pointer;transition:transform .12s ease,background .12s ease,border-color .12s ease}.dangerBtn:hover{transform:translateY(-1px);background:rgba(255,90,90,.22);border-color:rgba(255,120,120,.5)}
@media (max-width:980px){.hero,.authWrap,.row,.row3,.grid,.dashGrid,.kanbanGrid,.metrics{grid-template-columns:1fr}.tabBtn{min-width:0;flex:1}.top{padding:20px}.main{padding:10px 20px 24px}.footer{padding:0 20px 24px}.big{font-size:30px}}
.footer{padding:0 28px 28px;color:rgba(255,255,255,.45);font-size:11px;letter-spacing:1px}
</style>
</head>
<body>
<pre class="ascii">    _._
  .-(_)-.
 /  /|\  \
|  / | \  |
| /  |  \ |
|/   |   \|
     •

P O K E   A G E N T   D A S H B O A R D
Welcome back / Create account / blue dot / ascii / worker bridge</pre>
<div class="shell">
  <div class="top" id="topSection">
    <div>
      <div class="brand"><div class="dot"></div><div><div class="kicker">poke agent dashboard</div><div class="title">master dashboard</div></div></div>
      <div class="sub">Email/password is the primary path. Magic links remain available for recovery and password resets. All agent data is partitioned by your user id and agent name.</div>
    </div>
    <div class="statusline"><span class="pill" id="sessionPill">booting…</span><span class="pill" id="scopePill">blue lane</span><span class="pill">inline assets</span></div>
  </div>

  <main class="main">
    <section class="hero" id="heroSection">
      <div class="card alt">
        <div class="h">overview</div>
        <h1 class="big">Clear auth screens.<br/>Same blue dot system.</h1>
        <p class="lead">The dashboard now starts as a clean landing page. Pick Log In or Sign Up to reveal the specific form, while magic links remain available as a fallback for resets and passwordless recovery.</p>
        <div class="asciiBox">  ●  authenticate
 /|\\  password first
 / \   magic link fallback

 tenant partitioning:
 user_id : agent_name</div>
      </div>

      <div class="card">
        <div class="h">session</div>
        <div class="stack">
          <div class="muted" id="meInfo">Not signed in.</div>
          <button class="small" id="reloadBtn">refresh</button>
          <button class="small ghost" id="logoutBtn">log out</button>
        </div>
      </div>
    </section>

    <section class="card" id="authSection">
      <div class="h">auth</div>
      <div class="authLanding" id="authLanding">
        <div class="kicker">single entry point</div>
        <h2>Your central hub for monitoring and managing autonomous Poke agents</h2>
        <p>Log in or sign up to get started.</p>
      </div>
      <div class="authPanels">
        <div class="panel" id="loginPanel">
          <div class="panelTop">
            <div>
              <div class="kicker">welcome back</div>
              <h2>Log In</h2>
            </div>
          </div>
          <p>Use your existing email and password to enter the master dashboard.</p>
          <div class="stack">
            <div><label for="loginEmail">email</label><input id="loginEmail" type="email" autocomplete="email" placeholder="you@example.com" /></div>
            <div><label for="loginPassword">password</label><input id="loginPassword" type="password" autocomplete="current-password" placeholder="••••••••••" /></div>
            <button class="primary" id="loginBtn">Log In</button>
            <div class="divider">or</div>
            <button class="ghost" id="magicBtn">send magic link</button>
          </div>
          <div class="panelFooter">
            <div class="muted" id="loginNote">Magic links are still available as a fallback for password resets.</div>
            <a href="#" class="swapLink" id="showSignupBtn">Need an account? Sign up</a>
          </div>
        </div>

        <div class="panel hidden" id="signupPanel">
          <div class="panelTop">
            <div>
              <div class="kicker">create account</div>
              <h2>Sign Up</h2>
            </div>
            <a href="#" class="swapLink" id="backFromSignupBtn">Back to log in</a>
          </div>
          <p>Create a new dashboard account with email/password. Your data stays partitioned by your user id.</p>
          <div class="stack">
            <div><label for="signupEmail">email</label><input id="signupEmail" type="email" autocomplete="email" placeholder="new@example.com" /></div>
            <div><label for="signupName">name</label><input id="signupName" type="text" autocomplete="name" placeholder="Name" /></div>
            <div><label for="signupPassword">password</label><input id="signupPassword" type="password" autocomplete="new-password" placeholder="at least 8 characters" /></div>
            <button class="primary" id="signupBtn">Sign Up</button>
          </div>
          <div class="muted" id="signupNote">New accounts become the primary email/password login path.</div>
        </div>
      </div>
    </section>

    <section class="tabsShell hidden" id="tabsShell">
      <div class="tabsBar" role="tablist" aria-label="Dashboard tabs">
        <button class="tabBtn active" data-tab="pulse" type="button">Pulse</button>
        <button class="tabBtn" data-tab="kanban" type="button">Kanban</button>
        <button class="tabBtn" data-tab="dashboard" type="button">Dashboard</button>
      </div>

      <section class="tabPanel" id="pulsePanel" role="tabpanel" aria-label="Pulse tab">
        <div class="card">
          <div class="h">pulse</div>
          <div class="metrics" id="pulseMetrics"></div>
        </div>
        <div class="card">
          <div class="h">recent agents</div>
          <div class="list" id="pulseList"></div>
          <div class="muted hidden" id="pulseEmpty">No agents saved yet.</div>
        </div>
      </section>

      <section class="tabPanel hidden" id="kanbanPanel" role="tabpanel" aria-label="Kanban tab">
        <div class="card">
          <div class="h">kanban</div>
          <div class="kanbanGrid" id="kanbanGrid"></div>
        </div>
      </section>

      <section class="tabPanel hidden" id="dashboardPanel" role="tabpanel" aria-label="Dashboard tab">
        <div class="dashGrid">
          <div class="card">
            <div class="h">upsert agent state</div>
            <div class="stack">
              <div><label for="dashboardAgent">agent name</label><input id="dashboardAgent" placeholder="inbox-bot" /></div>
              <div class="row">
                <div><label for="dashboardState">status</label><select id="dashboardState"><option>idle</option><option>working</option><option>busy</option><option>error</option></select></div>
                <div><label for="dashboardTask">task</label><input id="dashboardTask" placeholder="triaging incoming messages" /></div>
              </div>
              <div><label for="dashboardDetails">details</label><textarea id="dashboardDetails" placeholder="notes, blockers, context"></textarea></div>
              <button class="primary" id="saveBtn" type="button">save state</button>
              <div class="muted" id="saveNote">State is partitioned by your user id and the agent name.</div>
            </div>
          </div>

          <div class="card">
            <div class="h">spin up subagent</div>
            <div class="stack">
              <div><label for="spinAgent">subagent name</label><input id="spinAgent" placeholder="research-bot" /></div>
              <div><label for="spinTask">task</label><input id="spinTask" placeholder="build a quick research pass" /></div>
              <div><label for="spinDetails">details</label><textarea id="spinDetails" placeholder="optional prompt or context"></textarea></div>
              <button class="primary" id="spinBtn" type="button">Spin Up Subagent</button>
              <div class="muted" id="spinNote">This calls the bridge /api/agents/spin-up endpoint.</div>
            </div>
          </div>

          <div class="card">
            <div class="h">force stop</div>
            <div class="stack">
              <div><label for="stopAgent">subagent name</label><input id="stopAgent" placeholder="research-bot" /></div>
              <button class="dangerBtn" id="stopBtn" type="button">Force Stop</button>
              <div class="muted" id="stopNote">This calls DELETE /api/status/:agent on the bridge.</div>
            </div>
          </div>

          <div class="card spanFull">
            <div class="h">subagent history</div>
            <div class="feed" id="historyFeed"></div>
            <div class="muted hidden" id="historyEmpty">No recent agent events.</div>
          </div>
        </div>
      </section>
    </section>

  </main>
  <div class="footer">inline assets only • blue dot / ascii retained • magic link fallback preserved</div>
</div>

<script>
const API_ORIGIN = '${API_ORIGIN}';
const state = { me: null, agents: [], events: [], activeTab: 'pulse' };
const $ = function (id) { return document.getElementById(id); };
function escapeHtml(value) {
  return String(value == null ? '' : value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
async function api(path, options) {
  const init = Object.assign({ credentials: 'include' }, options || {});
  init.headers = Object.assign({ 'Content-Type': 'application/json' }, init.headers || {});
  const response = await fetch(API_ORIGIN + path, init);
  const data = await response.json().catch(function () { return {}; });
  if (!response.ok) throw new Error(data.error || 'request failed');
  return data;
}
function setNote(el, message, kind) {
  el.className = 'muted' + (kind ? ' ' + kind : '');
  el.textContent = message;
}
function normalizeStateJson(row) {
  try {
    return JSON.parse(row.state_json || row.stateJson || '{}');
  } catch (error) {
    return {};
  }
}
function getStatus(row) {
  const stateJson = normalizeStateJson(row);
  return String(stateJson.status || 'idle').toLowerCase();
}
function formatAgentCard(row) {
  const stateJson = normalizeStateJson(row);
  const agent = escapeHtml(row.agent_key || row.agent || '');
  const status = escapeHtml(stateJson.status || 'idle');
  const meta = [];
  meta.push('status: ' + (stateJson.status || 'idle'));
  if (stateJson.task) meta.push('task: ' + stateJson.task);
  if (stateJson.details) meta.push('details: ' + stateJson.details);
  meta.push('updated: ' + (row.updated_at || stateJson.updatedAt || 'n/a'));
  return '<div class="item"><div class="itemhead"><div><div class="agent">' + agent + '</div><div class="muted">user partitioned key: user_id:' + escapeHtml(state.me.id) + ' / agent:' + agent + '</div></div><div class="badge">' + status + '</div></div><div class="meta">' + escapeHtml(meta.join('\n')) + '</div><div style="margin-top:12px;display:flex;gap:10px;flex-wrap:wrap"><button class="small" type="button" data-fill-agent="' + agent + '">edit</button><button class="small ghost" type="button" data-stop-agent="' + agent + '">stop</button></div></div>';
}
function formatEventItem(eventRow) {
  const event = eventRow.event || {};
  const agent = escapeHtml(eventRow.agent || event.agent || '');
  const eventType = escapeHtml(eventRow.eventType || event.action || 'event');
  const createdAt = escapeHtml(eventRow.createdAt || event.createdAt || 'n/a');
  const details = [];
  if (event.task) details.push('task: ' + event.task);
  if (event.details) details.push('details: ' + event.details);
  if (event.status) details.push('status: ' + event.status);
  if (!details.length) details.push(JSON.stringify(event));
  return '<div class="feedItem"><div class="itemhead"><div><div class="agent">' + agent + '</div><div class="muted">' + eventType + '</div></div><div class="tag">' + createdAt + '</div></div><div class="meta">' + escapeHtml(details.join('\n')) + '</div></div>';
}
function renderPulse() {
  const counts = { total: state.agents.length, idle: 0, working: 0, busy: 0, error: 0, other: 0 };
  state.agents.forEach(function (row) {
    const status = getStatus(row);
    if (counts[status] == null) counts.other += 1; else counts[status] += 1;
  });
  $('pulseMetrics').innerHTML = [
    ['agents', counts.total],
    ['idle', counts.idle],
    ['working', counts.working],
    ['busy', counts.busy],
    ['error', counts.error],
    ['events', state.events.length],
  ].map(function (entry) {
    return '<div class="metric"><span>' + entry[0] + '</span><strong>' + entry[1] + '</strong></div>';
  }).join('');
  $('pulseList').innerHTML = state.agents.slice(0, 8).map(formatAgentCard).join('');
  $('pulseEmpty').classList.toggle('hidden', state.agents.length > 0);
}
function renderKanban() {
  const groups = { idle: [], working: [], busy: [], error: [], other: [] };
  state.agents.forEach(function (row) {
    const status = getStatus(row);
    const bucket = groups[status] ? status : 'other';
    groups[bucket].push(row);
  });
  const columns = [
    ['idle', 'Idle'],
    ['working', 'Working'],
    ['busy', 'Busy'],
    ['error', 'Error'],
    ['other', 'Other'],
  ];
  $('kanbanGrid').innerHTML = columns.map(function (column) {
    const key = column[0];
    const title = column[1];
    const rows = groups[key];
    return '<div class="kanbanCol"><div class="kanbanHeader"><span>' + title + '</span><span class="tag">' + rows.length + '</span></div><div class="kanbanList">' + (rows.length ? rows.map(formatAgentCard).join('') : '<div class="muted">none</div>') + '</div></div>';
  }).join('');
}
function renderHistory() {
  $('historyFeed').innerHTML = state.events.map(formatEventItem).join('');
  $('historyEmpty').classList.toggle('hidden', state.events.length > 0);
}
function renderTabs() {
  const tabs = document.querySelectorAll('[data-tab]');
  tabs.forEach(function (button) {
    button.classList.toggle('active', button.getAttribute('data-tab') === state.activeTab);
  });
  $('pulsePanel').classList.toggle('hidden', state.activeTab !== 'pulse');
  $('kanbanPanel').classList.toggle('hidden', state.activeTab !== 'kanban');
  $('dashboardPanel').classList.toggle('hidden', state.activeTab !== 'dashboard');
}
function render() {
  const authed = !!state.me;
  $('topSection').classList.toggle('hidden', !authed);
  $('heroSection').classList.toggle('hidden', !authed);
  $('tabsShell').classList.toggle('hidden', !authed);
  $('authSection').classList.toggle('hidden', authed);
  $('sessionPill').textContent = authed ? 'authenticated' : 'sign in required';
  $('scopePill').textContent = authed ? ('user ' + state.me.id.slice(0, 8)) : 'blue lane';
  if (authed) {
    $('meInfo').innerHTML = '<div><strong>' + escapeHtml(state.me.email) + '</strong></div><div class="muted">user id: ' + escapeHtml(state.me.id) + '</div><div class="muted">session expires: ' + escapeHtml((state.me.session && state.me.session.expiresAt) || 'n/a') + '</div>';
    $('meSummary').innerHTML = '<div><strong>' + escapeHtml(state.me.email) + '</strong></div><div class="muted">user id: ' + escapeHtml(state.me.id) + '</div><div class="muted">tenant partition: user_id:' + escapeHtml(state.me.id) + ' / agent_name</div>';
    renderTabs();
    renderPulse();
    renderKanban();
    renderHistory();
  } else {
    $('meInfo').textContent = 'Not signed in.';
    $('meSummary').textContent = 'Sign in to view your tenant partition.';
  }
}
async function loadMe() {
  try {
    const data = await api('/api/me', { method: 'GET', headers: {} });
    state.me = data.user ? Object.assign({}, data.user, { session: data.session }) : null;
  } catch (error) {
    state.me = null;
  }
  render();
}
async function loadAgents() {
  if (!state.me) return;
  const data = await api('/api/status', { method: 'GET', headers: {} });
  state.agents = data.agents || [];
  render();
}
async function loadHistory() {
  if (!state.me) return;
  const data = await api('/api/agents/history?limit=20', { method: 'GET', headers: {} });
  state.events = data.events || [];
  render();
}
async function loadWorkspace() {
  await Promise.all([loadAgents(), loadHistory()]);
}
async function loginFlow() {
  try {
    setNote($('loginNote'), 'working…');
    await api('/api/auth/login', { method: 'POST', body: JSON.stringify({ email: $('loginEmail').value.trim(), password: $('loginPassword').value }) });
    await loadMe();
    await loadWorkspace();
    setNote($('loginNote'), 'signed in', 'ok');
  } catch (error) {
    setNote($('loginNote'), error.message || 'request failed', 'error');
  }
}
async function signupFlow() {
  try {
    setNote($('signupNote'), 'creating…');
    await api('/api/auth/signup', { method: 'POST', body: JSON.stringify({ email: $('signupEmail').value.trim(), name: $('signupName').value.trim(), password: $('signupPassword').value }) });
    await loadMe();
    await loadWorkspace();
    setNote($('signupNote'), 'account created', 'ok');
  } catch (error) {
    setNote($('signupNote'), error.message || 'request failed', 'error');
  }
}
async function magicFlow() {
  try {
    setNote($('loginNote'), 'queueing magic link…');
    await api('/api/auth/request', { method: 'POST', body: JSON.stringify({ email: $('loginEmail').value.trim() || $('signupEmail').value.trim() }) });
    setNote($('loginNote'), 'magic link queued for delivery', 'ok');
  } catch (error) {
    setNote($('loginNote'), error.message || 'request failed', 'error');
  }
}
async function saveAgent() {
  try {
    const body = {
      agent: $('dashboardAgent').value.trim(),
      status: $('dashboardState').value,
      task: $('dashboardTask').value.trim(),
      details: $('dashboardDetails').value.trim() || null,
    };
    if (!body.agent) throw new Error('agent name required');
    setNote($('saveNote'), 'saving…');
    await api('/api/status', { method: 'POST', body: JSON.stringify(body) });
    await loadAgents();
    await loadHistory();
    setNote($('saveNote'), 'saved', 'ok');
  } catch (error) {
    setNote($('saveNote'), error.message || 'save failed', 'error');
  }
}
async function spinUpAgent() {
  try {
    const agent = $('spinAgent').value.trim();
    if (!agent) throw new Error('subagent name required');
    setNote($('spinNote'), 'spinning up…');
    await api('/api/agents/spin-up', {
      method: 'POST',
      body: JSON.stringify({
        agent,
        task: $('spinTask').value.trim(),
        details: $('spinDetails').value.trim() || null,
      }),
    });
    await loadAgents();
    await loadHistory();
    setNote($('spinNote'), 'spin-up event created', 'ok');
  } catch (error) {
    setNote($('spinNote'), error.message || 'request failed', 'error');
  }
}
async function forceStopAgent(agentName) {
  try {
    const agent = String(agentName || $('stopAgent').value || '').trim();
    if (!agent) throw new Error('subagent name required');
    setNote($('stopNote'), 'stopping…');
    await api('/api/status/' + encodeURIComponent(agent), { method: 'DELETE', headers: {}, body: '{}' });
    await loadAgents();
    await loadHistory();
    setNote($('stopNote'), 'subagent stopped', 'ok');
  } catch (error) {
    setNote($('stopNote'), error.message || 'request failed', 'error');
  }
}
async function logout() {
  await api('/api/auth/logout', { method: 'POST', body: '{}' }).catch(function () {});
  state.me = null;
  state.agents = [];
  state.events = [];
  render();
}
function showAuthPanel(panel) {
  $('loginPanel').classList.toggle('hidden', panel !== 'login');
  $('signupPanel').classList.toggle('hidden', panel !== 'signup');
}
function setTab(tab) {
  state.activeTab = tab;
  renderTabs();
}
document.addEventListener('click', function (event) {
  const tabButton = event.target.closest('[data-tab]');
  if (tabButton) {
    setTab(tabButton.getAttribute('data-tab'));
    return;
  }
  const fillButton = event.target.closest('[data-fill-agent]');
  if (fillButton) {
    const agent = fillButton.getAttribute('data-fill-agent');
    $('dashboardAgent').value = agent;
    $('spinAgent').value = agent;
    $('stopAgent').value = agent;
    const row = state.agents.find(function (entry) { return (entry.agent_key || entry.agent || '') === agent; });
    const jsonState = normalizeStateJson(row || {});
    $('dashboardState').value = jsonState.status || 'idle';
    $('dashboardTask').value = jsonState.task || '';
    $('dashboardDetails').value = jsonState.details || '';
    setTab('dashboard');
    setNote($('saveNote'), 'loaded ' + agent + ' into dashboard form');
    return;
  }
  const stopButton = event.target.closest('[data-stop-agent]');
  if (stopButton) {
    event.preventDefault();
    forceStopAgent(stopButton.getAttribute('data-stop-agent'));
  }
});
$('showSignupBtn').addEventListener('click', function (event) { event.preventDefault(); showAuthPanel('signup'); });
$('backFromSignupBtn').addEventListener('click', function (event) { event.preventDefault(); showAuthPanel('login'); });
$('loginBtn').addEventListener('click', function () { loginFlow(); });
$('signupBtn').addEventListener('click', function () { signupFlow(); });
$('magicBtn').addEventListener('click', function () { magicFlow(); });
$('saveBtn').addEventListener('click', function () { saveAgent(); });
$('spinBtn').addEventListener('click', function () { spinUpAgent(); });
$('stopBtn').addEventListener('click', function () { forceStopAgent(); });
$('logoutBtn').addEventListener('click', function () { logout(); });
$('reloadBtn').addEventListener('click', function () { loadMe().then(loadWorkspace); });
$('reloadAgentsBtn').addEventListener('click', function () { loadWorkspace(); });
$('loginPassword').addEventListener('keydown', function (event) { if (event.key === 'Enter') loginFlow(); });
$('signupPassword').addEventListener('keydown', function (event) { if (event.key === 'Enter') signupFlow(); });
(async function init() {
  showAuthPanel('login');
  setTab('pulse');
  const token = new URL(location.href).searchParams.get('token');
  if (token) {
    try {
      await api('/api/auth/verify?token=' + encodeURIComponent(token), { method: 'GET', headers: {} });
      history.replaceState({}, '', '/');
    } catch (error) {
      setNote($('loginNote'), error.message || 'magic link expired', 'error');
      showAuthPanel('login');
    }
  }
  await loadMe();
  if (state.me) {
    await loadWorkspace();
  }
})();

</script>
</body>
</html>`;

export default {
  async fetch() {
    return new Response(HTML, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-store',
      },
    });
  },
};
