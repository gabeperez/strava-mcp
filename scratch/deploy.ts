import { readFileSync } from 'fs';
import { execute } from '../mcp/cloudflare-mcp-ce761b4d-7a49-445a-baa0-0d3dcb5da7a3.ts';

function requiredEnv(name: string) {
  const value = (globalThis as any).process?.env?.[name];
  if (!value) throw new Error('Missing required env var: ' + name);
  return value;
}

const accountId = requiredEnv('CLOUDFLARE_ACCOUNT_ID');
const dashboardDbId = requiredEnv('POKE_DASHBOARD_DB_ID');
const pokeAgentStatusNamespaceId = requiredEnv('POKEAGENTSTATUS_NAMESPACE_ID');
const pokeSessionsNamespaceId = requiredEnv('POKE_SESSIONS_NAMESPACE_ID');

function multipart(code: string, metadata: unknown) {
  const boundary = '----poke' + Date.now() + Math.random().toString(16).slice(2);
  const body = [
    `--${boundary}`,
    'Content-Disposition: form-data; name="metadata"',
    'Content-Type: application/json',
    '',
    JSON.stringify(metadata),
    `--${boundary}`,
    'Content-Disposition: form-data; name="files"; filename="worker.js"',
    'Content-Type: application/javascript+module',
    '',
    code,
    `--${boundary}--`,
    '',
  ].join('\r\n');
  return { boundary, body };
}

async function deploy(scriptName: string, filePath: string, metadata: Record<string, unknown>) {
  const code = readFileSync(filePath, 'utf8');
  const { boundary, body } = multipart(code, metadata);
  const remoteCode = "async () => cloudflare.request({ method: 'PUT', path: '/accounts/" + accountId + "/workers/scripts/" + scriptName + "', body: " + JSON.stringify(body) + ", contentType: 'multipart/form-data; boundary=" + boundary + "', rawBody: true })";
  const res = await execute({ account_id: accountId, code: remoteCode });
  console.log(scriptName, JSON.stringify(res, null, 2));
}

await deploy('poke-agent-bridge', 'scratch/worker-index.js', {
  main_module: 'worker.js',
  compatibility_date: '2024-01-01',
  bindings: [
    { type: 'd1', name: 'POKE_DASHBOARD_DB', id: dashboardDbId },
    { type: 'kv_namespace', name: 'POKEAGENTSTATUS', namespace_id: pokeAgentStatusNamespaceId },
    { type: 'kv_namespace', name: 'POKE_SESSIONS', namespace_id: pokeSessionsNamespaceId },
  ],
});

await deploy('poke-agent-dashboard-live', 'scratch/dashboard-worker.js', {
  main_module: 'worker.js',
  compatibility_date: '2024-01-01',
});
