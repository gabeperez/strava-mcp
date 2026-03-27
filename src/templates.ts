import { readFileSync } from 'fs';
import { join } from 'path';

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

    // Handle simple conditionals {{#if condition}}...{{/if}}
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

    // Handle {{else}} in conditionals
    result = result.replace(/\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, trueContent, falseContent) => {
      const value = this.getNestedValue(data, condition.trim());
      const contentToRender = this.isTruthy(value) ? trueContent : falseContent;
      return this.processTemplate(contentToRender, data);
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

// Template contents (since we can't read files in Cloudflare Workers)
export const LANDING_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SportsMCP - Connect Your AI to Strava</title>
    <meta name="description" content="Get your personal MCP server URL to unlock powerful Strava integration with AI assistants like Poke.com, Claude Desktop, and more.">
    <link rel="icon" type="image/png" href="https://res.cloudinary.com/dxoyxnrjl/image/upload/v1758961029/Strava_MCP_Logo_4_u0pe64.png">
    
    <!-- Social Media Meta Tags -->
    <meta property="og:title" content="SportsMCP - Connect Your AI to Strava">
    <meta property="og:description" content="Get your personal MCP server URL to unlock powerful Strava integration with AI assistants.">
    <meta property="og:image" content="https://res.cloudinary.com/dxoyxnrjl/image/upload/v1758961568/SportMCP_opengraph.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:url" content="{{base_url}}">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="SportsMCP - Connect Your AI to Strava">
    <meta name="twitter:description" content="Get your personal MCP server URL to unlock powerful Strava integration with AI assistants.">
    <meta name="twitter:image" content="https://res.cloudinary.com/dxoyxnrjl/image/upload/v1758961568/SportMCP_opengraph.png">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .gradient-bg {
            background: linear-gradient(135deg, #FC4C02 0%, #FF7B00 100%);
        }
        .feature-card {
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid rgba(255, 255, 255, 0.2);
        }
        .hero-pattern {
            background-image: 
                radial-gradient(circle at 20% 50%, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, rgba(255, 123, 0, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 40% 80%, rgba(252, 76, 2, 0.3) 0%, transparent 50%);
        }
    </style>
</head>
<body class="bg-gray-900 text-white">
    <!-- Navigation -->
    <nav class="relative z-10 px-6 py-4">
        <div class="max-w-7xl mx-auto flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <img src="https://res.cloudinary.com/dxoyxnrjl/image/upload/v1758961029/Strava_MCP_Logo_4_u0pe64.png" alt="SportsMCP Logo" class="w-10 h-10 rounded-lg">
                <span class="text-xl font-bold">SportsMCP</span>
            </div>
            <div class="flex items-center space-x-6">
                <a href="/about" class="text-gray-300 hover:text-white transition-colors">About</a>
                <a href="/support" class="text-gray-300 hover:text-white transition-colors">Support</a>
                <a href="/auth" class="bg-orange-500 hover:bg-orange-600 px-6 py-2 rounded-lg font-semibold transition-colors">
                    Get Started
                </a>
            </div>
        </div>
    </nav>

    <!-- Hero Section -->
    <section class="relative min-h-screen hero-pattern overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-gray-900/90 via-gray-900/80 to-gray-900/90"></div>
        
        <div class="relative z-10 max-w-7xl mx-auto px-6 pt-20 pb-32">
            <div class="text-center max-w-4xl mx-auto">
                <!-- Hero Logo -->
                <div class="flex justify-center mb-8">
                    <img src="https://res.cloudinary.com/dxoyxnrjl/image/upload/v1758961029/Strava_MCP_Logo_4_u0pe64.png" alt="SportsMCP Logo" class="w-32 h-32 rounded-2xl shadow-2xl">
                </div>
                
                <h1 class="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                    Connect Your AI to Strava
                </h1>
                <p class="text-xl md:text-2xl text-gray-300 mb-12 leading-relaxed">
                    Get your personal MCP server URL to unlock powerful Strava integration with AI assistants like 
                    <span class="text-orange-400 font-semibold">Poke.com</span>, 
                    <span class="text-orange-400 font-semibold">Claude Desktop</span>, and more.
                </p>
                
                <div class="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
                    <a href="/auth" class="gradient-bg hover:opacity-90 text-white font-bold py-4 px-8 rounded-lg text-lg transition-all transform hover:scale-105 shadow-lg flex items-center">
                        <i class="fab fa-strava mr-2"></i>
                        Connect with Strava
                    </a>
                    <div class="text-gray-400 flex items-center">
                        <i class="fas fa-shield-alt mr-2"></i>
                        Secure OAuth Authentication
                    </div>
                </div>

                <!-- Demo Terminal -->
                <div class="relative max-w-4xl mx-auto">
                    <div class="bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-700">
                        <div class="bg-gray-900 rounded-lg p-6 font-mono text-sm text-left">
                            <div class="flex items-center mb-4 text-gray-400">
                                <div class="flex space-x-2">
                                    <div class="w-3 h-3 bg-red-500 rounded-full"></div>
                                    <div class="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                    <div class="w-3 h-3 bg-green-500 rounded-full"></div>
                                </div>
                                <span class="ml-4">AI Assistant - Poke.com</span>
                            </div>
                            <div class="space-y-2 text-gray-300">
                                <div><span class="text-blue-400">You:</span> Show me my recent Strava activities</div>
                                <div><span class="text-green-400">AI:</span> I found your recent activities! Here are your last 5 workouts:</div>
                                <div class="ml-4 text-gray-400">
                                    • Evening Run - 5.2 miles, 7:45 pace<br>
                                    • Morning Bike Ride - 25 miles, 285W avg<br>
                                    • Trail Run - 8.1 miles, varied terrain
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="py-24 bg-gray-800">
        <div class="max-w-7xl mx-auto px-6">
            <div class="text-center mb-16">
                <h2 class="text-4xl font-bold mb-6">Why Choose Our MCP Server?</h2>
                <p class="text-xl text-gray-400">Everything you need for seamless AI-Strava integration</p>
            </div>

            <div class="grid md:grid-cols-3 gap-8">
                <div class="feature-card rounded-2xl p-8 text-center">
                    <div class="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-6">
                        <i class="fas fa-link text-2xl text-white"></i>
                    </div>
                    <h3 class="text-2xl font-bold mb-4">Personal MCP URL</h3>
                    <p class="text-gray-300">Get your unique, secure MCP server URL that works with any AI assistant supporting the Model Context Protocol.</p>
                </div>

                <div class="feature-card rounded-2xl p-8 text-center">
                    <div class="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-6">
                        <i class="fas fa-sync-alt text-2xl text-white"></i>
                    </div>
                    <h3 class="text-2xl font-bold mb-4">Auto Token Refresh</h3>
                    <p class="text-gray-300">Never worry about expired tokens. Our system automatically refreshes your Strava authentication in the background.</p>
                </div>

                <div class="feature-card rounded-2xl p-8 text-center">
                    <div class="w-16 h-16 gradient-bg rounded-full flex items-center justify-center mx-auto mb-6">
                        <i class="fas fa-shield-alt text-2xl text-white"></i>
                    </div>
                    <h3 class="text-2xl font-bold mb-4">Secure & Private</h3>
                    <p class="text-gray-300">Your data stays private. We only access what you authorize and never store sensitive information permanently.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- CTA Section -->
    <section class="py-24 gradient-bg">
        <div class="max-w-4xl mx-auto text-center px-6">
            <h2 class="text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p class="text-xl mb-8 text-orange-100">
                Connect your Strava account and get your personal MCP URL in under 30 seconds.
            </p>
            
            <a href="/auth" class="inline-block bg-white text-orange-600 hover:text-orange-700 font-bold py-4 px-8 rounded-xl text-lg transition-colors shadow-xl hover:shadow-2xl transform hover:scale-105">
                <i class="fab fa-strava mr-3"></i>
                Get Your MCP URL Now
            </a>
        </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-950 py-12">
        <div class="max-w-7xl mx-auto px-6 text-center text-gray-400">
            <div class="flex items-center justify-center space-x-6 mb-6">
                <a href="/privacy" class="hover:text-white transition-colors text-sm">Privacy Policy</a>
                <a href="/terms" class="hover:text-white transition-colors text-sm">Terms of Service</a>
                <a href="/about" class="hover:text-white transition-colors text-sm">About</a>
                <a href="/support" class="hover:text-white transition-colors text-sm">Support</a>
            </div>
            
            <div class="flex items-center justify-center space-x-3 mb-4">
                <img src="https://res.cloudinary.com/dxoyxnrjl/image/upload/v1758961029/Strava_MCP_Logo_4_u0pe64.png" alt="SportsMCP Logo" class="w-8 h-8 rounded-lg">
                <span class="font-bold">SportsMCP</span>
            </div>
            
            <p class="text-sm">
                Powered by Cloudflare Workers • Built for the Model Context Protocol
            </p>
            <p class="text-xs mt-3 text-gray-600">
                Compatible with <a href="https://www.strava.com" target="_blank" rel="noopener noreferrer" class="text-orange-500 font-semibold hover:text-orange-400">Strava</a>.
                SportsMCP is not affiliated with, endorsed, or sponsored by Strava.
            </p>
        </div>
    </footer>
</body>
</html>`;

export const DASHBOARD_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard - SportsMCP</title>
    <meta name="description" content="Your personal Strava MCP dashboard with activity stats, insights, and your unique MCP URL for AI assistants.">
    <link rel="icon" type="image/png" href="https://res.cloudinary.com/dxoyxnrjl/image/upload/v1758961029/Strava_MCP_Logo_4_u0pe64.png">
    
    <!-- Social Media Meta Tags -->
    <meta property="og:title" content="SportsMCP Dashboard - Your Personal Activity Hub">
    <meta property="og:description" content="View your Strava stats, get your personal MCP URL, and connect AI assistants to your fitness data.">
    <meta property="og:image" content="https://res.cloudinary.com/dxoyxnrjl/image/upload/v1758961568/SportMCP_opengraph.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="SportsMCP Dashboard">
    <meta name="twitter:description" content="View your Strava stats, get your personal MCP URL, and connect AI assistants to your fitness data.">
    <meta name="twitter:image" content="https://res.cloudinary.com/dxoyxnrjl/image/upload/v1758961568/SportMCP_opengraph.png">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .gradient-bg {
            background: linear-gradient(135deg, #FC4C02 0%, #FF7B00 100%);
        }
        .card {
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.05);
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .copy-success {
            animation: copySuccess 2s ease-out;
        }
        @keyframes copySuccess {
            0% { opacity: 0; transform: translateY(-10px); }
            20% { opacity: 1; transform: translateY(0); }
            80% { opacity: 1; transform: translateY(0); }
            100% { opacity: 0; transform: translateY(-10px); }
        }
        .active-tab {
            background-color: rgba(249, 115, 22, 0.15);
        }
    </style>
</head>
<body class="bg-gray-900 text-white min-h-screen">
    <!-- Navigation -->
    <nav class="bg-gray-800 border-b border-gray-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 py-3">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <img src="https://res.cloudinary.com/dxoyxnrjl/image/upload/v1758961029/Strava_MCP_Logo_4_u0pe64.png" alt="SportsMCP Logo" class="w-9 h-9 rounded-lg">
                    <span class="text-lg font-bold">SportsMCP</span>
                </div>
                <div class="flex items-center space-x-3 sm:space-x-5">
                    <a href="/about" class="hidden sm:block text-gray-300 hover:text-white transition-colors text-sm">About</a>
                    <a href="/support" class="hidden sm:block text-gray-300 hover:text-white transition-colors text-sm">Support</a>
                    <form action="/logout" method="post" class="inline">
                        <button type="submit" class="text-gray-400 hover:text-white transition-colors text-sm">
                            <i class="fas fa-sign-out-alt mr-1"></i><span class="hidden sm:inline">Logout</span><span class="sm:hidden">Exit</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </nav>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <!-- Welcome Section -->
        <div class="mb-8">
            <h1 class="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Your SportsMCP Dashboard
            </h1>
            <p class="text-xl text-gray-400 mb-6">
                Everything you need to connect AI assistants to your Strava data
            </p>
            
            <!-- Quick Insights Banner -->
            <div class="bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-xl p-4 border border-orange-500/30">
                <div class="grid grid-cols-3 gap-2 sm:flex sm:items-center sm:justify-between">
                    <div class="text-center">
                        <div class="text-xl sm:text-2xl font-bold text-orange-400">{{total_activities}}</div>
                        <div class="text-xs sm:text-sm text-gray-300">Activities</div>
                        <div class="text-xs text-gray-500 hidden sm:block">Last 4 weeks</div>
                    </div>
                    <div class="text-center">
                        <div class="text-xl sm:text-2xl font-bold text-orange-400">{{insights.most_active_sport}}</div>
                        <div class="text-xs sm:text-sm text-gray-300">Most Active</div>
                        <div class="text-xs text-gray-500 hidden sm:block">Primary sport</div>
                    </div>
                    <div class="text-center">
                        <div class="text-xl sm:text-2xl font-bold text-orange-400">{{insights.weekly_average}}</div>
                        <div class="text-xs sm:text-sm text-gray-300">Per Week</div>
                        <div class="text-xs text-gray-500 hidden sm:block">Average pace</div>
                    </div>
                    <div class="hidden md:flex items-center text-orange-400">
                        <i class="fas fa-chart-line text-3xl"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Poke Notifications (compact, near top) -->
        <div class="card rounded-2xl p-4 mb-6">
            <div class="flex flex-col sm:flex-row sm:items-center gap-3">
                <div class="flex items-center gap-2 flex-shrink-0">
                    <i class="fas fa-bell text-orange-400 text-lg"></i>
                    <h2 class="text-base font-bold">Poke Notifications</h2>
                </div>
                <p class="text-xs text-gray-400 sm:mr-4 flex-shrink-0">Get notified on <a href="https://poke.com" target="_blank" rel="noopener noreferrer" class="text-orange-400 hover:underline">Poke.com</a> after each workout.</p>
                <form id="poke-form" class="flex gap-2 flex-1 min-w-0" onsubmit="window.savePokeKey(event)">
                    <input type="password" id="poke-key-input" placeholder="poke_xxxxxxxxxxxxxxxx"
                           class="flex-1 min-w-0 bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-orange-500">
                    <button type="submit"
                            class="flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap">
                        Save Key
                    </button>
                </form>
            </div>
            <p id="poke-status" class="text-xs mt-2 hidden"></p>
        </div>

        <!-- Profile & MCP URL Section -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            <!-- Profile Card -->
            <div class="card rounded-2xl p-6">
                <div class="flex items-center space-x-4 mb-6">
                    <div class="w-16 h-16 rounded-full overflow-hidden bg-gray-700">
                        {{#if profile.profile_medium}}
                            <img src="{{profile.profile_medium}}" alt="Profile" class="w-full h-full object-cover">
                        {{else}}
                            <div class="w-full h-full flex items-center justify-center">
                                <i class="fas fa-user text-2xl text-gray-400"></i>
                            </div>
                        {{/if}}
                    </div>
                    <div>
                        <h2 class="text-2xl font-bold">{{profile.firstname}} {{profile.lastname}}</h2>
                        <p class="text-orange-400">@{{profile.username}}</p>
                    </div>
                </div>
                
                <div class="space-y-3 text-sm">
                    <div class="flex justify-between">
                        <span class="text-gray-400">Location:</span>
                        <span>{{profile.location}}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Athlete Type:</span>
                        <span class="capitalize">{{profile.athlete_type}}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-400">Member Since:</span>
                        <span>{{profile.created_date}}</span>
                    </div>
                </div>
            </div>

            <!-- MCP URL Card -->
            <div class="lg:col-span-2 card rounded-2xl p-6">
                <div class="flex items-center justify-between mb-6">
                    <h2 class="text-2xl font-bold flex items-center">
                        <i class="fas fa-link text-orange-400 mr-3"></i>
                        Your Personal MCP URL
                    </h2>
                    <div class="bg-green-500 text-green-100 px-3 py-1 rounded-full text-sm font-semibold">
                        <i class="fas fa-check-circle mr-1"></i>Active
                    </div>
                </div>

                <p class="text-gray-300 mb-4">
                    This URL connects <strong>any MCP-compatible AI agent</strong> to your Strava data. It's unique to you and private — never share it publicly.
                </p>

                <div class="bg-gray-800 rounded-lg p-4 mb-6">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <code class="text-orange-400 font-mono text-xs sm:text-sm break-all" id="mcp-url-text">{{mcp_url}}</code>
                        <button
                            onclick="window.copyToClipboard('{{mcp_url}}')"
                            class="w-full sm:w-auto sm:ml-4 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex-shrink-0 flex items-center justify-center"
                        >
                            <i class="fas fa-copy mr-2"></i>Copy URL
                        </button>
                    </div>
                </div>

                <!-- Agent tabs -->
                <div class="mb-3">
                    <p class="text-sm text-gray-400 mb-3 font-semibold uppercase tracking-wide">Setup instructions by agent</p>
                    <div class="flex flex-wrap gap-2 mb-4" id="agent-tabs">
                        <button onclick="showAgent('claude')" id="tab-claude"
                            class="agent-tab active-tab px-3 py-1 rounded-full text-xs font-semibold border border-orange-500 text-orange-400">
                            Claude Desktop
                        </button>
                        <button onclick="showAgent('cursor')" id="tab-cursor"
                            class="agent-tab px-3 py-1 rounded-full text-xs font-semibold border border-gray-600 text-gray-400 hover:border-orange-500 hover:text-orange-400">
                            Cursor
                        </button>
                        <button onclick="showAgent('windsurf')" id="tab-windsurf"
                            class="agent-tab px-3 py-1 rounded-full text-xs font-semibold border border-gray-600 text-gray-400 hover:border-orange-500 hover:text-orange-400">
                            Windsurf
                        </button>
                        <button onclick="showAgent('cline')" id="tab-cline"
                            class="agent-tab px-3 py-1 rounded-full text-xs font-semibold border border-gray-600 text-gray-400 hover:border-orange-500 hover:text-orange-400">
                            Cline
                        </button>
                        <button onclick="showAgent('continue')" id="tab-continue"
                            class="agent-tab px-3 py-1 rounded-full text-xs font-semibold border border-gray-600 text-gray-400 hover:border-orange-500 hover:text-orange-400">
                            Continue.dev
                        </button>
                        <button onclick="showAgent('poke')" id="tab-poke"
                            class="agent-tab px-3 py-1 rounded-full text-xs font-semibold border border-gray-600 text-gray-400 hover:border-orange-500 hover:text-orange-400">
                            Poke
                        </button>
                        <button onclick="showAgent('other')" id="tab-other"
                            class="agent-tab px-3 py-1 rounded-full text-xs font-semibold border border-gray-600 text-gray-400 hover:border-orange-500 hover:text-orange-400">
                            Other
                        </button>
                    </div>

                    <!-- Claude Desktop -->
                    <div id="agent-claude" class="agent-panel">
                        <p class="text-xs text-gray-400 mb-2">Add to <code class="text-orange-300">~/Library/Application Support/Claude/claude_desktop_config.json</code>:</p>
                        <div class="relative">
                            <pre class="bg-gray-900 rounded-lg p-4 text-xs text-green-300 overflow-x-auto"><code id="claude-config">{
  "mcpServers": {
    "sportsmcp": {
      "url": "{{mcp_url}}"
    }
  }
}</code></pre>
                            <button onclick="copyConfig('claude-config')"
                                class="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs text-gray-300">
                                <i class="fas fa-copy mr-1"></i>Copy
                            </button>
                        </div>
                        <p class="text-xs text-gray-500 mt-2">Restart Claude Desktop after saving.</p>
                    </div>

                    <!-- Cursor -->
                    <div id="agent-cursor" class="agent-panel hidden">
                        <p class="text-xs text-gray-400 mb-2">Go to <strong>Settings → Cursor Settings → MCP</strong> and add:</p>
                        <div class="relative">
                            <pre class="bg-gray-900 rounded-lg p-4 text-xs text-green-300 overflow-x-auto"><code id="cursor-config">{
  "mcpServers": {
    "sportsmcp": {
      "url": "{{mcp_url}}"
    }
  }
}</code></pre>
                            <button onclick="copyConfig('cursor-config')"
                                class="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs text-gray-300">
                                <i class="fas fa-copy mr-1"></i>Copy
                            </button>
                        </div>
                        <p class="text-xs text-gray-500 mt-2">Cursor auto-reloads MCP servers on save.</p>
                    </div>

                    <!-- Windsurf -->
                    <div id="agent-windsurf" class="agent-panel hidden">
                        <p class="text-xs text-gray-400 mb-2">Go to <strong>Settings → Cascade → MCP Servers</strong> and add:</p>
                        <div class="relative">
                            <pre class="bg-gray-900 rounded-lg p-4 text-xs text-green-300 overflow-x-auto"><code id="windsurf-config">{
  "mcpServers": {
    "sportsmcp": {
      "url": "{{mcp_url}}"
    }
  }
}</code></pre>
                            <button onclick="copyConfig('windsurf-config')"
                                class="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs text-gray-300">
                                <i class="fas fa-copy mr-1"></i>Copy
                            </button>
                        </div>
                    </div>

                    <!-- Cline -->
                    <div id="agent-cline" class="agent-panel hidden">
                        <p class="text-xs text-gray-400 mb-2">In VS Code, open <strong>Cline → MCP Servers → Edit Config</strong> and add:</p>
                        <div class="relative">
                            <pre class="bg-gray-900 rounded-lg p-4 text-xs text-green-300 overflow-x-auto"><code id="cline-config">{
  "mcpServers": {
    "sportsmcp": {
      "url": "{{mcp_url}}"
    }
  }
}</code></pre>
                            <button onclick="copyConfig('cline-config')"
                                class="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs text-gray-300">
                                <i class="fas fa-copy mr-1"></i>Copy
                            </button>
                        </div>
                    </div>

                    <!-- Continue.dev -->
                    <div id="agent-continue" class="agent-panel hidden">
                        <p class="text-xs text-gray-400 mb-2">Add to your <code class="text-orange-300">~/.continue/config.json</code>:</p>
                        <div class="relative">
                            <pre class="bg-gray-900 rounded-lg p-4 text-xs text-green-300 overflow-x-auto"><code id="continue-config">{
  "mcpServers": [
    {
      "name": "sportsmcp",
      "transport": {
        "type": "streamable-http",
        "url": "{{mcp_url}}"
      }
    }
  ]
}</code></pre>
                            <button onclick="copyConfig('continue-config')"
                                class="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs text-gray-300">
                                <i class="fas fa-copy mr-1"></i>Copy
                            </button>
                        </div>
                    </div>

                    <!-- Poke -->
                    <div id="agent-poke" class="agent-panel hidden">
                        <p class="text-xs text-gray-400 mb-2">Go to <strong>Settings → Integrations → Add MCP Server</strong> in Poke and paste:</p>
                        <div class="bg-gray-900 rounded-lg p-4">
                            <code class="text-orange-400 text-sm break-all">{{mcp_url}}</code>
                        </div>
                        <p class="text-xs text-gray-500 mt-2">Poke also supports real-time workout notifications — see the Poke Notifications section below.</p>
                    </div>

                    <!-- Other -->
                    <div id="agent-other" class="agent-panel hidden">
                        <p class="text-xs text-gray-400 mb-2">Any MCP-compatible agent that supports <strong>Streamable HTTP</strong> or <strong>HTTP+SSE</strong> transport works:</p>
                        <div class="bg-gray-900 rounded-lg p-4 text-xs space-y-1 text-gray-300">
                            <p><span class="text-orange-400 font-semibold">Streamable HTTP:</span> <code class="text-green-300">POST {{mcp_url}}</code></p>
                            <p><span class="text-orange-400 font-semibold">SSE transport:</span> <code class="text-green-300">GET {{mcp_sse_url}}</code></p>
                        </div>
                        <p class="text-xs text-gray-500 mt-2">Check your agent's MCP docs for which transport type it uses. Both are supported.</p>
                    </div>
                </div>
            </div>
        </div>

        <!-- Enhanced Stats Section -->
        <div class="card rounded-2xl p-5 sm:p-6 mb-6">
            <div class="flex items-center justify-between mb-5">
                <h2 class="text-xl sm:text-2xl font-bold flex items-center">
                    <i class="fas fa-chart-bar text-orange-400 mr-3"></i>
                    Activity Overview
                </h2>
                <div class="text-xs sm:text-sm text-gray-400 bg-gray-800 px-2 sm:px-3 py-1 rounded-full">
                    <i class="fas fa-calendar mr-1"></i>{{stats_date_range}}
                </div>
            </div>
            
            <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
                <div class="text-center">
                    <div class="text-3xl text-orange-400 mb-2">
                        <i class="fas fa-running"></i>
                    </div>
                    <h3 class="text-2xl font-bold">{{stats.recent_run_totals.count}}</h3>
                    <p class="text-gray-400">Runs</p>
                    <p class="text-xs text-gray-500">{{stats.recent_run_totals.distance}} km total</p>
                </div>

                <div class="text-center">
                    <div class="text-3xl text-orange-400 mb-2">
                        <i class="fas fa-biking"></i>
                    </div>
                    <h3 class="text-2xl font-bold">{{stats.recent_ride_totals.count}}</h3>
                    <p class="text-gray-400">Rides</p>
                    <p class="text-xs text-gray-500">{{stats.recent_ride_totals.distance}} km total</p>
                </div>

                <div class="text-center">
                    <div class="text-3xl text-orange-400 mb-2">
                        <i class="fas fa-clock"></i>
                    </div>
                    <h3 class="text-2xl font-bold">{{total_time}}</h3>
                    <p class="text-gray-400">Total Time</p>
                    <p class="text-xs text-gray-500">{{insights.weekly_average}}/week avg</p>
                </div>

                <div class="text-center">
                    <div class="text-3xl text-orange-400 mb-2">
                        <i class="fas fa-mountain"></i>
                    </div>
                    <h3 class="text-2xl font-bold">{{total_elevation}}m</h3>
                    <p class="text-gray-400">Elevation</p>
                    <p class="text-xs text-gray-500">Total climbed</p>
                </div>
            </div>
            
            <!-- Additional Insights -->
            <div class="border-t border-gray-700 pt-4">
                <div class="grid grid-cols-3 gap-3 text-sm">
                    <div class="bg-gray-800/30 rounded-lg p-3 text-center">
                        <div class="text-orange-400 font-semibold">{{total_activities}}</div>
                        <div class="text-gray-400">Total Activities</div>
                    </div>
                    <div class="bg-gray-800/30 rounded-lg p-3 text-center">
                        <div class="text-orange-400 font-semibold">{{avg_distance}}km</div>
                        <div class="text-gray-400">Avg Distance</div>
                    </div>
                    <div class="bg-gray-800/30 rounded-lg p-3 text-center">
                        <div class="text-orange-400 font-semibold">{{insights.longest_activity}}km</div>
                        <div class="text-gray-400">Longest Activity</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Activities -->
        <div class="card rounded-2xl p-5 sm:p-6 mb-6">
            <h2 class="text-xl sm:text-2xl font-bold mb-5 flex items-center">
                <i class="fas fa-list text-orange-400 mr-3"></i>
                Recent Activities
            </h2>
            
            {{#if recent_activities}}
                <div class="space-y-4">
                    {{#each recent_activities}}
                    <div class="bg-gray-800/50 rounded-lg p-4">
                        <div class="flex items-center justify-between mb-2">
                            <div class="flex items-center space-x-3">
                                <div class="text-2xl">
                                    {{#if (eq sport_type "Run")}}🏃{{/if}}
                                    {{#if (eq sport_type "Ride")}}🚴{{/if}}
                                    {{#if (eq sport_type "Swim")}}🏊{{/if}}
                                    {{#if (not (or (eq sport_type "Run") (eq sport_type "Ride") (eq sport_type "Swim")))}}⚡{{/if}}
                                </div>
                                <div>
                                    <h3 class="font-semibold text-white">{{name}}</h3>
                                    <div class="text-xs text-gray-500">{{start_date_local}}</div>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-sm font-semibold text-orange-400">{{sport_type}}</div>
                                {{#if pace}}
                                    <div class="text-xs text-gray-400">{{pace}} pace</div>
                                {{/if}}
                                {{#if speed}}
                                    <div class="text-xs text-gray-400">{{speed}} avg</div>
                                {{/if}}
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-3 gap-2 sm:gap-4 text-sm">
                            <div class="text-center bg-gray-800/50 rounded p-2">
                                <div class="text-orange-400 font-semibold">{{distance}}km</div>
                                <div class="text-xs text-gray-500">Distance</div>
                            </div>
                            <div class="text-center bg-gray-800/50 rounded p-2">
                                <div class="text-orange-400 font-semibold">{{moving_time}}</div>
                                <div class="text-xs text-gray-500">Time</div>
                            </div>
                            <div class="text-center bg-gray-800/50 rounded p-2">
                                {{#if elevation_gain}}
                                    <div class="text-orange-400 font-semibold">{{elevation_gain}}m</div>
                                    <div class="text-xs text-gray-500">Elevation</div>
                                {{else}}
                                    <div class="text-orange-400 font-semibold">--</div>
                                    <div class="text-xs text-gray-500">Elevation</div>
                                {{/if}}
                            </div>
                        </div>
                        <div class="mt-3 text-right">
                            <a href="https://www.strava.com/activities/{{id}}" target="_blank" rel="noopener noreferrer"
                               class="inline-flex items-center text-xs font-bold text-orange-400 underline hover:text-orange-300 transition-colors">
                                <svg class="w-3 h-3 mr-1" viewBox="0 0 24 24" fill="currentColor"><path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/></svg>
                                View on Strava
                            </a>
                        </div>
                    </div>
                    {{/each}}
                </div>
            {{else}}
                <div class="text-center py-8 text-gray-400">
                    <i class="fas fa-running text-4xl mb-4"></i>
                    <p>No recent activities found</p>
                    <p class="text-sm">Go get moving! 🏃‍♂️</p>
                </div>
            {{/if}}
        </div>

        <!-- API Usage & Tools -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-2">
            <!-- Available Tools -->
            <div class="card rounded-2xl p-5 sm:p-6">
                <h2 class="text-lg sm:text-xl font-bold mb-4 flex items-center">
                    <i class="fas fa-tools text-orange-400 mr-3"></i>
                    Available MCP Tools
                </h2>
                <div class="space-y-2">
                    <div class="bg-gray-800/30 rounded-lg p-3">
                        <h3 class="font-semibold text-sm">get-recent-activities</h3>
                        <p class="text-xs text-gray-400">Fetch your recent Strava activities</p>
                    </div>
                    <div class="bg-gray-800/30 rounded-lg p-3">
                        <h3 class="font-semibold text-sm">get-athlete-profile</h3>
                        <p class="text-xs text-gray-400">Get your athlete profile information</p>
                    </div>
                    <div class="bg-gray-800/30 rounded-lg p-3">
                        <h3 class="font-semibold text-sm">get-activity-details</h3>
                        <p class="text-xs text-gray-400">Get detailed info about specific activities</p>
                    </div>
                    <div class="bg-gray-800/30 rounded-lg p-3">
                        <h3 class="font-semibold text-sm">get-activity-streams</h3>
                        <p class="text-xs text-gray-400">Access time-series data (GPS, heart rate, etc.)</p>
                    </div>
                    <div class="text-center mt-2">
                        <span class="text-xs text-gray-500">And 6 more tools...</span>
                    </div>
                </div>
            </div>

            <!-- Status & Usage -->
            <div class="card rounded-2xl p-5 sm:p-6">
                <h2 class="text-lg sm:text-xl font-bold mb-4 flex items-center">
                    <i class="fas fa-shield-alt text-orange-400 mr-3"></i>
                    Status &amp; Usage
                </h2>
                <div class="space-y-4">
                    <div>
                        <div class="flex justify-between items-center mb-1">
                            <span class="text-sm text-gray-400">Requests This Month</span>
                            <span class="text-sm font-semibold">0 / 1000</span>
                        </div>
                        <div class="w-full bg-gray-700 rounded-full h-2">
                            <div class="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full" style="width: 0%"></div>
                        </div>
                        <p class="text-xs text-gray-500 mt-1">Generous limits for personal use</p>
                    </div>
                    <div class="bg-gray-800/30 rounded-lg p-4 space-y-2 text-sm">
                        <div class="flex items-center gap-2 mb-2">
                            <i class="fas fa-circle text-green-400 text-xs"></i>
                            <span class="font-semibold">All Systems Operational</span>
                        </div>
                        <div class="flex justify-between text-gray-400">
                            <span>OAuth Token:</span>
                            <span class="text-green-400 font-medium">Valid</span>
                        </div>
                        <div class="flex justify-between text-gray-400">
                            <span>MCP Endpoint:</span>
                            <span class="text-green-400 font-medium">Active</span>
                        </div>
                        <div class="flex justify-between text-gray-400">
                            <span>Last Refresh:</span>
                            <span class="text-right text-xs">{{last_refresh}}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer attribution -->
    <footer class="bg-gray-950 py-4 mt-8 text-center">
        <p class="text-xs text-gray-600">
            Compatible with <a href="https://www.strava.com" target="_blank" rel="noopener noreferrer" class="text-orange-500 font-semibold hover:text-orange-400">Strava</a>.
            SportsMCP is not affiliated with, endorsed, or sponsored by Strava.
        </p>
    </footer>

    <!-- Copy Success Message -->
    <div id="copy-success" class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg hidden">
        <i class="fas fa-check mr-2"></i>MCP URL copied to clipboard!
    </div>

    <script>
        window.copyToClipboard = function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(function() {
                const successMsg = document.getElementById('copy-success');
                successMsg.classList.remove('hidden');
                successMsg.classList.add('copy-success');
                
                setTimeout(() => {
                    successMsg.classList.add('hidden');
                    successMsg.classList.remove('copy-success');
                }, 2000);
            }, function(err) {
                console.error('Could not copy text: ', err);
                // Fallback for older browsers
                const textArea = document.createElement("textarea");
                textArea.value = text;
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                try {
                    document.execCommand('copy');
                    const successMsg = document.getElementById('copy-success');
                    successMsg.classList.remove('hidden');
                    successMsg.classList.add('copy-success');
                    
                    setTimeout(() => {
                        successMsg.classList.add('hidden');
                        successMsg.classList.remove('copy-success');
                    }, 2000);
                } catch (err) {
                    console.error('Fallback: Could not copy text: ', err);
                }
                document.body.removeChild(textArea);
            });
        }

        // Agent tab switching
        window.showAgent = function showAgent(agent) {
            document.querySelectorAll('.agent-panel').forEach(el => el.classList.add('hidden'));
            document.querySelectorAll('.agent-tab').forEach(el => {
                el.classList.remove('active-tab', 'border-orange-500', 'text-orange-400');
                el.classList.add('border-gray-600', 'text-gray-400');
            });
            document.getElementById('agent-' + agent).classList.remove('hidden');
            const tab = document.getElementById('tab-' + agent);
            tab.classList.add('active-tab', 'border-orange-500', 'text-orange-400');
            tab.classList.remove('border-gray-600', 'text-gray-400');
        }

        // Copy config snippet
        window.copyConfig = function copyConfig(elementId) {
            const text = document.getElementById(elementId).textContent;
            navigator.clipboard.writeText(text).then(() => {
                const successMsg = document.getElementById('copy-success');
                successMsg.querySelector('span') && (successMsg.querySelector('span').textContent = 'Config copied!');
                successMsg.textContent = '✅ Config copied to clipboard!';
                successMsg.classList.remove('hidden');
                successMsg.classList.add('copy-success');
                setTimeout(() => {
                    successMsg.classList.add('hidden');
                    successMsg.classList.remove('copy-success');
                }, 2000);
            });
        }

        // Auto-refresh every 5 minutes to keep data fresh
        setTimeout(() => {
            window.location.reload();
        }, 5 * 60 * 1000);

        // Save per-user Poke API key
        window.savePokeKey = async function savePokeKey(event) {
            event.preventDefault();
            const key = document.getElementById('poke-key-input').value.trim();
            const status = document.getElementById('poke-status');
            if (!key) {
                status.textContent = 'Please enter a Poke API key.';
                status.className = 'text-xs mt-2 text-red-400';
                status.classList.remove('hidden');
                return;
            }
            try {
                // Extract token from current URL
                const params = new URLSearchParams(window.location.search);
                const token = params.get('token') || '';
                const res = await fetch('/settings/poke-key', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token, poke_api_key: key })
                });
                if (res.ok) {
                    status.textContent = "✅ Poke API key saved! You'll now get personal notifications.";
                    status.className = 'text-xs mt-2 text-green-400';
                    document.getElementById('poke-key-input').value = '';
                } else {
                    const err = await res.json();
                    status.textContent = '❌ Error: ' + (err.error || 'Failed to save key.');
                    status.className = 'text-xs mt-2 text-red-400';
                }
            } catch (e) {
                status.textContent = '❌ Network error. Please try again.';
                status.className = 'text-xs mt-2 text-red-400';
            }
            status.classList.remove('hidden');
        }
    </script>
</body>
</html>`;
