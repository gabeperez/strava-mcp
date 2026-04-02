// Nothing Design System — Templates
// Swiss typography, industrial design, monochrome, OLED black
// Fonts: Doto (display), Space Grotesk (body), Space Mono (labels/data)

// Shared Nothing CSS (injected into all templates)
const NOTHING_HEAD = `
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Doto:wght@400;700&family=Space+Grotesk:wght@300;400;500&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">
    <link rel="icon" type="image/png" href="https://res.cloudinary.com/dxoyxnrjl/image/upload/v1758961029/Strava_MCP_Logo_4_u0pe64.png">
`;

const NOTHING_CSS = `
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
        :root {
            --black: #000000; --surface: #111111; --surface-raised: #1A1A1A;
            --border: #222222; --border-visible: #333333;
            --text-disabled: #666666; --text-secondary: #999999;
            --text-primary: #E8E8E8; --text-display: #FFFFFF;
            --accent: #D71921; --accent-subtle: rgba(215,25,33,0.15);
            --interactive: #FC4C02;
            --success: #4A9E5C;
            --font-display: 'Doto', 'Space Mono', monospace;
            --font-body: 'Space Grotesk', system-ui, sans-serif;
            --font-mono: 'Space Mono', 'JetBrains Mono', monospace;
        }
        html { font-size: 16px; -webkit-font-smoothing: antialiased; }
        body { background: var(--black); color: var(--text-primary); font-family: var(--font-body); line-height: 1.5; min-height: 100vh; }
        .container { max-width: 960px; margin: 0 auto; padding: 0 24px; }
        .label { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.08em; text-transform: uppercase; color: var(--text-secondary); line-height: 1.2; }
        .divider { border: none; border-top: 1px solid var(--border); margin: 48px 0; }
        .section-label { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-disabled); margin-bottom: 24px; }
        a { color: var(--text-secondary); transition: color 200ms ease-out; }
        a:hover { color: var(--interactive); }

        /* Nav */
        nav { padding: 24px 0; border-bottom: 1px solid var(--border); }
        nav .inner { display: flex; align-items: center; justify-content: space-between; }
        nav a { font-family: var(--font-mono); font-size: 12px; letter-spacing: 0.06em; text-transform: uppercase; text-decoration: none; color: var(--text-secondary); }
        nav a:hover { color: var(--interactive); }
        nav .nav-links { display: flex; gap: 24px; align-items: center; }
        .nav-brand { font-family: var(--font-display); font-size: 18px; color: var(--text-display) !important; letter-spacing: -0.02em !important; text-transform: none !important; }

        /* Footer */
        footer { border-top: 1px solid var(--border); padding: 48px 0 32px; }
        footer .footer-inner { display: flex; justify-content: space-between; align-items: flex-start; gap: 32px; flex-wrap: wrap; }
        footer .footer-links { display: flex; gap: 24px; flex-wrap: wrap; }
        footer a { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-disabled); text-decoration: none; }
        footer a:hover { color: var(--interactive); }
        .footer-bottom { margin-top: 32px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; }
        .footer-disclaimer { font-size: 11px; color: var(--text-disabled); max-width: 400px; line-height: 1.5; }

        @media (max-width: 640px) {
            .container { padding: 0 16px; }
            footer .footer-inner { flex-direction: column; }
            .footer-bottom { flex-direction: column; align-items: flex-start; }
        }
`;

const NOTHING_NAV = `
    <nav>
        <div class="container">
            <div class="inner">
                <a href="/nothing" class="nav-brand">毎日</a>
                <div class="nav-links">
                    <a href="/about/nothing">About</a>
                    <a href="/support/nothing">Support</a>
                    <a href="/auth">Connect</a>
                </div>
            </div>
        </div>
    </nav>
`;

const NOTHING_FOOTER = `
    <footer>
        <div class="container">
            <div class="footer-inner">
                <div class="footer-links">
                    <a href="/privacy/nothing">Privacy</a>
                    <a href="/terms/nothing">Terms</a>
                    <a href="/about/nothing">About</a>
                    <a href="/support/nothing">Support</a>
                    <a href="/">Classic</a>
                </div>
                <a href="https://www.strava.com" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.strava.com/assets/api/badge-strava-light.svg" alt="Powered by Strava" style="height: 28px; opacity: 0.5; transition: opacity 200ms ease-out;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='0.5'">
                </a>
            </div>
            <div class="footer-bottom">
                <div class="footer-disclaimer">
                    Mainichi Fit is not affiliated with, endorsed, or sponsored by Strava. Data accessed via the official <a href="https://developers.strava.com" target="_blank" rel="noopener noreferrer" style="color: var(--text-secondary);">Strava API</a>.
                </div>
                <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-disabled); letter-spacing: 0.06em;">&copy; 2026 MAINICHI FIT</span>
            </div>
        </div>
    </footer>
`;

