const ACCOUNT_DOMAIN = '.perez-jg22.workers.dev';
const DASHBOARD_ORIGIN = 'https://poke-agent-dashboard-live.perez-jg22.workers.dev';
const BRIDGE_ORIGIN = 'https://poke-agent-bridge.perez-jg22.workers.dev';
const COOKIE_NAME = 'poke_session';
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 30;
const MAGICLINK_TTL_SECONDS = 60 * 15;
const STATUS_TTL_SECONDS = 60 * 60 * 24 * 7;
const PASSWORD_HASH_ITERATIONS = 120000;
const PASSWORD_HASH_PREFIX = 'pbkdf2-sha256';
const ALLOWED_ORIGINS = new Set([DASHBOARD_ORIGIN, BRIDGE_ORIGIN]);
const encoder = new TextEncoder();

const POKE_WEBHOOK_URL = 'https://poke.com/api/v1/inbound/webhook';

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE COLLATE NOCASE,
  name TEXT,
  displayname TEXT,
  display_name TEXT,
  role TEXT NOT NULL DEFAULT 'member',
  passwordHash TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  session_hash TEXT NOT NULL UNIQUE,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  revoked_at TEXT,
  user_agent TEXT,
  ip TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_expires_at ON sessions(expires_at);
CREATE TABLE IF NOT EXISTS magiclinks (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  email TEXT NOT NULL,
  token_hash TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  consumed_session_id TEXT,
  request_ip TEXT,
  request_user_agent TEXT
);
CREATE INDEX IF NOT EXISTS idx_magiclinks_user_id ON magiclinks(user_id);
CREATE INDEX IF NOT EXISTS idx_magiclinks_expires_at ON magiclinks(expires_at);
CREATE TABLE IF NOT EXISTS agentstate (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  agent_key TEXT NOT NULL,
  state_json TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE UNIQUE INDEX IF NOT EXISTS idx_agentstate_user_agent ON agentstate(user_id, agent_key);
CREATE INDEX IF NOT EXISTS idx_agentstate_updated_at ON agentstate(updated_at);
CREATE TABLE IF NOT EXISTS agentevents (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  tenant_id TEXT NOT NULL,
  agent_key TEXT NOT NULL,
  event_type TEXT NOT NULL,
  event_json TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_agentevents_user_agent ON agentevents(user_id, agent_key);
CREATE INDEX IF NOT EXISTS idx_agentevents_created_at ON agentevents(created_at);
`;

let schemaReadyPromise = null;

async function dispatchPokeMagicLinkNotification(payload, env) {
  const response = await fetch(POKE_WEBHOOK_URL, {
    method: 'POST',
    headers: {
      Authorization: 'Bearer ' + env.POKE_WEBHOOK_TOKEN,
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
    const url = new URL(request.url);
    const origin = request.headers.get('Origin');
    const cors = buildCors(origin);
    try {
      if (request.method === 'OPTIONS') {
        return new Response(null, { headers: cors });
      }

      await ensureSchema(env.POKE_DASHBOARD_DB);

      if (url.pathname === '/api/health') {
        return json({ ok: true, service: 'poke-agent-bridge' }, cors);
      }

      if (url.pathname === '/api/auth/signup' && request.method === 'POST') {
        return handleSignup(request, env, cors);
      }

      if (url.pathname === '/api/auth/login' && request.method === 'POST') {
        return handleLogin(request, env, cors);
      }

      if (url.pathname === '/api/auth/request' && request.method === 'POST') {
        return handleMagicLinkRequest(request, env, cors);
      }

      if (url.pathname === '/api/auth/verify') {
        return handleMagicLinkVerify(request, env, cors);
      }

      if (url.pathname === '/api/auth/logout' && request.method === 'POST') {
        return handleLogout(request, env, cors);
      }

      if (url.pathname === '/api/me' && request.method === 'GET') {
        return handleMe(request, env, cors);
      }

      if (url.pathname === '/api/status' || url.pathname.startsWith('/api/status/')) {
        return handleStatusApi(request, env, cors);
      }

      if (url.pathname === '/api/agents/spin-up' && request.method === 'POST') {
        return handleAgentSpinUp(request, env, cors);
      }

      if (url.pathname === '/api/agents/history' && request.method === 'GET') {
        return handleAgentHistory(request, env, cors);
      }

      if (url.pathname === '/og') {
        return handleOg(request, env, cors);
      }

      return json({ ok: false, error: 'not found' }, cors, 404);
    } catch (error) {
      console.error('bridge error', error);
      return json({ ok: false, error: error && error.message ? error.message : String(error) }, cors, 500);
    }
  },
};

function buildCors(origin) {
  const allowOrigin = origin && ALLOWED_ORIGINS.has(origin) ? origin : DASHBOARD_ORIGIN;
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
    Vary: 'Origin',
  };
}

function json(data, headers = {}, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...headers },
  });
}

function getCookie(request, name) {
  const cookieHeader = request.headers.get('Cookie') || '';
  for (const pair of cookieHeader.split(';')) {
    const trimmed = pair.trim();
    if (!trimmed) continue;
    const index = trimmed.indexOf('=');
    if (index === -1) continue;
    const key = trimmed.slice(0, index);
    const value = trimmed.slice(index + 1);
    if (key === name) return decodeURIComponent(value);
  }
  return null;
}

function cookieHeader(token, maxAge = SESSION_TTL_SECONDS) {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; HttpOnly; Secure; SameSite=Lax; Domain=${ACCOUNT_DOMAIN}`;
}

function nowIso() {
  return new Date().toISOString();
}

function plusSeconds(seconds) {
  return new Date(Date.now() + seconds * 1000).toISOString();
}

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function normalizeAgent(agent) {
  return String(agent || '').trim();
}

function tenantIdForUser(user) {
  return String(user.id);
}

function opaqueToken(size = 32) {
  const bytes = new Uint8Array(size);
  crypto.getRandomValues(bytes);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sha256(value) {
  const bytes = encoder.encode(value);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function bytesToBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function base64UrlToBytes(value) {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (value.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

function constantTimeEqual(a, b) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function hashPassword(password) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const derived = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: PASSWORD_HASH_ITERATIONS },
    key,
    256,
  );
  return [
    PASSWORD_HASH_PREFIX,
    String(PASSWORD_HASH_ITERATIONS),
    bytesToBase64Url(salt),
    bytesToBase64Url(new Uint8Array(derived)),
  ].join('$');
}

async function verifyPassword(password, storedHash) {
  const [prefix, iterationsStr, saltB64, hashB64] = String(storedHash || '').split('$');
  if (prefix !== PASSWORD_HASH_PREFIX || !iterationsStr || !saltB64 || !hashB64) return false;
  const iterations = Number(iterationsStr);
  if (!Number.isFinite(iterations) || iterations < 1) return false;
  const salt = base64UrlToBytes(saltB64);
  const expected = base64UrlToBytes(hashB64);
  const key = await crypto.subtle.importKey('raw', encoder.encode(password), 'PBKDF2', false, ['deriveBits']);
  const derived = new Uint8Array(
    await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, key, expected.length * 8),
  );
  if (derived.length !== expected.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) diff |= expected[i] ^ derived[i];
  return diff === 0;
}

async function dbFirst(db, sql, params = []) {
  return await db.prepare(sql).bind(...params).first();
}

async function dbAll(db, sql, params = []) {
  return await db.prepare(sql).bind(...params).all();
}

async function dbRun(db, sql, params = []) {
  return await db.prepare(sql).bind(...params).run();
}

async function hasColumn(db, table, column) {
  const info = await dbAll(db, `PRAGMA table_info(${table})`);
  return (info.results || []).some((row) => row.name === column);
}

async function addColumnIfMissing(db, table, columnDef) {
  const columnName = columnDef.split(/\s+/)[0].replace(/[`"\[\]]/g, '');
  if (await hasColumn(db, table, columnName)) return;
  await db.exec(`ALTER TABLE ${table} ADD COLUMN ${columnDef}`);
}

async function ensureSchema(db) {
  if (!schemaReadyPromise) {
    schemaReadyPromise = (async () => {
      try {
        await addColumnIfMissing(db, 'users', 'passwordHash TEXT');
      } catch (error) {
        console.error('schema init failed', error);
      }
    })();
  }
  return await schemaReadyPromise;
}

async function ensureUser(db, email, displayName = null) {
  const normalizedEmail = normalizeEmail(email);
  const existing = await dbFirst(db, 'SELECT * FROM users WHERE email = ?1 LIMIT 1', [normalizedEmail]);
  if (existing) return existing;
  const id = crypto.randomUUID();
  const createdAt = nowIso();
  await dbRun(db, `INSERT INTO users (id, email, displayname, display_name, role, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)`, [
    id,
    normalizedEmail,
    displayName,
    displayName,
    'member',
    createdAt,
    createdAt,
  ]);
  return await dbFirst(db, 'SELECT * FROM users WHERE email = ?1 LIMIT 1', [normalizedEmail]);
}

async function updatePasswordForUser(db, userId, passwordHash) {
  await dbRun(db, `UPDATE users SET passwordHash = ?1, updated_at = ?2 WHERE id = ?3`, [passwordHash, nowIso(), userId]);
  return await dbFirst(db, 'SELECT * FROM users WHERE id = ?1 LIMIT 1', [userId]);
}

async function createSession(env, user, requestMeta = {}) {
  const sessionToken = opaqueToken(48);
  const tokenHash = await sha256(sessionToken);
  const sessionId = crypto.randomUUID();
  const tenantId = tenantIdForUser(user);
  const createdAt = nowIso();
  const expiresAt = plusSeconds(SESSION_TTL_SECONDS);
  await dbRun(env.POKE_DASHBOARD_DB, `INSERT INTO sessions
    (id, user_id, tenant_id, token_hash, created_at, expires_at, last_seen_at, user_agent, ip_address)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?5, ?7, ?8)`, [
      sessionId,
      user.id,
      tenantId,
      tokenHash,
      createdAt,
      expiresAt,
      requestMeta.userAgent || null,
      requestMeta.ipAddress || null,
    ]);
  await env.POKE_SESSIONS.put(
    `user:${user.id}:session:${tokenHash}`,
    JSON.stringify({
      sessionId,
      tokenHash,
      userId: user.id,
      email: user.email,
      tenantId,
      createdAt,
      expiresAt,
      userAgent: requestMeta.userAgent || null,
      ipAddress: requestMeta.ipAddress || null,
    }),
    { expirationTtl: SESSION_TTL_SECONDS },
  );
  return { sessionToken, tokenHash, sessionId, expiresAt, tenantId };
}

async function getSessionFromRequest(request, env) {
  const token = getCookie(request, COOKIE_NAME);
  if (!token) return null;
  const tokenHash = await sha256(token);
  const session = await dbFirst(env.POKE_DASHBOARD_DB, `
    SELECT s.*, u.email, u.displayname, u.display_name, u.role, u.passwordHash
    FROM sessions s
    JOIN users u ON u.id = s.user_id
    WHERE s.token_hash = ?1 AND s.revoked_at IS NULL AND s.expires_at > ?2
    LIMIT 1`, [tokenHash, nowIso()]);
  if (!session) return null;
  await env.POKE_SESSIONS.put(
    `user:${session.user_id}:session:${tokenHash}`,
    JSON.stringify(session),
    { expirationTtl: SESSION_TTL_SECONDS },
  );
  return session;
}

async function requireSession(request, env, cors) {
  const session = await getSessionFromRequest(request, env);
  if (!session) {
    return { response: json({ ok: false, authenticated: false, error: 'unauthorized' }, cors, 401) };
  }
  return { session };
}

async function issueAuthSession(request, env, cors, user) {
  const session = await createSession(env, user, {
    userAgent: request.headers.get('User-Agent') || null,
    ipAddress: request.headers.get('CF-Connecting-IP') || null,
  });
  return json(
    {
      ok: true,
      authenticated: true,
      email: user.email,
      userId: user.id,
      tenantId: session.tenantId,
      expiresAt: session.expiresAt,
      redirectTo: DASHBOARD_ORIGIN,
    },
    { ...cors, 'Set-Cookie': cookieHeader(session.sessionToken) },
  );
}

async function readJson(request) {
  return await request.json().catch(() => ({}));
}

async function handleSignup(request, env, cors) {
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const password = String(body.password || '');
  const displayName = body.name ? String(body.name).trim() : null;
  if (!email || !email.includes('@')) {
    return json({ ok: false, error: 'valid email required' }, cors, 400);
  }
  if (password.length < 8) {
    return json({ ok: false, error: 'password must be at least 8 characters' }, cors, 400);
  }
  let user = await ensureUser(env.POKE_DASHBOARD_DB, email, displayName);
  if (user.passwordHash) {
    return json({ ok: false, error: 'account already exists; please log in or request a magic link' }, cors, 409);
  }
  const passwordHash = await hashPassword(password);
  user = await updatePasswordForUser(env.POKE_DASHBOARD_DB, user.id, passwordHash);
  return await issueAuthSession(request, env, cors, user);
}

async function handleLogin(request, env, cors) {
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  const password = String(body.password || '');
  if (!email || !email.includes('@')) {
    return json({ ok: false, error: 'valid email required' }, cors, 400);
  }
  const user = await dbFirst(env.POKE_DASHBOARD_DB, 'SELECT * FROM users WHERE email = ?1 LIMIT 1', [email]);
  if (!user || !user.passwordHash) {
    return json({ ok: false, error: 'account not found or password login not enabled; use signup or magic link' }, cors, 401);
  }
  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return json({ ok: false, error: 'invalid email or password' }, cors, 401);
  }
  return await issueAuthSession(request, env, cors, user);
}

async function handleMagicLinkRequest(request, env, cors) {
  const body = await readJson(request);
  const email = normalizeEmail(body.email);
  if (!email || !email.includes('@')) {
    return json({ ok: false, error: 'valid email required' }, cors, 400);
  }
  const user = await ensureUser(env.POKE_DASHBOARD_DB, email, body.name ? String(body.name).trim() : null);
  const token = opaqueToken(24);
  const tokenHash = await sha256(token);
  const id = crypto.randomUUID();
  const tenantId = tenantIdForUser(user);
  const createdAt = nowIso();
  const expiresAt = plusSeconds(MAGICLINK_TTL_SECONDS);
  await dbRun(env.POKE_DASHBOARD_DB, `INSERT INTO magiclinks
    (id, user_id, tenant_id, email, token_hash, created_at, expires_at, request_ip, request_user_agent)
    VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)`, [
      id,
      user.id,
      tenantId,
      email,
      tokenHash,
      createdAt,
      expiresAt,
      request.headers.get('CF-Connecting-IP') || null,
      request.headers.get('User-Agent') || null,
    ]);
  await env.POKE_SESSIONS.put(
    `user:${user.id}:magic:${tokenHash}`,
    JSON.stringify({ id, email, userId: user.id, tenantId, tokenHash, expiresAt }),
    { expirationTtl: MAGICLINK_TTL_SECONDS },
  );
  const magicLink = `${DASHBOARD_ORIGIN}/?token=${encodeURIComponent(token)}`;
  try {
    await dispatchPokeMagicLinkNotification({
      email,
      magicLink,
      expiresAt,
      tenantId,
      source: 'poke-agent-dashboard',
      event: 'magic_link_requested',
      purpose: user.passwordHash ? 'password_reset_or_sign_in' : 'first_time_sign_in',
    }, env);
  } catch (error) {
    console.error('poke notification delivery failed', error);
  }
  return json({ ok: true, email, expiresAt, notificationQueued: true, note: 'Magic link queued for Poke delivery.' }, cors);
}

async function handleMagicLinkVerify(request, env, cors) {
  const url = new URL(request.url);
  let token = url.searchParams.get('token');
  if (request.method === 'POST') {
    const body = await readJson(request);
    token = token || body.token || '';
  }
  if (!token) return json({ ok: false, error: 'token required' }, cors, 400);
  const tokenHash = await sha256(token);
  const link = await dbFirst(env.POKE_DASHBOARD_DB, `SELECT * FROM magiclinks WHERE token_hash = ?1 LIMIT 1`, [tokenHash]);
  if (!link || link.consumed_at || link.expires_at <= nowIso()) {
    return json({ ok: false, error: 'invalid or expired token' }, cors, 401);
  }
  const user = await dbFirst(env.POKE_DASHBOARD_DB, 'SELECT * FROM users WHERE id = ?1 LIMIT 1', [link.user_id]) || await ensureUser(env.POKE_DASHBOARD_DB, link.email);
  const session = await createSession(env, user, {
    userAgent: request.headers.get('User-Agent') || null,
    ipAddress: request.headers.get('CF-Connecting-IP') || null,
  });
  await dbRun(env.POKE_DASHBOARD_DB, `UPDATE magiclinks SET consumed_at = ?1, consumed_session_id = ?2 WHERE id = ?3`, [nowIso(), session.sessionId, link.id]);
  if (request.method === 'GET') {
    return new Response(null, {
      status: 302,
      headers: {
        Location: DASHBOARD_ORIGIN,
        'Set-Cookie': cookieHeader(session.sessionToken),
        ...cors,
      },
    });
  }
  return json({ ok: true, authenticated: true, email: user.email, userId: user.id, tenantId: session.tenantId, expiresAt: session.expiresAt, redirectTo: DASHBOARD_ORIGIN }, { ...cors, 'Set-Cookie': cookieHeader(session.sessionToken) });
}

async function handleLogout(request, env, cors) {
  const session = await getSessionFromRequest(request, env);
  if (session) {
    await dbRun(env.POKE_DASHBOARD_DB, `UPDATE sessions SET revoked_at = ?1 WHERE token_hash = ?2`, [nowIso(), session.token_hash]);
    await env.POKE_SESSIONS.delete(`user:${session.user_id}:session:${session.token_hash}`);
  }
  return json({ ok: true }, { ...cors, 'Set-Cookie': `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Lax; Domain=${ACCOUNT_DOMAIN}` });
}

async function handleMe(request, env, cors) {
  const session = await getSessionFromRequest(request, env);
  if (!session) return json({ ok: false, authenticated: false, error: 'unauthorized' }, cors, 401);
  await dbRun(env.POKE_DASHBOARD_DB, `UPDATE sessions SET last_seen_at = ?1 WHERE token_hash = ?2`, [nowIso(), session.token_hash]);
  return json(
    {
      ok: true,
      authenticated: true,
      user: {
        id: session.user_id,
        email: session.email,
        name: session.displayname || session.display_name || session.name,
        tenantId: session.tenant_id,
      },
      session: {
        expiresAt: session.expires_at,
        sessionId: session.id,
      },
    },
    cors,
  );
}

async function handleStatusApi(request, env, cors) {
  const auth = await requireSession(request, env, cors);
  if (auth.response) return auth.response;
  const session = auth.session;
  const userId = session.user_id;
  const tenantId = session.tenant_id || userId;
  const url = new URL(request.url);
  const agentKey = normalizeAgent(url.pathname.split('/').slice(3).join('/'));

  if (request.method === 'GET' && url.pathname === '/api/status') {
    const rows = await dbAll(env.POKE_DASHBOARD_DB, `SELECT * FROM agentstate WHERE user_id = ?1 ORDER BY updated_at DESC`, [userId]);
    return json({ ok: true, userId, tenantId, agents: rows.results || [] }, cors);
  }

  if (request.method === 'GET' && url.pathname.startsWith('/api/status/')) {
    if (!agentKey) return json({ ok: false, error: 'agent required' }, cors, 400);
    const row = await dbFirst(env.POKE_DASHBOARD_DB, `SELECT * FROM agentstate WHERE user_id = ?1 AND agent_key = ?2 LIMIT 1`, [userId, agentKey]);
    if (!row) return json({ ok: false, error: 'not found' }, cors, 404);
    return json({ ok: true, agent: row }, cors);
  }

  if (request.method === 'POST' && url.pathname === '/api/status') {
    const body = await readJson(request);
    const agent = normalizeAgent(body.agent || body.agent_key);
    if (!agent) return json({ ok: false, error: 'agent required' }, cors, 400);
    const stateJson = JSON.stringify({
      agent,
      status: String(body.status || 'idle'),
      task: body.task || '',
      details: body.details || null,
      updatedAt: nowIso(),
      userId,
    });
    const id = crypto.randomUUID();
    const createdAt = nowIso();
    await dbRun(env.POKE_DASHBOARD_DB, `INSERT INTO agentstate (id, user_id, tenant_id, agent_key, state_json, updated_at, created_at)
      VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)
      ON CONFLICT(user_id, agent_key) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at`, [
        id,
        userId,
        tenantId,
        agent,
        stateJson,
        createdAt,
        createdAt,
      ]);
    await dbRun(env.POKE_DASHBOARD_DB, `INSERT INTO agentevents (id, user_id, tenant_id, agent_key, event_type, event_json, created_at)
      VALUES (?1, ?2, ?3, ?4, 'status-upsert', ?5, ?6)`, [crypto.randomUUID(), userId, tenantId, agent, stateJson, createdAt]);
    await env.POKEAGENTSTATUS.put(`user:${userId}:agent:${agent}`, stateJson, { expirationTtl: STATUS_TTL_SECONDS });
    return json({ ok: true, userId, tenantId, agent, state: JSON.parse(stateJson) }, cors);
  }

  if (request.method === 'DELETE' && url.pathname.startsWith('/api/status/')) {
    if (!agentKey) return json({ ok: false, error: 'agent required' }, cors, 400);
    const existing = await dbFirst(env.POKE_DASHBOARD_DB, `SELECT * FROM agentstate WHERE user_id = ?1 AND agent_key = ?2 LIMIT 1`, [userId, agentKey]);
    await dbRun(env.POKE_DASHBOARD_DB, `DELETE FROM agentstate WHERE user_id = ?1 AND agent_key = ?2`, [userId, agentKey]);
    await dbRun(env.POKE_DASHBOARD_DB, `INSERT INTO agentevents (id, user_id, tenant_id, agent_key, event_type, event_json, created_at)
      VALUES (?1, ?2, ?3, ?4, 'status-delete', ?5, ?6)`, [crypto.randomUUID(), userId, tenantId, agentKey, JSON.stringify({ agent: agentKey, deleted: true, previous: !!existing, userId }), nowIso()]);
    await env.POKEAGENTSTATUS.delete(`user:${userId}:agent:${agentKey}`);
    return json({ ok: true, userId, tenantId, agent: agentKey, deleted: true }, cors);
  }

  return json({ ok: false, error: 'not found' }, cors, 404);
}

function parseEventJson(value) {
  try {
    return JSON.parse(value || '{}');
  } catch (error) {
    return { raw: String(value || '') };
  }
}

async function handleAgentSpinUp(request, env, cors) {
  const auth = await requireSession(request, env, cors);
  if (auth.response) return auth.response;
  const session = auth.session;
  const userId = session.user_id;
  const tenantId = session.tenant_id || userId;
  const body = await readJson(request);
  const agent = normalizeAgent(body.agent || body.agent_key || body.name);
  if (!agent) return json({ ok: false, error: 'agent required' }, cors, 400);
  const now = nowIso();
  const status = String(body.status || 'working');
  const task = String(body.task || body.prompt || 'spinning up subagent');
  const details = body.details != null ? String(body.details) : (body.prompt != null ? String(body.prompt) : null);
  const stateJson = JSON.stringify({
    agent,
    status,
    task,
    details,
    updatedAt: now,
    userId,
    spinUp: true,
  });
  const eventJson = JSON.stringify({
    agent,
    action: 'spin-up',
    status,
    task,
    details,
    createdAt: now,
    userId,
  });
  const id = crypto.randomUUID();
  await dbRun(env.POKE_DASHBOARD_DB, 'INSERT INTO agentstate (id, user_id, tenant_id, agent_key, state_json, updated_at, created_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7) ON CONFLICT(user_id, agent_key) DO UPDATE SET state_json = excluded.state_json, updated_at = excluded.updated_at', [
    id,
    userId,
    tenantId,
    agent,
    stateJson,
    now,
    now,
  ]);
  await dbRun(env.POKE_DASHBOARD_DB, 'INSERT INTO agentevents (id, user_id, tenant_id, agent_key, event_type, event_json, created_at) VALUES (?1, ?2, ?3, ?4, \'agent-spin-up\', ?5, ?6)', [crypto.randomUUID(), userId, tenantId, agent, eventJson, now]);
  await env.POKEAGENTSTATUS.put(`user:${userId}:agent:${agent}`, stateJson, { expirationTtl: STATUS_TTL_SECONDS });
  return json({ ok: true, userId, tenantId, agent, state: JSON.parse(stateJson), event: parseEventJson(eventJson) }, cors);
}

async function handleAgentHistory(request, env, cors) {
  const auth = await requireSession(request, env, cors);
  if (auth.response) return auth.response;
  const session = auth.session;
  const userId = session.user_id;
  const tenantId = session.tenant_id || userId;
  const url = new URL(request.url);
  const agent = normalizeAgent(url.searchParams.get('agent'));
  const limitRaw = Number(url.searchParams.get('limit') || 20);
  const limit = Math.max(1, Math.min(100, Number.isFinite(limitRaw) ? Math.floor(limitRaw) : 20));
  const params = [userId];
  let clause = 'user_id = ?1';
  if (agent) {
    clause += ' AND agent_key = ?2';
    params.push(agent);
  }
  const rows = await dbAll(env.POKE_DASHBOARD_DB, `SELECT * FROM agentevents WHERE ${clause} ORDER BY created_at DESC LIMIT ${limit}`, params);
  const events = (rows.results || []).map((row) => ({
    id: row.id,
    agent: row.agent_key,
    eventType: row.event_type,
    event: parseEventJson(row.event_json),
    createdAt: row.created_at,
    tenantId: row.tenant_id,
  }));
  return json({ ok: true, userId, tenantId, events }, cors);
}

async function handleOg(request, env, cors) {
  const session = await getSessionFromRequest(request, env);
  const userId = session?.user_id || null;
  const countRow = userId
    ? await dbFirst(env.POKE_DASHBOARD_DB, `SELECT COUNT(*) AS count FROM agentstate WHERE user_id = ?1`, [userId])
    : await dbFirst(env.POKE_DASHBOARD_DB, `SELECT COUNT(*) AS count FROM agentstate`, []);
  const count = Number(countRow?.count || 0);
  const scopeLabel = userId ? 'user scoped' : 'public preview';
  const footerLabel = userId || 'login required';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1a3ab5"/>
      <stop offset="1" stop-color="#2449d1"/>
    </linearGradient>
    <radialGradient id="v" cx="50%" cy="50%" r="70%"><stop offset="0" stop-color="rgba(255,255,255,0)"/><stop offset="1" stop-color="rgba(0,0,0,0.35)"/></radialGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#g)"/>
  <g fill="rgba(255,255,255,0.18)">${Array.from({ length: 560 }, (_, i) => {
    const x = (i * 73) % 1200; const y = (i * 37) % 630; return `<circle cx="${x}" cy="${y}" r="2"/>`; }).join('')}</g>
  <rect width="1200" height="630" fill="url(#v)"/>
  <circle cx="96" cy="96" r="12" fill="#fff"/>
  <text x="130" y="104" font-family="monospace" font-size="24" fill="#fff" letter-spacing="4">POKE</text>
  <text x="130" y="124" font-family="monospace" font-size="10" fill="rgba(255,255,255,0.6)" letter-spacing="4">MASTER DASHBOARD</text>
  <text x="600" y="330" text-anchor="middle" font-family="monospace" font-size="140" fill="#fff" font-weight="700">${count}</text>
  <text x="600" y="392" text-anchor="middle" font-family="monospace" font-size="22" fill="#5dffb0" letter-spacing="3">${scopeLabel}</text>
  <text x="600" y="590" text-anchor="middle" font-family="monospace" font-size="11" fill="rgba(255,255,255,0.35)" letter-spacing="2">${footerLabel} • live agent state</text>
</svg>`;
  return new Response(svg, { headers: { ...cors, 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=30' } });
}
