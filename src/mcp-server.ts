import { Context } from 'hono';
import { streamSSE } from 'hono/streaming';
import { Env } from './types';
import { AuthMiddleware } from './middleware';
import { StravaApiProxy } from './middleware';

// MCP Protocol types
interface MCPRequest {
  jsonrpc: string;
  id?: string | number | null;
  method: string;
  params?: any;
}

interface MCPResponse {
  jsonrpc: string;
  id?: string | number | null;
  result?: any;
  error?: {
    code: number;
    message: string;
    data?: any;
  };
}

interface MCPNotification {
  jsonrpc: string;
  method: string;
  params?: any;
}

// MCP Server implementation for Strava
export class StravaMCPServer {
  private env: Env;
  private authMiddleware: AuthMiddleware;

  constructor(env: Env) {
    this.env = env;
    this.authMiddleware = new AuthMiddleware(env);
  }

  // Handle MCP requests
  async handleMCPRequest(request: MCPRequest, context: any): Promise<MCPResponse> {
    try {
      switch (request.method) {
        case 'initialize':
          return this.handleInitialize(request);
        
        case 'tools/list':
          return this.handleToolsList(request);
        
        case 'tools/call':
          return await this.handleToolCall(request, context);
        
        case 'notifications/initialized':
          return { jsonrpc: '2.0', id: request.id, result: {} };
        
        default:
          return {
            jsonrpc: '2.0',
            id: request.id,
            error: {
              code: -32601,
              message: 'Method not found',
              data: { method: request.method }
            }
          };
      }
    } catch (error: any) {
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32603,
          message: 'Internal error',
          data: { message: error.message }
        }
      };
    }
  }

  private handleInitialize(request: MCPRequest): MCPResponse {
    return {
      jsonrpc: '2.0',
      id: request.id,
      result: {
        protocolVersion: '2024-11-05',
        capabilities: {
          tools: {}
        },
        serverInfo: {
          name: 'Strava MCP Server',
          version: '1.0.0'
        }
      }
    };
  }

  private handleToolsList(request: MCPRequest): MCPResponse {
    // Always include the authentication and welcome tools first
    const tools = [
      {
        name: 'welcome-strava-mcp',
        description: 'Welcome message and setup instructions for new users. Use this first to help users get started.',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'authenticate-strava',
        description: 'Get the Strava OAuth authentication URL to connect your account',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get-recent-activities',
        description: 'Get recent Strava activities for the authenticated athlete',
        inputSchema: {
          type: 'object',
          properties: {
            per_page: {
              type: 'number',
              description: 'Number of activities to retrieve (max 200)',
              default: 30
            }
          }
        }
      },
      {
        name: 'get-athlete-profile',
        description: 'Get the authenticated athlete profile information',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get-athlete-stats',
        description: 'Get athlete activity statistics (recent, YTD, all-time)',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'get-activity-details',
        description: 'Get detailed information about a specific activity',
        inputSchema: {
          type: 'object',
          properties: {
            activityId: {
              type: 'number',
              description: 'The unique identifier of the activity'
            }
          },
          required: ['activityId']
        }
      },
      {
        name: 'get-activity-streams',
        description: 'Get time-series data streams from a Strava activity',
        inputSchema: {
          type: 'object',
          properties: {
            id: {
              type: 'number',
              description: 'The Strava activity identifier'
            },
            types: {
              type: 'string',
              description: 'Comma-separated list of stream types',
              default: 'time,distance,heartrate,cadence,watts'
            },
            resolution: {
              type: 'string',
              description: 'Data resolution',
              enum: ['low', 'medium', 'high'],
              default: 'high'
            }
          },
          required: ['id']
        }
      },
      {
        name: 'get-starred-segments',
        description: 'List the segments starred by the authenticated athlete',
        inputSchema: {
          type: 'object',
          properties: {}
        }
      },
      {
        name: 'explore-segments',
        description: 'Explore popular segments in a geographical area',
        inputSchema: {
          type: 'object',
          properties: {
            bounds: {
              type: 'string',
              description: 'Comma-separated: south_west_lat,south_west_lng,north_east_lat,north_east_lng'
            },
            activity_type: {
              type: 'string',
              enum: ['running', 'riding'],
              description: 'Filter by activity type'
            }
          },
          required: ['bounds']
        }
      },
      {
        name: 'get-athlete-routes',
        description: 'List routes created by the authenticated athlete',
        inputSchema: {
          type: 'object',
          properties: {
            page: {
              type: 'number',
              description: 'Page number for pagination',
              default: 1
            },
            per_page: {
              type: 'number',
              description: 'Number of routes per page',
              default: 30
            }
          }
        }
      }
    ];

    return {
      jsonrpc: '2.0',
      id: request.id,
      result: { tools }
    };
  }

  private async handleToolCall(request: MCPRequest, context: any): Promise<MCPResponse> {
    const { name, arguments: args } = request.params;
    const baseUrl = context.baseUrl || 'https://your-worker-name.your-subdomain.workers.dev'; // fallback
    
    // Check if user is authenticated
    if (!context.session || !context.token) {
      return {
        jsonrpc: '2.0',
        id: request.id,
        result: {
          content: [
            {
              type: 'text',
              text: `🔐 **Authentication Required**\n\nTo use ${name}, please connect your Strava account first:\n\n👉 [Authenticate with Strava](${baseUrl}/auth)\n\nThis will allow the AI to access your Strava data securely. Each user authenticates with their own account - your data stays private!\n\nAfter authentication, try your request again.`
            }
          ]
        }
      };
    }

    try {
      let result;
      
      switch (name) {
        case 'welcome-strava-mcp':
          const isAuthenticated = !!(context.session && context.token);
          if (isAuthenticated) {
            result = {
              message: `Welcome back, ${context.session.athlete.firstname}! Your Strava account is connected.`,
              status: 'authenticated'
            };
            return {
              jsonrpc: '2.0',
              id: request.id,
              result: {
                content: [
                  {
                    type: 'text',
                    text: `🎉 **Welcome back, ${context.session.athlete.firstname}!**\n\nYour Strava account is connected and ready to use.\n\n🏃 **Try asking me:**\n• "Show me my recent activities"\n• "What was my heart rate data from my last run?"\n• "Get the power profile for my weekend ride"\n• "Find challenging climbs near Boulder, Colorado"\n\n📊 I can access all your Strava data including activities, segments, routes, and stats!`
                  }
                ]
              }
            };
          } else {
            return {
              jsonrpc: '2.0',
              id: request.id,
              result: {
                content: [
                  {
                    type: 'text',
                    text: `🎉 **Welcome to Strava MCP!**\n\nI can help you access and analyze your Strava data through natural language.\n\n🔐 **Quick Setup (just 2 clicks!):**\n\n1. 👉 [Connect your Strava account](${baseUrl}/auth)\n2. 📎 Copy your personal MCP URL from the success page\n3. 🔄 Replace this connection with your personal URL\n\n🏃 **After setup, I can help you:**\n• View recent activities and detailed workout data\n• Analyze heart rate, power, and performance metrics\n• Explore segments and find new routes\n• Get comprehensive athlete statistics\n\n📊 **Privacy Note:** Each user gets their own personal URL. Your data stays completely private!`
                  }
                ]
              }
            };
          }
        
        case 'authenticate-strava':
          // Generate a unique user session ID for this conversation
          const userSessionId = `user_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          
          // Store the user session temporarily
          await this.env.STRAVA_SESSIONS.put(`pending_auth:${userSessionId}`, JSON.stringify({
            created_at: Math.floor(Date.now() / 1000),
            status: 'pending'
          }), { expirationTtl: 1800 }); // 30 minutes
          
          const authUrl = `${baseUrl}/auth?session=${userSessionId}`;
          
          return {
            jsonrpc: '2.0',
            id: request.id,
            result: {
              content: [
                {
                  type: 'text',
                  text: `🔐 **Strava Authentication Required**\n\nTo access your Strava data, please authenticate first:\n\n👉 [Connect your Strava account](${authUrl})\n\n📄 **Instructions:**\n1. Click the link above to authenticate with Strava\n2. After authentication, come back and try your request again\n3. No need to update any URLs - just ask for your Strava data!\n\n🔄 **Then try:** "Show me my recent Strava activities"`
                }
              ],
              userSession: userSessionId // Pass this to the client for future requests
            }
          };
        
        case 'get-recent-activities':
          const perPage = args?.per_page || 30;
          result = await StravaApiProxy.fetchJson('/athlete/activities', context.token, {
            params: { per_page: Math.min(perPage, 200) }
          });
          break;
        
        case 'get-athlete-profile':
          result = await StravaApiProxy.fetchJson('/athlete', context.token);
          break;
        
        case 'get-athlete-stats':
          result = await StravaApiProxy.fetchJson(`/athletes/${context.session.athlete_id}/stats`, context.token);
          break;
        
        case 'get-activity-details':
          if (!args?.activityId) {
            throw new Error('Activity ID is required');
          }
          result = await StravaApiProxy.fetchJson(`/activities/${args.activityId}`, context.token);
          break;
        
        case 'get-activity-streams':
          if (!args?.id) {
            throw new Error('Activity ID is required');
          }
          const types = args.types || 'time,distance,heartrate,cadence,watts';
          const resolution = args.resolution || 'high';
          result = await StravaApiProxy.fetchJson(`/activities/${args.id}/streams`, context.token, {
            params: {
              keys: types,
              key_by_type: 'true',
              resolution
            }
          });
          break;
        
        case 'get-starred-segments':
          result = await StravaApiProxy.fetchJson('/segments/starred', context.token);
          break;
        
        case 'explore-segments':
          if (!args?.bounds) {
            throw new Error('Bounds parameter is required');
          }
          const exploreParams: any = { bounds: args.bounds };
          if (args.activity_type) exploreParams.activity_type = args.activity_type;
          result = await StravaApiProxy.fetchJson('/segments/explore', context.token, {
            params: exploreParams
          });
          break;
        
        case 'get-athlete-routes':
          const routeParams: any = {};
          if (args?.page) routeParams.page = args.page;
          if (args?.per_page) routeParams.per_page = Math.min(args.per_page, 200);
          result = await StravaApiProxy.fetchJson(`/athletes/${context.session.athlete_id}/routes`, context.token, {
            params: routeParams
          });
          break;
        
        default:
          return {
            jsonrpc: '2.0',
            id: request.id,
            error: {
              code: -32601,
              message: 'Tool not found',
              data: { tool: name }
            }
          };
      }

      return {
        jsonrpc: '2.0',
        id: request.id,
        result: {
          content: [
            {
              type: 'text',
              text: typeof result === 'string' ? result : JSON.stringify(result, null, 2)
            }
          ]
        }
      };

    } catch (error: any) {
      return {
        jsonrpc: '2.0',
        id: request.id,
        error: {
          code: -32603,
          message: 'Tool execution failed',
          data: { message: error.message, tool: name }
        }
      };
    }
  }
}

// MCP over SSE endpoint handler
export async function handleMCPOverSSE(c: Context) {
  const env = c.env as Env;
  const mcpServer = new StravaMCPServer(env);

  return streamSSE(c, async (stream) => {
    let context: any = {};
    
    // Try to get authentication context
    try {
      const authMiddleware = new AuthMiddleware(env);
      // We need to create a mock context for the middleware
      const mockContext = {
        req: c.req,
        env: c.env,
        get: () => null,
        set: (key: string, value: any) => {
          if (key === 'session') context.session = value;
          if (key === 'token') context.token = value;
        }
      };
      
      await authMiddleware.authenticate(mockContext as any, async () => {});
    } catch (error) {
      // Authentication failed - will be handled in tool calls
    }

    // Send server capabilities
    await stream.writeSSE({
      data: JSON.stringify({
        jsonrpc: '2.0',
        method: 'notifications/initialized',
        params: {}
      })
    });

    // Handle incoming messages
    const handleMessage = async (data: string) => {
      try {
        const request = JSON.parse(data) as MCPRequest;
        const response = await mcpServer.handleMCPRequest(request, context);
        
        await stream.writeSSE({
          data: JSON.stringify(response)
        });
      } catch (error) {
        await stream.writeSSE({
          data: JSON.stringify({
            jsonrpc: '2.0',
            error: {
              code: -32700,
              message: 'Parse error',
              data: { message: 'Invalid JSON' }
            }
          })
        });
      }
    };

    // Keep connection alive
    const keepAlive = setInterval(async () => {
      await stream.writeSSE({
        data: JSON.stringify({
          jsonrpc: '2.0',
          method: 'notifications/ping',
          params: { timestamp: Date.now() }
        })
      });
    }, 30000);

    // Cleanup on close
    stream.onAbort = () => {
      clearInterval(keepAlive);
    };
  });
}