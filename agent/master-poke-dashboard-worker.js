const COOKIE_NAME = 'poke_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const MAGICLINK_TTL_SECONDS = 15 * 60;
const SCHEMA_KEY = '__SCHEMA_READY__';
const encoder = new TextEncoder();

const POKE_WEBHOOK_URL = 'https://poke.com/api/v1/inbound/webhook';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_hash TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  last_seen_at INTEGER NOT NULL,
  revoked_at INTEGER,
  user_agent TEXT,
  ip TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE TABLE IF NOT EXISTS magiclinks (
  id TEXT PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  email TEXT NOT NULL COLLATE NOCASE,
  token_hash TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  consumed_at INTEGER,
  consumed_session_id TEXT,
  used_ip TEXT,
  used_user_agent TEXT
);
CREATE INDEX IF NOT EXISTS idx_magiclinks_email ON magiclinks(email);
CREATE INDEX IF NOT EXISTS idx_magiclinks_token_hash ON magiclinks(token_hash);
CREATE TABLE IF NOT EXISTS agentstate (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  agent_key TEXT NOT NULL,
  state_json TEXT NOT NULL,
  updated_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  UNIQUE(tenant_id, agent_key)
);
CREATE INDEX IF NOT EXISTS idx_agentstate_tenant_id ON agentstate(tenant_id);
CREATE TABLE IF NOT EXISTS agentevents (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tenant_id TEXT NOT NULL,
  agent_key TEXT NOT NULL,
  event_type TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_agentevents_tenant_created ON agentevents(tenant_id, created_at DESC);
CREATE TABLE IF NOT EXISTS schema_migrations (
  name TEXT PRIMARY KEY,
  applied_at INTEGER NOT NULL
);
INSERT OR IGNORE INTO schema_migrations(name, applied_at) VALUES ('2026-03-26-master-dashboard', strftime('%s','now'));
`;

"<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\" />\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />\n<title>Master Poke Dashboard</title>\n<style>\n:root{--bg:#2248cf;--panel:rgba(255,255,255,.08);--line:rgba(255,255,255,.16);--text:#fff;--muted:rgba(255,255,255,.68);--green:#63ffbf;--yellow:#ffd86d;--red:#ff7b7b;--font:SFMono-Regular,Consolas,Menlo,monospace}\n*{box-sizing:border-box}html,body{margin:0;height:100%;background:var(--bg);color:var(--text);font-family:var(--font);overflow-x:hidden}\nbody::before{content:'';position:fixed;inset:0;pointer-events:none;background-image:radial-gradient(rgba(255,255,255,.17) 1px,transparent 1px);background-size:26px 26px;opacity:.55;mix-blend-mode:screen}\n#ascii{position:fixed;inset:0;pointer-events:none;white-space:pre;line-height:1.2;font-size:11px;color:rgba(255,255,255,.05);mix-blend-mode:screen;opacity:.8}\n.wrap{position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column}\n.head{display:flex;justify-content:space-between;align-items:center;padding:28px 32px 18px;border-bottom:1px solid var(--line);backdrop-filter:blur(4px)}\n.brand{display:flex;align-items:center;gap:10px;flex-wrap:wrap}.dot{width:14px;height:14px;border-radius:50%;background:#fff;box-shadow:0 0 10px rgba(255,255,255,.85),0 0 24px rgba(155,197,255,.55);animation:pulse 2s ease-in-out infinite}.pulse{width:8px;height:8px;border-radius:50%;background:var(--green);box-shadow:0 0 8px var(--green)}\n@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.25)}}\n.title{font-size:22px;font-weight:700;letter-spacing:.2em}.sub{font-size:11px;letter-spacing:.24em;color:var(--muted);text-transform:uppercase}\n.meta{display:flex;align-items:center;gap:8px;color:var(--muted);font-size:11px}\n.main{padding:28px 32px 40px;flex:1}\n.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}\n.card,.panel{background:var(--panel);border:1px solid var(--line);border-radius:14px;backdrop-filter:blur(10px);position:relative;overflow:hidden}\n.card::before,.panel::before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 50% 0%,rgba(255,255,255,.06),transparent 70%);pointer-events:none}\n.card{padding:18px 18px 16px}.row{display:flex;justify-content:space-between;align-items:center;gap:10px}.name{font-size:13px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}.badge{font-size:10px;border-radius:999px;padding:3px 8px;border:1px solid var(--line);text-transform:uppercase;letter-spacing:.12em}.b-active{color:var(--green);border-color:rgba(99,255,191,.3);background:rgba(99,255,191,.12)}.b-idle{color:var(--yellow);border-color:rgba(255,216,109,.3);background:rgba(255,216,109,.12)}.b-error{color:var(--red);border-color:rgba(255,123,123,.3);background:rgba(255,123,123,.12)}.b-off{color:var(--muted)}\n.task{margin-top:12px;min-height:36px;font-size:12px;line-height:1.5;color:var(--muted);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}.dots{display:flex;gap:4px;flex-wrap:wrap;margin-top:12px}.mini{width:7px;height:7px;border-radius:50%;background:rgba(255,255,255,.2)}.mini.lit{background:#fff;box-shadow:0 0 6px rgba(255,255,255,.8)}\n.small{margin-top:10px;font-size:10px;color:var(--muted)}\n.empty,.loading{grid-column:1/-1;display:flex;align-items:center;justify-content:center;gap:12px;padding:56px 0;color:var(--muted);font-size:13px}\n.spin{width:18px;height:18px;border-radius:50%;border:2px solid rgba(255,255,255,.15);border-top-color:#fff;animation:rot .8s linear infinite}@keyframes rot{to{transform:rotate(360deg)}}\n.lane{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}.lane h3{margin:0 0 14px;font-size:10px;letter-spacing:.24em;color:var(--muted)}.lane .card{margin-bottom:12px}.lane .col{padding:18px}.count{float:right;background:rgba(255,255,255,.08);padding:1px 7px;border-radius:999px;border:1px solid var(--line)}\n.login{max-width:560px;margin:40px auto 0;padding:22px}.login h1{margin:0 0 6px;font-size:16px;letter-spacing:.16em;text-transform:uppercase}.login p{margin:0 0 16px;color:var(--muted);font-size:13px;line-height:1.5}.form{display:flex;gap:10px;flex-wrap:wrap}.form input,.form button,.linkbox{font:inherit;border-radius:10px;border:1px solid var(--line);background:rgba(255,255,255,.06);color:#fff}.form input{flex:1;min-width:220px;padding:12px 14px;outline:none}.form button{padding:12px 16px;cursor:pointer}.form button:hover{background:rgba(255,255,255,.1)}.linkbox{width:100%;min-height:92px;padding:12px 14px;resize:vertical}.actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:10px}.actions button,.actions a{display:inline-flex;align-items:center;justify-content:center;padding:10px 14px;border-radius:10px;border:1px solid var(--line);background:rgba(255,255,255,.06);color:#fff;text-decoration:none;cursor:pointer}\n@media (max-width:900px){.lane{grid-template-columns:1fr}.head,.main{padding-left:18px;padding-right:18px}}\n</style>\n</head>\n<body>\n<div id=\"ascii\"></div>\n<div class=\"wrap\">\n  <header class=\"head\">\n    <div class=\"brand\"><div class=\"dot\"></div><div><div class=\"title\">POKE</div><div class=\"sub\">MASTER DASHBOARD</div></div></div>\n    <div class=\"meta\"><span class=\"pulse\"></span><span id=\"sync\">booting…</span></div>\n  </header>\n  <main class=\"main\">\n    <section id=\"loginView\" class=\"panel login\" style=\"display:none\">\n      <h1>send via poke login</h1>\n      <p>Enter your email for account identity. The login link will be sent directly via Poke (iMessage/WhatsApp), and the session cookie stays opaque, HttpOnly, Secure, and scoped to this master bridge host.</p>\n      <div class=\"form\">\n        <input id=\"email\" type=\"email\" placeholder=\"you@company.com\" autocomplete=\"email\" />\n        <button id=\"sendLink\">Send via Poke</button>\n      </div>\n      <div style=\"height:12px\"></div>\n      <textarea id=\"magicLink\" class=\"linkbox\" placeholder=\"check your Poke chat for the link\" readonly></textarea>\n      <div class=\"actions\">\n        <button id=\"openLink\">Open link</button>\n        <button id=\"logoutBtn\">Clear session</button>\n      </div>\n    </section>\n\n    <section id=\"appView\" style=\"display:none\">\n      <div class=\"panel\" style=\"padding:18px 18px 10px;margin-bottom:16px\">\n        <div class=\"row\"><div><div class=\"name\">session</div><div class=\"small\" id=\"whoami\">—</div></div><div class=\"badge b-active\" id=\"sessionState\">online</div></div>\n      </div>\n      <div class=\"grid\" id=\"stateGrid\"><div class=\"loading\"><div class=\"spin\"></div><span>loading agents…</span></div></div>\n      <div style=\"height:16px\"></div>\n      <div class=\"panel\" style=\"padding:18px\">\n        <div class=\"row\" style=\"margin-bottom:12px\"><div class=\"name\">recent events</div><div class=\"badge b-off\" id=\"eventCount\">0</div></div>\n        <div id=\"eventList\" style=\"display:grid;gap:10px\"></div>\n      </div>\n    </section>\n  </main>\n</div>\n<script>\nconst api = (path, init = {}) => fetch(path, { credentials: 'include', ...init, headers: { 'content-type': 'application/json', ...(init.headers || {}) } });\nconst asciiChars = '·•⋆◦∘⋄⟡';\nconst ascii = document.getElementById('ascii');\nconst syncEl = document.getElementById('sync');\nconst loginView = document.getElementById('loginView');\nconst appView = document.getElementById('appView');\nconst stateGrid = document.getElementById('stateGrid');\nconst whoami = document.getElementById('whoami');\nconst eventList = document.getElementById('eventList');\nconst eventCount = document.getElementById('eventCount');\nconst magicLink = document.getElementById('magicLink');\nconst email = document.getElementById('email');\nlet session = null;\nlet pollTimer = null;\nfunction genAscii(){const cols=Math.floor(innerWidth/8), rows=Math.floor(innerHeight/14); let out=''; for(let r=0;r<rows;r++){for(let c=0;c<cols;c++) out += Math.random()<.07 ? asciiChars[Math.floor(Math.random()*asciiChars.length)] : ' '; out+='\\n';} ascii.textContent = out;} window.addEventListener('resize', genAscii); genAscii(); setInterval(genAscii, 2600);\nfunction badgeFor(status=''){ const s = status.toLowerCase(); if (s.includes('active') || s.includes('running') || s.includes('busy')) return 'b-active'; if (s.includes('error') || s.includes('fail')) return 'b-error'; if (s.includes('idle') || s.includes('ready')) return 'b-idle'; return 'b-off'; }\nfunction relTime(ts){ if (!ts) return ''; const diff = Math.floor((Date.now() - new Date(ts).getTime()) / 1000); if (diff < 5) return 'just now'; if (diff < 60) return diff + 's ago'; if (diff < 3600) return Math.floor(diff / 60) + 'm ago'; return Math.floor(diff / 3600) + 'h ago'; }\nfunction esc(s){ return String(s).replace(/[&<>\\\"]/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[x])); }\nfunction dots(n){ let h=''; for(let i=0;i<n;i++) h += '<div class=\"mini' + (i%3===0 ? ' lit' : '') + '\"></div>'; return h; }\nfunction renderState(agents){ const entries = Object.values(agents || {}); if (!entries.length) { stateGrid.innerHTML = '<div class=\"empty\"><span>no subagents running</span></div>'; return; } stateGrid.innerHTML = entries.map(a => '<div class=\"card\"><div class=\"row\"><div class=\"name\">' + esc(a.agent_key || a.agent || 'agent') + '</div><div class=\"badge ' + badgeFor(a.status) + '\">' + esc(a.status || 'offline') + '</div></div><div class=\"task\">' + esc(a.task || a.message || 'no active task') + '</div><div class=\"dots\">' + dots(12) + '</div><div class=\"small\">updated ' + relTime(a.updatedAt || a.updated_at) + '</div></div>').join(''); }\nfunction renderEvents(events){ const list = events || []; eventCount.textContent = String(list.length); eventList.innerHTML = list.length ? list.map(e => '<div class=\"card\"><div class=\"row\"><div class=\"name\">' + esc(e.agent_key) + ' · ' + esc(e.event_type) + '</div><div class=\"badge ' + badgeFor(e.event_type) + '\">' + esc(relTime(e.created_at_iso || e.created_at)) + '</div></div><div class=\"task\">' + esc(e.payload_summary || e.payload_json || '') + '</div></div>').join('') : '<div class=\"empty\"><span>no events yet</span></div>'; }\nasync function loadMe(){ const r = await api('/api/me'); if (!r.ok) { session = null; loginView.style.display = ''; appView.style.display = 'none'; syncEl.textContent = 'not signed in'; return false; } session = await r.json(); loginView.style.display = 'none'; appView.style.display = ''; whoami.textContent = session.user.email + ' · tenant ' + session.user.id; syncEl.textContent = 'session live'; return true; }\nasync function loadDashboard(){ const r = await api('/api/state'); if (!r.ok) return; const data = await r.json(); renderState(data.agents); renderEvents(data.events); syncEl.textContent = 'updated ' + relTime(data.now); }\nasync function boot(){ const ok = await loadMe(); if (ok) { await loadDashboard(); clearInterval(pollTimer); pollTimer = setInterval(loadDashboard, 8000); } }\ndocument.getElementById('sendLink').onclick = async () => { const value = email.value.trim(); if (!value) return alert('enter an email'); const r = await api('/api/auth/request', { method: 'POST', body: JSON.stringify({ email: value }) }); const data = await r.json(); if (!r.ok) return alert(data.error || 'could not generate link'); magicLink.value = data.magicLink; if (data.magicLink) window.location.hash = '#magic-link-ready'; };\ndocument.getElementById('openLink').onclick = () => { if (magicLink.value) window.location.assign(magicLink.value); };\ndocument.getElementById('logoutBtn').onclick = async () => { await api('/api/logout', { method: 'POST' }); magicLink.value = ''; await boot(); };\nboot();\n</script>\n</body>\n</html>\n"

function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', ...headers },
  });
}

function text(body, status = 200, headers = {}) {
  return new Response(body, { status, headers });
}

function cookieValue(token) {
  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}`;
}

function clearCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

function getCookie(request, name) {
  const raw = request.headers.get('cookie') || '';
  for (const part of raw.split(/;\s*/)) {
    const idx = part.indexOf('=');
    if (idx === -1) continue;
    const key = part.slice(0, idx);
    if (key === name) return part.slice(idx + 1);
  }
  return null;
}

function hex(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function base64Url(bytes) {
  let str = '';
  for (const b of bytes) str += String.fromCharCode(b);
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function randomToken(length = 32) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return base64Url(bytes);
}

async function sha256Hex(input) {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(input));
  return hex(new Uint8Array(digest));
}

function now() {
  return Date.now();
}

async function ensureSchema(env) {
  if (!env?.POKE_DASHBOARD_DB) throw new Error('POKE_DASHBOARD_DB binding missing');
  if (!globalThis[SCHEMA_KEY]) {
    globalThis[SCHEMA_KEY] = env.POKE_DASHBOARD_DB.exec(SCHEMA_SQL);
  }
  return globalThis[SCHEMA_KEY];
}

function cleanEmail(email) {
  return String(email || '').trim().toLowerCase();
}

async function getSession(request, env) {
  const token = getCookie(request, COOKIE_NAME);
  if (!token) return null;
  const tokenHash = await sha256Hex(token);
  const current = await env.POKE_DASHBOARD_DB.prepare(
    `SELECT s.id AS session_id, s.user_id, s.expires_at, s.revoked_at, s.last_seen_at, u.email, u.name
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.session_hash = ?`
  ).bind(tokenHash).first();
  if (!current) return null;
  if (current.revoked_at || current.expires_at <= now()) return null;
  await env.POKE_DASHBOARD_DB.prepare(
    `UPDATE sessions SET last_seen_at = ? WHERE session_hash = ?`
  ).bind(now(), tokenHash).run();
  return {
    user: { id: String(current.user_id), email: current.email, name: current.name || null },
    session: { id: current.session_id, expiresAt: current.expires_at, lastSeenAt: current.last_seen_at },
    tokenHash,
  };
}

