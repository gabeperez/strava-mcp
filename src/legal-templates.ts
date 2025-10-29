// Legal and support page templates

export const ABOUT_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>About - Strava MCP Server</title>
    <meta name="description" content="Learn about Strava MCP Server - a secure bridge connecting AI assistants to your personal Strava data through the Model Context Protocol.">
    <link rel="icon" type="image/png" href="https://res.cloudinary.com/dxoyxnrjl/image/upload/v1758961029/Strava_MCP_Logo_4_u0pe64.png">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .gradient-bg { background: linear-gradient(135deg, #FC4C02 0%, #FF7B00 100%); }
    </style>
</head>
<body class="bg-gray-900 text-white">
    <!-- Navigation -->
    <nav class="bg-gray-800 border-b border-gray-700">
        <div class="max-w-7xl mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <img src="https://res.cloudinary.com/dxoyxnrjl/image/upload/v1758961029/Strava_MCP_Logo_4_u0pe64.png" alt="Strava MCP Logo" class="w-10 h-10 rounded-lg">
                    <span class="text-xl font-bold">Strava MCP Server</span>
                </div>
                <div class="flex items-center space-x-6">
                    <a href="/" class="text-gray-300 hover:text-white transition-colors">Home</a>
                    <a href="/about" class="text-orange-400 font-semibold">About</a>
                    <a href="/support" class="text-gray-300 hover:text-white transition-colors">Support</a>
                    <a href="/auth" class="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg font-semibold transition-colors">Get Started</a>
                </div>
            </div>
        </div>
    </nav>

    <div class="max-w-4xl mx-auto px-6 py-12">
        <div class="text-center mb-12">
            <h1 class="text-5xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                About Strava MCP Server
            </h1>
            <p class="text-xl text-gray-400">
                Bridging the gap between AI assistants and your personal fitness data
            </p>
        </div>

        <!-- Mission Statement -->
        <div class="bg-gray-800 rounded-2xl p-8 mb-8">
            <h2 class="text-3xl font-bold mb-6 flex items-center">
                <i class="fas fa-bullseye text-orange-400 mr-3"></i>
                Our Mission
            </h2>
            <p class="text-lg text-gray-300 leading-relaxed mb-6">
                Strava MCP Server empowers athletes to unlock the full potential of their fitness data through natural language interactions with AI assistants. We believe your workout data should be easily accessible, securely managed, and seamlessly integrated with the AI tools you already use.
            </p>
            <p class="text-lg text-gray-300 leading-relaxed">
                By implementing the Model Context Protocol (MCP), we create a standardized bridge between your Strava account and any compatible AI assistant, enabling personalized insights, training analysis, and fitness coaching at scale.
            </p>
        </div>

        <!-- What is MCP -->
        <div class="bg-gray-800 rounded-2xl p-8 mb-8">
            <h2 class="text-3xl font-bold mb-6 flex items-center">
                <i class="fas fa-network-wired text-orange-400 mr-3"></i>
                What is the Model Context Protocol?
            </h2>
            <div class="space-y-4 text-gray-300">
                <p>
                    The Model Context Protocol (MCP) is an open standard that enables AI assistants to securely access external data sources and services. Think of it as a universal translator between AI systems and your personal data.
                </p>
                <div class="bg-gray-900 rounded-lg p-6">
                    <h3 class="text-xl font-semibold text-orange-400 mb-4">How it works:</h3>
                    <div class="grid md:grid-cols-3 gap-6">
                        <div class="text-center">
                            <div class="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                <i class="fas fa-user text-2xl"></i>
                            </div>
                            <h4 class="font-semibold mb-2">1. You Ask</h4>
                            <p class="text-sm text-gray-400">"Show me my running progress this month"</p>
                        </div>
                        <div class="text-center">
                            <div class="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                <i class="fas fa-robot text-2xl"></i>
                            </div>
                            <h4 class="font-semibold mb-2">2. AI Requests</h4>
                            <p class="text-sm text-gray-400">AI calls our MCP server for your data</p>
                        </div>
                        <div class="text-center">
                            <div class="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-3">
                                <i class="fas fa-chart-line text-2xl"></i>
                            </div>
                            <h4 class="font-semibold mb-2">3. You Get Insights</h4>
                            <p class="text-sm text-gray-400">Personalized analysis and recommendations</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Privacy & Security -->
        <div class="bg-gray-800 rounded-2xl p-8 mb-8">
            <h2 class="text-3xl font-bold mb-6 flex items-center">
                <i class="fas fa-shield-alt text-orange-400 mr-3"></i>
                Privacy & Security First
            </h2>
            <div class="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 class="text-xl font-semibold text-orange-400 mb-4">What We Do</h3>
                    <ul class="space-y-3 text-gray-300">
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-400 mr-3 mt-1"></i>
                            <span>Use secure OAuth 2.0 authentication</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-400 mr-3 mt-1"></i>
                            <span>Encrypt all data in transit and at rest</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-400 mr-3 mt-1"></i>
                            <span>Respect your Strava privacy settings</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-400 mr-3 mt-1"></i>
                            <span>Provide per-user data isolation</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check text-green-400 mr-3 mt-1"></i>
                            <span>Auto-expire authentication tokens</span>
                        </li>
                    </ul>
                </div>
                <div>
                    <h3 class="text-xl font-semibold text-red-400 mb-4">What We Never Do</h3>
                    <ul class="space-y-3 text-gray-300">
                        <li class="flex items-start">
                            <i class="fas fa-times text-red-400 mr-3 mt-1"></i>
                            <span>Train AI models on your data</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-times text-red-400 mr-3 mt-1"></i>
                            <span>Share your data with third parties</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-times text-red-400 mr-3 mt-1"></i>
                            <span>Store activity data permanently</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-times text-red-400 mr-3 mt-1"></i>
                            <span>Access other users' information</span>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-times text-red-400 mr-3 mt-1"></i>
                            <span>Sell or monetize your fitness data</span>
                        </li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Technical Details -->
        <div class="bg-gray-800 rounded-2xl p-8 mb-8">
            <h2 class="text-3xl font-bold mb-6 flex items-center">
                <i class="fas fa-cogs text-orange-400 mr-3"></i>
                Technical Architecture
            </h2>
            <div class="space-y-6 text-gray-300">
                <div class="bg-gray-900 rounded-lg p-6">
                    <h3 class="text-xl font-semibold text-orange-400 mb-4">Built on Modern Infrastructure</h3>
                    <div class="grid md:grid-cols-3 gap-6">
                        <div class="text-center">
                            <i class="fab fa-cloudflare text-3xl text-orange-400 mb-3"></i>
                            <h4 class="font-semibold">Cloudflare Workers</h4>
                            <p class="text-sm text-gray-400">Edge computing for global low-latency access</p>
                        </div>
                        <div class="text-center">
                            <i class="fas fa-database text-3xl text-orange-400 mb-3"></i>
                            <h4 class="font-semibold">KV Storage</h4>
                            <p class="text-sm text-gray-400">Encrypted session storage with automatic expiry</p>
                        </div>
                        <div class="text-center">
                            <i class="fas fa-lock text-3xl text-orange-400 mb-3"></i>
                            <h4 class="font-semibold">OAuth 2.0</h4>
                            <p class="text-sm text-gray-400">Industry-standard secure authentication</p>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h3 class="text-xl font-semibold text-orange-400 mb-4">Available MCP Tools</h3>
                    <div class="grid md:grid-cols-2 gap-4">
                        <div class="bg-gray-900 rounded-lg p-4">
                            <h4 class="font-semibold text-green-400">Activity Tools</h4>
                            <ul class="text-sm space-y-1 mt-2">
                                <li>• get-recent-activities</li>
                                <li>• get-activity-details</li>
                                <li>• get-activity-streams</li>
                            </ul>
                        </div>
                        <div class="bg-gray-900 rounded-lg p-4">
                            <h4 class="font-semibold text-blue-400">Profile & Stats</h4>
                            <ul class="text-sm space-y-1 mt-2">
                                <li>• get-athlete-profile</li>
                                <li>• get-athlete-stats</li>
                            </ul>
                        </div>
                        <div class="bg-gray-900 rounded-lg p-4">
                            <h4 class="font-semibold text-purple-400">Segments & Routes</h4>
                            <ul class="text-sm space-y-1 mt-2">
                                <li>• get-starred-segments</li>
                                <li>• explore-segments</li>
                                <li>• get-athlete-routes</li>
                            </ul>
                        </div>
                        <div class="bg-gray-900 rounded-lg p-4">
                            <h4 class="font-semibold text-orange-400">Setup & Auth</h4>
                            <ul class="text-sm space-y-1 mt-2">
                                <li>• welcome-strava-mcp</li>
                                <li>• authenticate-strava</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Contact -->
        <div class="bg-gray-800 rounded-2xl p-8">
            <h2 class="text-3xl font-bold mb-6 flex items-center">
                <i class="fas fa-envelope text-orange-400 mr-3"></i>
                Get in Touch
            </h2>
            <div class="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 class="text-xl font-semibold text-orange-400 mb-4">Need Help?</h3>
                    <p class="text-gray-300 mb-4">
                        Our support team is here to help you get the most out of your Strava MCP integration.
                    </p>
                    <a href="/support" class="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                        <i class="fas fa-life-ring mr-2"></i>
                        Visit Support Center
                    </a>
                </div>
                <div>
                    <h3 class="text-xl font-semibold text-orange-400 mb-4">Contact Information</h3>
                    <div class="space-y-3 text-gray-300">
                        <div class="flex items-center">
                            <i class="fas fa-envelope text-orange-400 mr-3"></i>
                            <a href="mailto:help@stravamcp.com" class="hover:text-orange-400 transition-colors">help@stravamcp.com</a>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-globe text-orange-400 mr-3"></i>
                            <a href="https://stravamcp.com" class="hover:text-orange-400 transition-colors">stravamcp.com</a>
                        </div>
                        <div class="flex items-center">
                            <i class="fas fa-code text-orange-400 mr-3"></i>
                            <span>Built with ❤️ for the fitness community</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-950 py-8 mt-12">
        <div class="max-w-7xl mx-auto px-6 text-center text-gray-400">
            <div class="flex items-center justify-center space-x-6 mb-6">
                <a href="/privacy" class="hover:text-white transition-colors">Privacy Policy</a>
                <a href="/terms" class="hover:text-white transition-colors">Terms of Service</a>
                <a href="/support" class="hover:text-white transition-colors">Support</a>
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

export const SUPPORT_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Support Center - Strava MCP Server</title>
    <meta name="description" content="Get help with Strava MCP Server setup, troubleshooting, and integration with AI assistants. Comprehensive support documentation and contact information.">
    <link rel="icon" type="image/png" href="https://res.cloudinary.com/dxoyxnrjl/image/upload/v1758961029/Strava_MCP_Logo_4_u0pe64.png">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
    <style>
        .gradient-bg { background: linear-gradient(135deg, #FC4C02 0%, #FF7B00 100%); }
    </style>
</head>
<body class="bg-gray-900 text-white">
    <!-- Navigation -->
    <nav class="bg-gray-800 border-b border-gray-700">
        <div class="max-w-7xl mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <img src="https://res.cloudinary.com/dxoyxnrjl/image/upload/v1758961029/Strava_MCP_Logo_4_u0pe64.png" alt="Strava MCP Logo" class="w-10 h-10 rounded-lg">
                    <span class="text-xl font-bold">Strava MCP Server</span>
                </div>
                <div class="flex items-center space-x-6">
                    <a href="/" class="text-gray-300 hover:text-white transition-colors">Home</a>
                    <a href="/about" class="text-gray-300 hover:text-white transition-colors">About</a>
                    <a href="/support" class="text-orange-400 font-semibold">Support</a>
                    <a href="/auth" class="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg font-semibold transition-colors">Get Started</a>
                </div>
            </div>
        </div>
    </nav>

    <div class="max-w-6xl mx-auto px-6 py-12">
        <div class="text-center mb-12">
            <h1 class="text-5xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Support Center
            </h1>
            <p class="text-xl text-gray-400">
                Everything you need to get up and running with Strava MCP Server
            </p>
        </div>

        <!-- Quick Help -->
        <div class="grid lg:grid-cols-3 gap-8 mb-12">
            <div class="bg-gray-800 rounded-2xl p-6 text-center">
                <div class="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-rocket text-2xl text-white"></i>
                </div>
                <h3 class="text-xl font-bold mb-3">Quick Start</h3>
                <p class="text-gray-300 mb-4">Get connected in under 30 seconds</p>
                <a href="#quick-start" class="text-orange-400 hover:text-orange-300">Learn More →</a>
            </div>
            <div class="bg-gray-800 rounded-2xl p-6 text-center">
                <div class="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-tools text-2xl text-white"></i>
                </div>
                <h3 class="text-xl font-bold mb-3">Troubleshooting</h3>
                <p class="text-gray-300 mb-4">Common issues and solutions</p>
                <a href="#troubleshooting" class="text-orange-400 hover:text-orange-300">Get Help →</a>
            </div>
            <div class="bg-gray-800 rounded-2xl p-6 text-center">
                <div class="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="fas fa-envelope text-2xl text-white"></i>
                </div>
                <h3 class="text-xl font-bold mb-3">Contact Support</h3>
                <p class="text-gray-300 mb-4">Get personalized help</p>
                <a href="#contact" class="text-orange-400 hover:text-orange-300">Contact Us →</a>
            </div>
        </div>

        <!-- Quick Start Guide -->
        <div id="quick-start" class="bg-gray-800 rounded-2xl p-8 mb-8">
            <h2 class="text-3xl font-bold mb-6 flex items-center">
                <i class="fas fa-rocket text-green-400 mr-3"></i>
                Quick Start Guide
            </h2>
            <div class="space-y-6">
                <div class="flex items-start space-x-4">
                    <div class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span class="text-white font-bold text-sm">1</span>
                    </div>
                    <div>
                        <h3 class="text-xl font-semibold text-orange-400 mb-2">Connect Your Strava Account</h3>
                        <p class="text-gray-300 mb-3">Visit our homepage and click "Connect with Strava" to authorize secure access to your fitness data.</p>
                        <div class="bg-gray-900 rounded-lg p-4">
                            <code class="text-orange-300">https://stravamcp.com</code> → <strong>Connect with Strava</strong> → Authorize
                        </div>
                    </div>
                </div>
                
                <div class="flex items-start space-x-4">
                    <div class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span class="text-white font-bold text-sm">2</span>
                    </div>
                    <div>
                        <h3 class="text-xl font-semibold text-orange-400 mb-2">Get Your Personal MCP URL</h3>
                        <p class="text-gray-300 mb-3">After authentication, you'll receive your unique MCP server URL on the dashboard.</p>
                        <div class="bg-gray-900 rounded-lg p-4">
                            <code class="text-green-300">https://stravamcp.com/mcp?token=YOUR_UNIQUE_TOKEN</code>
                        </div>
                    </div>
                </div>
                
                <div class="flex items-start space-x-4">
                    <div class="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                        <span class="text-white font-bold text-sm">3</span>
                    </div>
                    <div>
                        <h3 class="text-xl font-semibold text-orange-400 mb-2">Configure Your AI Assistant</h3>
                        <p class="text-gray-300 mb-3">Add your MCP URL to your preferred AI assistant and start asking about your fitness data!</p>
                        <div class="grid md:grid-cols-2 gap-4 mt-4">
                            <div class="bg-gray-900 rounded-lg p-4">
                                <h4 class="font-semibold text-blue-400 mb-2"><i class="fas fa-search mr-2"></i>Poke.com</h4>
                                <p class="text-sm text-gray-300">Add new MCP server → Paste URL → Start chatting</p>
                            </div>
                            <div class="bg-gray-900 rounded-lg p-4">
                                <h4 class="font-semibold text-purple-400 mb-2"><i class="fas fa-desktop mr-2"></i>Claude Desktop</h4>
                                <p class="text-sm text-gray-300">Update config file → Add server entry → Restart</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- AI Assistant Setup -->
        <div class="bg-gray-800 rounded-2xl p-8 mb-8">
            <h2 class="text-3xl font-bold mb-6 flex items-center">
                <i class="fas fa-robot text-blue-400 mr-3"></i>
                AI Assistant Configuration
            </h2>
            
            <div class="grid md:grid-cols-2 gap-8">
                <div class="bg-gray-900 rounded-lg p-6">
                    <h3 class="text-xl font-bold text-blue-400 mb-4 flex items-center">
                        <i class="fas fa-search mr-3"></i>
                        Poke.com Setup
                    </h3>
                    <ol class="space-y-3 text-gray-300">
                        <li class="flex items-start">
                            <span class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                            <span>Go to your Poke.com dashboard</span>
                        </li>
                        <li class="flex items-start">
                            <span class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                            <span>Click "Add MCP Server"</span>
                        </li>
                        <li class="flex items-start">
                            <span class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                            <span>Paste your MCP URL</span>
                        </li>
                        <li class="flex items-start">
                            <span class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</span>
                            <span>Save and start asking about your Strava data!</span>
                        </li>
                    </ol>
                </div>
                
                <div class="bg-gray-900 rounded-lg p-6">
                    <h3 class="text-xl font-bold text-purple-400 mb-4 flex items-center">
                        <i class="fas fa-desktop mr-3"></i>
                        Claude Desktop Setup
                    </h3>
                    <ol class="space-y-3 text-gray-300">
                        <li class="flex items-start">
                            <span class="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">1</span>
                            <span>Open <code class="bg-gray-800 px-2 py-1 rounded text-orange-300">claude_desktop_config.json</code></span>
                        </li>
                        <li class="flex items-start">
                            <span class="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">2</span>
                            <span>Add your server configuration</span>
                        </li>
                        <li class="flex items-start">
                            <span class="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">3</span>
                            <span>Restart Claude Desktop</span>
                        </li>
                        <li class="flex items-start">
                            <span class="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-0.5">4</span>
                            <span>Start asking about your fitness data!</span>
                        </li>
                    </ol>
                    <div class="bg-gray-800 rounded p-3 mt-4">
                        <code class="text-xs text-gray-300">
{<br>
&nbsp;&nbsp;"mcpServers": {<br>
&nbsp;&nbsp;&nbsp;&nbsp;"strava": {<br>
&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;"command": "YOUR_MCP_URL"<br>
&nbsp;&nbsp;&nbsp;&nbsp;}<br>
&nbsp;&nbsp;}<br>
}
                        </code>
                    </div>
                </div>
            </div>
        </div>

        <!-- Troubleshooting -->
        <div id="troubleshooting" class="bg-gray-800 rounded-2xl p-8 mb-8">
            <h2 class="text-3xl font-bold mb-6 flex items-center">
                <i class="fas fa-tools text-yellow-400 mr-3"></i>
                Common Issues & Solutions
            </h2>
            
            <div class="space-y-6">
                <div class="border-l-4 border-red-400 bg-gray-900 p-6 rounded-r-lg">
                    <h3 class="text-xl font-semibold text-red-400 mb-3 flex items-center">
                        <i class="fas fa-exclamation-triangle mr-2"></i>
                        "Authentication Required" Error
                    </h3>
                    <p class="text-gray-300 mb-3"><strong>Problem:</strong> AI assistant shows authentication error when trying to access Strava data.</p>
                    <div class="bg-gray-800 rounded-lg p-4">
                        <p class="text-green-400 font-semibold mb-2">Solutions:</p>
                        <ul class="space-y-2 text-gray-300">
                            <li>• Ensure you're using your personal MCP URL with the correct token</li>
                            <li>• Check that your Strava authentication hasn't expired</li>
                            <li>• Try reconnecting your Strava account on the dashboard</li>
                            <li>• Verify your AI assistant supports HTTPS MCP servers</li>
                        </ul>
                    </div>
                </div>
                
                <div class="border-l-4 border-yellow-400 bg-gray-900 p-6 rounded-r-lg">
                    <h3 class="text-xl font-semibold text-yellow-400 mb-3 flex items-center">
                        <i class="fas fa-clock mr-2"></i>
                        Connection Timeouts
                    </h3>
                    <p class="text-gray-300 mb-3"><strong>Problem:</strong> AI assistant can't connect to MCP server or requests time out.</p>
                    <div class="bg-gray-800 rounded-lg p-4">
                        <p class="text-green-400 font-semibold mb-2">Solutions:</p>
                        <ul class="space-y-2 text-gray-300">
                            <li>• Verify your MCP URL includes <code class="bg-gray-700 px-2 py-1 rounded">/mcp</code> at the end</li>
                            <li>• Check your internet connection</li>
                            <li>• Ensure your AI assistant supports the MCP protocol</li>
                            <li>• Try accessing the URL directly in your browser to test connectivity</li>
                        </ul>
                    </div>
                </div>
                
                <div class="border-l-4 border-blue-400 bg-gray-900 p-6 rounded-r-lg">
                    <h3 class="text-xl font-semibold text-blue-400 mb-3 flex items-center">
                        <i class="fas fa-ban mr-2"></i>
                        "No Recent Activities" Message
                    </h3>
                    <p class="text-gray-300 mb-3"><strong>Problem:</strong> MCP server shows no activities even though you have Strava data.</p>
                    <div class="bg-gray-800 rounded-lg p-4">
                        <p class="text-green-400 font-semibold mb-2">Solutions:</p>
                        <ul class="space-y-2 text-gray-300">
                            <li>• Check your Strava privacy settings - activities might be private</li>
                            <li>• Ensure you've granted the required permissions during OAuth</li>
                            <li>• Verify you have recent activities in your Strava account</li>
                            <li>• Try disconnecting and reconnecting your account</li>
                        </ul>
                    </div>
                </div>
                
                <div class="border-l-4 border-purple-400 bg-gray-900 p-6 rounded-r-lg">
                    <h3 class="text-xl font-semibold text-purple-400 mb-3 flex items-center">
                        <i class="fas fa-key mr-2"></i>
                        Token Expired Issues
                    </h3>
                    <p class="text-gray-300 mb-3"><strong>Problem:</strong> Authentication works initially but stops working after some time.</p>
                    <div class="bg-gray-800 rounded-lg p-4">
                        <p class="text-green-400 font-semibold mb-2">Solutions:</p>
                        <ul class="space-y-2 text-gray-300">
                            <li>• Our system automatically refreshes tokens - this should be rare</li>
                            <li>• If it persists, visit your dashboard to check status</li>
                            <li>• Reconnect your Strava account to get fresh tokens</li>
                            <li>• Contact support if automatic refresh isn't working</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>

        <!-- Example Queries -->
        <div class="bg-gray-800 rounded-2xl p-8 mb-8">
            <h2 class="text-3xl font-bold mb-6 flex items-center">
                <i class="fas fa-comments text-green-400 mr-3"></i>
                Example AI Queries
            </h2>
            <p class="text-gray-300 mb-6">Try these natural language queries with your AI assistant once connected:</p>
            
            <div class="grid md:grid-cols-2 gap-6">
                <div class="space-y-4">
                    <h3 class="text-xl font-semibold text-orange-400">Activity Queries</h3>
                    <div class="space-y-3">
                        <div class="bg-gray-900 rounded-lg p-4">
                            <p class="text-blue-300 font-medium">"Show me my recent Strava activities"</p>
                        </div>
                        <div class="bg-gray-900 rounded-lg p-4">
                            <p class="text-blue-300 font-medium">"What was my fastest run this month?"</p>
                        </div>
                        <div class="bg-gray-900 rounded-lg p-4">
                            <p class="text-blue-300 font-medium">"Get heart rate data from my last cycling workout"</p>
                        </div>
                        <div class="bg-gray-900 rounded-lg p-4">
                            <p class="text-blue-300 font-medium">"How many miles did I run this week?"</p>
                        </div>
                    </div>
                </div>
                
                <div class="space-y-4">
                    <h3 class="text-xl font-semibold text-orange-400">Analysis Queries</h3>
                    <div class="space-y-3">
                        <div class="bg-gray-900 rounded-lg p-4">
                            <p class="text-green-300 font-medium">"Compare my performance this month vs last month"</p>
                        </div>
                        <div class="bg-gray-900 rounded-lg p-4">
                            <p class="text-green-300 font-medium">"What are my personal records?"</p>
                        </div>
                        <div class="bg-gray-900 rounded-lg p-4">
                            <p class="text-green-300 font-medium">"Find popular segments near my location"</p>
                        </div>
                        <div class="bg-gray-900 rounded-lg p-4">
                            <p class="text-green-300 font-medium">"Show me my training consistency"</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Contact Support -->
        <div id="contact" class="bg-gray-800 rounded-2xl p-8">
            <h2 class="text-3xl font-bold mb-6 flex items-center">
                <i class="fas fa-headset text-purple-400 mr-3"></i>
                Contact Support
            </h2>
            
            <div class="grid md:grid-cols-2 gap-8">
                <div>
                    <h3 class="text-xl font-semibold text-orange-400 mb-4">Get Personal Help</h3>
                    <p class="text-gray-300 mb-6">
                        Can't find the answer you're looking for? Our support team is here to help you resolve any issues with your Strava MCP integration.
                    </p>
                    
                    <div class="space-y-4">
                        <div class="flex items-center space-x-4">
                            <div class="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                                <i class="fas fa-envelope text-xl text-white"></i>
                            </div>
                            <div>
                                <h4 class="font-semibold">Email Support</h4>
                                <p class="text-gray-400">help@stravamcp.com</p>
                                <p class="text-sm text-gray-500">Response within 24 hours</p>
                            </div>
                        </div>
                        
                        <div class="flex items-center space-x-4">
                            <div class="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                                <i class="fas fa-clock text-xl text-white"></i>
                            </div>
                            <div>
                                <h4 class="font-semibold">Support Hours</h4>
                                <p class="text-gray-400">Monday - Friday</p>
                                <p class="text-sm text-gray-500">9 AM - 6 PM UTC</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h3 class="text-xl font-semibold text-orange-400 mb-4">What to Include in Your Message</h3>
                    <div class="bg-gray-900 rounded-lg p-6">
                        <ul class="space-y-3 text-gray-300">
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-400 mr-3 mt-1"></i>
                                <span>Detailed description of the issue</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-400 mr-3 mt-1"></i>
                                <span>Steps you've already tried</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-400 mr-3 mt-1"></i>
                                <span>Which AI assistant you're using</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-400 mr-3 mt-1"></i>
                                <span>Any error messages you received</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-400 mr-3 mt-1"></i>
                                <span>Your browser and operating system</span>
                            </li>
                        </ul>
                    </div>
                    
                    <div class="mt-6">
                        <a href="mailto:help@stravamcp.com" class="inline-flex items-center bg-purple-500 hover:bg-purple-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
                            <i class="fas fa-paper-plane mr-2"></i>
                            Send Support Email
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-950 py-8 mt-12">
        <div class="max-w-7xl mx-auto px-6 text-center text-gray-400">
            <div class="flex items-center justify-center space-x-6 mb-6">
                <a href="/privacy" class="hover:text-white transition-colors">Privacy Policy</a>
                <a href="/terms" class="hover:text-white transition-colors">Terms of Service</a>
                <a href="/about" class="hover:text-white transition-colors">About</a>
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

export const PRIVACY_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy Policy - Strava MCP Server</title>
    <meta name="description" content="Privacy Policy for Strava MCP Server - Learn how we protect your personal information and Strava data.">
    <link rel="icon" type="image/png" href="https://res.cloudflare.com/dxoyxnrjl/image/upload/v1758961029/Strava_MCP_Logo_4_u0pe64.png">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-900 text-white">
    <!-- Navigation -->
    <nav class="bg-gray-800 border-b border-gray-700">
        <div class="max-w-7xl mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <img src="https://res.cloudinary.com/dxoyxnrjl/image/upload/v1758961029/Strava_MCP_Logo_4_u0pe64.png" alt="Strava MCP Logo" class="w-10 h-10 rounded-lg">
                    <span class="text-xl font-bold">Strava MCP Server</span>
                </div>
                <div class="flex items-center space-x-6">
                    <a href="/" class="text-gray-300 hover:text-white transition-colors">Home</a>
                    <a href="/about" class="text-gray-300 hover:text-white transition-colors">About</a>
                    <a href="/support" class="text-gray-300 hover:text-white transition-colors">Support</a>
                    <a href="/auth" class="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg font-semibold transition-colors">Get Started</a>
                </div>
            </div>
        </div>
    </nav>

    <div class="max-w-4xl mx-auto px-6 py-12">
        <div class="text-center mb-12">
            <h1 class="text-5xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Privacy Policy
            </h1>
            <p class="text-xl text-gray-400">
                How we protect and handle your personal information
            </p>
            <p class="text-sm text-gray-500 mt-2">
                Last updated: October 2025
            </p>
        </div>

        <div class="space-y-8">
            <!-- Introduction -->
            <div class="bg-gray-800 rounded-2xl p-8">
                <h2 class="text-3xl font-bold mb-6 flex items-center">
                    <i class="fas fa-shield-alt text-green-400 mr-3"></i>
                    Our Commitment to Privacy
                </h2>
                <div class="space-y-4 text-gray-300">
                    <p class="text-lg">
                        At Strava MCP Server, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our Model Context Protocol (MCP) server service.
                    </p>
                    <p>
                        <strong>Contact Information:</strong><br>
                        Email: <a href="mailto:help@stravamcp.com" class="text-orange-400 hover:text-orange-300">help@stravamcp.com</a><br>
                        Website: <a href="https://stravamcp.com" class="text-orange-400 hover:text-orange-300">https://stravamcp.com</a>
                    </p>
                </div>
            </div>

            <!-- Information We Collect -->
            <div class="bg-gray-800 rounded-2xl p-8">
                <h2 class="text-3xl font-bold mb-6 flex items-center">
                    <i class="fas fa-database text-blue-400 mr-3"></i>
                    Information We Collect
                </h2>
                <div class="space-y-6">
                    <div>
                        <h3 class="text-xl font-semibold text-orange-400 mb-3">Strava Account Information</h3>
                        <p class="text-gray-300 mb-3">When you connect your Strava account, we receive:</p>
                        <ul class="list-disc list-inside space-y-2 text-gray-300 ml-4">
                            <li>Basic profile information (name, username, profile picture)</li>
                            <li>Activity data (workouts, routes, performance metrics)</li>
                            <li>Athlete statistics and achievements</li>
                            <li>Starred segments and created routes</li>
                        </ul>
                        <p class="text-sm text-gray-400 mt-3">
                            <strong>Note:</strong> We only access data that you have made available through your Strava privacy settings and the permissions you grant during OAuth authentication.
                        </p>
                    </div>
                    
                    <div>
                        <h3 class="text-xl font-semibold text-orange-400 mb-3">Authentication Data</h3>
                        <ul class="list-disc list-inside space-y-2 text-gray-300 ml-4">
                            <li>OAuth access tokens and refresh tokens (encrypted)</li>
                            <li>Session identifiers and expiration dates</li>
                            <li>Device fingerprints for seamless authentication</li>
                        </ul>
                    </div>
                    
                    <div>
                        <h3 class="text-xl font-semibold text-orange-400 mb-3">Technical Information</h3>
                        <ul class="list-disc list-inside space-y-2 text-gray-300 ml-4">
                            <li>Browser User-Agent strings (for device identification)</li>
                            <li>IP addresses (for security and rate limiting)</li>
                            <li>Request timestamps and API usage patterns</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- How We Use Information -->
            <div class="bg-gray-800 rounded-2xl p-8">
                <h2 class="text-3xl font-bold mb-6 flex items-center">
                    <i class="fas fa-cogs text-purple-400 mr-3"></i>
                    How We Use Your Information
                </h2>
                <div class="grid md:grid-cols-2 gap-6">
                    <div class="bg-gray-900 rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-green-400 mb-4">✅ What We Do</h3>
                        <ul class="space-y-3 text-gray-300">
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-400 mr-3 mt-1"></i>
                                <span>Provide real-time access to your Strava data via MCP</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-400 mr-3 mt-1"></i>
                                <span>Maintain secure authentication sessions</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-400 mr-3 mt-1"></i>
                                <span>Automatically refresh expired tokens</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-400 mr-3 mt-1"></i>
                                <span>Provide customer support and troubleshooting</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-400 mr-3 mt-1"></i>
                                <span>Monitor service health and performance</span>
                            </li>
                        </ul>
                    </div>
                    
                    <div class="bg-gray-900 rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-red-400 mb-4">❌ What We Never Do</h3>
                        <ul class="space-y-3 text-gray-300">
                            <li class="flex items-start">
                                <i class="fas fa-times text-red-400 mr-3 mt-1"></i>
                                <span>Train AI models using your data</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times text-red-400 mr-3 mt-1"></i>
                                <span>Sell your data to third parties</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times text-red-400 mr-3 mt-1"></i>
                                <span>Store activity data permanently</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times text-red-400 mr-3 mt-1"></i>
                                <span>Share data with advertisers</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-times text-red-400 mr-3 mt-1"></i>
                                <span>Access data beyond granted permissions</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Data Storage and Security -->
            <div class="bg-gray-800 rounded-2xl p-8">
                <h2 class="text-3xl font-bold mb-6 flex items-center">
                    <i class="fas fa-lock text-yellow-400 mr-3"></i>
                    Data Storage and Security
                </h2>
                <div class="space-y-6">
                    <div class="bg-gray-900 rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-orange-400 mb-4">Where Your Data is Stored</h3>
                        <ul class="space-y-2 text-gray-300">
                            <li><strong>Authentication Tokens:</strong> Encrypted in Cloudflare KV (global edge storage)</li>
                            <li><strong>Session Data:</strong> Temporarily stored with automatic 30-day expiration</li>
                            <li><strong>Activity Data:</strong> Not stored - fetched in real-time from Strava API</li>
                            <li><strong>Geographic Location:</strong> Stored globally across Cloudflare's edge network</li>
                        </ul>
                    </div>
                    
                    <div class="bg-gray-900 rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-orange-400 mb-4">Security Measures</h3>
                        <div class="grid md:grid-cols-2 gap-4">
                            <ul class="space-y-2 text-gray-300">
                                <li>🔐 End-to-end HTTPS encryption</li>
                                <li>🛡️ OAuth 2.0 secure authentication</li>
                                <li>🔑 Encrypted token storage</li>
                                <li>⏰ Automatic token refresh</li>
                            </ul>
                            <ul class="space-y-2 text-gray-300">
                                <li>🔒 Per-user data isolation</li>
                                <li>🚫 No permanent data retention</li>
                                <li>📊 Rate limiting and monitoring</li>
                                <li>🏢 Enterprise-grade infrastructure</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Data Sharing -->
            <div class="bg-gray-800 rounded-2xl p-8">
                <h2 class="text-3xl font-bold mb-6 flex items-center">
                    <i class="fas fa-share-alt text-indigo-400 mr-3"></i>
                    Data Sharing and Third Parties
                </h2>
                <div class="space-y-4">
                    <div class="border-l-4 border-green-400 bg-gray-900 p-6 rounded-r-lg">
                        <h3 class="text-xl font-semibold text-green-400 mb-3">Authorized Sharing</h3>
                        <p class="text-gray-300 mb-3">
                            We only share your data with services you explicitly authorize:
                        </p>
                        <ul class="list-disc list-inside space-y-2 text-gray-300 ml-4">
                            <li><strong>AI Assistants:</strong> Data is shared with your chosen AI assistant (Poke.com, Claude Desktop, etc.) only when you make specific requests</li>
                            <li><strong>Cloudflare:</strong> Our hosting provider processes data to deliver the service (covered by their privacy policy)</li>
                            <li><strong>Strava:</strong> We communicate with Strava's API to fetch your authorized data</li>
                        </ul>
                    </div>
                    
                    <div class="border-l-4 border-red-400 bg-gray-900 p-6 rounded-r-lg">
                        <h3 class="text-xl font-semibold text-red-400 mb-3">No Unauthorized Sharing</h3>
                        <p class="text-gray-300">
                            We never share your data with advertisers, marketers, data brokers, or any unauthorized third parties. Your fitness data belongs to you and stays private.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Your Rights -->
            <div class="bg-gray-800 rounded-2xl p-8">
                <h2 class="text-3xl font-bold mb-6 flex items-center">
                    <i class="fas fa-user-shield text-cyan-400 mr-3"></i>
                    Your Privacy Rights
                </h2>
                <div class="grid md:grid-cols-2 gap-6">
                    <div class="space-y-4">
                        <div class="bg-gray-900 rounded-lg p-4">
                            <h3 class="font-semibold text-orange-400 mb-2">🔓 Access Your Data</h3>
                            <p class="text-sm text-gray-300">Request a copy of all personal data we have about you</p>
                        </div>
                        <div class="bg-gray-900 rounded-lg p-4">
                            <h3 class="font-semibold text-orange-400 mb-2">✏️ Correct Your Data</h3>
                            <p class="text-sm text-gray-300">Update any incorrect information in our systems</p>
                        </div>
                        <div class="bg-gray-900 rounded-lg p-4">
                            <h3 class="font-semibold text-orange-400 mb-2">🗑️ Delete Your Data</h3>
                            <p class="text-sm text-gray-300">Request immediate deletion of all your personal data</p>
                        </div>
                    </div>
                    <div class="space-y-4">
                        <div class="bg-gray-900 rounded-lg p-4">
                            <h3 class="font-semibold text-orange-400 mb-2">📦 Port Your Data</h3>
                            <p class="text-sm text-gray-300">Export your data in a machine-readable format</p>
                        </div>
                        <div class="bg-gray-900 rounded-lg p-4">
                            <h3 class="font-semibold text-orange-400 mb-2">🛑 Opt-Out</h3>
                            <p class="text-sm text-gray-300">Disconnect your account and stop data processing</p>
                        </div>
                        <div class="bg-gray-900 rounded-lg p-4">
                            <h3 class="font-semibold text-orange-400 mb-2">📞 Contact Support</h3>
                            <p class="text-sm text-gray-300">Get help with any privacy-related concerns</p>
                        </div>
                    </div>
                </div>
                <div class="mt-6 p-4 bg-blue-900/30 border border-blue-400 rounded-lg">
                    <p class="text-blue-300">
                        <strong>To exercise your rights:</strong> Email us at <a href="mailto:help@stravamcp.com" class="text-blue-400 hover:text-blue-300">help@stravamcp.com</a> with your request. We'll respond within 30 days.
                    </p>
                </div>
            </div>

            <!-- Data Retention -->
            <div class="bg-gray-800 rounded-2xl p-8">
                <h2 class="text-3xl font-bold mb-6 flex items-center">
                    <i class="fas fa-clock text-orange-400 mr-3"></i>
                    Data Retention
                </h2>
                <div class="space-y-4">
                    <div class="bg-gray-900 rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-orange-400 mb-4">Automatic Deletion</h3>
                        <div class="space-y-3 text-gray-300">
                            <p><strong>Authentication Sessions:</strong> 30 days (automatically renewed when active)</p>
                            <p><strong>OAuth Tokens:</strong> Until you disconnect your account</p>
                            <p><strong>Activity Data:</strong> Not stored - fetched in real-time only</p>
                            <p><strong>Technical Logs:</strong> 90 days for security and troubleshooting</p>
                        </div>
                    </div>
                    
                    <div class="bg-gray-900 rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-orange-400 mb-4">Account Deletion</h3>
                        <p class="text-gray-300">
                            When you disconnect your Strava account or request deletion, we immediately remove all stored authentication data and personal information. This action is irreversible.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Updates to Policy -->
            <div class="bg-gray-800 rounded-2xl p-8">
                <h2 class="text-3xl font-bold mb-6 flex items-center">
                    <i class="fas fa-edit text-green-400 mr-3"></i>
                    Updates to This Policy
                </h2>
                <p class="text-gray-300 mb-4">
                    We may update this Privacy Policy from time to time to reflect changes in our practices or for legal reasons. When we make changes:
                </p>
                <ul class="list-disc list-inside space-y-2 text-gray-300 ml-4 mb-4">
                    <li>We'll update the "Last updated" date at the top of this policy</li>
                    <li>For significant changes, we'll notify users via email or dashboard notification</li>
                    <li>Continued use of our service after changes constitutes acceptance of the updated policy</li>
                </ul>
                <p class="text-gray-300">
                    We recommend reviewing this policy periodically to stay informed about how we protect your information.
                </p>
            </div>

            <!-- Contact -->
            <div class="bg-gray-800 rounded-2xl p-8">
                <h2 class="text-3xl font-bold mb-6 flex items-center">
                    <i class="fas fa-envelope text-purple-400 mr-3"></i>
                    Contact Us
                </h2>
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 class="text-xl font-semibold text-orange-400 mb-4">Privacy Questions</h3>
                        <p class="text-gray-300 mb-4">
                            If you have questions about this Privacy Policy or how we handle your data, please contact us:
                        </p>
                        <div class="space-y-2 text-gray-300">
                            <p><strong>Email:</strong> <a href="mailto:help@stravamcp.com" class="text-orange-400 hover:text-orange-300">help@stravamcp.com</a></p>
                            <p><strong>Subject:</strong> Privacy Policy Question</p>
                            <p><strong>Response Time:</strong> Within 48 hours</p>
                        </div>
                    </div>
                    <div>
                        <h3 class="text-xl font-semibold text-orange-400 mb-4">Data Requests</h3>
                        <p class="text-gray-300 mb-4">
                            To exercise your privacy rights or request data deletion:
                        </p>
                        <div class="space-y-2 text-gray-300">
                            <p><strong>Email:</strong> <a href="mailto:help@stravamcp.com" class="text-orange-400 hover:text-orange-300">help@stravamcp.com</a></p>
                            <p><strong>Subject:</strong> Data Request - [Your Request Type]</p>
                            <p><strong>Response Time:</strong> Within 30 days</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-950 py-8 mt-12">
        <div class="max-w-7xl mx-auto px-6 text-center text-gray-400">
            <div class="flex items-center justify-center space-x-6 mb-6">
                <a href="/terms" class="hover:text-white transition-colors">Terms of Service</a>
                <a href="/about" class="hover:text-white transition-colors">About</a>
                <a href="/support" class="hover:text-white transition-colors">Support</a>
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

export const TERMS_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Terms of Service - Strava MCP Server</title>
    <meta name="description" content="Terms of Service for Strava MCP Server - Legal terms and conditions for using our Model Context Protocol service.">
    <link rel="icon" type="image/png" href="https://res.cloudinary.com/dxoyxnrjl/image/upload/v1758961029/Strava_MCP_Logo_4_u0pe64.png">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
</head>
<body class="bg-gray-900 text-white">
    <!-- Navigation -->
    <nav class="bg-gray-800 border-b border-gray-700">
        <div class="max-w-7xl mx-auto px-6 py-4">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-3">
                    <img src="https://res.cloudinary.com/dxoyxnrjl/image/upload/v1758961029/Strava_MCP_Logo_4_u0pe64.png" alt="Strava MCP Logo" class="w-10 h-10 rounded-lg">
                    <span class="text-xl font-bold">Strava MCP Server</span>
                </div>
                <div class="flex items-center space-x-6">
                    <a href="/" class="text-gray-300 hover:text-white transition-colors">Home</a>
                    <a href="/about" class="text-gray-300 hover:text-white transition-colors">About</a>
                    <a href="/support" class="text-gray-300 hover:text-white transition-colors">Support</a>
                    <a href="/auth" class="bg-orange-500 hover:bg-orange-600 px-4 py-2 rounded-lg font-semibold transition-colors">Get Started</a>
                </div>
            </div>
        </div>
    </nav>

    <div class="max-w-4xl mx-auto px-6 py-12">
        <div class="text-center mb-12">
            <h1 class="text-5xl font-bold mb-6 bg-gradient-to-r from-orange-400 to-orange-600 bg-clip-text text-transparent">
                Terms of Service
            </h1>
            <p class="text-xl text-gray-400">
                Legal terms and conditions for using Strava MCP Server
            </p>
            <p class="text-sm text-gray-500 mt-2">
                Last updated: October 2025
            </p>
        </div>

        <div class="space-y-8">
            <!-- Acceptance -->
            <div class="bg-gray-800 rounded-2xl p-8">
                <h2 class="text-3xl font-bold mb-6 flex items-center">
                    <i class="fas fa-handshake text-green-400 mr-3"></i>
                    Acceptance of Terms
                </h2>
                <div class="space-y-4 text-gray-300">
                    <p>
                        By accessing or using Strava MCP Server ("the Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, do not use the Service.
                    </p>
                    <p>
                        These Terms constitute a legally binding agreement between you and Strava MCP Server. Your use of the Service is also subject to our Privacy Policy.
                    </p>
                    <div class="bg-blue-900/30 border border-blue-400 rounded-lg p-4">
                        <p class="text-blue-300">
                            <strong>Service Provider:</strong> Strava MCP Server<br>
                            <strong>Contact:</strong> <a href="mailto:help@stravamcp.com" class="text-blue-400 hover:text-blue-300">help@stravamcp.com</a>
                        </p>
                    </div>
                </div>
            </div>

            <!-- Service Description -->
            <div class="bg-gray-800 rounded-2xl p-8">
                <h2 class="text-3xl font-bold mb-6 flex items-center">
                    <i class="fas fa-server text-blue-400 mr-3"></i>
                    Description of Service
                </h2>
                <div class="space-y-4 text-gray-300">
                    <p>
                        Strava MCP Server provides a Model Context Protocol (MCP) interface that enables AI assistants to access your personal Strava fitness data with your explicit authorization.
                    </p>
                    <div class="bg-gray-900 rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-orange-400 mb-4">The Service Includes:</h3>
                        <ul class="space-y-2 ml-4">
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-400 mr-3 mt-1"></i>
                                <span>Secure OAuth authentication with Strava</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-400 mr-3 mt-1"></i>
                                <span>MCP-compliant API endpoints for AI assistants</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-400 mr-3 mt-1"></i>
                                <span>Real-time access to your Strava activity data</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-400 mr-3 mt-1"></i>
                                <span>Automatic token refresh and session management</span>
                            </li>
                            <li class="flex items-start">
                                <i class="fas fa-check text-green-400 mr-3 mt-1"></i>
                                <span>Personal dashboard and support resources</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- User Responsibilities -->
            <div class="bg-gray-800 rounded-2xl p-8">
                <h2 class="text-3xl font-bold mb-6 flex items-center">
                    <i class="fas fa-user-check text-purple-400 mr-3"></i>
                    Your Responsibilities
                </h2>
                <div class="space-y-6">
                    <div class="bg-gray-900 rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-green-400 mb-4">✅ You Must:</h3>
                        <ul class="space-y-2 text-gray-300">
                            <li>• Provide accurate information during account setup</li>
                            <li>• Maintain the security of your authentication credentials</li>
                            <li>• Use the Service in compliance with all applicable laws</li>
                            <li>• Respect Strava's Terms of Service and Community Standards</li>
                            <li>• Only access your own personal Strava data</li>
                            <li>• Report any suspected security vulnerabilities</li>
                        </ul>
                    </div>
                    
                    <div class="bg-gray-900 rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-red-400 mb-4">❌ You Must Not:</h3>
                        <ul class="space-y-2 text-gray-300">
                            <li>• Attempt to access other users' data or accounts</li>
                            <li>• Use the Service for illegal or unauthorized purposes</li>
                            <li>• Reverse engineer, modify, or tamper with the Service</li>
                            <li>• Share your personal MCP token with unauthorized parties</li>
                            <li>• Use the Service to harass, abuse, or harm others</li>
                            <li>• Overload our servers with excessive requests</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Data and Privacy -->
            <div class="bg-gray-800 rounded-2xl p-8">
                <h2 class="text-3xl font-bold mb-6 flex items-center">
                    <i class="fas fa-shield-alt text-yellow-400 mr-3"></i>
                    Data Usage and Privacy
                </h2>
                <div class="space-y-4">
                    <div class="border-l-4 border-green-400 bg-gray-900 p-6 rounded-r-lg">
                        <h3 class="text-xl font-semibold text-green-400 mb-3">Our Commitments</h3>
                        <ul class="space-y-2 text-gray-300">
                            <li>• We will never train AI models on your Strava data</li>
                            <li>• Your data is never shared without your explicit consent</li>
                            <li>• We implement industry-standard security measures</li>
                            <li>• We respect your Strava privacy settings</li>
                            <li>• We provide transparent data handling practices</li>
                        </ul>
                    </div>
                    
                    <div class="border-l-4 border-blue-400 bg-gray-900 p-6 rounded-r-lg">
                        <h3 class="text-xl font-semibold text-blue-400 mb-3">Your Data Rights</h3>
                        <p class="text-gray-300 mb-3">
                            You retain full ownership of your Strava data. You may:
                        </p>
                        <ul class="space-y-2 text-gray-300">
                            <li>• Disconnect your account at any time</li>
                            <li>• Request deletion of stored authentication data</li>
                            <li>• Control which AI assistants access your data</li>
                            <li>• Monitor your data usage through our dashboard</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Service Availability -->
            <div class="bg-gray-800 rounded-2xl p-8">
                <h2 class="text-3xl font-bold mb-6 flex items-center">
                    <i class="fas fa-cloud text-indigo-400 mr-3"></i>
                    Service Availability
                </h2>
                <div class="space-y-4 text-gray-300">
                    <p>
                        We strive to maintain high availability but cannot guarantee uninterrupted service. The Service may be temporarily unavailable for maintenance, updates, or due to factors beyond our control.
                    </p>
                    
                    <div class="bg-gray-900 rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-orange-400 mb-4">Service Dependencies</h3>
                        <p class="mb-3">Our Service depends on third-party services:</p>
                        <ul class="space-y-2">
                            <li>• <strong>Strava API:</strong> Subject to Strava's availability and rate limits</li>
                            <li>• <strong>Cloudflare:</strong> Hosting infrastructure and global network</li>
                            <li>• <strong>AI Assistants:</strong> Integration depends on MCP protocol support</li>
                        </ul>
                    </div>
                    
                    <p>
                        We will make reasonable efforts to notify users of planned maintenance or significant service disruptions.
                    </p>
                </div>
            </div>

            <!-- Intellectual Property -->
            <div class="bg-gray-800 rounded-2xl p-8">
                <h2 class="text-3xl font-bold mb-6 flex items-center">
                    <i class="fas fa-copyright text-cyan-400 mr-3"></i>
                    Intellectual Property
                </h2>
                <div class="space-y-4 text-gray-300">
                    <div class="bg-gray-900 rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-orange-400 mb-4">Our Intellectual Property</h3>
                        <p class="mb-3">
                            The Service, including its software, design, and documentation, is owned by Strava MCP Server and protected by intellectual property laws.
                        </p>
                        <p>
                            We grant you a limited, non-exclusive, non-transferable license to use the Service for its intended purpose.
                        </p>
                    </div>
                    
                    <div class="bg-gray-900 rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-orange-400 mb-4">Your Data Ownership</h3>
                        <p>
                            You retain all rights to your Strava data accessed through our Service. We claim no ownership over your personal fitness information, activities, or other data.
                        </p>
                    </div>
                    
                    <div class="bg-gray-900 rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-orange-400 mb-4">Third-Party Trademarks</h3>
                        <p>
                            "Strava" and related marks are trademarks of Strava, Inc. We are not affiliated with or endorsed by Strava, Inc.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Limitations and Disclaimers -->
            <div class="bg-gray-800 rounded-2xl p-8">
                <h2 class="text-3xl font-bold mb-6 flex items-center">
                    <i class="fas fa-exclamation-triangle text-yellow-400 mr-3"></i>
                    Limitations and Disclaimers
                </h2>
                <div class="space-y-4">
                    <div class="border-l-4 border-yellow-400 bg-gray-900 p-6 rounded-r-lg">
                        <h3 class="text-xl font-semibold text-yellow-400 mb-3">Service "As Is"</h3>
                        <p class="text-gray-300">
                            The Service is provided "as is" without warranties of any kind. We disclaim all warranties, express or implied, including merchantability, fitness for a particular purpose, and non-infringement.
                        </p>
                    </div>
                    
                    <div class="border-l-4 border-red-400 bg-gray-900 p-6 rounded-r-lg">
                        <h3 class="text-xl font-semibold text-red-400 mb-3">Limitation of Liability</h3>
                        <p class="text-gray-300 mb-3">
                            To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to:
                        </p>
                        <ul class="space-y-1 text-gray-300 ml-4">
                            <li>• Loss of data or information</li>
                            <li>• Business interruption</li>
                            <li>• Loss of profits or revenue</li>
                            <li>• Damage to reputation</li>
                        </ul>
                    </div>
                    
                    <div class="border-l-4 border-blue-400 bg-gray-900 p-6 rounded-r-lg">
                        <h3 class="text-xl font-semibold text-blue-400 mb-3">Maximum Liability</h3>
                        <p class="text-gray-300">
                            Our total liability for any claims related to the Service shall not exceed the amount you paid us (if any) in the 12 months preceding the claim. Since our Service is currently free, this would be $0.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Termination -->
            <div class="bg-gray-800 rounded-2xl p-8">
                <h2 class="text-3xl font-bold mb-6 flex items-center">
                    <i class="fas fa-times-circle text-red-400 mr-3"></i>
                    Termination
                </h2>
                <div class="space-y-4 text-gray-300">
                    <div class="bg-gray-900 rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-orange-400 mb-4">Your Right to Terminate</h3>
                        <p class="mb-3">
                            You may stop using the Service at any time by:
                        </p>
                        <ul class="space-y-2">
                            <li>• Disconnecting your Strava account from our dashboard</li>
                            <li>• Revoking authorization in your Strava account settings</li>
                            <li>• Contacting us to request account deletion</li>
                        </ul>
                    </div>
                    
                    <div class="bg-gray-900 rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-orange-400 mb-4">Our Right to Terminate</h3>
                        <p class="mb-3">
                            We may suspend or terminate your access if you:
                        </p>
                        <ul class="space-y-2">
                            <li>• Violate these Terms of Service</li>
                            <li>• Use the Service for illegal purposes</li>
                            <li>• Attempt to compromise security</li>
                            <li>• Abuse or overload our systems</li>
                        </ul>
                    </div>
                    
                    <div class="bg-gray-900 rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-orange-400 mb-4">Effect of Termination</h3>
                        <p>
                            Upon termination, we will immediately delete your stored authentication data and discontinue access to your Strava information. Some provisions of these Terms will survive termination.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Changes to Terms -->
            <div class="bg-gray-800 rounded-2xl p-8">
                <h2 class="text-3xl font-bold mb-6 flex items-center">
                    <i class="fas fa-edit text-green-400 mr-3"></i>
                    Changes to Terms
                </h2>
                <div class="space-y-4 text-gray-300">
                    <p>
                        We reserve the right to modify these Terms at any time. When we make changes:
                    </p>
                    <ul class="list-disc list-inside space-y-2 ml-4 mb-4">
                        <li>We'll update the "Last updated" date</li>
                        <li>For significant changes, we'll provide 30 days notice via email or dashboard notification</li>
                        <li>Continued use after changes constitutes acceptance of the new Terms</li>
                        <li>If you don't agree to changes, you may terminate your use of the Service</li>
                    </ul>
                    
                    <div class="bg-blue-900/30 border border-blue-400 rounded-lg p-4">
                        <p class="text-blue-300">
                            <strong>Tip:</strong> Bookmark this page and check periodically for updates to stay informed of any changes.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Governing Law -->
            <div class="bg-gray-800 rounded-2xl p-8">
                <h2 class="text-3xl font-bold mb-6 flex items-center">
                    <i class="fas fa-gavel text-purple-400 mr-3"></i>
                    Legal Information
                </h2>
                <div class="space-y-4 text-gray-300">
                    <div class="bg-gray-900 rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-orange-400 mb-4">Governing Law</h3>
                        <p>
                            These Terms are governed by the laws of the jurisdiction where our service is operated, without regard to conflict of law provisions.
                        </p>
                    </div>
                    
                    <div class="bg-gray-900 rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-orange-400 mb-4">Dispute Resolution</h3>
                        <p class="mb-3">
                            Before pursuing legal action, we encourage you to contact us to resolve any disputes amicably. For formal disputes:
                        </p>
                        <ul class="space-y-2">
                            <li>• First contact our support team at <a href="mailto:help@stravamcp.com" class="text-orange-400 hover:text-orange-300">help@stravamcp.com</a></li>
                            <li>• We'll work in good faith to resolve the issue within 60 days</li>
                            <li>• If unresolved, disputes may be subject to binding arbitration</li>
                        </ul>
                    </div>
                    
                    <div class="bg-gray-900 rounded-lg p-6">
                        <h3 class="text-xl font-semibold text-orange-400 mb-4">Severability</h3>
                        <p>
                            If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions will continue in full force and effect.
                        </p>
                    </div>
                </div>
            </div>

            <!-- Contact Information -->
            <div class="bg-gray-800 rounded-2xl p-8">
                <h2 class="text-3xl font-bold mb-6 flex items-center">
                    <i class="fas fa-envelope text-blue-400 mr-3"></i>
                    Contact Information
                </h2>
                <div class="grid md:grid-cols-2 gap-6">
                    <div>
                        <h3 class="text-xl font-semibold text-orange-400 mb-4">Legal Questions</h3>
                        <p class="text-gray-300 mb-4">
                            For questions about these Terms of Service:
                        </p>
                        <div class="space-y-2 text-gray-300">
                            <p><strong>Email:</strong> <a href="mailto:help@stravamcp.com" class="text-orange-400 hover:text-orange-300">help@stravamcp.com</a></p>
                            <p><strong>Subject:</strong> Terms of Service Question</p>
                            <p><strong>Website:</strong> <a href="https://stravamcp.com" class="text-orange-400 hover:text-orange-300">stravamcp.com</a></p>
                        </div>
                    </div>
                    <div>
                        <h3 class="text-xl font-semibold text-orange-400 mb-4">General Support</h3>
                        <p class="text-gray-300 mb-4">
                            For technical support or general inquiries:
                        </p>
                        <div class="space-y-2 text-gray-300">
                            <p><strong>Support Center:</strong> <a href="/support" class="text-orange-400 hover:text-orange-300">/support</a></p>
                            <p><strong>Email:</strong> <a href="mailto:help@stravamcp.com" class="text-orange-400 hover:text-orange-300">help@stravamcp.com</a></p>
                            <p><strong>Response Time:</strong> Within 24 hours</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Footer -->
    <footer class="bg-gray-950 py-8 mt-12">
        <div class="max-w-7xl mx-auto px-6 text-center text-gray-400">
            <div class="flex items-center justify-center space-x-6 mb-6">
                <a href="/privacy" class="hover:text-white transition-colors">Privacy Policy</a>
                <a href="/about" class="hover:text-white transition-colors">About</a>
                <a href="/support" class="hover:text-white transition-colors">Support</a>
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
