// Nothing design variant stubs — re-export the main templates for the open-source version.
// The hosted product uses a custom design system; this OSS version uses the same minimal UI.

import { LANDING_TEMPLATE, DASHBOARD_TEMPLATE } from './templates';

export const NOTHING_LANDING_TEMPLATE = LANDING_TEMPLATE;
export const NOTHING_DASHBOARD_TEMPLATE = DASHBOARD_TEMPLATE;

// Legal page stubs — minimal text-only pages
const legalPage = (title: string, body: string) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — SportMCP</title>
  <style>
    body { font-family: system-ui, sans-serif; background: #0a0a0a; color: #e0e0e0; line-height: 1.6; margin: 0; }
    a { color: #FC4C02; }
    .container { max-width: 720px; margin: 0 auto; padding: 2rem 1rem; }
    nav { border-bottom: 1px solid #222; padding: 1rem 0; }
    nav .inner { max-width: 720px; margin: 0 auto; padding: 0 1rem; display: flex; justify-content: space-between; align-items: center; }
    nav .brand { font-weight: 700; color: #fff; font-size: 1.1rem; text-decoration: none; }
    h1 { color: #fff; font-size: 1.5rem; margin-bottom: 1rem; }
    p { color: #999; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <nav><div class="inner"><a href="/" class="brand">SportMCP</a></div></nav>
  <div class="container">
    <h1>${title}</h1>
    ${body}
  </div>
</body>
</html>`;

export const NOTHING_ABOUT_TEMPLATE = legalPage('About',
  '<p>SportMCP is an open-source Model Context Protocol server for Strava. It gives any MCP-compatible AI assistant secure, read-only access to your fitness data.</p><p>See the <a href="https://github.com/gabeperez/strava-mcp">GitHub repository</a> for documentation and source code.</p>');

export const NOTHING_SUPPORT_TEMPLATE = legalPage('Support',
  '<p>For help with SportMCP, please <a href="https://github.com/gabeperez/strava-mcp/issues">open a GitHub issue</a>.</p><p>Common issues are covered in the <a href="https://github.com/gabeperez/strava-mcp#-troubleshooting">troubleshooting section</a> of the README.</p>');

export const NOTHING_PRIVACY_TEMPLATE = legalPage('Privacy',
  '<p>SportMCP is self-hosted. Your Strava tokens are stored in your own Cloudflare KV namespace. No data is sent to third parties beyond the Strava API and any notification providers you configure.</p><p>When you deauthorize, all stored data is deleted within 48 hours per Strava API requirements.</p>');

export const NOTHING_TERMS_TEMPLATE = legalPage('Terms',
  '<p>SportMCP is provided under the <a href="https://github.com/gabeperez/strava-mcp/blob/main/LICENSE">MIT License</a>. Use at your own risk. This project is not affiliated with Strava.</p>');