async function createOrGetUser(env, email, name = null) {
  const existing = await env.POKE_DASHBOARD_DB.prepare(
    `SELECT id, email, name FROM users WHERE email = ?`
  ).bind(email).first();
  if (existing) {
    if (name && name !== existing.name) {
      await env.POKE_DASHBOARD_DB.prepare(
        `UPDATE users SET name = COALESCE(?, name), updated_at = ? WHERE id = ?`
      ).bind(name, now(), existing.id).run();
    }
    return { id: existing.id, email: existing.email, name: name || existing.name || null };
  }
  const created = await env.POKE_DASHBOARD_DB.prepare(
    `INSERT INTO users (email, name, created_at, updated_at) VALUES (?, ?, ?, ?)`
  ).bind(email, name, now(), now()).run();
  return { id: created.meta.last_row_id, email, name };
}

async function appendEvent(env, tenantId, agentKey, eventType, payload) {
  await env.POKE_DASHBOARD_DB.prepare(
    `INSERT INTO agentevents (tenant_id, agent_key, event_type, payload_json, created_at) VALUES (?, ?, ?, ?, ?)`
  ).bind(tenantId, agentKey, eventType, JSON.stringify(payload), now()).run();
}

async function upsertState(env, tenantId, agentKey, payload) {
  const ts = now();
  await env.POKE_DASHBOARD_DB.prepare(
    `INSERT INTO agentstate (tenant_id, agent_key, state_json, updated_at, created_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(tenant_id, agent_key) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at`
  ).bind(tenantId, agentKey, JSON.stringify(payload), ts, ts).run();
  if (env.POKE_DASHBOARD_KV) {
    await env.POKE_DASHBOARD_KV.put(`tenant:${tenantId}:state:${agentKey}`, JSON.stringify({ ...payload, agent_key: agentKey, updatedAt: ts }));
  }
  await appendEvent(env, tenantId, agentKey, 'state_update', payload);
}

