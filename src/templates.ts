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
    <title>Strava MCP Server - Connect Your AI to Strava</title>
    <meta name="description" content="Get your personal MCP server URL to unlock powerful Strava integration with AI assistants like Poke.com, Claude Desktop, and more.">
    <link rel="icon" type="image/png" href="https://res.cloudinary.com/dxoyxnrjl/image/upload/v1758961029/Strava_MCP_Logo_4_u0pe64.png">
    
    <!-- Social Media Meta Tags -->
    <meta property="og:title" content="Strava MCP Server - Connect Your AI to Strava">
    <meta property="og:description" content="Get your personal MCP server URL to unlock powerful Strava integration with AI assistants.">
    <meta property="og:image" content="https://res.cloudinary.com/dxoyxnrjl/image/upload/v1758961568/SportMCP_opengraph.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:url" content="{{base_url}}">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Strava MCP Server - Connect Your AI to Strava">
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
                <img src="https://res.cloudinary.com/dxoyxnrjl/image/upload/v1758961029/Strava_MCP_Logo_4_u0pe64.png" alt="Strava MCP Logo" class="w-10 h-10 rounded-lg">
                <span class="text-xl font-bold">Strava MCP Server</span>
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
                    <img src="https://res.cloudinary.com/dxoyxnrjl/image/upload/v1758961029/Strava_MCP_Logo_4_u0pe64.png" alt="Strava MCP Logo" class="w-32 h-32 rounded-2xl shadow-2xl">
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
                    <a href="/auth" class="group relative overflow-hidden bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-xl">
                        <span class="relative z-10 flex items-center">
                            <i class="fab fa-strava mr-3"></i>
                            Connect with Strava
                        </span>
                        <div class="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity"></div>
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
                <img src="https://res.cloudinary.com/dxoyxnrjl/image/upload/v1758961029/Strava_MCP_Logo_4_u0pe64.png" alt="Strava MCP Logo" class="w-8 h-8 rounded-lg">
                <span class="font-bold">Strava MCP Server</span>
            </div>
            
            <p class="text-sm">
                Powered by Cloudflare Workers • Built for the Model Context Protocol
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
    <title>Dashboard - Strava MCP Server</title>
    <meta name="description" content="Your personal Strava MCP dashboard with activity stats, insights, and your unique MCP URL for AI assistants.">
    <link rel="icon" type="image/png" href="https://res.cloudinary.com/dxoyxnrjl/image/upload/v1758961029/Strava_MCP_Logo_4_u0pe64.png">
    
    <!-- Social Media Meta Tags -->
    <meta property="og:title" content="Strava MCP Dashboard - Your Personal Activity Hub">
    <meta property="og:description" content="View your Strava stats, get your personal MCP URL, and connect AI assistants to your fitness data.">
    <meta property="og:image" content="https://res.cloudinary.com/dxoyxnrjl/image/upload/v1758961568/SportMCP_opengraph.png">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="Strava MCP Dashboard">
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
    </style>