export const NOTHING_LANDING_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mainichi Fit — Everyday Fitness</title>
    <meta name="description" content="Mainichi Fit helps you live a healthier, more active lifestyle through daily AI-powered coaching, Strava integration, and fitness insights from Japan.">
    <link rel="icon" type="image/png" href="https://res.cloudinary.com/dxoyxnrjl/image/upload/v1758961029/Strava_MCP_Logo_4_u0pe64.png">

    <!-- Social Meta -->
    <meta property="og:title" content="Mainichi Fit — Everyday Fitness">
    <meta property="og:description" content="Daily AI-powered coaching, Strava integration, and fitness insights from Japan.">
    <meta property="og:image" content="https://res.cloudinary.com/dxoyxnrjl/image/upload/v1758961568/SportMCP_opengraph.png">
    <meta property="og:url" content="{{base_url}}/nothing">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">

    <!-- Fonts: Doto (display), Space Grotesk (body), Space Mono (labels) -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Doto:wght@400;700&family=Space+Grotesk:wght@300;400;500&family=Space+Mono:wght@400;700&display=swap" rel="stylesheet">

    <style>
        *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }

        :root {
            --black: #000000;
            --surface: #111111;
            --surface-raised: #1A1A1A;
            --border: #222222;
            --border-visible: #333333;
            --text-disabled: #666666;
            --text-secondary: #999999;
            --text-primary: #E8E8E8;
            --text-display: #FFFFFF;
            --accent: #D71921;
            --accent-subtle: rgba(215, 25, 33, 0.15);

            --font-display: 'Doto', 'Space Mono', monospace;
            --font-body: 'Space Grotesk', system-ui, sans-serif;
            --font-mono: 'Space Mono', 'JetBrains Mono', monospace;
        }

        html { font-size: 16px; -webkit-font-smoothing: antialiased; }

        body {
            background: var(--black);
            color: var(--text-primary);
            font-family: var(--font-body);
            line-height: 1.5;
            min-height: 100vh;
        }

        /* Dot grid background */
        .dot-grid {
            background-image: radial-gradient(circle, var(--border-visible) 0.5px, transparent 0.5px);
            background-size: 24px 24px;
        }

        /* Labels */
        .label {
            font-family: var(--font-mono);
            font-size: 11px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--text-secondary);
            line-height: 1.2;
        }

        /* Layout */
        .container {
            max-width: 960px;
            margin: 0 auto;
            padding: 0 24px;
        }

        /* Nav */
        nav {
            padding: 24px 0;
            border-bottom: 1px solid var(--border);
        }
        nav .inner {
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        nav a {
            font-family: var(--font-mono);
            font-size: 12px;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: var(--text-secondary);
            text-decoration: none;
            transition: color 200ms ease-out;
        }
        nav a:hover { color: var(--interactive); }
        nav .nav-links { display: flex; gap: 24px; align-items: center; }
        .nav-brand {
            font-family: var(--font-display);
            font-size: 18px;
            color: var(--text-display) !important;
            letter-spacing: -0.02em !important;
            text-transform: none !important;
        }

        /* Hero */
        .hero {
            padding: 96px 0 64px;
            text-align: left;
        }
        .hero-kanji {
            font-family: var(--font-display);
            font-size: clamp(96px, 18vw, 200px);
            font-weight: 700;
            color: var(--text-display);
            line-height: 0.9;
            letter-spacing: -0.03em;
            margin-bottom: 16px;
            position: relative;
        }
        .hero-kanji .red-dot {
            display: inline-block;
            width: 12px;
            height: 12px;
            background: var(--accent);
            border-radius: 50%;
            vertical-align: super;
            margin-left: 8px;
        }
        .hero-romanization {
            font-family: var(--font-mono);
            font-size: 14px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--text-secondary);
            margin-bottom: 32px;
        }
        .hero-tagline {
            font-family: var(--font-body);
            font-size: clamp(20px, 3vw, 28px);
            font-weight: 300;
            color: var(--text-primary);
            line-height: 1.4;
            max-width: 560px;
            margin-bottom: 16px;
        }
        .hero-sub {
            font-family: var(--font-body);
            font-size: 16px;
            font-weight: 300;
            color: var(--text-secondary);
            line-height: 1.6;
            max-width: 480px;
        }

        /* Divider */
        .divider {
            border: none;
            border-top: 1px solid var(--border);
            margin: 64px 0;
        }

        /* Coming Soon section */
        .section-label {
            font-family: var(--font-mono);
            font-size: 11px;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: var(--text-disabled);
            margin-bottom: 32px;
        }

        .coming-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
            gap: 2px;
        }
        .coming-card {
            background: var(--surface);
            border: 1px solid var(--border);
            padding: 32px 24px;
            transition: border-color 200ms ease-out;
        }
        .coming-card:hover {
            border-color: var(--interactive);
        }
        .coming-card .card-number {
            font-family: var(--font-mono);
            font-size: 11px;
            color: var(--text-disabled);
            letter-spacing: 0.08em;
            margin-bottom: 16px;
        }
        .coming-card h3 {
            font-family: var(--font-body);
            font-size: 18px;
            font-weight: 500;
            color: var(--text-display);
            margin-bottom: 8px;
            line-height: 1.3;
        }
        .coming-card p {
            font-size: 14px;
            color: var(--text-secondary);
            line-height: 1.5;
        }
        .coming-card .card-tag {
            display: inline-block;
            font-family: var(--font-mono);
            font-size: 10px;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: var(--text-disabled);
            border: 1px solid var(--border-visible);
            border-radius: 999px;
            padding: 3px 10px;
            margin-top: 16px;
        }
        .coming-card.active-card {
            border-color: var(--interactive);
        }
        .coming-card.active-card .card-tag {
            color: var(--interactive);
            border-color: var(--interactive);
        }

        /* Waitlist */
        .waitlist {
            padding: 64px 0;
        }
        .waitlist-box {
            background: var(--surface);
            border: 1px solid var(--border);
            padding: 48px;
            max-width: 560px;
        }
        .waitlist-box h3 {
            font-family: var(--font-body);
            font-size: 20px;
            font-weight: 400;
            color: var(--text-display);
            margin-bottom: 8px;
        }
        .waitlist-box p {
            font-size: 14px;
            color: var(--text-secondary);
            margin-bottom: 24px;
        }
        .waitlist-form {
            display: flex;
            gap: 8px;
        }
        .waitlist-input {
            flex: 1;
            background: transparent;
            border: none;
            border-bottom: 1px solid var(--border-visible);
            color: var(--text-primary);
            font-family: var(--font-mono);
            font-size: 14px;
            padding: 12px 0;
            outline: none;
            transition: border-color 200ms ease-out;
        }
        .waitlist-input::placeholder {
            color: var(--text-disabled);
            font-family: var(--font-mono);
            font-size: 12px;
            letter-spacing: 0.04em;
            text-transform: uppercase;
        }
        .waitlist-input:focus {
            border-color: var(--text-primary);
        }
        .waitlist-btn {
            font-family: var(--font-mono);
            font-size: 13px;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            background: var(--text-display);
            color: var(--black);
            border: none;
            border-radius: 999px;
            padding: 12px 24px;
            cursor: pointer;
            transition: opacity 200ms ease-out;
            white-space: nowrap;
        }
        .waitlist-btn:hover { opacity: 0.85; }
        .waitlist-btn:disabled {
            opacity: 0.4;
            cursor: not-allowed;
        }
        .waitlist-status {
            font-family: var(--font-mono);
            font-size: 12px;
            letter-spacing: 0.04em;
            margin-top: 12px;
            min-height: 18px;
        }
        .waitlist-status.success { color: #4A9E5C; }
        .waitlist-status.error { color: var(--accent); }

        /* Footer */
        footer {
            border-top: 1px solid var(--border);
            padding: 48px 0 32px;
        }
        footer .footer-inner {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            gap: 32px;
            flex-wrap: wrap;
        }
        footer .footer-links {
            display: flex;
            gap: 24px;
            flex-wrap: wrap;
        }
        footer a {
            font-family: var(--font-mono);
            font-size: 11px;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            color: var(--text-disabled);
            text-decoration: none;
            transition: color 200ms ease-out;
        }
        footer a:hover { color: var(--interactive); }
        .footer-bottom {
            margin-top: 32px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
            gap: 16px;
        }
        .footer-disclaimer {
            font-size: 11px;
            color: var(--text-disabled);
            max-width: 400px;
            line-height: 1.5;
        }

        /* Responsive */
        @media (max-width: 640px) {
            .container { padding: 0 16px; }
            .hero { padding: 64px 0 48px; }
            .waitlist-form { flex-direction: column; }
            .waitlist-btn { width: 100%; text-align: center; }
            .waitlist-box { padding: 32px 24px; }
            footer .footer-inner { flex-direction: column; }
            .footer-bottom { flex-direction: column; align-items: flex-start; }
        }
    </style>
</head>
<body>
    <!-- Nav -->
    <nav>
        <div class="container">
            <div class="inner">
                <a href="/nothing" class="nav-brand">毎日</a>
                <div class="nav-links">
                    <a href="/about">About</a>
                    <a href="/support">Support</a>
                    <a href="/auth">Connect</a>
                </div>
            </div>
        </div>
    </nav>

    <!-- Hero -->
    <section class="hero">
        <div class="container">
            <div class="hero-kanji">毎日<span class="red-dot"></span></div>
            <div class="hero-romanization">Mainichi — "every day"</div>
            <div class="hero-tagline">Everyday fitness, elevated by AI.</div>
            <p class="hero-sub">
                Mainichi Fit is dedicated to helping you live a healthier, more active lifestyle through daily support, thoughtful routine, and intelligent training guidance.
            </p>
        </div>
    </section>

    <div class="container"><hr class="divider"></div>

    <!-- Coming Soon -->
    <section>
        <div class="container">
            <div class="section-label">Coming Soon</div>
            <div class="coming-grid">
                <div class="coming-card">
                    <div class="card-number">01</div>
                    <h3>Text-Based Coaching</h3>
                    <p>Daily check-ins, workout suggestions, and recovery guidance delivered through conversation. Your AI coach learns your patterns and adapts.</p>
                    <span class="card-tag">In Development</span>
                </div>
                <a href="/auth" style="text-decoration: none; color: inherit;">
                    <div class="coming-card active-card">
                        <div class="card-number">02</div>
                        <h3>MCP Powered by Strava</h3>
                        <p>Connect your Strava account to any AI assistant. 21 tools give your AI full access to activities, stats, segments, routes, and more.</p>
                        <span class="card-tag">Live Now</span>
                    </div>
                </a>
                <div class="coming-card">
                    <div class="card-number">03</div>
                    <h3>Fitness Content from Japan</h3>
                    <p>Training philosophies, recovery practices, and nutrition insights drawn from Japanese athletic culture and everyday wellness traditions.</p>
                    <span class="card-tag">Coming 2026</span>
                </div>
            </div>
        </div>
    </section>

    <div class="container"><hr class="divider"></div>

    <!-- Waitlist -->
    <section class="waitlist">
        <div class="container">
            <div class="waitlist-box">
                <div class="section-label" style="margin-bottom: 16px;">Stay in the loop</div>
                <h3>Get early access</h3>
                <p>Be the first to know when new features launch. No spam, just updates.</p>
                <form class="waitlist-form" id="waitlist-form" onsubmit="return handleWaitlist(event)">
                    <input type="email" class="waitlist-input" id="waitlist-email" placeholder="Your email" required autocomplete="email">
                    <button type="submit" class="waitlist-btn" id="waitlist-btn">Notify Me</button>
                </form>
                <div class="waitlist-status" id="waitlist-status"></div>
            </div>
        </div>
    </section>

    <!-- Footer -->
    <footer>
        <div class="container">
            <div class="footer-inner">
                <div class="footer-links">
                    <a href="/privacy">Privacy</a>
                    <a href="/terms">Terms</a>
                    <a href="/about">About</a>
                    <a href="/support">Support</a>
                    <a href="/">Classic</a>
                </div>
                <a href="https://www.strava.com" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.strava.com/assets/api/badge-strava-light.svg" alt="Powered by Strava" style="height: 28px; opacity: 0.5; transition: opacity 200ms ease-out;" onmouseover="this.style.opacity='0.8'" onmouseout="this.style.opacity='0.5'">
                </a>
            </div>
            <div class="footer-bottom">
                <div class="footer-disclaimer">
                    Mainichi Fit is not affiliated with, endorsed, or sponsored by Strava. Data accessed via the official <a href="https://developers.strava.com" target="_blank" rel="noopener noreferrer" style="color: var(--text-secondary);">Strava API</a>.
                </div>
                <span style="font-family: var(--font-mono); font-size: 11px; color: var(--text-disabled); letter-spacing: 0.06em;">&copy; 2026 MAINICHI FIT</span>
            </div>
        </div>
    </footer>

    <script>
    async function handleWaitlist(e) {
        e.preventDefault();
        const email = document.getElementById('waitlist-email').value.trim();
        const btn = document.getElementById('waitlist-btn');
        const status = document.getElementById('waitlist-status');

        if (!email) return false;

        btn.disabled = true;
        btn.textContent = '...';
        status.textContent = '';
        status.className = 'waitlist-status';

        try {
            const res = await fetch('/api/waitlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await res.json();

            if (res.ok) {
                status.textContent = '[SAVED] You\\'re on the list.';
                status.className = 'waitlist-status success';
                document.getElementById('waitlist-email').value = '';
            } else {
                status.textContent = '[ERROR] ' + (data.message || 'Something went wrong.');
                status.className = 'waitlist-status error';
            }
        } catch (err) {
            status.textContent = '[ERROR] Network error. Try again.';
            status.className = 'waitlist-status error';
        }

        btn.disabled = false;
        btn.textContent = 'NOTIFY ME';
        return false;
    }
    </script>
</body>
</html>`;


// ─── DASHBOARD ──────────────────────────────────────────────────────────────
export const NOTHING_DASHBOARD_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard — Mainichi Fit</title>
    ${NOTHING_HEAD}
    <style>
        ${NOTHING_CSS}

        .hero-stat { padding: 64px 0 48px; }
        .stat-number {
            font-family: var(--font-display);
            font-size: clamp(48px, 10vw, 96px);
            font-weight: 700;
            color: var(--text-display);
            line-height: 0.9;
            letter-spacing: -0.03em;
        }
        .stat-unit {
            font-family: var(--font-mono);
            font-size: 14px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--text-secondary);
            margin-top: 8px;
        }

        .profile-row {
            display: flex;
            align-items: center;
            gap: 16px;
            padding: 24px 0;
        }
        .profile-img {
            width: 48px; height: 48px;
            border-radius: 50%;
            border: 1px solid var(--border-visible);
        }
        .profile-name {
            font-family: var(--font-body);
            font-size: 18px;
            font-weight: 500;
            color: var(--text-display);
        }
        .profile-meta {
            font-family: var(--font-mono);
            font-size: 11px;
            letter-spacing: 0.06em;
            color: var(--text-disabled);
            text-transform: uppercase;
        }

        .data-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 2px;
        }
        .data-cell {
            background: var(--surface);
            border: 1px solid var(--border);
            padding: 20px;
        }
        .data-cell .data-label {
            font-family: var(--font-mono);
            font-size: 10px;
            letter-spacing: 0.08em;
            text-transform: uppercase;
            color: var(--text-disabled);
            margin-bottom: 6px;
        }
        .data-cell .data-value {
            font-family: var(--font-mono);
            font-size: 20px;
            color: var(--text-display);
            letter-spacing: -0.01em;
        }

        .activity-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 14px 0;
            border-bottom: 1px solid var(--border);
        }
        .activity-row:last-child { border-bottom: none; }
        .activity-name {
            font-family: var(--font-body);
            font-size: 14px;
            color: var(--text-primary);
        }
        .activity-meta {
            font-family: var(--font-mono);
            font-size: 12px;
            color: var(--text-secondary);
            display: flex;
            gap: 16px;
        }
        .activity-date {
            font-family: var(--font-mono);
            font-size: 11px;
            color: var(--text-disabled);
        }

        .mcp-section { padding: 48px 0; }
        .mcp-url-box {
            background: var(--surface);
            border: 1px solid var(--border);
            padding: 20px;
            font-family: var(--font-mono);
            font-size: 13px;
            color: var(--text-primary);
            word-break: break-all;
            position: relative;
        }
        .copy-btn {
            font-family: var(--font-mono);
            font-size: 11px;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            background: var(--surface-raised);
            color: var(--text-secondary);
            border: 1px solid var(--border-visible);
            border-radius: 999px;
            padding: 6px 16px;
            cursor: pointer;
            transition: all 200ms ease-out;
        }
        .copy-btn:hover { color: var(--interactive); border-color: var(--interactive); }
        .copy-status {
            font-family: var(--font-mono);
            font-size: 11px;
            color: var(--success);
            margin-top: 8px;
            min-height: 16px;
        }
        .hidden { display: none; }

        .config-block {
            background: var(--surface);
            border: 1px solid var(--border);
            padding: 20px;
            position: relative;
        }
        .config-block pre {
            font-family: var(--font-mono);
            font-size: 12px;
            color: var(--text-primary);
            white-space: pre;
            overflow-x: auto;
            margin: 0;
        }
        .config-block .copy-btn {
            position: absolute;
            top: 12px;
            right: 12px;
        }

        .logout-btn {
            font-family: var(--font-mono);
            font-size: 11px;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            background: transparent;
            color: var(--text-disabled);
            border: 1px solid var(--border-visible);
            border-radius: 999px;
            padding: 6px 16px;
            cursor: pointer;
            transition: all 200ms ease-out;
        }
        .logout-btn:hover { color: var(--accent); border-color: var(--accent); }

        .tab-bar { display: flex; gap: 2px; margin-bottom: 16px; }
        .tab-btn {
            font-family: var(--font-mono);
            font-size: 11px;
            letter-spacing: 0.06em;
            text-transform: uppercase;
            background: transparent;
            color: var(--text-disabled);
            border: 1px solid var(--border);
            padding: 8px 16px;
            cursor: pointer;
            transition: all 200ms ease-out;
        }
        .tab-btn:hover { color: var(--interactive); border-color: var(--interactive); }
        .tab-btn.active { color: var(--text-display); border-color: var(--text-display); background: var(--surface); }
    </style>
</head>
<body>
    ${NOTHING_NAV}

    <div class="container">
        <!-- Profile -->
        <div class="profile-row" style="padding-top: 32px;">
            <img src="{{profile.profile_medium}}" alt="Profile" class="profile-img">
            <div>
                <div class="profile-name">{{profile.firstname}} {{profile.lastname}}</div>
                <div class="profile-meta">{{profile.location}}</div>
            </div>
            <div style="margin-left: auto;">
                <form action="/logout" method="post" style="display: inline;">
                    <button type="submit" class="logout-btn">Logout</button>
                </form>
            </div>
        </div>

        <!-- Hero stat -->
        <div class="hero-stat">
            <div class="stat-number">{{total_distance}}</div>
            <div class="stat-unit">Total distance — last 4 weeks</div>
        </div>

        <!-- Stats grid -->
        <div class="section-label">Recent Stats — {{stats_date_range}}</div>
        <div class="data-grid">
            <div class="data-cell">
                <div class="data-label">Activities</div>
                <div class="data-value">{{total_activities}}</div>
            </div>
            <div class="data-cell">
                <div class="data-label">Time</div>
                <div class="data-value">{{total_time}}</div>
            </div>
            <div class="data-cell">
                <div class="data-label">Elevation</div>
                <div class="data-value">{{total_elevation}}m</div>
            </div>
            <div class="data-cell">
                <div class="data-label">Avg Distance</div>
                <div class="data-value">{{avg_distance}}km</div>
            </div>
            <div class="data-cell">
                <div class="data-label">Primary Sport</div>
                <div class="data-value" style="font-size: 16px;">{{insights.most_active_sport}}</div>
            </div>
            <div class="data-cell">
                <div class="data-label">Weekly Avg</div>
                <div class="data-value">{{insights.weekly_average}}</div>
            </div>
        </div>

        <hr class="divider">

        <!-- Recent Activities -->
        <div class="section-label">Recent Activities</div>
        {{#each recent_activities}}
        <div class="activity-row">
            <div>
                <div class="activity-name">{{name}}</div>
                <div class="activity-date">{{start_date_local}} — {{sport_type}}</div>
            </div>
            <div class="activity-meta">
                <span>{{distance}}km</span>
                <span>{{moving_time}}</span>
                {{#if pace}}<span>{{pace}}</span>{{/if}}
                {{#if speed}}<span>{{speed}}</span>{{/if}}
            </div>
        </div>
        {{/each}}

        <hr class="divider">

        <!-- MCP Setup -->
        <div class="mcp-section">
            <div class="section-label">MCP Connection</div>

            <div class="tab-bar">
                <button class="tab-btn active" onclick="showSetup('oauth')">OAuth</button>
                <button class="tab-btn" onclick="showSetup('config')">JSON Config</button>
                <button class="tab-btn" onclick="showSetup('manual')">Manual</button>
            </div>

            <!-- OAuth -->
            <div id="setup-oauth" class="setup-panel">
                <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 12px;">
                    Paste this URL as a Streamable HTTP MCP server. Your app handles auth automatically.
                </p>
                <div class="mcp-url-box">
                    <span id="oauth-url">{{mcp_base_url}}</span>
                    <button class="copy-btn" onclick="copyText('oauth-url')" style="position: absolute; top: 12px; right: 12px;">Copy</button>
                </div>
                <div class="copy-status" id="copy-status-oauth"></div>
                <p style="font-size: 12px; color: var(--text-disabled); margin-top: 12px;">
                    Works with Claude Desktop, Cursor, Windsurf, Poke, and any MCP OAuth-compatible app.
                </p>
            </div>

            <!-- JSON Config -->
            <div id="setup-config" class="setup-panel hidden">
                <div class="config-block">
                    <pre id="json-config">{
  "mcpServers": {
    "sportsmcp": {
      "url": "{{mcp_base_url}}",
      "headers": {
        "Authorization": "Bearer {{mcp_bearer_token}}"
      }
    }
  }
}</pre>
                    <button class="copy-btn" onclick="copyEl('json-config')">Copy</button>
                </div>
                <div class="copy-status" id="copy-status-config"></div>
            </div>

            <!-- Manual -->
            <div id="setup-manual" class="setup-panel hidden">
                <div style="background: var(--surface); border: 1px solid var(--border); padding: 20px;">
                    <div style="margin-bottom: 16px;">
                        <div class="label" style="margin-bottom: 4px;">Streamable HTTP</div>
                        <div style="font-family: var(--font-mono); font-size: 13px; color: var(--text-primary);">{{mcp_base_url}}</div>
                    </div>
                    <div style="margin-bottom: 16px;">
                        <div class="label" style="margin-bottom: 4px;">SSE (Legacy)</div>
                        <div style="font-family: var(--font-mono); font-size: 13px; color: var(--text-primary);">{{mcp_sse_base_url}}</div>
                    </div>
                    <div>
                        <div class="label" style="margin-bottom: 4px;">Authorization</div>
                        <div style="font-family: var(--font-mono); font-size: 13px; color: var(--text-primary);">Bearer {{mcp_bearer_token}}</div>
                    </div>
                </div>
            </div>
        </div>

        <hr class="divider">

        <!-- AI Notifications -->
        <div style="padding-bottom: 48px;">
            <div class="section-label">AI Notifications</div>
            <p style="font-size: 14px; color: var(--text-secondary); margin-bottom: 24px;">
                Get pinged whenever you finish a workout. Add one or more providers — all active providers receive every workout.
            </p>

            <!-- Active providers (shown when connected) -->
            <div id="poke-saved-view" class="{{poke_saved_class}}">
                <div id="active-providers-list" style="margin-bottom: 16px;"></div>
                <div style="display: flex; gap: 8px;">
                    <button onclick="window.testPokeKey()" id="poke-test-btn"
                        class="copy-btn" style="flex: 1; text-align: center;">
                        Send Test Ping
                    </button>
                    <button onclick="window.showAddProvider()"
                        class="copy-btn" style="flex: 1; text-align: center;">
                        Add Provider
                    </button>
                </div>
            </div>

            <!-- Add provider form -->
            <div id="poke-form-view" class="{{poke_form_class}}">
                <form id="poke-form" onsubmit="window.savePokeKey(event)">
                    <div class="label" style="margin-bottom: 8px;">Choose Provider</div>
                    <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2px; margin-bottom: 16px;" id="provider-selector">
                        <button type="button" onclick="window.selectProvider('poke')"
                            class="provider-btn" data-provider="poke"
                            style="background: var(--surface); border: 1px solid var(--border); padding: 12px; text-align: center; cursor: pointer; transition: border-color 200ms ease-out;">
                            <div style="font-family: var(--font-body); font-size: 14px; font-weight: 500; color: var(--text-display);">Poke</div>
                            <div style="font-family: var(--font-mono); font-size: 10px; color: var(--text-disabled); letter-spacing: 0.04em;">poke.com</div>
                        </button>
                        <button type="button" onclick="window.selectProvider('openclaw')"
                            class="provider-btn" data-provider="openclaw"
                            style="background: var(--surface); border: 1px solid var(--border); padding: 12px; text-align: center; cursor: pointer; transition: border-color 200ms ease-out;">
                            <div style="font-family: var(--font-body); font-size: 14px; font-weight: 500; color: var(--text-display);">OpenClaw</div>
                            <div style="font-family: var(--font-mono); font-size: 10px; color: var(--text-disabled); letter-spacing: 0.04em;">openclaw.ai</div>
                        </button>
                        <button type="button" onclick="window.selectProvider('manus')"
                            class="provider-btn" data-provider="manus"
                            style="background: var(--surface); border: 1px solid var(--border); padding: 12px; text-align: center; cursor: pointer; transition: border-color 200ms ease-out;">
                            <div style="font-family: var(--font-body); font-size: 14px; font-weight: 500; color: var(--text-display);">Manus</div>
                            <div style="font-family: var(--font-mono); font-size: 10px; color: var(--text-disabled); letter-spacing: 0.04em;">manus.im</div>
                        </button>
                    </div>

                    <input type="hidden" id="selected-provider" value="poke">

                    <div class="label" style="margin-bottom: 4px;" id="api-key-label">Poke API Key</div>
                    <input type="password" id="poke-key-input" placeholder="poke_xxxxxxxxxxxxxxxx"
                        style="width: 100%; background: transparent; border: none; border-bottom: 1px solid var(--border-visible); color: var(--text-primary); font-family: var(--font-mono); font-size: 14px; padding: 12px 0; outline: none; margin-bottom: 16px;">

                    <div id="endpoint-field" class="hidden">
                        <div class="label" style="margin-bottom: 4px;">Gateway URL</div>
                        <input type="url" id="endpoint-input" placeholder="https://your-openclaw-instance:18789"
                            style="width: 100%; background: transparent; border: none; border-bottom: 1px solid var(--border-visible); color: var(--text-primary); font-family: var(--font-mono); font-size: 14px; padding: 12px 0; outline: none; margin-bottom: 16px;">
                    </div>

                    <button type="submit" class="copy-btn" style="width: 100%; text-align: center; background: var(--text-display); color: var(--black);">
                        Save & Connect
                    </button>
                </form>
                <button onclick="window.cancelPokeEdit()" id="cancel-add-btn"
                    class="{{poke_form_class}}" style="width: 100%; font-family: var(--font-mono); font-size: 11px; color: var(--text-disabled); background: none; border: none; padding: 8px; cursor: pointer; margin-top: 4px;">
                    Cancel
                </button>
            </div>

            <div id="poke-status-bar" class="hidden" style="margin-top: 12px;">
                <div id="poke-status" style="font-family: var(--font-mono); font-size: 12px; padding: 8px 12px;"></div>
            </div>
        </div>

        <a href="/dashboard/{{profile.id}}" style="font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-disabled); text-decoration: none;">[ Classic Dashboard ]</a>
    </div>

    ${NOTHING_FOOTER}

    <script>
    // MCP setup tabs
    function showSetup(panel) {
        document.querySelectorAll('.setup-panel').forEach(el => el.classList.add('hidden'));
        document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
        document.getElementById('setup-' + panel).classList.remove('hidden');
        event.target.classList.add('active');
    }
    function copyText(id) {
        const text = document.getElementById(id).textContent;
        navigator.clipboard.writeText(text).then(() => {
            const s = document.getElementById('copy-status-oauth');
            s.textContent = '[COPIED]';
            setTimeout(() => s.textContent = '', 2000);
        });
    }
    function copyEl(id) {
        const text = document.getElementById(id).textContent;
        navigator.clipboard.writeText(text).then(() => {
            const s = document.getElementById('copy-status-config');
            s.textContent = '[COPIED]';
            setTimeout(() => s.textContent = '', 2000);
        });
    }

    // Notification system
    (function() {
        var _activeProviders = JSON.parse('{{active_providers_json}}' || '[]');
        var _providerMeta = {
            poke:     { name: 'Poke',     keyLabel: 'Poke API Key',  keyPlaceholder: 'poke_xxxxxxxxxxxxxxxx', needsEndpoint: false },
            openclaw: { name: 'OpenClaw',  keyLabel: 'Gateway Token', keyPlaceholder: 'your-gateway-token',   needsEndpoint: true  },
            manus:    { name: 'Manus',     keyLabel: 'API Key',       keyPlaceholder: 'your-manus-api-key',   needsEndpoint: false }
        };

        function _pokeToken() { return window.__mcpToken || ''; }

        function _pokeStatus(msg, isError) {
            var bar = document.getElementById('poke-status-bar');
            var el = document.getElementById('poke-status');
            if (!bar || !el) return;
            el.textContent = (isError ? '[ERROR] ' : '[OK] ') + msg;
            el.style.color = isError ? 'var(--accent)' : 'var(--success)';
            bar.classList.remove('hidden');
        }

        function _showPokeView(view) {
            document.getElementById('poke-saved-view').classList.toggle('hidden', view !== 'saved');
            document.getElementById('poke-form-view').classList.toggle('hidden', view !== 'form');
            var cancelBtn = document.getElementById('cancel-add-btn');
            if (cancelBtn) cancelBtn.classList.toggle('hidden', _activeProviders.length === 0);
        }

        function _renderActiveProviders() {
            var container = document.getElementById('active-providers-list');
            if (!container) return;
            if (_activeProviders.length === 0) { container.innerHTML = ''; return; }
            container.innerHTML = _activeProviders.map(function(p) {
                var meta = _providerMeta[p] || { name: p };
                return '<div style="display: flex; align-items: center; gap: 8px; background: var(--surface); border: 1px solid var(--border); padding: 12px 16px; margin-bottom: 2px;">' +
                    '<span style="width: 6px; height: 6px; background: var(--success); border-radius: 50%;"></span>' +
                    '<span style="font-family: var(--font-mono); font-size: 12px; color: var(--success); letter-spacing: 0.04em;">' + meta.name + '</span>' +
                    '<span style="font-family: var(--font-mono); font-size: 10px; color: var(--text-disabled); letter-spacing: 0.06em; text-transform: uppercase; margin-left: auto;">Active</span>' +
                    '<button onclick="window.removeProvider(\\'' + p + '\\')" style="font-family: var(--font-mono); font-size: 10px; color: var(--text-disabled); background: none; border: none; cursor: pointer; padding: 2px 6px;" title="Remove">[x]</button>' +
                    '</div>';
            }).join('');
        }
        _renderActiveProviders();

        window.selectProvider = function selectProvider(provider) {
            var meta = _providerMeta[provider] || _providerMeta.poke;
            document.getElementById('selected-provider').value = provider;
            document.getElementById('api-key-label').textContent = meta.keyLabel;
            document.getElementById('poke-key-input').placeholder = meta.keyPlaceholder;
            var epField = document.getElementById('endpoint-field');
            if (epField) epField.classList.toggle('hidden', !meta.needsEndpoint);
            document.querySelectorAll('.provider-btn').forEach(function(btn) {
                var isActive = btn.getAttribute('data-provider') === provider;
                btn.style.borderColor = isActive ? 'var(--text-display)' : 'var(--border)';
            });
        };

        // Default to first non-active provider
        (function() {
            var pick = ['poke', 'openclaw', 'manus'].find(function(p) { return _activeProviders.indexOf(p) === -1; }) || 'poke';
            window.selectProvider(pick);
        })();

        window.showAddProvider = function() { _showPokeView('form'); };
        window.cancelPokeEdit = function() { _showPokeView('saved'); };

        window.savePokeKey = async function savePokeKey(event) {
            event.preventDefault();
            var provider = document.getElementById('selected-provider').value || 'poke';
            var key = document.getElementById('poke-key-input').value.trim();
            var endpoint = document.getElementById('endpoint-input') ? document.getElementById('endpoint-input').value.trim() : '';
            if (!key) { _pokeStatus('Please enter your API key.', true); return; }
            if (provider === 'openclaw' && !endpoint) { _pokeStatus('OpenClaw requires a Gateway URL.', true); return; }
            try {
                var body = { token: _pokeToken(), provider: provider, api_key: key };
                if (endpoint) body.endpoint = endpoint;
                var res = await fetch('/settings/notification-config', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body)
                });
                if (res.ok) {
                    var data = await res.json();
                    document.getElementById('poke-key-input').value = '';
                    if (document.getElementById('endpoint-input')) document.getElementById('endpoint-input').value = '';
                    _activeProviders = data.providers || _activeProviders;
                    if (_activeProviders.indexOf(provider) === -1) _activeProviders.push(provider);
                    _renderActiveProviders();
                    _showPokeView('saved');
                    var providerName = (_providerMeta[provider] || {}).name || provider;
                    _pokeStatus("Connected to " + providerName + ". You'll get a ping after every workout.", false);
                } else {
                    var err = await res.json();
                    _pokeStatus(err.error || 'Failed to save.', true);
                }
            } catch (e) { _pokeStatus('Network error.', true); }
        };

        window.testPokeKey = async function testPokeKey() {
            var btn = document.getElementById('poke-test-btn');
            var orig = btn ? btn.textContent : '';
            if (btn) { btn.textContent = '...'; btn.disabled = true; }
            try {
                var res = await fetch('/test-notification?token=' + _pokeToken(), { method: 'POST' });
                var data = await res.json();
                if (res.ok && data.success) {
                    _pokeStatus(data.message, false);
                } else {
                    _pokeStatus(data.error || 'Test failed.', true);
                }
            } catch (e) { _pokeStatus('Network error.', true); }
            finally { if (btn) { btn.textContent = orig; btn.disabled = false; } }
        };

        window.removeProvider = async function removeProvider(provider) {
            try {
                var res = await fetch('/settings/notification-config', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: _pokeToken(), provider: provider })
                });
                if (res.ok) {
                    _activeProviders = _activeProviders.filter(function(p) { return p !== provider; });
                    _renderActiveProviders();
                    if (_activeProviders.length === 0) _showPokeView('form');
                    _pokeStatus((_providerMeta[provider] || {}).name + ' removed.', false);
                } else { _pokeStatus('Could not remove.', true); }
            } catch (e) { _pokeStatus('Network error.', true); }
        };

        if (_activeProviders.length > 0) { _showPokeView('saved'); } else { _showPokeView('form'); }
    })();
    </script>
    <script>window.__mcpToken = '{{mcp_token}}';</script>
</body>
</html>`;


// ─── ABOUT ──────────────────────────────────────────────────────────────────
export const NOTHING_ABOUT_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About — Mainichi Fit</title>
    ${NOTHING_HEAD}
    <style>
        ${NOTHING_CSS}
        .page-title { font-family: var(--font-display); font-size: 36px; font-weight: 700; color: var(--text-display); letter-spacing: -0.02em; margin: 48px 0 8px; }
        .page-subtitle { font-size: 16px; color: var(--text-secondary); margin-bottom: 48px; }
        .content-section { margin-bottom: 48px; }
        .content-section h2 { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-disabled); margin-bottom: 16px; }
        .content-section p { font-size: 15px; color: var(--text-primary); line-height: 1.7; margin-bottom: 12px; }
        .content-card { background: var(--surface); border: 1px solid var(--border); padding: 24px; margin-bottom: 2px; }
        .content-card h3 { font-family: var(--font-body); font-size: 16px; font-weight: 500; color: var(--text-display); margin-bottom: 8px; }
        .content-card p { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
        @media (max-width: 640px) { .two-col { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    ${NOTHING_NAV}
    <div class="container">
        <div class="page-title">About</div>
        <div class="page-subtitle">Bridging AI assistants and your personal fitness data</div>

        <div class="content-section">
            <h2>Our Mission</h2>
            <p>Mainichi Fit builds tools that make your fitness data more useful. We believe your workout history, training patterns, and athletic achievements should be accessible to the AI tools you already use — securely and privately.</p>
            <p>Our first product, SportsMCP, is a Model Context Protocol server that connects AI assistants directly to your Strava data. Ask your AI about your training, get insights from your workout history, and let AI help you train smarter.</p>
        </div>

        <div class="content-section">
            <h2>How It Works</h2>
            <div class="content-card">
                <h3>01 — Connect</h3>
                <p>Authorize with your Strava account using secure OAuth. We only request read access to your data.</p>
            </div>
            <div class="content-card">
                <h3>02 — Configure</h3>
                <p>Add your personal MCP URL to any compatible AI assistant — Claude Desktop, Cursor, Windsurf, Poke, and more.</p>
            </div>
            <div class="content-card">
                <h3>03 — Ask</h3>
                <p>Your AI can now access 21 tools covering activities, segments, routes, stats, zones, gear, clubs, and social data.</p>
            </div>
        </div>

        <div class="content-section">
            <h2>Privacy & Security</h2>
            <div class="two-col">
                <div class="content-card">
                    <h3>What we do</h3>
                    <p>Encrypted token storage. Auto-refresh authentication. Real-time data fetching from Strava (nothing stored permanently). Full data deletion within 48 hours of deauthorization.</p>
                </div>
                <div class="content-card">
                    <h3>What we never do</h3>
                    <p>We never train AI models on your data. Never sell data to third parties. Never store activity data permanently. Never share with advertisers.</p>
                </div>
            </div>
        </div>

        <div class="content-section">
            <h2>Contact</h2>
            <p>Email: <a href="mailto:hello@mainichi.fit" style="color: var(--text-primary);">hello@mainichi.fit</a></p>
        </div>
    </div>
    ${NOTHING_FOOTER}
</body>
</html>`;


// ─── SUPPORT ────────────────────────────────────────────────────────────────
export const NOTHING_SUPPORT_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Support — Mainichi Fit</title>
    ${NOTHING_HEAD}
    <style>
        ${NOTHING_CSS}
        .page-title { font-family: var(--font-display); font-size: 36px; font-weight: 700; color: var(--text-display); letter-spacing: -0.02em; margin: 48px 0 8px; }
        .page-subtitle { font-size: 16px; color: var(--text-secondary); margin-bottom: 48px; }
        .content-section { margin-bottom: 48px; }
        .content-section h2 { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-disabled); margin-bottom: 16px; }
        .content-section p { font-size: 15px; color: var(--text-primary); line-height: 1.7; margin-bottom: 12px; }
        .step-card { background: var(--surface); border: 1px solid var(--border); padding: 24px; margin-bottom: 2px; }
        .step-card .step-num { font-family: var(--font-mono); font-size: 11px; color: var(--text-disabled); letter-spacing: 0.08em; margin-bottom: 8px; }
        .step-card h3 { font-family: var(--font-body); font-size: 16px; font-weight: 500; color: var(--text-display); margin-bottom: 8px; }
        .step-card p { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
        .faq-item { padding: 20px 0; border-bottom: 1px solid var(--border); }
        .faq-item:last-child { border-bottom: none; }
        .faq-q { font-family: var(--font-body); font-size: 15px; font-weight: 500; color: var(--text-display); margin-bottom: 8px; }
        .faq-a { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
    </style>
</head>
<body>
    ${NOTHING_NAV}
    <div class="container">
        <div class="page-title">Support</div>
        <div class="page-subtitle">Get started and troubleshoot common issues</div>

        <div class="content-section">
            <h2>Quick Start</h2>
            <div class="step-card">
                <div class="step-num">01</div>
                <h3>Connect Strava</h3>
                <p>Click "Connect" in the navigation and authorize with your Strava account. We only request read access.</p>
            </div>
            <div class="step-card">
                <div class="step-num">02</div>
                <h3>Get your MCP URL</h3>
                <p>After connecting, your dashboard shows your personal MCP endpoint URL and configuration options.</p>
            </div>
            <div class="step-card">
                <div class="step-num">03</div>
                <h3>Configure your AI</h3>
                <p>Add the URL to your AI assistant's MCP settings. Most apps support OAuth (just paste the URL) or JSON config.</p>
            </div>
        </div>

        <div class="content-section">
            <h2>Common Issues</h2>
            <div class="faq-item">
                <div class="faq-q">Authentication not working</div>
                <div class="faq-a">Try logging out and reconnecting your Strava account. Tokens auto-refresh, but occasionally a fresh connection is needed. Check that your Strava account is active.</div>
            </div>
            <div class="faq-item">
                <div class="faq-q">MCP connection timing out</div>
                <div class="faq-a">Ensure your AI assistant supports Streamable HTTP transport. If using SSE, try switching to the Streamable HTTP endpoint. Some older clients may need the SSE URL instead.</div>
            </div>
            <div class="faq-item">
                <div class="faq-q">No activities showing</div>
                <div class="faq-a">Activities are fetched in real-time from Strava. If your recent activities aren't appearing, check your Strava privacy settings and ensure the activities are not marked as private.</div>
            </div>
            <div class="faq-item">
                <div class="faq-q">Which AI apps are supported?</div>
                <div class="faq-a">Any app that supports the Model Context Protocol works — Claude Desktop, Cursor, Windsurf, Cline, Continue.dev, Poke, Manus, OpenClaw, and more. Check the dashboard for setup instructions by connection type.</div>
            </div>
        </div>

        <div class="content-section">
            <h2>Get Help</h2>
            <p>Email: <a href="mailto:hello@mainichi.fit" style="color: var(--text-primary);">hello@mainichi.fit</a></p>
            <p>GitHub: <a href="https://github.com/gabeperez/strava-mcp/issues" style="color: var(--text-primary);">Open an issue</a></p>
        </div>
    </div>
    ${NOTHING_FOOTER}
</body>
</html>`;


// ─── PRIVACY ────────────────────────────────────────────────────────────────
export const NOTHING_PRIVACY_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy Policy — Mainichi Fit</title>
    ${NOTHING_HEAD}
    <style>
        ${NOTHING_CSS}
        .page-title { font-family: var(--font-display); font-size: 36px; font-weight: 700; color: var(--text-display); letter-spacing: -0.02em; margin: 48px 0 8px; }
        .page-meta { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-disabled); margin-bottom: 48px; }
        .content-section { margin-bottom: 48px; }
        .content-section h2 { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-disabled); margin-bottom: 16px; }
        .content-section p { font-size: 15px; color: var(--text-primary); line-height: 1.7; margin-bottom: 12px; }
        .content-section ul { list-style: none; padding: 0; }
        .content-section ul li { font-size: 14px; color: var(--text-secondary); line-height: 1.6; padding: 6px 0; padding-left: 16px; position: relative; }
        .content-section ul li::before { content: '—'; position: absolute; left: 0; color: var(--text-disabled); }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 2px; }
        .content-card { background: var(--surface); border: 1px solid var(--border); padding: 24px; }
        .content-card h3 { font-family: var(--font-body); font-size: 16px; font-weight: 500; color: var(--text-display); margin-bottom: 8px; }
        .content-card p, .content-card li { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
        @media (max-width: 640px) { .two-col { grid-template-columns: 1fr; } }
    </style>
</head>
<body>
    ${NOTHING_NAV}
    <div class="container">
        <div class="page-title">Privacy Policy</div>
        <div class="page-meta">Last updated: April 2026</div>

        <div class="content-section">
            <h2>Our Commitment</h2>
            <p>Mainichi Fit is committed to protecting your privacy and ensuring the security of your personal information. This policy explains how we collect, use, and safeguard your data.</p>
            <p style="font-size: 14px; color: var(--text-secondary);">We access your data through the official Strava API, subject to the <a href="https://www.strava.com/legal/api" target="_blank" rel="noopener noreferrer" style="color: var(--text-primary);">Strava API Agreement</a>.</p>
            <p style="font-size: 14px; color: var(--text-secondary);">Contact: <a href="mailto:hello@mainichi.fit" style="color: var(--text-primary);">hello@mainichi.fit</a></p>
        </div>

        <div class="content-section">
            <h2>Information We Collect</h2>
            <ul>
                <li>Basic profile information (name, username, profile picture)</li>
                <li>Activity data (workouts, routes, performance metrics) — fetched in real-time, not stored</li>
                <li>Athlete statistics and achievements</li>
                <li>OAuth authentication tokens (encrypted, auto-expiring)</li>
                <li>Technical data: IP address, browser type, access timestamps</li>
            </ul>
            <p style="font-size: 13px; color: var(--text-disabled);">We only access data available through your Strava privacy settings and the permissions you grant.</p>
        </div>

        <div class="content-section">
            <h2>How We Use Your Data</h2>
            <div class="two-col">
                <div class="content-card">
                    <h3>What we do</h3>
                    <ul>
                        <li>Authenticate your Strava connection</li>
                        <li>Fetch activity data in real-time when requested by your AI</li>
                        <li>Store encrypted tokens for seamless access</li>
                        <li>Auto-refresh expired tokens</li>
                    </ul>
                </div>
                <div class="content-card">
                    <h3>What we never do</h3>
                    <ul>
                        <li>Train AI models using your data</li>
                        <li>Sell your data to third parties</li>
                        <li>Store activity data permanently</li>
                        <li>Share data with advertisers</li>
                        <li>Use your data for ML/AI training</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="content-section">
            <h2>Data Storage & Security</h2>
            <p>Data is stored on Cloudflare Workers KV with encryption at rest. All connections use HTTPS. OAuth tokens are stored with automatic expiry (30-day session TTL). Authentication tokens are refreshed automatically before expiry.</p>
        </div>

        <div class="content-section">
            <h2>Your Rights</h2>
            <ul>
                <li>Access: Request a copy of your stored data at any time</li>
                <li>Correct: Update inaccurate information through Strava</li>
                <li>Delete: Disconnect your account — all data deleted within 48 hours</li>
                <li>Portability: Export your data in standard formats</li>
                <li>Opt-out: Revoke access through Strava settings at any time</li>
            </ul>
        </div>

        <div class="content-section">
            <h2>Data Retention</h2>
            <p>Session tokens auto-expire after 30 days of inactivity. When you deauthorize the app through Strava, all stored data is automatically deleted within 48 hours. Webhook event summaries are cached for a maximum of 7 days.</p>
        </div>

        <div class="content-section">
            <h2>Contact</h2>
            <p>Privacy questions: <a href="mailto:hello@mainichi.fit" style="color: var(--text-primary);">hello@mainichi.fit</a></p>
        </div>
    </div>
    ${NOTHING_FOOTER}
</body>
</html>`;


// ─── TERMS ──────────────────────────────────────────────────────────────────
export const NOTHING_TERMS_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Terms of Service — Mainichi Fit</title>
    ${NOTHING_HEAD}
    <style>
        ${NOTHING_CSS}
        .page-title { font-family: var(--font-display); font-size: 36px; font-weight: 700; color: var(--text-display); letter-spacing: -0.02em; margin: 48px 0 8px; }
        .page-meta { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.06em; text-transform: uppercase; color: var(--text-disabled); margin-bottom: 48px; }
        .content-section { margin-bottom: 48px; }
        .content-section h2 { font-family: var(--font-mono); font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--text-disabled); margin-bottom: 16px; }
        .content-section p { font-size: 15px; color: var(--text-primary); line-height: 1.7; margin-bottom: 12px; }
        .content-section ul { list-style: none; padding: 0; }
        .content-section ul li { font-size: 14px; color: var(--text-secondary); line-height: 1.6; padding: 6px 0; padding-left: 16px; position: relative; }
        .content-section ul li::before { content: '—'; position: absolute; left: 0; color: var(--text-disabled); }
        .content-card { background: var(--surface); border: 1px solid var(--border); padding: 24px; margin-bottom: 2px; }
        .content-card h3 { font-family: var(--font-body); font-size: 16px; font-weight: 500; color: var(--text-display); margin-bottom: 8px; }
        .content-card p, .content-card li { font-size: 14px; color: var(--text-secondary); line-height: 1.6; }
    </style>
</head>
<body>
    ${NOTHING_NAV}
    <div class="container">
        <div class="page-title">Terms of Service</div>
        <div class="page-meta">Last updated: April 2026</div>

        <div class="content-section">
            <h2>Acceptance</h2>
            <p>By accessing or using Mainichi Fit ("the Service"), you agree to be bound by these Terms. If you do not agree, do not use the Service.</p>
            <p>These Terms constitute a legally binding agreement between you and Mainichi Fit. Your use is also subject to our <a href="/privacy/nothing" style="color: var(--text-primary);">Privacy Policy</a>. Mainichi Fit operates under the <a href="https://www.strava.com/legal/api" target="_blank" rel="noopener noreferrer" style="color: var(--text-primary);">Strava API Agreement</a>.</p>
            <p style="font-size: 14px; color: var(--text-secondary);">Contact: <a href="mailto:hello@mainichi.fit" style="color: var(--text-primary);">hello@mainichi.fit</a></p>
        </div>

        <div class="content-section">
            <h2>Description of Service</h2>
            <p>Mainichi Fit provides a Model Context Protocol (MCP) interface that enables AI assistants to access your personal Strava fitness data with your explicit authorization. The service includes:</p>
            <ul>
                <li>Secure OAuth authentication with Strava</li>
                <li>Personal MCP server endpoint for AI assistants</li>
                <li>21 read-only tools for accessing Strava data</li>
                <li>Real-time webhook notifications for new activities</li>
                <li>Dashboard for managing connections and settings</li>
            </ul>
        </div>

        <div class="content-section">
            <h2>Your Responsibilities</h2>
            <ul>
                <li>Keep your MCP token confidential and do not share it publicly</li>
                <li>Use the service in compliance with Strava's terms of service</li>
                <li>Do not attempt to access other users' data</li>
                <li>Do not use the service for any illegal or unauthorized purpose</li>
                <li>Do not reverse-engineer, decompile, or disassemble the service</li>
                <li>Report any security vulnerabilities to hello@mainichi.fit</li>
            </ul>
        </div>

        <div class="content-section">
            <h2>Data & Privacy</h2>
            <p>Your data remains yours. We access it only to provide the service and never for other purposes. See our <a href="/privacy/nothing" style="color: var(--text-primary);">Privacy Policy</a> for full details on data handling.</p>
        </div>

        <div class="content-section">
            <h2>Service Availability</h2>
            <p>The service is provided "as is" without warranty. We strive for high availability but cannot guarantee uninterrupted access. The service depends on third-party infrastructure (Cloudflare Workers, Strava API) subject to their own availability and rate limits.</p>
        </div>

        <div class="content-section">
            <h2>Termination</h2>
            <p>You may disconnect your Strava account at any time through your dashboard or Strava settings. Upon disconnection, all stored data is deleted within 48 hours. We reserve the right to suspend accounts that violate these terms.</p>
        </div>

        <div class="content-section">
            <h2>Intellectual Property</h2>
            <p>Mainichi Fit, SportsMCP, and associated trademarks are the property of Mainichi Fit. Strava and the Strava logo are trademarks of Strava, Inc. Your fitness data remains your property at all times.</p>
        </div>

        <div class="content-section">
            <h2>Changes to Terms</h2>
            <p>We may update these terms. Continued use after changes constitutes acceptance. Significant changes will be communicated via email or dashboard notification.</p>
        </div>

        <div class="content-section">
            <h2>Contact</h2>
            <p>Legal questions: <a href="mailto:hello@mainichi.fit" style="color: var(--text-primary);">hello@mainichi.fit</a></p>
        </div>
    </div>
    ${NOTHING_FOOTER}
</body>
</html>`;