async function listState(env, tenantId) {
  const rows = await env.POKE_DASHBOARD_DB.prepare(
    `SELECT agent_key, state_json, updated_at, created_at FROM agentstate WHERE tenant_id = ? ORDER BY updated_at DESC`
  ).bind(tenantId).all();
  const agents = {};
  for (const row of rows.results || []) {
    let parsed = {};
    try { parsed = JSON.parse(row.state_json); } catch {}
    agents[row.agent_key] = { ...parsed, agent_key: row.agent_key, updated_at: row.updated_at, created_at: row.created_at };
  }
  return agents;
}

async function listEvents(env, tenantId, limit = 50) {
  const rows = await env.POKE_DASHBOARD_DB.prepare(
    `SELECT agent_key, event_type, payload_json, created_at FROM agentevents WHERE tenant_id = ? ORDER BY created_at DESC LIMIT ?`
  ).bind(tenantId, limit).all();
  return (rows.results || []).map((row) => ({
    agent_key: row.agent_key,
    event_type: row.event_type,
    payload_json: row.payload_json,
    payload_summary: (() => {
      try {
        const parsed = JSON.parse(row.payload_json);
        return parsed.task || parsed.message || parsed.status || row.payload_json;
      } catch {
        return row.payload_json;
      }
    })(),
    created_at: row.created_at,
    created_at_iso: new Date(row.created_at).toISOString(),
  }));
}