</head>
<body class="bg-gray-900 text-white min-h-screen">
    <!-- Navigation -->
    <nav class="bg-gray-800 border-b border-gray-700">
        <div class="max-w-7xl mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <img src="https://res.cloudinary.com/dxoyxnrjl/image/upload/v1758961029/Strava_MCP_Logo_4_u0pe64.png" alt="Strava MCP Logo" class="w-10 h-10 rounded-lg">
                    <span class="text-xl font-bold">Strava MCP Server</span>
                </div>
                <div class="flex items-center space-x-6">
                    <a href="/about" class="text-gray-300 hover:text-white transition-colors">About</a>
                    <a href="/support" class="text-gray-300 hover:text-white transition-colors">Support</a>
                    <span class="text-gray-300">Welcome back!</span>
                    <form action="/logout" method="post" class="inline">
                        <button type="submit" class="text-gray-400 hover:text-white transition-colors">
                            <i class="fas fa-sign-out-alt mr-2"></i>Logout
                        </button>
                    </form>
                </div>
            </div>
        </div>
    </nav>

    <div class="max-w-7xl mx-auto px-6 py-8">
        <!-- Welcome Section -->
        <div class="mb-8">
            <h1 class="text-4xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Your Strava MCP Dashboard
            </h1>
            <p class="text-xl text-gray-400 mb-6">
                Everything you need to connect AI assistants to your Strava data
            </p>
            
            <!-- Quick Insights Banner -->
            <div class="bg-gradient-to-r from-orange-500/20 to-orange-600/20 rounded-xl p-4 border border-orange-500/30">
                <div class="flex items-center justify-between">
                    <div class="flex items-center space-x-6">
                        <div class="text-center">
                            <div class="text-2xl font-bold text-orange-400">{{total_activities}}</div>
                            <div class="text-sm text-gray-300">Activities</div>
                            <div class="text-xs text-gray-500">Last 4 weeks</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-orange-400">{{insights.most_active_sport}}</div>
                            <div class="text-sm text-gray-300">Most Active</div>
                            <div class="text-xs text-gray-500">Primary sport</div>
                        </div>
                        <div class="text-center">
                            <div class="text-2xl font-bold text-orange-400">{{insights.weekly_average}}</div>
                            <div class="text-sm text-gray-300">Per Week</div>
                            <div class="text-xs text-gray-500">Average pace</div>
                        </div>
                    </div>
                    <div class="hidden md:flex items-center text-orange-400">
                        <i class="fas fa-chart-line text-3xl"></i>
                    </div>
                </div>
            </div>
        </div>

        <!-- Profile & MCP URL Section -->
        <div class="grid lg:grid-cols-3 gap-8 mb-8">
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

                <p class="text-gray-300 mb-6">
                    Use this URL in your AI assistant to access your Strava data. This URL is unique to you and stays active as long as your account is connected.
                </p>

                <div class="bg-gray-800 rounded-lg p-4 mb-6">
                    <div class="flex items-center justify-between">
                        <code class="text-orange-400 font-mono text-sm break-all">
                            {{mcp_url}}
                        </code>
                        <button 
                            onclick="copyToClipboard('{{mcp_url}}')" 
                            class="ml-4 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex-shrink-0"
                        >
                            <i class="fas fa-copy mr-2"></i>Copy
                        </button>
                    </div>
                </div>

                <!-- Quick Setup Instructions -->
                <div class="grid md:grid-cols-2 gap-6">
                    <div class="bg-gray-800/50 rounded-lg p-4">
                        <h3 class="font-bold mb-2 text-orange-400">
                            <i class="fas fa-search mr-2"></i>For Poke.com
                        </h3>
                        <ol class="text-sm text-gray-300 space-y-1">
                            <li>1. Add new MCP server</li>
                            <li>2. Paste your URL above</li>
                            <li>3. Save and start chatting!</li>
                        </ol>
                    </div>
                    
                    <div class="bg-gray-800/50 rounded-lg p-4">
                        <h3 class="font-bold mb-2 text-orange-400">
                            <i class="fas fa-desktop mr-2"></i>For Claude Desktop
                        </h3>
                        <ol class="text-sm text-gray-300 space-y-1">
                            <li>1. Open config file</li>
                            <li>2. Add server entry</li>
                            <li>3. Use URL as endpoint</li>
                        </ol>
                    </div>
                </div>
            </div>
        </div>

        <!-- Enhanced Stats Section -->
        <div class="card rounded-2xl p-6 mb-8">
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-bold flex items-center">
                    <i class="fas fa-chart-bar text-orange-400 mr-3"></i>
                    Activity Overview
                </h2>
                <div class="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                    <i class="fas fa-calendar mr-1"></i>{{stats_date_range}}
                </div>
            </div>
            
            <div class="grid lg:grid-cols-4 gap-6 mb-6">
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
                <div class="grid md:grid-cols-3 gap-4 text-sm">
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
        <div class="card rounded-2xl p-6 mb-8">
            <h2 class="text-2xl font-bold mb-6 flex items-center">
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
                        
                        <div class="grid grid-cols-3 gap-4 text-sm">
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
        <div class="grid lg:grid-cols-2 gap-8">
            <!-- Available Tools -->
            <div class="card rounded-2xl p-6">
                <h2 class="text-2xl font-bold mb-6 flex items-center">
                    <i class="fas fa-tools text-orange-400 mr-3"></i>
                    Available MCP Tools
                </h2>
                
                <div class="space-y-3">
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
                    <div class="text-center mt-4">
                        <span class="text-sm text-gray-400">And 6 more tools...</span>
                    </div>
                </div>
            </div>

            <!-- Usage Stats -->
            <div class="card rounded-2xl p-6">
                <h2 class="text-2xl font-bold mb-6 flex items-center">
                    <i class="fas fa-chart-bar text-orange-400 mr-3"></i>
                    API Usage
                </h2>
                
                <div class="space-y-6">
                    <div>
                        <div class="flex justify-between items-center mb-2">
                            <span class="text-sm text-gray-400">Requests This Month</span>
                            <span class="font-semibold">0 / 1000</span>
                        </div>
                        <div class="w-full bg-gray-700 rounded-full h-2">
                            <div class="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full" style="width: 0%"></div>
                        </div>
                        <p class="text-xs text-gray-500 mt-1">Generous limits for personal use</p>
                    </div>
                    
                    <div class="bg-gray-800/30 rounded-lg p-4">
                        <h3 class="font-semibold mb-2 flex items-center">
                            <i class="fas fa-shield-alt text-green-400 mr-2"></i>
                            Status: All Systems Operational
                        </h3>
                        <div class="space-y-2 text-sm text-gray-400">
                            <div class="flex justify-between">
                                <span>OAuth Token:</span>
                                <span class="text-green-400">Valid</span>
                            </div>
                            <div class="flex justify-between">
                                <span>MCP Endpoint:</span>
                                <span class="text-green-400">Active</span>
                            </div>
                            <div class="flex justify-between">
                                <span>Last Refresh:</span>
                                <span>{{last_refresh}}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Copy Success Message -->
    <div id="copy-success" class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg hidden">
        <i class="fas fa-check mr-2"></i>MCP URL copied to clipboard!
    </div>

    <script>
        function copyToClipboard(text) {
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

        // Auto-refresh every 5 minutes to keep data fresh
        setTimeout(() => {
            window.location.reload();
        }, 5 * 60 * 1000);
    </script>
</body>
</html>`;
