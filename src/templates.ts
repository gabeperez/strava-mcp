import { STRAVA_POWERED_BADGE_SVG } from './strava-brand';

// Simple template engine for HTML rendering
export class TemplateEngine {
  private templates: Map<string, string> = new Map();

  // Load template from string content (for Cloudflare Workers compatibility)
  loadTemplate(name: string, content: string): void {
    this.templates.set(name, content);
  }

  // Render template with data
  render(templateName: string, data: Record<string, any> = {}): string {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template '${templateName}' not found`);
    }

    return this.processTemplate(template, data);
  }

  private processTemplate(template: string, data: Record<string, any>): string {
    let result = template;

    // Replace simple variables {{variable}}
    result = result.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
      const trimmedKey = key.trim();
      const value = this.getNestedValue(data, trimmedKey);
      return value !== undefined ? String(value) : match;
    });

    // Handle {{#if}}...{{else}}...{{/if}} FIRST (specific pattern must match before simple {{#if}})
    result = result.replace(/\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, trueContent, falseContent) => {
      const value = this.getNestedValue(data, condition.trim());
      const contentToRender = this.isTruthy(value) ? trueContent : falseContent;
      return this.processTemplate(contentToRender, data);
    });

    // Handle simple conditionals {{#if condition}}...{{/if}} (no else branch)
    result = result.replace(/\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, content) => {
      const value = this.getNestedValue(data, condition.trim());
      return this.isTruthy(value) ? this.processTemplate(content, data) : '';
    });

    // Handle {{#each array}}...{{/each}}
    result = result.replace(/\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g, (match, arrayKey, content) => {
      const array = this.getNestedValue(data, arrayKey.trim());
      if (!Array.isArray(array)) return '';

      return array.map(item => this.processTemplate(content, { ...data, ...item })).join('');
    });

    return result;
  }

  private getNestedValue(obj: any, path: string): any {
    // Handle Handlebars helper functions
    if (path.startsWith('eq ')) {
      const parts = path.substring(3).split(' ');
      const value1 = this.getNestedValue(obj, parts[0]);
      const value2 = parts[1].replace(/["|']/g, ''); // Remove quotes
      return value1 === value2;
    }

    if (path.startsWith('or ')) {
      // Handle complex OR expressions like (or (eq ...) (eq ...))
      return true; // Simplified for now
    }

    if (path.startsWith('not ')) {
      const subPath = path.substring(4).replace(/[()]/g, '');
      return !this.getNestedValue(obj, subPath);
    }
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  private isTruthy(value: any): boolean {
    if (value === null || value === undefined) return false;
    if (typeof value === 'boolean') return value;
    if (typeof value === 'number') return value !== 0;
    if (typeof value === 'string') return value.length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object') return Object.keys(value).length > 0;
    return !!value;
  }
}

// Minimal CSS for developer-facing pages
const DEV_CSS = `
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, sans-serif; background: #0a0a0a; color: #e0e0e0; line-height: 1.6; }
  code, .mono { font-family: ui-monospace, 'SF Mono', monospace; font-size: 0.9em; }
  a { color: #FC4C02; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .container { max-width: 720px; margin: 0 auto; padding: 2rem 1rem; }
  nav { border-bottom: 1px solid #222; padding: 1rem 0; }
  nav .inner { max-width: 720px; margin: 0 auto; padding: 0 1rem; display: flex; justify-content: space-between; align-items: center; }
  nav .brand { font-weight: 700; color: #fff; font-size: 1.1rem; text-decoration: none; }
  nav .links a { color: #888; margin-left: 1.5rem; font-size: 0.9rem; }
  nav .links a:hover { color: #e0e0e0; }
  .card { background: #141414; border: 1px solid #222; border-radius: 8px; padding: 1.5rem; margin-bottom: 1rem; }
  .card h3 { color: #fff; margin-bottom: 0.75rem; font-size: 1rem; }
  .card p { color: #999; font-size: 0.9rem; margin-bottom: 0.5rem; }
  .url-box { background: #0d0d0d; border: 1px solid #333; border-radius: 4px; padding: 0.75rem; font-family: ui-monospace, monospace; font-size: 0.85rem; word-break: break-all; color: #FC4C02; }
  .btn { background: #FC4C02; color: #fff; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer; font-size: 0.85rem; }
  .btn:hover { background: #e04400; }
  .btn-secondary { background: #222; color: #ccc; }
  .btn-secondary:hover { background: #333; }
  .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 0.75rem; }
  .stat { background: #111; border: 1px solid #222; border-radius: 6px; padding: 1rem; text-align: center; }
  .stat .value { font-size: 1.5rem; font-weight: 700; color: #fff; }
  .stat .label { font-size: 0.75rem; color: #666; text-transform: uppercase; letter-spacing: 0.05em; }
  .badge { display: inline-block; margin-top: 2rem; opacity: 0.5; }
  pre { background: #111; border: 1px solid #222; border-radius: 6px; padding: 1rem; overflow-x: auto; font-size: 0.8rem; line-height: 1.5; }
  .activity-row { display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0; border-bottom: 1px solid #1a1a1a; font-size: 0.85rem; }
  .activity-row:last-child { border-bottom: none; }
  .activity-name { color: #fff; }
  .activity-meta { color: #666; }
  footer { border-top: 1px solid #222; padding: 1.5rem 0; margin-top: 2rem; text-align: center; font-size: 0.75rem; color: #444; }
`;

// Landing page — developer-focused, minimal
export const LANDING_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SportsMCP — Strava MCP Server</title>
  <style>${DEV_CSS}</style>
</head>
<body>
  <nav>
    <div class="inner">
      <a href="/" class="brand">SportsMCP</a>
      <div class="links">
        <a href="https://github.com/gabeperez/strava-mcp">GitHub</a>
        {{#if is_authenticated}}<a href="/dashboard/{{athlete_id}}">Dashboard</a>{{else}}<a href="/auth">Connect Strava</a>{{/if}}
      </div>
    </div>
  </nav>

  <div class="container">
    <div style="margin: 2rem 0 3rem;">
      <h1 style="color: #fff; font-size: 1.8rem; margin-bottom: 0.5rem;">Strava for Any AI Agent</h1>
      <p style="color: #888; font-size: 1rem; max-width: 520px;">Open-source MCP server that gives Claude, Cursor, Windsurf, and any MCP-compatible AI read-only access to your Strava data.</p>
    </div>

    <div class="card">
      <h3>Quick Start</h3>
      <pre><code>git clone https://github.com/gabeperez/strava-mcp.git
cd strava-mcp
npm install
node scripts/setup.js</code></pre>
      <p style="margin-top: 0.75rem;">See <a href="https://github.com/gabeperez/strava-mcp#-quick-start">README</a> for full setup guide.</p>
    </div>

    <div class="card">
      <h3>21 MCP Tools</h3>
      <div class="grid" style="margin-top: 0.5rem;">
        <div><code style="color: #FC4C02;">Activities</code><br><span style="color: #666; font-size: 0.8rem;">Recent, details, streams, laps, kudos, comments</span></div>
        <div><code style="color: #FC4C02;">Athlete</code><br><span style="color: #666; font-size: 0.8rem;">Profile, stats, zones, clubs, routes</span></div>
        <div><code style="color: #FC4C02;">Segments</code><br><span style="color: #666; font-size: 0.8rem;">Explore, starred, efforts, details</span></div>
        <div><code style="color: #FC4C02;">Gear &amp; Social</code><br><span style="color: #666; font-size: 0.8rem;">Equipment, clubs, route details</span></div>
      </div>
    </div>

    <div class="card">
      <h3>Connect Your AI Agent</h3>
      <p>After deploying, add your MCP URL to any compatible client:</p>
      <pre><code>{
  "mcpServers": {
    "sportsmcp": {
      "url": "https://your-worker.workers.dev/mcp?token=YOUR_TOKEN"
    }
  }
}</code></pre>
      <p style="margin-top: 0.5rem; color: #666; font-size: 0.8rem;">Works with Claude Desktop, Cursor, Windsurf, Cline, Continue.dev, and more.</p>
    </div>

    <footer>
      <div class="badge">${STRAVA_POWERED_BADGE_SVG}</div>
      <p style="margin-top: 0.75rem;">Compatible with Strava. Not affiliated with, endorsed, or sponsored by Strava.</p>
    </footer>
  </div>
</body>
</html>`;

// Dashboard — shows MCP URL, config snippets, recent activities
export const DASHBOARD_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard — SportsMCP</title>
  <style>${DEV_CSS}</style>
</head>
<body>
  <nav>
    <div class="inner">
      <a href="/" class="brand">SportsMCP</a>
      <div class="links">
        <a href="https://github.com/gabeperez/strava-mcp">GitHub</a>
        <form method="POST" action="/logout" style="display: inline;"><button type="submit" class="btn-secondary" style="background: none; border: none; color: #888; cursor: pointer; font-size: 0.9rem;">Logout</button></form>
      </div>
    </div>
  </nav>

  <div class="container">
    <div class="card" style="display: flex; align-items: center; gap: 1rem;">
      {{#if profile.profile_medium}}
      <img src="{{profile.profile_medium}}" alt="avatar" style="width: 48px; height: 48px; border-radius: 50%;">
      {{/if}}
      <div>
        <h3 style="margin-bottom: 0;">{{profile.firstname}} {{profile.lastname}}</h3>
        <p style="margin: 0;">{{profile.location}}</p>
      </div>
    </div>

    <div class="card">
      <h3>Your MCP Server URL</h3>
      <p>Copy this into Claude Desktop, Cursor, or any MCP-compatible client:</p>
      <div class="url-box" id="mcp-url">{{mcp_url}}</div>
      <div style="display: flex; gap: 0.5rem; margin-top: 0.75rem;">
        <button class="btn" onclick="navigator.clipboard.writeText(document.getElementById('mcp-url').textContent); this.textContent='Copied!'; setTimeout(() => this.textContent='Copy URL', 2000);">Copy URL</button>
      </div>
    </div>

    <div class="card">
      <h3>Agent Config</h3>
      <p>Paste into your AI agent's MCP settings:</p>
      <pre><code>{
  "mcpServers": {
    "sportsmcp": {
      "url": "{{mcp_url}}"
    }
  }
}</code></pre>
    </div>

    <div class="grid">
      <div class="stat">
        <div class="value">{{total_activities}}</div>
        <div class="label">Activities (4 wk)</div>
      </div>
      <div class="stat">
        <div class="value">{{total_distance}}</div>
        <div class="label">Distance</div>
      </div>
      <div class="stat">
        <div class="value">{{total_elevation}}m</div>
        <div class="label">Elevation</div>
      </div>
      <div class="stat">
        <div class="value">{{total_time}}</div>
        <div class="label">Moving Time</div>
      </div>
    </div>

    {{#if recent_activities}}
    <div class="card" style="margin-top: 1rem;">
      <h3>Recent Activities</h3>
      {{#each recent_activities}}
      <div class="activity-row">
        <span class="activity-name">{{name}}</span>
        <span class="activity-meta">{{distance}} km &middot; {{moving_time}} &middot; {{start_date_local}}</span>
      </div>
      {{/each}}
    </div>
    {{/if}}

    <footer>
      <div class="badge">${STRAVA_POWERED_BADGE_SVG}</div>
      <p style="margin-top: 0.75rem;">Compatible with Strava. Not affiliated with, endorsed, or sponsored by Strava.</p>
    </footer>
  </div>
</body>
</html>`;