function apiPath(url) {
  const p = url.pathname;
  if (p === '/status') return '/api/state';
  if (p.startsWith('/status/')) return `/api/state/${p.slice('/status/'.length)}`;
  return p;
}

function agentFromPath(pathname) {
  const parts = pathname.split('/').filter(Boolean);
  return parts[parts.length - 1] || '';
}

async function dispatchPokeMagicLinkNotification(payload, env) {
  const token = env?.POKE_WEBHOOK_TOKEN;
  if (!token) throw new Error('missing POKE_WEBHOOK_TOKEN');
  const response = await fetch(POKE_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ' + token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });
  if (!response.ok) {
    throw new Error('poke webhook failed: ' + response.status);
  }
}

export default {
  async fetch(request, env) {
    await ensureSchema(env);
    const url = new URL(request.url);
    const path = apiPath(url);

    if (request.method === 'GET' && path === '/') {
      return text(HTML, 200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    }

    if (request.method === 'GET' && path === '/api/me') {
      const session = await getSession(request, env);
      if (!session) return json({ authenticated: false }, 401);
      return json({ authenticated: true, user: session.user, session: session.session });
    }

    if (request.method === 'POST' && path === '/api/auth/request') {
      const body = await request.json().catch(() => ({}));
      const email = cleanEmail(body.email);
      if (!email || !email.includes('@')) return json({ ok: false, error: 'email is required' }, 400);
      const user = await createOrGetUser(env, email, body.name || null);
      const token = randomToken(32);
      const tokenHash = await sha256Hex(token);
      const id = crypto.randomUUID();
      const expiresAt = now() + MAGICLINK_TTL_SECONDS * 1000;
      await env.POKE_DASHBOARD_DB.prepare(
        `INSERT INTO magiclinks (id, user_id, email, token_hash, expires_at, created_at) VALUES (?, ?, ?, ?, ?, ?)`
      ).bind(id, user.id, email, tokenHash, expiresAt, now()).run();
      const magicLink = `${url.origin}/api/auth/consume?token=${encodeURIComponent(token)}`;
      try {
        await dispatchPokeMagicLinkNotification({
          email,
          magicLink,
          expiresAt,
          userId: user.id,
          source: 'poke-agent-dashboard',
          event: 'magic_link_requested',
        }, env);
      } catch (error) {
        console.error('poke notification delivery failed', error);
      }
      return json({ ok: true, email, expiresAt, notificationQueued: true, note: 'Magic link queued for Poke delivery.' });
    }

    if ((request.method === 'GET' || request.method === 'POST') && path === '/api/auth/consume') {
      const body = request.method === 'POST' ? await request.json().catch(() => ({})) : {};
      const token = url.searchParams.get('token') || body.token;
      if (!token) return json({ ok: false, error: 'token required' }, 400);
      const tokenHash = await sha256Hex(token);
      const link = await env.POKE_DASHBOARD_DB.prepare(
        `SELECT id, user_id, email, expires_at, consumed_at FROM magiclinks WHERE token_hash = ?`
      ).bind(tokenHash).first();
      if (!link || link.consumed_at || link.expires_at <= now()) return json({ ok: false, error: 'invalid or expired token' }, 400);
      const sessionId = crypto.randomUUID();
      const sessionToken = randomToken(48);
      const sessionHash = await sha256Hex(sessionToken);
      const sessionExpiresAt = now() + SESSION_TTL_SECONDS * 1000;
      const userAgent = request.headers.get('user-agent') || null;
      const ip = request.headers.get('cf-connecting-ip') || null;
      await env.POKE_DASHBOARD_DB.prepare(
        `INSERT INTO sessions (id, user_id, session_hash, expires_at, created_at, last_seen_at, user_agent, ip) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(sessionId, link.user_id, sessionHash, sessionExpiresAt, now(), now(), userAgent, ip).run();
      await env.POKE_DASHBOARD_DB.prepare(
        `UPDATE magiclinks SET consumed_at = ?, consumed_session_id = ?, used_ip = ?, used_user_agent = ? WHERE id = ?`
      ).bind(now(), sessionId, ip, userAgent, link.id).run();
      const headers = new Headers({ 'set-cookie': cookieValue(sessionToken) });
      if (request.method === 'GET') {
        headers.set('location', '/');
        return new Response(null, { status: 302, headers });
      }
      return json({ ok: true, authenticated: true, sessionId, expiresAt: sessionExpiresAt }, 200, Object.fromEntries(headers.entries()));
    }

    if (request.method === 'POST' && path === '/api/logout') {
      const session = await getSession(request, env);
      if (session) {
        await env.POKE_DASHBOARD_DB.prepare(`UPDATE sessions SET revoked_at = ? WHERE session_hash = ?`).bind(now(), session.tokenHash).run();
      }
      return json({ ok: true }, 200, { 'set-cookie': clearCookie() });
    }

    if (request.method === 'GET' && path === '/api/state') {
      const session = await getSession(request, env);
      if (!session) return json({ ok: false, error: 'unauthorized' }, 401);
      const [agents, events] = await Promise.all([
        listState(env, session.user.id),
        listEvents(env, session.user.id),
      ]);
      return json({ ok: true, tenantId: session.user.id, agents, events, now: now() });
    }

    if (request.method === 'POST' && path === '/api/state') {
      const session = await getSession(request, env);
      if (!session) return json({ ok: false, error: 'unauthorized' }, 401);
      const body = await request.json().catch(() => ({}));
      const agentKey = cleanEmail(body.agent || body.agent_key || body.key || 'default') || String(body.agent || body.key || 'default');
      await upsertState(env, session.user.id, agentKey, { ...body, agent_key: agentKey, updatedAt: now() });
      return json({ ok: true, agent: agentKey });
    }

    if (request.method === 'DELETE' && path.startsWith('/api/state/')) {
      const session = await getSession(request, env);
      if (!session) return json({ ok: false, error: 'unauthorized' }, 401);
      const agentKey = decodeURIComponent(agentFromPath(path));
      await env.POKE_DASHBOARD_DB.prepare(`DELETE FROM agentstate WHERE tenant_id = ? AND agent_key = ?`).bind(session.user.id, agentKey).run();
      if (env.POKE_DASHBOARD_KV) await env.POKE_DASHBOARD_KV.delete(`tenant:${session.user.id}:state:${agentKey}`);
      await appendEvent(env, session.user.id, agentKey, 'state_delete', { deleted: true });
      return json({ ok: true, agent: agentKey });
    }

    if (request.method === 'GET' && path === '/api/events') {
      const session = await getSession(request, env);
      if (!session) return json({ ok: false, error: 'unauthorized' }, 401);
      return json({ ok: true, events: await listEvents(env, session.user.id) });
    }

    if (request.method === 'POST' && path === '/api/events') {
      const session = await getSession(request, env);
      if (!session) return json({ ok: false, error: 'unauthorized' }, 401);
      const body = await request.json().catch(() => ({}));
      const agentKey = cleanEmail(body.agent || body.agent_key || body.key || 'default') || String(body.agent || body.key || 'default');
      const eventType = String(body.event_type || body.type || 'event');
      const payload = body.payload ?? body;
      await appendEvent(env, session.user.id, agentKey, eventType, payload);
      return json({ ok: true });
    }

    if (request.method === 'GET' && path === '/og') {
      const session = await getSession(request, env);
      const count = session ? Object.keys(await listState(env, session.user.id)).length : 0;
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#2248cf"/><text x="600" y="290" text-anchor="middle" font-family="monospace" font-size="120" fill="#fff">${count}</text><text x="600" y="360" text-anchor="middle" font-family="monospace" font-size="24" fill="#fff">subagents online</text></svg>`;
      return text(svg, 200, { 'content-type': 'image/svg+xml', 'cache-control': 'public, max-age=30, stale-while-revalidate=10' });
    }

    return json({ ok: false, error: 'not found' }, 404);
  },
};
