import { env, createExecutionContext, waitOnExecutionContext } from 'cloudflare:test';
import { describe, it, expect } from 'vitest';
import worker from '../src';

describe('SportMCP worker', () => {
	it('GET / returns HTML landing page', async () => {
		const request = new Request<unknown, IncomingRequestCfProperties>('http://example.com/');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(200);
		expect(response.headers.get('content-type')).toContain('text/html');
		const text = await response.text();
		expect(text).toContain('SportMCP');
	});

	it('GET / with Accept: application/json returns server info', async () => {
		const request = new Request<unknown, IncomingRequestCfProperties>('http://example.com/', {
			headers: { 'Accept': 'application/json' }
		});
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(200);
		const json = await response.json() as any;
		expect(json.name).toBe('SportMCP');
		expect(json.protocol).toBe('mcp');
	});

	it('GET /mcp returns server info or auth prompt', async () => {
		const request = new Request<unknown, IncomingRequestCfProperties>('http://example.com/mcp');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		// Returns 200 with capabilities or 401 requiring auth — both are valid
		expect([200, 401]).toContain(response.status);
	});

	it('returns 404 for unknown routes', async () => {
		const request = new Request<unknown, IncomingRequestCfProperties>('http://example.com/nonexistent');
		const ctx = createExecutionContext();
		const response = await worker.fetch(request, env, ctx);
		await waitOnExecutionContext(ctx);
		expect(response.status).toBe(404);
	});
});
