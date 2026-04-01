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


    <!-- MCP Tools Showcase Section -->
    <section class="py-24 bg-gray-900" id="tools-section">
        <div class="max-w-7xl mx-auto px-6">
            <div class="text-center mb-14">
                <span class="inline-block bg-orange-500/10 text-orange-400 text-sm font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full border border-orange-500/20 mb-4">21 Available Tools</span>
                <h2 class="text-4xl font-bold mb-5">Full Strava API Coverage</h2>
                <p class="text-xl text-gray-400 max-w-2xl mx-auto">Every piece of your Strava data, accessible to any AI assistant through a single endpoint.</p>
            </div>

            <!-- Category Cards -->
            <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-12">
                <button onclick="openToolsModal('activities')" class="group bg-gray-800 hover:bg-gray-750 border border-gray-700/50 hover:border-orange-500/40 rounded-2xl p-5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/10 cursor-pointer w-full">
                    <div class="text-3xl mb-3">🏃</div>
                    <div class="font-semibold text-sm text-white mb-1">Activities</div>
                    <div class="text-orange-400 text-xs font-medium">5 tools</div>
                </button>
                <button onclick="openToolsModal('segments')" class="group bg-gray-800 hover:bg-gray-750 border border-gray-700/50 hover:border-orange-500/40 rounded-2xl p-5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/10 cursor-pointer w-full">
                    <div class="text-3xl mb-3">📍</div>
                    <div class="font-semibold text-sm text-white mb-1">Segments</div>
                    <div class="text-orange-400 text-xs font-medium">5 tools</div>
                </button>
                <button onclick="openToolsModal('profile')" class="group bg-gray-800 hover:bg-gray-750 border border-gray-700/50 hover:border-orange-500/40 rounded-2xl p-5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/10 cursor-pointer w-full">
                    <div class="text-3xl mb-3">👤</div>
                    <div class="font-semibold text-sm text-white mb-1">Profile & Gear</div>
                    <div class="text-orange-400 text-xs font-medium">3 tools</div>
                </button>
                <button onclick="openToolsModal('social')" class="group bg-gray-800 hover:bg-gray-750 border border-gray-700/50 hover:border-orange-500/40 rounded-2xl p-5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/10 cursor-pointer w-full">
                    <div class="text-3xl mb-3">👥</div>
                    <div class="font-semibold text-sm text-white mb-1">Social & Clubs</div>
                    <div class="text-orange-400 text-xs font-medium">4 tools</div>
                </button>
                <button onclick="openToolsModal('routes')" class="group bg-gray-800 hover:bg-gray-750 border border-gray-700/50 hover:border-orange-500/40 rounded-2xl p-5 text-center transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-orange-500/10 cursor-pointer w-full col-span-2 md:col-span-1">
                    <div class="text-3xl mb-3">🗺️</div>
                    <div class="font-semibold text-sm text-white mb-1">Routes</div>
                    <div class="text-orange-400 text-xs font-medium">2 tools</div>
                </button>
            </div>

            <!-- Example prompts teaser -->
            <div class="bg-gray-800/50 border border-gray-700/40 rounded-2xl p-6 mb-12">
                <p class="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-4">Ask your AI assistant things like:</p>
                <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    <div class="flex items-start gap-2 text-sm text-gray-300"><span class="text-orange-400 mt-0.5">›</span>"Break down the laps on my last interval run"</div>
                    <div class="flex items-start gap-2 text-sm text-gray-300"><span class="text-orange-400 mt-0.5">›</span>"What are my heart rate training zones?"</div>
                    <div class="flex items-start gap-2 text-sm text-gray-300"><span class="text-orange-400 mt-0.5">›</span>"How many miles are on my running shoes?"</div>
                    <div class="flex items-start gap-2 text-sm text-gray-300"><span class="text-orange-400 mt-0.5">›</span>"Show me my personal bests on segment 12345"</div>
                    <div class="flex items-start gap-2 text-sm text-gray-300"><span class="text-orange-400 mt-0.5">›</span>"Find popular climbs near Boulder, CO"</div>
                    <div class="flex items-start gap-2 text-sm text-gray-300"><span class="text-orange-400 mt-0.5">›</span>"What are my year-to-date cycling stats?"</div>
                </div>
            </div>

            <div class="text-center">
                <button onclick="openToolsModal()" class="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3.5 px-10 rounded-xl transition-colors shadow-lg shadow-orange-500/20">
                    <i class="fas fa-tools"></i>
                    Explore All 21 Tools
                    <i class="fas fa-chevron-right text-xs"></i>
                </button>
            </div>
        </div>
    </section>

    <!-- ── TOOLS MODAL ─────────────────────────────────────────────────────── -->
    <div id="tools-modal" class="fixed inset-0 z-50 hidden" aria-modal="true" role="dialog">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" onclick="closeToolsModal()"></div>
        <!-- Panel -->
        <div class="relative z-10 flex items-center justify-center min-h-screen p-4">
            <div class="bg-gray-900 border border-gray-700/60 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <!-- Header -->
                <div class="flex items-center justify-between px-6 py-5 border-b border-gray-700/50 flex-shrink-0">
                    <div>
                        <h2 class="text-xl font-bold text-white flex items-center gap-2">
                            <i class="fas fa-tools text-orange-400"></i>
                            SportsMCP Tools
                        </h2>
                        <p class="text-xs text-gray-500 mt-0.5">21 tools powered by the official Strava API</p>
                    </div>
                    <!-- Category filter tabs -->
                    <div class="hidden md:flex items-center gap-1 bg-gray-800 rounded-xl p-1">
                        <button onclick="filterTools('all')" id="tab-all" class="modal-tab active px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">All</button>
                        <button onclick="filterTools('activities')" id="tab-activities" class="modal-tab px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">🏃 Activities</button>
                        <button onclick="filterTools('segments')" id="tab-segments" class="modal-tab px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">📍 Segments</button>
                        <button onclick="filterTools('profile')" id="tab-profile" class="modal-tab px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">👤 Profile</button>
                        <button onclick="filterTools('social')" id="tab-social" class="modal-tab px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">👥 Social</button>
                        <button onclick="filterTools('routes')" id="tab-routes" class="modal-tab px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">🗺️ Routes</button>
                    </div>
                    <button onclick="closeToolsModal()" class="ml-4 text-gray-400 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-gray-700">
                        <i class="fas fa-times text-lg"></i>
                    </button>
                </div>
                <!-- Mobile tabs -->
                <div class="md:hidden flex gap-1 px-4 pt-3 overflow-x-auto flex-shrink-0">
                    <button onclick="filterTools('all')" id="tab-all-m" class="modal-tab-m active whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0">All 21</button>
                    <button onclick="filterTools('activities')" id="tab-activities-m" class="modal-tab-m whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0">🏃 Activities</button>
                    <button onclick="filterTools('segments')" id="tab-segments-m" class="modal-tab-m whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0">📍 Segments</button>
                    <button onclick="filterTools('profile')" id="tab-profile-m" class="modal-tab-m whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0">👤 Profile</button>
                    <button onclick="filterTools('social')" id="tab-social-m" class="modal-tab-m whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0">👥 Social</button>
                    <button onclick="filterTools('routes')" id="tab-routes-m" class="modal-tab-m whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex-shrink-0">🗺️ Routes</button>
                </div>
                <!-- Tool list -->
                <div class="overflow-y-auto flex-1 px-6 py-4" id="modal-tools-list">
                    <!-- Populated by JS -->
                </div>
                <!-- Footer -->
                <div class="border-t border-gray-700/50 px-6 py-4 flex-shrink-0 flex items-center justify-between">
                    <p class="text-xs text-gray-500">All tools use your personal OAuth token — your data is never shared.</p>
                    <a href="/auth" class="bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors">Connect Strava →</a>
                </div>
            </div>
        </div>
    </div>

    <style>
        .modal-tab { color: #9ca3af; }
        .modal-tab.active, .modal-tab:hover { background: #374151; color: #fff; }
        .modal-tab.active { color: #fb923c; }
        .modal-tab-m { color: #9ca3af; background: #1f2937; }
        .modal-tab-m.active, .modal-tab-m:hover { background: #374151; color: #fb923c; }
        .tool-row { display: flex; }
        .tool-row.hidden { display: none; }
    </style>

    <script>
    const TOOLS_DATA = [
      { name: 'get-recent-activities', cat: 'activities', emoji: '📋', title: 'Recent Activities', desc: 'Fetch your latest workouts with distance, time, pace, and sport type.', example: '"Show me my last 10 runs"' },
      { name: 'get-activity-details', cat: 'activities', emoji: '🔍', title: 'Activity Details', desc: 'Full breakdown of any activity — HR, power, elevation, pace, cadence, and more.', example: '"Deep-dive on my last ride"' },
      { name: 'get-activity-streams', cat: 'activities', emoji: '📈', title: 'Activity Streams', desc: 'Time-series data: GPS coordinates, heart rate, power, cadence, altitude, and velocity.', example: '"Show power data from my last workout"' },
      { name: 'get-activity-laps', cat: 'activities', emoji: '⏱️', title: 'Activity Laps', desc: 'Lap splits for interval sessions and structured workouts — essential for training analysis.', example: '"Break down the laps on my interval run"' },
      { name: 'get-athlete-stats', cat: 'activities', emoji: '📊', title: 'Athlete Stats', desc: 'All-time, year-to-date, and recent totals for running, cycling, and swimming.', example: '"What are my YTD cycling stats?"' },
      { name: 'explore-segments', cat: 'segments', emoji: '🔭', title: 'Explore Segments', desc: 'Discover popular Strava segments in any geographic area, filtered by activity type.', example: '"Find climbs near Boulder, CO"' },
      { name: 'get-starred-segments', cat: 'segments', emoji: '⭐', title: 'Starred Segments', desc: 'List all the segments you have starred on Strava.', example: '"Show my starred segments"' },
      { name: 'get-segment', cat: 'segments', emoji: '📌', title: 'Segment Details', desc: 'Full details about a specific segment: distance, elevation, grade, and KOM/QOM time.', example: '"Tell me about segment 12345"' },
      { name: 'get-segment-efforts', cat: 'segments', emoji: '🏆', title: 'Segment Efforts', desc: 'Your complete effort history on a segment — see your PRs and improvement over time.', example: '"Show my history on that climb"' },
      { name: 'get-segment-effort', cat: 'segments', emoji: '🎯', title: 'Segment Effort Detail', desc: 'Details on a specific effort: elapsed time, avg HR, power output, and whether it set a PR.', example: '"How did I do on that effort?"' },
      { name: 'get-athlete-profile', cat: 'profile', emoji: '🏅', title: 'Athlete Profile', desc: 'Your Strava profile info including name, location, follower counts, and gear list.', example: '"Show me my Strava profile"' },
      { name: 'get-athlete-zones', cat: 'profile', emoji: '❤️', title: 'Training Zones', desc: 'Your heart rate and power training zones for targeted workout intensity.', example: '"What are my HR zones?"' },
      { name: 'get-gear', cat: 'profile', emoji: '👟', title: 'Gear & Equipment', desc: 'Details on any piece of gear (bike or shoes) including total mileage and brand info.', example: '"How many miles on my shoes?"' },
      { name: 'get-activity-kudos', cat: 'social', emoji: '👍', title: 'Activity Kudos', desc: 'List the athletes who have given kudos on a specific activity.', example: '"Who kudoed my last run?"' },
      { name: 'get-activity-comments', cat: 'social', emoji: '💬', title: 'Activity Comments', desc: 'Read comments left on a specific activity.', example: '"Show comments on my last race"' },
      { name: 'get-athlete-clubs', cat: 'social', emoji: '🏟️', title: 'Your Clubs', desc: 'List all the Strava clubs you are a member of.', example: '"What clubs am I in?"' },
      { name: 'get-club', cat: 'social', emoji: '🤝', title: 'Club Details', desc: 'Info about a specific club: member count, sport type, city, and description.', example: '"Tell me about club 67890"' },
      { name: 'get-athlete-routes', cat: 'routes', emoji: '🛤️', title: 'Your Routes', desc: 'List all routes you have created on Strava with distance and elevation.', example: '"Show my saved routes"' },
      { name: 'get-route', cat: 'routes', emoji: '🗺️', title: 'Route Details', desc: 'Full details for a specific route including distance, elevation gain, and estimated time.', example: '"Tell me about route 99999"' },
    ];

    let activeCategory = 'all';

    function renderTools(cat) {
      const list = document.getElementById('modal-tools-list');
      if (!list) return;
      const filtered = cat === 'all' ? TOOLS_DATA : TOOLS_DATA.filter(t => t.cat === cat);
      let html = '<div class="grid gap-2">';
      const catLabels = { activities: '🏃 Activities', segments: '📍 Segments', profile: '👤 Profile & Gear', social: '👥 Social & Clubs', routes: '🗺️ Routes' };
      let lastCat = null;
      for (const t of filtered) {
        if (cat === 'all' && t.cat !== lastCat) {
          if (lastCat) html += '</div></div>';
          html += '<div class="mt-4 first:mt-0"><p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">' + catLabels[t.cat] + '</p><div class="grid gap-2">';
          lastCat = t.cat;
        }
        html += '<div class="flex items-start gap-3 p-3 rounded-xl bg-gray-800/60 hover:bg-gray-800 transition-colors border border-gray-700/30 hover:border-orange-500/20">';
        html += '<span class="text-xl flex-shrink-0 mt-0.5">' + t.emoji + '</span>';
        html += '<div class="flex-1 min-w-0">';
        html += '<div class="flex items-center gap-2 flex-wrap">';
        html += '<code class="text-orange-300 text-xs font-mono bg-gray-900/60 px-2 py-0.5 rounded">' + t.name + '</code>';
        html += '<span class="font-medium text-sm text-white">' + t.title + '</span>';
        html += '</div>';
        html += '<p class="text-xs text-gray-400 mt-1">' + t.desc + '</p>';
        html += '<p class="text-xs text-gray-600 mt-1 italic">' + t.example + '</p>';
        html += '</div></div>';
      }
      if (cat === 'all' && lastCat) html += '</div></div>';
      html += '</div>';
      list.innerHTML = html;
    }

    function filterTools(cat) {
      activeCategory = cat;
      // Update desktop tabs
      document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
      const dt = document.getElementById('tab-' + cat);
      if (dt) dt.classList.add('active');
      // Update mobile tabs
      document.querySelectorAll('.modal-tab-m').forEach(t => t.classList.remove('active'));
      const mt = document.getElementById('tab-' + cat + '-m');
      if (mt) mt.classList.add('active');
      renderTools(cat);
    }

    window.openToolsModal = function(cat) {
      const modal = document.getElementById('tools-modal');
      if (!modal) return;
      modal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      filterTools(cat || 'all');
    };

    window.closeToolsModal = function() {
      const modal = document.getElementById('tools-modal');
      if (!modal) return;
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    };

    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape') window.closeToolsModal();
    });
    </script>

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
            
            <div class="flex justify-center mb-4">
                <a href="https://www.strava.com" target="_blank" rel="noopener noreferrer">
                    <img src="https://www.strava.com/assets/api/badge-strava-light.svg" alt="Powered by Strava" class="h-8 opacity-70 hover:opacity-100 transition-opacity">
                </a>
            </div>
            <p class="text-sm">
                Powered by Cloudflare Workers • Built for the Model Context Protocol
            </p>
            <p class="text-xs mt-3 text-gray-600">
                SportsMCP is not affiliated with, endorsed, or sponsored by Strava.<br>
                Data accessed via the official <a href="https://developers.strava.com" target="_blank" rel="noopener noreferrer" class="text-orange-500 font-semibold hover:text-orange-400">Strava API</a>.
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

        <!-- Notification bar (both states pre-rendered, toggled by JS) -->
        <div class="card rounded-2xl p-4 mb-6" id="poke-top-bar">
            <!-- Active state: visible when a provider is configured -->
            <div id="poke-top-saved" class="flex flex-wrap items-center gap-3 {{poke_saved_class}}">
                <div class="flex items-center gap-2 flex-shrink-0">
                    <i class="fas fa-bell text-orange-400"></i>
                    <span class="font-semibold text-sm"><span id="poke-top-provider-name">{{notification_provider_name}}</span> Notifications</span>
                    <span class="flex items-center gap-1 text-xs font-semibold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                        <span class="w-1.5 h-1.5 bg-green-400 rounded-full"></span>Active
                    </span>
                </div>
                <span id="poke-top-masked" class="text-xs text-gray-500 font-mono">{{poke_masked_key}}</span>
                <div class="flex items-center gap-2 ml-auto">
                    <button onclick="window.testPokeKeyTop()" id="poke-top-test-btn"
                            class="text-xs font-semibold text-orange-400 border border-orange-500/40 hover:bg-orange-500/10 px-3 py-1.5 rounded-lg transition-colors">
                        <i class="fas fa-paper-plane mr-1"></i>Send Test Ping
                    </button>
                    <button onclick="window.scrollToPokeCard()"
                            class="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                        Manage →
                    </button>
                </div>
            </div>
            <!-- Form state: visible when no provider configured -->
            <div id="poke-top-form-wrap" class="flex flex-col sm:flex-row sm:items-center gap-3 {{poke_form_class}}">
                <div class="flex items-center gap-2 flex-shrink-0">
                    <i class="fas fa-bell text-orange-400"></i>
                    <span class="font-semibold text-sm">AI Notifications</span>
                </div>
                <p class="text-xs text-gray-400 flex-shrink-0">Get pinged after each workout via your favorite AI.</p>
                <button onclick="window.scrollToPokeCard()"
                        class="flex-shrink-0 bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-1.5 rounded-lg text-sm transition-colors whitespace-nowrap">
                    Set Up →
                </button>
            </div>
            <div id="poke-top-status-bar" class="mt-2 hidden">
                <div id="poke-top-status" class="text-xs rounded-lg px-3 py-2"></div>
            </div>
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
                        <code class="text-orange-400 font-mono text-xs sm:text-sm break-all" id="mcp-url-text">{{mcp_base_url}}</code>
                        <button
                            onclick="window.copyToClipboard('{{mcp_base_url}}')"
                            class="w-full sm:w-auto sm:ml-4 bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex-shrink-0 flex items-center justify-center"
                        >
                            <i class="fas fa-copy mr-2"></i>Copy URL
                        </button>
                    </div>
                    <p class="text-xs text-gray-500 mt-2">Authentication is handled via Bearer token in the config snippets below — your token is never exposed in the URL.</p>
                </div>

                <!-- Connection type tabs -->
                <div class="mb-3">
                    <p class="text-sm text-gray-400 mb-3 font-semibold uppercase tracking-wide">Setup instructions</p>
                    <div class="flex flex-wrap gap-2 mb-4" id="agent-tabs">
                        <button onclick="showAgent('oauth')" id="tab-oauth"
                            class="agent-tab active-tab px-3 py-1 rounded-full text-xs font-semibold border border-orange-500 text-orange-400">
                            Streamable HTTP (OAuth)
                        </button>
                        <button onclick="showAgent('config')" id="tab-config"
                            class="agent-tab px-3 py-1 rounded-full text-xs font-semibold border border-gray-600 text-gray-400 hover:border-orange-500 hover:text-orange-400">
                            JSON Config
                        </button>
                        <button onclick="showAgent('sse')" id="tab-sse"
                            class="agent-tab px-3 py-1 rounded-full text-xs font-semibold border border-gray-600 text-gray-400 hover:border-orange-500 hover:text-orange-400">
                            SSE (Legacy)
                        </button>
                        <button onclick="showAgent('manual')" id="tab-manual"
                            class="agent-tab px-3 py-1 rounded-full text-xs font-semibold border border-gray-600 text-gray-400 hover:border-orange-500 hover:text-orange-400">
                            Manual
                        </button>
                    </div>

                    <!-- Streamable HTTP (OAuth) -->
                    <div id="agent-oauth" class="agent-panel">
                        <div class="bg-green-900/20 border border-green-700/40 rounded-lg p-3 mb-3">
                            <p class="text-xs text-green-300 font-semibold mb-1">Recommended — zero config, no tokens to copy</p>
                            <p class="text-xs text-gray-400">Just paste the URL below. Your app will open a browser to log in with Strava automatically.</p>
                        </div>
                        <p class="text-xs text-gray-400 mb-2">Add this URL as a Streamable HTTP MCP server:</p>
                        <div class="relative">
                            <pre class="bg-gray-900 rounded-lg p-4 text-xs text-green-300 overflow-x-auto"><code id="oauth-url">{{mcp_base_url}}</code></pre>
                            <button onclick="copyConfig('oauth-url')"
                                class="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs text-gray-300">
                                <i class="fas fa-copy mr-1"></i>Copy
                            </button>
                        </div>
                        <p class="text-xs text-gray-500 mt-3"><strong class="text-gray-400">Works with:</strong> Claude Desktop, Cursor, Windsurf, Poke, and any app that supports MCP OAuth</p>
                        <p class="text-xs text-gray-500 mt-1">The app handles authentication for you — no Bearer token or config file needed.</p>
                    </div>

                    <!-- JSON Config -->
                    <div id="agent-config" class="agent-panel hidden">
                        <div class="bg-gray-800/50 border border-gray-700/40 rounded-lg p-3 mb-3">
                            <p class="text-xs text-gray-300 font-semibold mb-1">For apps that use a JSON config file</p>
                            <p class="text-xs text-gray-400">Copy the config below into your app's MCP settings. The Bearer token authenticates your account.</p>
                        </div>
                        <p class="text-xs text-gray-400 mb-2 font-semibold">Standard config (most apps):</p>
                        <div class="relative mb-3">
                            <pre class="bg-gray-900 rounded-lg p-4 text-xs text-green-300 overflow-x-auto"><code id="json-config">{
  "mcpServers": {
    "sportsmcp": {
      "url": "{{mcp_base_url}}",
      "headers": {
        "Authorization": "Bearer {{mcp_bearer_token}}"
      }
    }
  }
}</code></pre>
                            <button onclick="copyConfig('json-config')"
                                class="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs text-gray-300">
                                <i class="fas fa-copy mr-1"></i>Copy
                            </button>
                        </div>
                        <p class="text-xs text-gray-400 mb-2 font-semibold">Continue.dev format:</p>
                        <div class="relative">
                            <pre class="bg-gray-900 rounded-lg p-4 text-xs text-green-300 overflow-x-auto"><code id="continue-config">{
  "mcpServers": [
    {
      "name": "sportsmcp",
      "transport": {
        "type": "streamable-http",
        "url": "{{mcp_base_url}}",
        "headers": {
          "Authorization": "Bearer {{mcp_bearer_token}}"
        }
      }
    }
  ]
}</code></pre>
                            <button onclick="copyConfig('continue-config')"
                                class="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs text-gray-300">
                                <i class="fas fa-copy mr-1"></i>Copy
                            </button>
                        </div>
                        <p class="text-xs text-gray-500 mt-3"><strong class="text-gray-400">Works with:</strong> Claude Desktop, Cursor, Windsurf, Cline, Continue.dev, Manus, OpenClaw, and any MCP-compatible app</p>
                        <details class="mt-2">
                            <summary class="text-xs text-gray-500 cursor-pointer hover:text-gray-400">Where to add this config</summary>
                            <div class="mt-2 text-xs text-gray-500 space-y-1 pl-3 border-l border-gray-700">
                                <p><strong class="text-gray-400">Claude Desktop:</strong> <code class="text-orange-300">~/Library/Application Support/Claude/claude_desktop_config.json</code> — restart after saving</p>
                                <p><strong class="text-gray-400">Cursor:</strong> Settings → Cursor Settings → MCP</p>
                                <p><strong class="text-gray-400">Windsurf:</strong> Settings → Cascade → MCP Servers</p>
                                <p><strong class="text-gray-400">Cline:</strong> VS Code → Cline → MCP Servers → Edit Config</p>
                                <p><strong class="text-gray-400">Continue.dev:</strong> <code class="text-orange-300">~/.continue/config.json</code> (use Continue.dev format above)</p>
                                <p><strong class="text-gray-400">Poke:</strong> Settings → Integrations → Add MCP Server</p>
                                <p><strong class="text-gray-400">Manus:</strong> Settings → Tools → Add MCP Server</p>
                                <p><strong class="text-gray-400">OpenClaw:</strong> Settings → MCP Servers → Add Server</p>
                            </div>
                        </details>
                    </div>

                    <!-- SSE (Legacy) -->
                    <div id="agent-sse" class="agent-panel hidden">
                        <div class="bg-gray-800/50 border border-gray-700/40 rounded-lg p-3 mb-3">
                            <p class="text-xs text-gray-300 font-semibold mb-1">For older MCP clients using HTTP+SSE transport</p>
                            <p class="text-xs text-gray-400">Some older clients don't support Streamable HTTP yet. Use this SSE endpoint instead.</p>
                        </div>
                        <div class="relative">
                            <pre class="bg-gray-900 rounded-lg p-4 text-xs text-green-300 overflow-x-auto"><code id="sse-config">{
  "mcpServers": {
    "sportsmcp": {
      "url": "{{mcp_sse_base_url}}",
      "headers": {
        "Authorization": "Bearer {{mcp_bearer_token}}"
      }
    }
  }
}</code></pre>
                            <button onclick="copyConfig('sse-config')"
                                class="absolute top-2 right-2 bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-xs text-gray-300">
                                <i class="fas fa-copy mr-1"></i>Copy
                            </button>
                        </div>
                        <p class="text-xs text-gray-500 mt-3"><strong class="text-gray-400">Use this if:</strong> your app doesn't connect with the Streamable HTTP URL or JSON config above</p>
                    </div>

                    <!-- Manual -->
                    <div id="agent-manual" class="agent-panel hidden">
                        <div class="bg-gray-800/50 border border-gray-700/40 rounded-lg p-3 mb-3">
                            <p class="text-xs text-gray-300 font-semibold mb-1">Raw connection details</p>
                            <p class="text-xs text-gray-400">For apps that ask for the endpoint and auth header separately.</p>
                        </div>
                        <div class="bg-gray-900 rounded-lg p-4 text-xs space-y-3 text-gray-300">
                            <div>
                                <p class="text-orange-400 font-semibold mb-1">Streamable HTTP endpoint</p>
                                <code class="text-green-300">{{mcp_base_url}}</code>
                            </div>
                            <div>
                                <p class="text-orange-400 font-semibold mb-1">SSE endpoint (legacy)</p>
                                <code class="text-green-300">{{mcp_sse_base_url}}</code>
                            </div>
                            <div>
                                <p class="text-orange-400 font-semibold mb-1">Authorization header</p>
                                <code class="text-green-300">Bearer {{mcp_bearer_token}}</code>
                            </div>
                        </div>
                        <p class="text-xs text-gray-500 mt-3">Any MCP-compatible app that supports Streamable HTTP or SSE transport will work. Check your app's docs for which transport it uses.</p>
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
            <div class="flex items-center justify-between mb-5">
                <h2 class="text-xl font-bold flex items-center">
                    <i class="fas fa-bolt text-orange-400 mr-2"></i>
                    Recent Activities
                </h2>
                <span class="text-xs text-gray-500 bg-gray-800 px-2 py-1 rounded-full">Last 7 workouts</span>
            </div>

            {{#if recent_activities}}
                <div class="space-y-3">
                    {{#each recent_activities}}
                    <div class="bg-gray-800/40 border border-gray-700/50 rounded-xl p-4 hover:border-orange-500/30 transition-colors">
                        <!-- Row 1: Emoji + Name + Date + Type badge -->
                        <div class="flex items-start justify-between gap-2 mb-3">
                            <div class="flex items-center gap-3">
                                <span class="text-xl leading-none">
                                    {{#if (eq sport_type "Run")}}🏃{{/if}}
                                    {{#if (eq sport_type "Ride")}}🚴{{/if}}
                                    {{#if (eq sport_type "Swim")}}🏊{{/if}}
                                    {{#if (not (or (eq sport_type "Run") (eq sport_type "Ride") (eq sport_type "Swim")))}}⚡{{/if}}
                                </span>
                                <div>
                                    <h3 class="font-semibold text-white text-sm leading-tight">{{name}}</h3>
                                    <div class="text-xs text-gray-500 mt-0.5">{{start_date_local}}</div>
                                </div>
                            </div>
                            <div class="text-right flex-shrink-0">
                                <span class="text-xs font-semibold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-full">{{sport_type}}</span>
                                {{#if pace}}<div class="text-xs text-gray-500 mt-1">{{pace}} /km</div>{{/if}}
                                {{#if speed}}<div class="text-xs text-gray-500 mt-1">{{speed}}</div>{{/if}}
                            </div>
                        </div>
                        <!-- Row 2: Stats pills -->
                        <div class="flex gap-2 flex-wrap">
                            <div class="flex items-center gap-1 bg-gray-800/60 rounded-lg px-3 py-1.5">
                                <i class="fas fa-route text-orange-400 text-xs"></i>
                                <span class="text-orange-400 font-semibold text-xs">{{distance}}km</span>
                            </div>
                            <div class="flex items-center gap-1 bg-gray-800/60 rounded-lg px-3 py-1.5">
                                <i class="fas fa-clock text-orange-400 text-xs"></i>
                                <span class="text-orange-400 font-semibold text-xs">{{moving_time}}</span>
                            </div>
                            {{#if elevation_gain}}
                            <div class="flex items-center gap-1 bg-gray-800/60 rounded-lg px-3 py-1.5">
                                <i class="fas fa-mountain text-orange-400 text-xs"></i>
                                <span class="text-orange-400 font-semibold text-xs">{{elevation_gain}}m</span>
                            </div>
                            {{/if}}
                            <a href="https://www.strava.com/activities/{{id}}" target="_blank" rel="noopener noreferrer"
                               class="ml-auto flex items-center gap-1 text-xs text-gray-500 hover:text-orange-400 transition-colors">
                                <i class="fas fa-external-link-alt text-xs"></i>
                                Strava
                            </a>
                        </div>
                    </div>
                    {{/each}}
                </div>
            {{else}}
                <div class="text-center py-10 text-gray-500">
                    <div class="text-4xl mb-3">🏃‍♂️</div>
                    <p class="font-medium">No recent activities yet</p>
                    <p class="text-sm mt-1">Log a workout on Strava and it'll appear here.</p>
                </div>
            {{/if}}
        </div>

        <!-- Tools, Status & Poke — 3-col on lg, stacked on mobile -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 pb-2">

            <!-- Available MCP Tools -->
            <div class="card rounded-2xl p-5">
                <h3 class="font-bold text-base mb-4 flex items-center justify-between">
                    <span class="flex items-center"><i class="fas fa-tools text-orange-400 mr-2"></i>MCP Tools</span>
                    <span class="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full font-semibold">21 tools</span>
                </h3>
                <div class="grid grid-cols-1 gap-1.5 mb-4">
                    <div class="flex items-center justify-between py-1 border-b border-gray-700/30">
                        <span class="text-xs text-gray-400">🏃 Activities &amp; Laps</span>
                        <span class="text-xs font-semibold text-white">5 tools</span>
                    </div>
                    <div class="flex items-center justify-between py-1 border-b border-gray-700/30">
                        <span class="text-xs text-gray-400">📍 Segments &amp; Efforts</span>
                        <span class="text-xs font-semibold text-white">5 tools</span>
                    </div>
                    <div class="flex items-center justify-between py-1 border-b border-gray-700/30">
                        <span class="text-xs text-gray-400">👥 Social &amp; Clubs</span>
                        <span class="text-xs font-semibold text-white">4 tools</span>
                    </div>
                    <div class="flex items-center justify-between py-1 border-b border-gray-700/30">
                        <span class="text-xs text-gray-400">👤 Profile &amp; Gear</span>
                        <span class="text-xs font-semibold text-white">3 tools</span>
                    </div>
                    <div class="flex items-center justify-between py-1">
                        <span class="text-xs text-gray-400">🗺️ Routes</span>
                        <span class="text-xs font-semibold text-white">2 tools</span>
                    </div>
                </div>
                <button onclick="window.openToolsModal()" class="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold py-2 rounded-lg transition-colors flex items-center justify-center gap-1.5">
                    <i class="fas fa-th-list"></i> View All 21 Tools
                </button>
            </div>

                        <!-- Status & Usage -->
            <div class="card rounded-2xl p-5">
                <h3 class="font-bold text-base mb-4 flex items-center">
                    <i class="fas fa-shield-alt text-orange-400 mr-2"></i>
                    Status &amp; Usage
                </h3>
                <!-- System status badge -->
                <div class="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2 mb-4">
                    <span class="w-2 h-2 bg-green-400 rounded-full flex-shrink-0 animate-pulse"></span>
                    <span class="text-xs font-semibold text-green-400">All Systems Operational</span>
                </div>
                <div class="space-y-2 text-xs">
                    <div class="flex justify-between items-center py-1.5 border-b border-gray-700/50">
                        <span class="text-gray-400">OAuth Token</span>
                        <span class="text-green-400 font-semibold">✓ Valid</span>
                    </div>
                    <div class="flex justify-between items-center py-1.5 border-b border-gray-700/50">
                        <span class="text-gray-400">MCP Endpoint</span>
                        <span class="text-green-400 font-semibold">✓ Active</span>
                    </div>
                    <div class="flex justify-between items-center py-1.5 border-b border-gray-700/50">
                        <span class="text-gray-400">Last Refresh</span>
                        <span class="text-gray-300">{{last_refresh}}</span>
                    </div>
                    <div class="flex justify-between items-center py-1.5">
                        <span class="text-gray-400">API Calls / Month</span>
                        <span class="text-gray-300">0 / 1,000</span>
                    </div>
                </div>
                <div class="mt-3">
                    <div class="w-full bg-gray-700 rounded-full h-1.5">
                        <div class="bg-gradient-to-r from-orange-400 to-orange-600 h-1.5 rounded-full" style="width: 0%"></div>
                    </div>
                    <p class="text-xs text-gray-600 mt-1">Generous limits for personal use</p>
                </div>
            </div>

            <!-- AI Notifications -->
            <div class="card rounded-2xl p-5" id="poke-card">
                <h3 class="font-bold text-base mb-1 flex items-center">
                    <i class="fas fa-bell text-orange-400 mr-2"></i>
                    AI Notifications
                </h3>
                <p class="text-xs text-gray-500 mb-4">
                    Get pinged whenever you finish a workout. Add one or more providers — all active providers receive every workout.
                </p>

                <!-- Active providers list (rendered by JS) -->
                <div id="poke-saved-view" class="{{poke_saved_class}}">
                    <div id="active-providers-list" class="space-y-2 mb-3">
                        <!-- Populated dynamically by JS -->
                    </div>
                    <button onclick="window.testPokeKey()"
                            class="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg text-xs transition-colors mb-2" id="poke-test-btn">
                        <i class="fas fa-paper-plane mr-1"></i> Send Test Ping to All
                    </button>
                    <button onclick="window.showAddProvider()"
                            class="w-full text-orange-400 hover:text-orange-300 border border-orange-500/30 hover:bg-orange-500/10 text-xs py-1.5 rounded-lg transition-colors">
                        <i class="fas fa-plus mr-1"></i> Add Another Provider
                    </button>
                </div>

                <!-- Add provider form -->
                <div id="poke-form-view" class="{{poke_form_class}}">
                    <form id="poke-form" onsubmit="window.savePokeKey(event, 'card')">
                        <label class="block text-xs text-gray-400 mb-1">Choose Provider</label>
                        <div class="grid grid-cols-3 gap-2 mb-3" id="provider-selector">
                            <button type="button" onclick="window.selectProvider('poke')"
                                    class="provider-btn border border-gray-700 rounded-lg px-2 py-2 text-xs text-center transition-all hover:border-orange-500/50"
                                    data-provider="poke">
                                <div class="font-semibold">Poke</div>
                                <div class="text-gray-500 text-[10px] mt-0.5">poke.com</div>
                            </button>
                            <button type="button" onclick="window.selectProvider('openclaw')"
                                    class="provider-btn border border-gray-700 rounded-lg px-2 py-2 text-xs text-center transition-all hover:border-orange-500/50"
                                    data-provider="openclaw">
                                <div class="font-semibold">OpenClaw</div>
                                <div class="text-gray-500 text-[10px] mt-0.5">openclaw.ai</div>
                            </button>
                            <button type="button" onclick="window.selectProvider('manus')"
                                    class="provider-btn border border-gray-700 rounded-lg px-2 py-2 text-xs text-center transition-all hover:border-orange-500/50"
                                    data-provider="manus">
                                <div class="font-semibold">Manus</div>
                                <div class="text-gray-500 text-[10px] mt-0.5">manus.im</div>
                            </button>
                        </div>

                        <input type="hidden" id="selected-provider" value="poke">

                        <label class="block text-xs text-gray-400 mb-1" id="api-key-label">Poke API Key</label>
                        <input type="password" id="poke-key-input" placeholder="poke_xxxxxxxxxxxxxxxx"
                               class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-orange-500 mb-3">

                        <div id="endpoint-field" class="hidden">
                            <label class="block text-xs text-gray-400 mb-1">Gateway URL</label>
                            <input type="url" id="endpoint-input" placeholder="https://your-openclaw-instance:18789"
                                   class="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-orange-500 mb-3">
                        </div>

                        <button type="submit"
                                class="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 rounded-lg text-xs transition-colors">
                            Save &amp; Connect
                        </button>
                    </form>
                    <button onclick="window.cancelPokeEdit()" id="cancel-add-btn"
                            class="w-full text-gray-500 hover:text-gray-300 text-xs py-1 mt-1 transition-colors {{poke_form_class}}">Cancel</button>
                </div>

                <div id="poke-status-bar" class="mt-3 hidden">
                    <div id="poke-status" class="text-xs rounded-lg px-3 py-2"></div>
                </div>
            </div>

        </div>
    </div>

    <!-- AI Agent Connections -->
    <div class="max-w-6xl mx-auto px-4 mb-8">
        <div class="card rounded-2xl p-6">
            <div class="flex items-center justify-between mb-4">
                <div>
                    <h3 class="font-bold text-base flex items-center">
                        <i class="fas fa-plug text-orange-400 mr-2"></i>
                        AI Agent Connections
                    </h3>
                    <p class="text-xs text-gray-500 mt-0.5">Auto-detected from actual MCP tool calls by each agent.</p>
                </div>
            </div>

            <!-- Last-seen banner (Option 2: real connection data) -->
            <div class="{{last_conn_has_data}} flex items-center gap-3 bg-green-500/8 border border-green-500/20 rounded-xl px-4 py-2.5 mb-4">
                <span class="w-2 h-2 bg-green-400 rounded-full flex-shrink-0 animate-pulse"></span>
                <div class="flex-1 min-w-0">
                    <span class="text-xs text-green-400 font-medium">Last connection: {{last_conn_display}}</span>
                    <span class="text-xs text-gray-500 ml-2">via {{last_conn_agent}}</span>
                    <span class="text-xs text-gray-600 ml-2">· {{last_conn_count}} total call(s)</span>
                </div>
            </div>
            <div class="{{last_conn_no_data}} flex items-center gap-2 bg-gray-800/50 border border-gray-700/40 rounded-xl px-4 py-2.5 mb-4">
                <i class="fas fa-circle-info text-gray-500 text-xs"></i>
                <span class="text-xs text-gray-500">No connections recorded yet. Add your MCP URL to an agent and use it — it will appear here automatically.</span>
            </div>

            <div class="space-y-2" id="agent-connections-list">

                <!-- Claude Desktop -->
                <div class="agent-row rounded-xl border border-gray-700/50 overflow-hidden" id="row-claude">
                    <button onclick="toggleAgentRow('claude')" class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/60 transition-colors text-left">
                        <div class="flex items-center gap-3">
                            <span class="text-lg">🤖</span>
                            <span class="font-medium text-sm">Claude Desktop</span>
                            <span class="{{agent_claude_on}} text-xs text-gray-500">{{agent_claude_lastconn}} · {{agent_claude_count}} calls</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="{{agent_claude_on}} inline-flex items-center gap-1 text-xs font-medium text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-2.5 py-0.5">
                                <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span> Connected
                            </span>
                            <span class="{{agent_claude_off}} inline-flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-700/40 border border-gray-600/30 rounded-full px-2.5 py-0.5">
                                Set up
                            </span>
                            <i class="fas fa-chevron-down text-gray-500 text-xs transition-transform" id="chevron-claude"></i>
                        </div>
                    </button>
                    <div class="hidden px-4 pb-4 pt-1 bg-gray-800/30" id="panel-claude">
                        <div class="{{agent_claude_on}} mb-3 flex items-center gap-2 text-xs text-gray-400">
                            <span class="{{agent_claude_lasttool_visible}} bg-gray-900 rounded px-2 py-0.5 text-gray-300">Last tool: <span class="text-orange-400">{{agent_claude_lasttool}}</span></span>
                        </div>
                        <p class="text-xs text-gray-400 mb-3">Add to your <code class="bg-gray-900 px-1 rounded">claude_desktop_config.json</code>:</p>
                        <pre class="bg-gray-900 rounded-lg p-3 text-xs text-green-300 overflow-x-auto mb-3"><code id="claude-conn-config">{
  "mcpServers": {
    "SportsMCP": {
      "url": "{{mcp_base_url}}",
      "headers": {
        "Authorization": "Bearer {{mcp_bearer_token}}"
      }
    }
  }
}</code></pre>
                        <div class="flex gap-2">
                            <button onclick="copyConfig('claude-conn-config')" class="flex-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 py-1.5 rounded-lg transition-colors">Copy Config</button>
                        </div>
                    </div>
                </div>

                <!-- Cursor -->
                <div class="agent-row rounded-xl border border-gray-700/50 overflow-hidden" id="row-cursor">
                    <button onclick="toggleAgentRow('cursor')" class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/60 transition-colors text-left">
                        <div class="flex items-center gap-3">
                            <span class="text-lg">⌨️</span>
                            <span class="font-medium text-sm">Cursor</span>
                            <span class="{{agent_cursor_on}} text-xs text-gray-500">{{agent_cursor_lastconn}} · {{agent_cursor_count}} calls</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="{{agent_cursor_on}} inline-flex items-center gap-1 text-xs font-medium text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-2.5 py-0.5">
                                <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span> Connected
                            </span>
                            <span class="{{agent_cursor_off}} inline-flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-700/40 border border-gray-600/30 rounded-full px-2.5 py-0.5">
                                Set up
                            </span>
                            <i class="fas fa-chevron-down text-gray-500 text-xs transition-transform" id="chevron-cursor"></i>
                        </div>
                    </button>
                    <div class="hidden px-4 pb-4 pt-1 bg-gray-800/30" id="panel-cursor">
                        <div class="{{agent_cursor_on}} mb-3 flex items-center gap-2 text-xs text-gray-400">
                            <span class="{{agent_cursor_lasttool_visible}} bg-gray-900 rounded px-2 py-0.5 text-gray-300">Last tool: <span class="text-orange-400">{{agent_cursor_lasttool}}</span></span>
                        </div>
                        <p class="text-xs text-gray-400 mb-3">Add to your Cursor MCP settings:</p>
                        <pre class="bg-gray-900 rounded-lg p-3 text-xs text-green-300 overflow-x-auto mb-3"><code id="cursor-conn-config">{
  "mcpServers": {
    "SportsMCP": {
      "url": "{{mcp_base_url}}",
      "headers": {
        "Authorization": "Bearer {{mcp_bearer_token}}"
      }
    }
  }
}</code></pre>
                        <div class="flex gap-2">
                            <button onclick="copyConfig('cursor-conn-config')" class="flex-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 py-1.5 rounded-lg transition-colors">Copy Config</button>
                        </div>
                    </div>
                </div>

                <!-- Windsurf -->
                <div class="agent-row rounded-xl border border-gray-700/50 overflow-hidden" id="row-windsurf">
                    <button onclick="toggleAgentRow('windsurf')" class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/60 transition-colors text-left">
                        <div class="flex items-center gap-3">
                            <span class="text-lg">🏄</span>
                            <span class="font-medium text-sm">Windsurf</span>
                            <span class="{{agent_windsurf_on}} text-xs text-gray-500">{{agent_windsurf_lastconn}} · {{agent_windsurf_count}} calls</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="{{agent_windsurf_on}} inline-flex items-center gap-1 text-xs font-medium text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-2.5 py-0.5">
                                <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span> Connected
                            </span>
                            <span class="{{agent_windsurf_off}} inline-flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-700/40 border border-gray-600/30 rounded-full px-2.5 py-0.5">
                                Set up
                            </span>
                            <i class="fas fa-chevron-down text-gray-500 text-xs transition-transform" id="chevron-windsurf"></i>
                        </div>
                    </button>
                    <div class="hidden px-4 pb-4 pt-1 bg-gray-800/30" id="panel-windsurf">
                        <div class="{{agent_windsurf_on}} mb-3 flex items-center gap-2 text-xs text-gray-400">
                            <span class="{{agent_windsurf_lasttool_visible}} bg-gray-900 rounded px-2 py-0.5 text-gray-300">Last tool: <span class="text-orange-400">{{agent_windsurf_lasttool}}</span></span>
                        </div>
                        <p class="text-xs text-gray-400 mb-3">Add to your Windsurf MCP settings:</p>
                        <pre class="bg-gray-900 rounded-lg p-3 text-xs text-green-300 overflow-x-auto mb-3"><code id="windsurf-conn-config">{
  "mcpServers": {
    "SportsMCP": {
      "url": "{{mcp_base_url}}",
      "headers": {
        "Authorization": "Bearer {{mcp_bearer_token}}"
      }
    }
  }
}</code></pre>
                        <div class="flex gap-2">
                            <button onclick="copyConfig('windsurf-conn-config')" class="flex-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 py-1.5 rounded-lg transition-colors">Copy Config</button>
                        </div>
                    </div>
                </div>

                <!-- Cline -->
                <div class="agent-row rounded-xl border border-gray-700/50 overflow-hidden" id="row-cline">
                    <button onclick="toggleAgentRow('cline')" class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/60 transition-colors text-left">
                        <div class="flex items-center gap-3">
                            <span class="text-lg">🧩</span>
                            <span class="font-medium text-sm">Cline</span>
                            <span class="{{agent_cline_on}} text-xs text-gray-500">{{agent_cline_lastconn}} · {{agent_cline_count}} calls</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="{{agent_cline_on}} inline-flex items-center gap-1 text-xs font-medium text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-2.5 py-0.5">
                                <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span> Connected
                            </span>
                            <span class="{{agent_cline_off}} inline-flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-700/40 border border-gray-600/30 rounded-full px-2.5 py-0.5">
                                Set up
                            </span>
                            <i class="fas fa-chevron-down text-gray-500 text-xs transition-transform" id="chevron-cline"></i>
                        </div>
                    </button>
                    <div class="hidden px-4 pb-4 pt-1 bg-gray-800/30" id="panel-cline">
                        <div class="{{agent_cline_on}} mb-3 flex items-center gap-2 text-xs text-gray-400">
                            <span class="{{agent_cline_lasttool_visible}} bg-gray-900 rounded px-2 py-0.5 text-gray-300">Last tool: <span class="text-orange-400">{{agent_cline_lasttool}}</span></span>
                        </div>
                        <p class="text-xs text-gray-400 mb-3">Add to your Cline MCP config:</p>
                        <pre class="bg-gray-900 rounded-lg p-3 text-xs text-green-300 overflow-x-auto mb-3"><code id="cline-conn-config">{
  "mcpServers": {
    "SportsMCP": {
      "url": "{{mcp_base_url}}",
      "headers": {
        "Authorization": "Bearer {{mcp_bearer_token}}"
      },
      "type": "streamable-http"
    }
  }
}</code></pre>
                        <div class="flex gap-2">
                            <button onclick="copyConfig('cline-conn-config')" class="flex-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 py-1.5 rounded-lg transition-colors">Copy Config</button>
                        </div>
                    </div>
                </div>

                <!-- Continue.dev -->
                <div class="agent-row rounded-xl border border-gray-700/50 overflow-hidden" id="row-continue">
                    <button onclick="toggleAgentRow('continue')" class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/60 transition-colors text-left">
                        <div class="flex items-center gap-3">
                            <span class="text-lg">▶️</span>
                            <span class="font-medium text-sm">Continue.dev</span>
                            <span class="{{agent_continue_on}} text-xs text-gray-500">{{agent_continue_lastconn}} · {{agent_continue_count}} calls</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="{{agent_continue_on}} inline-flex items-center gap-1 text-xs font-medium text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-2.5 py-0.5">
                                <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span> Connected
                            </span>
                            <span class="{{agent_continue_off}} inline-flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-700/40 border border-gray-600/30 rounded-full px-2.5 py-0.5">
                                Set up
                            </span>
                            <i class="fas fa-chevron-down text-gray-500 text-xs transition-transform" id="chevron-continue"></i>
                        </div>
                    </button>
                    <div class="hidden px-4 pb-4 pt-1 bg-gray-800/30" id="panel-continue">
                        <div class="{{agent_continue_on}} mb-3 flex items-center gap-2 text-xs text-gray-400">
                            <span class="{{agent_continue_lasttool_visible}} bg-gray-900 rounded px-2 py-0.5 text-gray-300">Last tool: <span class="text-orange-400">{{agent_continue_lasttool}}</span></span>
                        </div>
                        <p class="text-xs text-gray-400 mb-3">Add to your Continue config.json:</p>
                        <pre class="bg-gray-900 rounded-lg p-3 text-xs text-green-300 overflow-x-auto mb-3"><code id="continue-conn-config">{
  "experimental": {
    "modelContextProtocolServers": [{
      "transport": {
        "type": "streamable-http",
        "url": "{{mcp_base_url}}",
        "headers": {
          "Authorization": "Bearer {{mcp_bearer_token}}"
        }
      }
    }]
  }
}</code></pre>
                        <div class="flex gap-2">
                            <button onclick="copyConfig('continue-conn-config')" class="flex-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 py-1.5 rounded-lg transition-colors">Copy Config</button>
                        </div>
                    </div>
                </div>

                <!-- Manus -->
                <div class="agent-row rounded-xl border border-gray-700/50 overflow-hidden" id="row-manus">
                    <button onclick="toggleAgentRow('manus')" class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/60 transition-colors text-left">
                        <div class="flex items-center gap-3">
                            <span class="text-lg">🦾</span>
                            <span class="font-medium text-sm">Manus</span>
                            <span class="{{agent_manus_on}} text-xs text-gray-500">{{agent_manus_lastconn}} · {{agent_manus_count}} calls</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="{{agent_manus_on}} inline-flex items-center gap-1 text-xs font-medium text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-2.5 py-0.5">
                                <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span> Connected
                            </span>
                            <span class="{{agent_manus_off}} inline-flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-700/40 border border-gray-600/30 rounded-full px-2.5 py-0.5">
                                Set up
                            </span>
                            <i class="fas fa-chevron-down text-gray-500 text-xs transition-transform" id="chevron-manus"></i>
                        </div>
                    </button>
                    <div class="hidden px-4 pb-4 pt-1 bg-gray-800/30" id="panel-manus">
                        <div class="{{agent_manus_on}} mb-3 flex items-center gap-2 text-xs text-gray-400">
                            <span class="{{agent_manus_lasttool_visible}} bg-gray-900 rounded px-2 py-0.5 text-gray-300">Last tool: <span class="text-orange-400">{{agent_manus_lasttool}}</span></span>
                        </div>
                        <p class="text-xs text-gray-400 mb-3">In Manus, add an MCP server with this config:</p>
                        <pre class="bg-gray-900 rounded-lg p-3 text-xs text-green-300 overflow-x-auto mb-3"><code id="manus-conn-config">{
  "mcpServers": {
    "SportsMCP": {
      "url": "{{mcp_base_url}}",
      "headers": {
        "Authorization": "Bearer {{mcp_bearer_token}}"
      }
    }
  }
}</code></pre>
                        <div class="flex gap-2">
                            <button onclick="copyConfig('manus-conn-config')" class="flex-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 py-1.5 rounded-lg transition-colors">Copy Config</button>
                        </div>
                    </div>
                </div>

                <!-- OpenClaw -->
                <div class="agent-row rounded-xl border border-gray-700/50 overflow-hidden" id="row-openclaw">
                    <button onclick="toggleAgentRow('openclaw')" class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/60 transition-colors text-left">
                        <div class="flex items-center gap-3">
                            <span class="text-lg">🦀</span>
                            <span class="font-medium text-sm">OpenClaw</span>
                            <span class="{{agent_openclaw_on}} text-xs text-gray-500">{{agent_openclaw_lastconn}} · {{agent_openclaw_count}} calls</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="{{agent_openclaw_on}} inline-flex items-center gap-1 text-xs font-medium text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-2.5 py-0.5">
                                <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span> Connected
                            </span>
                            <span class="{{agent_openclaw_off}} inline-flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-700/40 border border-gray-600/30 rounded-full px-2.5 py-0.5">
                                Set up
                            </span>
                            <i class="fas fa-chevron-down text-gray-500 text-xs transition-transform" id="chevron-openclaw"></i>
                        </div>
                    </button>
                    <div class="hidden px-4 pb-4 pt-1 bg-gray-800/30" id="panel-openclaw">
                        <div class="{{agent_openclaw_on}} mb-3 flex items-center gap-2 text-xs text-gray-400">
                            <span class="{{agent_openclaw_lasttool_visible}} bg-gray-900 rounded px-2 py-0.5 text-gray-300">Last tool: <span class="text-orange-400">{{agent_openclaw_lasttool}}</span></span>
                        </div>
                        <p class="text-xs text-gray-400 mb-3">In OpenClaw, add an MCP server with this config:</p>
                        <pre class="bg-gray-900 rounded-lg p-3 text-xs text-green-300 overflow-x-auto mb-3"><code id="openclaw-conn-config">{
  "mcpServers": {
    "SportsMCP": {
      "url": "{{mcp_base_url}}",
      "headers": {
        "Authorization": "Bearer {{mcp_bearer_token}}"
      }
    }
  }
}</code></pre>
                        <div class="flex gap-2">
                            <button onclick="copyConfig('openclaw-conn-config')" class="flex-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-200 py-1.5 rounded-lg transition-colors">Copy Config</button>
                        </div>
                    </div>
                </div>

                <!-- Poke (real state from KV) -->
                <div class="agent-row rounded-xl border border-gray-700/50 overflow-hidden" id="row-poke-agent">
                    <button onclick="toggleAgentRow('poke-agent')" class="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/60 transition-colors text-left">
                        <div class="flex items-center gap-3">
                            <span class="text-lg">📱</span>
                            <span class="font-medium text-sm">Poke</span>
                        </div>
                        <div class="flex items-center gap-3">
                            <span class="{{agent_poke_on}} inline-flex items-center gap-1 text-xs font-medium text-green-400 bg-green-400/10 border border-green-400/20 rounded-full px-2.5 py-0.5">
                                <span class="w-1.5 h-1.5 rounded-full bg-green-400"></span> Active
                            </span>
                            <span class="{{agent_poke_off}} inline-flex items-center gap-1 text-xs font-medium text-gray-400 bg-gray-700/40 border border-gray-600/30 rounded-full px-2.5 py-0.5">
                                Set up
                            </span>
                            <i class="fas fa-chevron-down text-gray-500 text-xs transition-transform" id="chevron-poke-agent"></i>
                        </div>
                    </button>
                    <div class="hidden px-4 pb-4 pt-1 bg-gray-800/30" id="panel-poke-agent">
                        <p class="text-xs text-gray-400 mb-2">Get notified on <a href="https://poke.com" target="_blank" rel="noopener noreferrer" class="text-orange-400 hover:underline">Poke.com</a> after every workout. Configure your API key in the <strong>Poke Notifications</strong> card above.</p>
                        <p class="{{agent_poke_on}} text-xs text-green-400">✓ Your Poke API key is saved and active.</p>
                        <p class="{{agent_poke_off}} text-xs text-gray-500">Scroll up to the Poke Notifications card to add your key.</p>
                    </div>
                </div>

            </div>
        </div>
    </div>

    <!-- Footer attribution -->
    <footer class="bg-gray-950 py-6 mt-8">
        <div class="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <a href="https://www.strava.com" target="_blank" rel="noopener noreferrer">
                <img src="https://www.strava.com/assets/api/badge-strava-light.svg" alt="Powered by Strava" class="h-8 opacity-70 hover:opacity-100 transition-opacity">
            </a>
            <p class="text-xs text-gray-600 text-center">
                SportsMCP is not affiliated with, endorsed, or sponsored by Strava.<br>
                Your data is accessed via the official <a href="https://developers.strava.com" target="_blank" rel="noopener noreferrer" class="text-orange-500 hover:underline">Strava API</a>.
            </p>
            <div class="flex gap-4 text-xs text-gray-600">
                <a href="/privacy" class="hover:text-gray-400">Privacy Policy</a>
                <a href="/terms" class="hover:text-gray-400">Terms</a>
                <a href="/about" class="hover:text-gray-400">About</a>
            </div>
        </div>
    </footer>

    <!-- Tools Modal (shared with homepage) -->
    <div id="tools-modal" class="fixed inset-0 z-50 hidden" aria-modal="true" role="dialog">
        <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" onclick="window.closeToolsModal()"></div>
        <div class="relative z-10 flex items-center justify-center min-h-screen p-4">
            <div class="bg-gray-900 border border-gray-700/60 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
                <div class="flex items-center justify-between px-6 py-5 border-b border-gray-700/50 flex-shrink-0">
                    <div>
                        <h2 class="text-xl font-bold text-white flex items-center gap-2">
                            <i class="fas fa-tools text-orange-400"></i> SportsMCP Tools
                        </h2>
                        <p class="text-xs text-gray-500 mt-0.5">21 tools powered by the official Strava API</p>
                    </div>
                    <div class="hidden md:flex items-center gap-1 bg-gray-800 rounded-xl p-1">
                        <button onclick="window.filterTools('all')" id="dtab-all" class="dtab active px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">All</button>
                        <button onclick="window.filterTools('activities')" id="dtab-activities" class="dtab px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">🏃 Activities</button>
                        <button onclick="window.filterTools('segments')" id="dtab-segments" class="dtab px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">📍 Segments</button>
                        <button onclick="window.filterTools('profile')" id="dtab-profile" class="dtab px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">👤 Profile</button>
                        <button onclick="window.filterTools('social')" id="dtab-social" class="dtab px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">👥 Social</button>
                        <button onclick="window.filterTools('routes')" id="dtab-routes" class="dtab px-3 py-1.5 rounded-lg text-xs font-medium transition-colors">🗺️ Routes</button>
                    </div>
                    <button onclick="window.closeToolsModal()" class="ml-4 text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-700 transition-colors">
                        <i class="fas fa-times text-lg"></i>
                    </button>
                </div>
                <div class="md:hidden flex gap-1 px-4 pt-3 overflow-x-auto flex-shrink-0">
                    <button onclick="window.filterTools('all')" id="dtab-all-m" class="dtab-m active whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0">All 21</button>
                    <button onclick="window.filterTools('activities')" id="dtab-activities-m" class="dtab-m whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0">🏃 Activities</button>
                    <button onclick="window.filterTools('segments')" id="dtab-segments-m" class="dtab-m whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0">📍 Segments</button>
                    <button onclick="window.filterTools('profile')" id="dtab-profile-m" class="dtab-m whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0">👤 Profile</button>
                    <button onclick="window.filterTools('social')" id="dtab-social-m" class="dtab-m whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0">👥 Social</button>
                    <button onclick="window.filterTools('routes')" id="dtab-routes-m" class="dtab-m whitespace-nowrap px-3 py-1.5 rounded-lg text-xs font-medium flex-shrink-0">🗺️ Routes</button>
                </div>
                <div class="overflow-y-auto flex-1 px-6 py-4" id="dashboard-tools-list"></div>
                <div class="border-t border-gray-700/50 px-6 py-4 flex-shrink-0 flex items-center justify-between">
                    <p class="text-xs text-gray-500">All tools use your personal OAuth token — your data stays private.</p>
                    <button onclick="window.closeToolsModal()" class="text-sm text-gray-400 hover:text-white transition-colors">Close</button>
                </div>
            </div>
        </div>
    </div>
    <style>
        .dtab { color: #9ca3af; }
        .dtab.active, .dtab:hover { background: #374151; color: #fb923c; }
        .dtab-m { color: #9ca3af; background: #1f2937; }
        .dtab-m.active, .dtab-m:hover { background: #374151; color: #fb923c; }
    </style>

    <!-- Copy Success Message -->
    <div id="copy-success" class="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg hidden">
        <i class="fas fa-check mr-2"></i>MCP URL copied to clipboard!
    </div>

    <script>
        // Embedded MCP token for client-side API calls (not in URL)
        window.__mcpToken = '{{mcp_token}}';

        // ── Tools Modal ──────────────────────────────────────────────────────
        const D_TOOLS = [
          { name: 'get-recent-activities', cat: 'activities', emoji: '📋', title: 'Recent Activities', desc: 'Fetch your latest workouts with distance, time, pace, and sport type.', example: '"Show me my last 10 runs"' },
          { name: 'get-activity-details', cat: 'activities', emoji: '🔍', title: 'Activity Details', desc: 'Full breakdown of any activity — HR, power, elevation, pace, cadence, and more.', example: '"Deep-dive on my last ride"' },
          { name: 'get-activity-streams', cat: 'activities', emoji: '📈', title: 'Activity Streams', desc: 'Time-series data: GPS coordinates, heart rate, power, cadence, altitude, and velocity.', example: '"Show power data from my last workout"' },
          { name: 'get-activity-laps', cat: 'activities', emoji: '⏱️', title: 'Activity Laps', desc: 'Lap splits for interval sessions and structured workouts.', example: '"Break down the laps on my interval run"' },
          { name: 'get-athlete-stats', cat: 'activities', emoji: '📊', title: 'Athlete Stats', desc: 'All-time, year-to-date, and recent totals for running, cycling, and swimming.', example: '"What are my YTD cycling stats?"' },
          { name: 'explore-segments', cat: 'segments', emoji: '🔭', title: 'Explore Segments', desc: 'Discover popular Strava segments in any geographic area, filtered by activity type.', example: '"Find climbs near Boulder, CO"' },
          { name: 'get-starred-segments', cat: 'segments', emoji: '⭐', title: 'Starred Segments', desc: 'List all the segments you have starred on Strava.', example: '"Show my starred segments"' },
          { name: 'get-segment', cat: 'segments', emoji: '📌', title: 'Segment Details', desc: 'Full details about a segment: distance, elevation, grade, and KOM/QOM time.', example: '"Tell me about segment 12345"' },
          { name: 'get-segment-efforts', cat: 'segments', emoji: '🏆', title: 'Segment Efforts', desc: 'Your complete effort history on a segment — see your PRs and improvement over time.', example: '"Show my history on that climb"' },
          { name: 'get-segment-effort', cat: 'segments', emoji: '🎯', title: 'Segment Effort Detail', desc: 'Details on a specific effort: elapsed time, avg HR, power, and whether it set a PR.', example: '"How did I do on that effort?"' },
          { name: 'get-athlete-profile', cat: 'profile', emoji: '🏅', title: 'Athlete Profile', desc: 'Your Strava profile info including name, location, follower counts, and gear list.', example: '"Show me my Strava profile"' },
          { name: 'get-athlete-zones', cat: 'profile', emoji: '❤️', title: 'Training Zones', desc: 'Your heart rate and power training zones for targeted workout intensity.', example: '"What are my HR zones?"' },
          { name: 'get-gear', cat: 'profile', emoji: '👟', title: 'Gear & Equipment', desc: 'Details on any gear (bike or shoes) including total mileage and brand info.', example: '"How many miles on my shoes?"' },
          { name: 'get-activity-kudos', cat: 'social', emoji: '👍', title: 'Activity Kudos', desc: 'List the athletes who have given kudos on a specific activity.', example: '"Who kudoed my last run?"' },
          { name: 'get-activity-comments', cat: 'social', emoji: '💬', title: 'Activity Comments', desc: 'Read comments left on a specific activity.', example: '"Show comments on my last race"' },
          { name: 'get-athlete-clubs', cat: 'social', emoji: '🏟️', title: 'Your Clubs', desc: 'List all the Strava clubs you are a member of.', example: '"What clubs am I in?"' },
          { name: 'get-club', cat: 'social', emoji: '🤝', title: 'Club Details', desc: 'Info about a specific club: member count, sport type, city, and description.', example: '"Tell me about club 67890"' },
          { name: 'get-athlete-routes', cat: 'routes', emoji: '🛤️', title: 'Your Routes', desc: 'List all routes you have created on Strava with distance and elevation.', example: '"Show my saved routes"' },
          { name: 'get-route', cat: 'routes', emoji: '🗺️', title: 'Route Details', desc: 'Full details for a specific route including distance, elevation gain, and estimated time.', example: '"Tell me about route 99999"' },
        ];

        function dRenderTools(cat) {
          const list = document.getElementById('dashboard-tools-list');
          if (!list) return;
          const filtered = cat === 'all' ? D_TOOLS : D_TOOLS.filter(t => t.cat === cat);
          const catLabels = { activities: '🏃 Activities', segments: '📍 Segments', profile: '👤 Profile & Gear', social: '👥 Social & Clubs', routes: '🗺️ Routes' };
          let html = '<div class="grid gap-2">', lastCat = null;
          for (const t of filtered) {
            if (cat === 'all' && t.cat !== lastCat) {
              if (lastCat) html += '</div></div>';
              html += '<div class="mt-4 first:mt-0"><p class="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 px-1">' + catLabels[t.cat] + '</p><div class="grid gap-2">';
              lastCat = t.cat;
            }
            html += '<div class="flex items-start gap-3 p-3 rounded-xl bg-gray-800/60 hover:bg-gray-800 transition-colors border border-gray-700/30 hover:border-orange-500/20">';
            html += '<span class="text-xl flex-shrink-0 mt-0.5">' + t.emoji + '</span><div class="flex-1 min-w-0">';
            html += '<div class="flex items-center gap-2 flex-wrap"><code class="text-orange-300 text-xs font-mono bg-gray-900/60 px-2 py-0.5 rounded">' + t.name + '</code>';
            html += '<span class="font-medium text-sm text-white">' + t.title + '</span></div>';
            html += '<p class="text-xs text-gray-400 mt-1">' + t.desc + '</p>';
            html += '<p class="text-xs text-gray-600 mt-1 italic">' + t.example + '</p>';
            html += '</div></div>';
          }
          if (cat === 'all' && lastCat) html += '</div></div>';
          list.innerHTML = html + '</div>';
        }

        window.filterTools = function(cat) {
          document.querySelectorAll('.dtab').forEach(t => t.classList.remove('active'));
          document.querySelectorAll('.dtab-m').forEach(t => t.classList.remove('active'));
          const dt = document.getElementById('dtab-' + cat);
          const mt = document.getElementById('dtab-' + cat + '-m');
          if (dt) dt.classList.add('active');
          if (mt) mt.classList.add('active');
          dRenderTools(cat);
        };

        window.openToolsModal = function(cat) {
          const m = document.getElementById('tools-modal');
          if (!m) return;
          m.classList.remove('hidden');
          document.body.style.overflow = 'hidden';
          window.filterTools(cat || 'all');
        };

        window.closeToolsModal = function() {
          const m = document.getElementById('tools-modal');
          if (!m) return;
          m.classList.add('hidden');
          document.body.style.overflow = '';
        };

        document.addEventListener('keydown', function(e) { if (e.key === 'Escape') window.closeToolsModal(); });
        // ─────────────────────────────────────────────────────────────────────

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

        window.copyText = function copyText(text) {
            navigator.clipboard.writeText(text).then(() => {
                const successMsg = document.getElementById('copy-success');
                successMsg.textContent = '✅ Copied to clipboard!';
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

        // ---- Notification helpers (multi-provider) ----
        var _currentProvider = 'poke';
        var _activeProviders = JSON.parse('{{active_providers_json}}' || '[]');
        var _providerMeta = {
            poke:     { name: 'Poke',     keyLabel: 'Poke API Key',  keyPlaceholder: 'poke_xxxxxxxxxxxxxxxx', needsEndpoint: false },
            openclaw: { name: 'OpenClaw',  keyLabel: 'Gateway Token', keyPlaceholder: 'your-gateway-token',   needsEndpoint: true  },
            manus:    { name: 'Manus',     keyLabel: 'API Key',       keyPlaceholder: 'your-manus-api-key',   needsEndpoint: false }
        };

        function _pokeToken() {
            return window.__mcpToken || '';
        }
        function _pokeStatus(msg, isError, location) {
            var target = location || 'both';
            function _set(barId, elId) {
                var bar = document.getElementById(barId);
                var el = document.getElementById(elId);
                if (!bar || !el) return;
                el.textContent = msg;
                el.className = 'text-xs rounded-lg px-3 py-2 ' + (isError ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400');
                bar.classList.remove('hidden');
            }
            if (target === 'top' || target === 'both') _set('poke-top-status-bar', 'poke-top-status');
            if (target === 'card' || target === 'both') _set('poke-status-bar', 'poke-status');
        }
        function _showPokeView(view) {
            document.getElementById('poke-saved-view').classList.toggle('hidden', view !== 'saved');
            document.getElementById('poke-form-view').classList.toggle('hidden', view !== 'form');
            // Show cancel button only if there are active providers to go back to
            var cancelBtn = document.getElementById('cancel-add-btn');
            if (cancelBtn) cancelBtn.classList.toggle('hidden', _activeProviders.length === 0);
        }
        function _showPokeTopView() {
            var saved = document.getElementById('poke-top-saved');
            var form = document.getElementById('poke-top-form-wrap');
            if (_activeProviders.length > 0) {
                var pName = document.getElementById('poke-top-provider-name');
                if (pName) pName.textContent = _activeProviders.map(function(p) { return (_providerMeta[p] || {}).name || p; }).join(', ');
                if (saved) saved.classList.remove('hidden');
                if (form) form.classList.add('hidden');
            } else {
                if (saved) saved.classList.add('hidden');
                if (form) form.classList.remove('hidden');
            }
        }

        // Render the active providers list from server data
        function _renderActiveProviders() {
            var container = document.getElementById('active-providers-list');
            if (!container) return;
            if (_activeProviders.length === 0) {
                container.innerHTML = '';
                return;
            }
            container.innerHTML = _activeProviders.map(function(p) {
                var meta = _providerMeta[p] || { name: p };
                return '<div class="flex items-center gap-2 bg-green-500/10 border border-green-500/20 rounded-xl px-3 py-2">' +
                    '<span class="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></span>' +
                    '<span class="text-xs font-semibold text-green-400">' + meta.name + '</span>' +
                    '<span class="text-xs text-gray-500 ml-auto">Active</span>' +
                    '<button onclick="window.removeProvider(&quot;' + p + '&quot;)" class="text-gray-500 hover:text-red-400 text-xs ml-2 transition-colors" title="Remove ' + meta.name + '">' +
                    '<i class="fas fa-times"></i></button>' +
                    '</div>';
            }).join('');
        }
        _renderActiveProviders();

        window.selectProvider = function selectProvider(provider) {
            _currentProvider = provider;
            var meta = _providerMeta[provider] || _providerMeta.poke;
            document.getElementById('selected-provider').value = provider;
            document.getElementById('api-key-label').textContent = meta.keyLabel;
            document.getElementById('poke-key-input').placeholder = meta.keyPlaceholder;
            var epField = document.getElementById('endpoint-field');
            if (epField) epField.classList.toggle('hidden', !meta.needsEndpoint);
            document.querySelectorAll('.provider-btn').forEach(function(btn) {
                var isActive = btn.getAttribute('data-provider') === provider;
                btn.classList.toggle('border-orange-500', isActive);
                btn.classList.toggle('bg-orange-500/10', isActive);
                btn.classList.toggle('border-gray-700', !isActive);
            });
        };
        // Pick a default provider that isn't already active
        (function initSelector() {
            var available = ['poke', 'openclaw', 'manus'];
            var pick = available.find(function(p) { return _activeProviders.indexOf(p) === -1; }) || 'poke';
            window.selectProvider(pick);
        })();

        window.showAddProvider = function showAddProvider() {
            _showPokeView('form');
        };

        window.savePokeKey = async function savePokeKey(event, source) {
            event.preventDefault();
            var provider = document.getElementById('selected-provider').value || 'poke';
            var key = document.getElementById('poke-key-input').value.trim();
            var endpoint = document.getElementById('endpoint-input') ? document.getElementById('endpoint-input').value.trim() : '';
            var statusLoc = source === 'top' ? 'top' : 'card';
            if (!key) { _pokeStatus('Please enter your API key.', true, statusLoc); return; }
            if (provider === 'openclaw' && !endpoint) { _pokeStatus('OpenClaw requires a Gateway URL.', true, statusLoc); return; }
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
                    var providerName = (_providerMeta[provider] || {}).name || provider;
                    // Update active providers list
                    _activeProviders = data.providers || _activeProviders;
                    if (_activeProviders.indexOf(provider) === -1) _activeProviders.push(provider);
                    _renderActiveProviders();
                    _showPokeView('saved');
                    _showPokeTopView();
                    _pokeStatus("Connected to " + providerName + "! You'll get a ping after every workout.", false, 'both');
                } else {
                    var err = await res.json();
                    _pokeStatus((err.error || 'Failed to save.'), true, statusLoc);
                }
            } catch (e) {
                _pokeStatus('Network error. Please try again.', true, statusLoc);
            }
        };

        window.testPokeKey = async function testPokeKey() {
            var btn = document.getElementById('poke-test-btn');
            var origHTML = btn ? btn.innerHTML : '';
            if (btn) { btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Sending...'; btn.disabled = true; }
            try {
                var res = await fetch('/test-notification?token=' + _pokeToken(), { method: 'POST' });
                var data = await res.json();
                if (res.ok && data.success) {
                    _pokeStatus('📱 ' + data.message, false, 'card');
                } else {
                    _pokeStatus(data.error || 'Test failed. Check your keys.', true, 'card');
                }
            } catch (e) {
                _pokeStatus('Network error. Please try again.', true, 'card');
            } finally {
                if (btn) { btn.innerHTML = origHTML; btn.disabled = false; }
            }
        };

        window.testPokeKeyTop = async function testPokeKeyTop() {
            var btn = document.getElementById('poke-top-test-btn');
            var origHTML = btn ? btn.innerHTML : '';
            if (btn) { btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-1"></i> Sending...'; btn.disabled = true; }
            try {
                var res = await fetch('/test-notification?token=' + _pokeToken(), { method: 'POST' });
                var data = await res.json();
                if (res.ok && data.success) {
                    _pokeStatus('📱 ' + data.message, false, 'top');
                } else {
                    _pokeStatus(data.error || 'Test failed. Check your keys.', true, 'top');
                }
            } catch (e) {
                _pokeStatus('Network error. Please try again.', true, 'top');
            } finally {
                if (btn) { btn.innerHTML = origHTML; btn.disabled = false; }
            }
        };

        window.scrollToPokeCard = function scrollToPokeCard() {
            var card = document.getElementById('poke-card');
            if (card) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
        };

        // Remove a single provider
        window.removeProvider = async function removeProvider(provider) {
            var meta = _providerMeta[provider] || { name: provider };
            if (!confirm('Remove ' + meta.name + ' notifications?')) return;
            try {
                var res = await fetch('/settings/notification-config', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: _pokeToken(), provider: provider })
                });
                if (res.ok) {
                    var data = await res.json();
                    _activeProviders = _activeProviders.filter(function(p) { return p !== provider; });
                    _renderActiveProviders();
                    if (_activeProviders.length === 0) {
                        _showPokeView('form');
                        _showPokeTopView();
                    } else {
                        _showPokeTopView();
                    }
                    document.getElementById('poke-status-bar').classList.add('hidden');
                } else {
                    _pokeStatus('Could not remove. Try again.', true, 'card');
                }
            } catch (e) {
                _pokeStatus('Network error.', true, 'card');
            }
        };

        // Legacy: remove all
        window.removePokeKey = async function removePokeKey() {
            if (!confirm('Remove all notification providers?')) return;
            try {
                var res = await fetch('/settings/notification-config', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ token: _pokeToken() })
                });
                if (res.ok) {
                    _activeProviders = [];
                    _renderActiveProviders();
                    _showPokeView('form');
                    _showPokeTopView();
                    document.getElementById('poke-status-bar').classList.add('hidden');
                } else {
                    _pokeStatus('Could not remove. Try again.', true, 'card');
                }
            } catch (e) {
                _pokeStatus('Network error.', true, 'card');
            }
        };

        window.cancelPokeEdit = function cancelPokeEdit() {
            if (_activeProviders.length > 0) {
                _showPokeView('saved');
            }
            document.getElementById('poke-status-bar').classList.add('hidden');
        };

        // AI Agent Connections card — expand/collapse rows
        window.toggleAgentRow = function toggleAgentRow(agent) {
            const panel = document.getElementById('panel-' + agent);
            const chevron = document.getElementById('chevron-' + agent);
            if (!panel) return;
            const isHidden = panel.classList.contains('hidden');
            panel.classList.toggle('hidden', !isHidden);
            if (chevron) chevron.style.transform = isHidden ? 'rotate(180deg)' : '';
        };

        // Agent connections are auto-detected from actual MCP tool calls (no manual toggle needed)
    </script>
</body>
</html>`;
