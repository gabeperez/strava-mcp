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
export class SportsMCPServer {
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
        
        case 'get-activity-laps':
          if (!args?.id) throw new Error('Activity ID is required');
          result = await StravaApiProxy.fetchJson(`/activities/${args.id}/laps`, context.token);
          break;

        case 'get-activity-kudos':
          if (!args?.id) throw new Error('Activity ID is required');
          result = await StravaApiProxy.fetchJson(`/activities/${args.id}/kudos`, context.token, {
            params: { per_page: Math.min(args?.per_page || 30, 200) }
          });
          break;

        case 'get-activity-comments':
          if (!args?.id) throw new Error('Activity ID is required');
          result = await StravaApiProxy.fetchJson(`/activities/${args.id}/comments`, context.token, {
            params: { per_page: Math.min(args?.per_page || 30, 200) }
          });
          break;

        case 'get-athlete-zones':
          result = await StravaApiProxy.fetchJson('/athlete/zones', context.token);
          break;

        case 'get-athlete-clubs':
          result = await StravaApiProxy.fetchJson('/athlete/clubs', context.token);
          break;

        case 'get-club':
          if (!args?.id) throw new Error('Club ID is required');
          result = await StravaApiProxy.fetchJson(`/clubs/${args.id}`, context.token);
          break;

        case 'get-gear':
          if (!args?.id) throw new Error('Gear ID is required');
          result = await StravaApiProxy.fetchJson(`/gear/${args.id}`, context.token);
          break;

        case 'get-segment':
          if (!args?.id) throw new Error('Segment ID is required');
          result = await StravaApiProxy.fetchJson(`/segments/${args.id}`, context.token);
          break;

        case 'get-segment-efforts':
          if (!args?.segment_id) throw new Error('Segment ID is required');
          result = await StravaApiProxy.fetchJson(`/segments/${args.segment_id}/all_efforts`, context.token, {
            params: {
              athlete_id: context.session.athlete_id,  // scope to authenticated user's efforts only
              per_page: Math.min(args?.per_page || 30, 200)
            }
          });
          break;

        case 'get-segment-effort':
          if (!args?.id) throw new Error('Segment effort ID is required');
          result = await StravaApiProxy.fetchJson(`/segment_efforts/${args.id}`, context.token);
          break;

        case 'get-route':
          if (!args?.id) throw new Error('Route ID is required');
          result = await StravaApiProxy.fetchJson(`/routes/${args.id}`, context.token);
          break;

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
          name: 'SportsMCP',
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
      },
      {
        name: 'get-activity-laps',
        description: 'Get the lap splits for a specific Strava activity. Essential for analyzing interval training sessions, tempo runs, and structured workouts.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: 'The Strava activity ID' }
          },
          required: ['id']
        }
      },
      {
        name: 'get-activity-kudos',
        description: 'List the athletes who have kudoed a specific Strava activity.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: 'The Strava activity ID' },
            per_page: { type: 'number', description: 'Results per page (max 200)', default: 30 }
          },
          required: ['id']
        }
      },
      {
        name: 'get-activity-comments',
        description: 'List the comments on a specific Strava activity.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: 'The Strava activity ID' },
            per_page: { type: 'number', description: 'Results per page (max 200)', default: 30 }
          },
          required: ['id']
        }
      },
      {
        name: 'get-athlete-zones',
        description: 'Get the heart rate and power training zones for the authenticated athlete. Useful for understanding training intensity targets.',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'get-athlete-clubs',
        description: 'List the clubs the authenticated athlete is a member of.',
        inputSchema: { type: 'object', properties: {} }
      },
      {
        name: 'get-club',
        description: 'Get details about a specific Strava club, including member count, sport type, and location.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: 'The Strava club ID' }
          },
          required: ['id']
        }
      },
      {
        name: 'get-gear',
        description: 'Get details about a specific piece of gear (bike or shoes), including total mileage logged. Great for tracking equipment wear.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'string', description: 'The gear ID (e.g. b123456 for bikes, g123456 for shoes) — found on the athlete profile' }
          },
          required: ['id']
        }
      },
      {
        name: 'get-segment',
        description: 'Get detailed information about a specific Strava segment, including distance, elevation, grade, and the KOM/QOM time.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: 'The Strava segment ID' }
          },
          required: ['id']
        }
      },
      {
        name: 'get-segment-efforts',
        description: 'List all of the authenticated athlete\'s recorded efforts on a specific segment, sorted by start date. Shows your personal history and progression on that segment.',
        inputSchema: {
          type: 'object',
          properties: {
            segment_id: { type: 'number', description: 'The Strava segment ID' },
            per_page: { type: 'number', description: 'Results per page (max 200)', default: 30 }
          },
          required: ['segment_id']
        }
      },
      {
        name: 'get-segment-effort',
        description: 'Get detailed information about a specific segment effort, including elapsed time, average HR, average watts, and whether it was a PR.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: 'The segment effort ID' }
          },
          required: ['id']
        }
      },
      {
        name: 'get-route',
        description: 'Get details about a specific route, including distance, elevation gain, and estimated moving time.',
        inputSchema: {
          type: 'object',
          properties: {
            id: { type: 'number', description: 'The Strava route ID' }
          },
          required: ['id']
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
            return {
              jsonrpc: '2.0',
              id: request.id,
              result: {
                content: [
                  {
                    type: 'text',
                    text: `🎉 **Welcome back, ${context.session.athlete.firstname}!**\n\nYour Strava account is connected and ready to use with SportsMCP.\n\n🏃 **Try asking:**\n• "Show me my last 10 activities"\n• "Break down the laps on my interval run"\n• "What are my heart rate and power zones?"\n• "How many miles are on my shoes?"\n• "Show my history on segment 12345"\n• "Find climbs near Boulder, Colorado"\n• "What clubs am I a member of?"\n\n📊 **21 tools:** activities, laps, streams, kudos, comments, segments, segment efforts, routes, clubs, gear, zones & stats — all powered by Strava.`
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
                    text: `👋 **Welcome to SportsMCP** — your Strava data for any AI agent.\n\nSportsMCP works with **Claude Desktop, Cursor, Windsurf, Cline, Continue.dev, Poke**, and any other MCP-compatible client.\n\n🔐 **Quick Setup:**\n1. Visit [${baseUrl}/auth](${baseUrl}/auth) and connect your Strava account\n2. Copy your personal MCP URL from the dashboard\n3. Paste it into your AI agent's MCP settings\n\n**Config format (works in all major clients):**\n\`\`\`json\n{\n  "mcpServers": {\n    "sportsmcp": {\n      "url": "${baseUrl}/mcp?token=YOUR_TOKEN"\n    }\n  }\n}\n\`\`\`\n\n🏃 **Once connected, you can ask:**\n• "Show me my recent activities"\n• "Break down the laps on my last run"\n• "What are my heart rate zones?"\n• "How many miles are on my gear?"\n• "Find popular segments near me"\n\n📊 **21 tools:** activities, laps, streams, segments, routes, clubs, gear, zones & stats — powered by Strava.\n\n🔒 **Privacy:** Your personal URL is unique to you. Data is fetched live, never stored or shared.`
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

      // Append "View on Strava" links where applicable (Strava brand requirement)
      let stravaLinks = '';
      if (name === 'get-recent-activities' && Array.isArray(result)) {
        stravaLinks = '\n\n---\n**View on Strava:**\n' +
          result.slice(0, 10).map((a: any) =>
            `• [${a.name || 'Activity'}](https://www.strava.com/activities/${a.id})`
          ).join('\n');
      } else if (name === 'get-activity-details' && result?.id) {
        stravaLinks = `\n\n[View on Strava](https://www.strava.com/activities/${result.id})`;
      } else if (name === 'get-activity-streams' && args?.id) {
        stravaLinks = `\n\n[View on Strava](https://www.strava.com/activities/${args.id})`;
      } else if (name === 'get-athlete-profile' && result?.id) {
        stravaLinks = `\n\n[View profile on Strava](https://www.strava.com/athletes/${result.id})`;
      } else if (name === 'get-athlete-routes' && Array.isArray(result)) {
        stravaLinks = '\n\n---\n**View on Strava:**\n' +
          result.slice(0, 10).map((r: any) =>
            `• [${r.name || 'Route'}](https://www.strava.com/routes/${r.id})`
          ).join('\n');
      } else if (name === 'get-starred-segments' && Array.isArray(result)) {
        stravaLinks = '\n\n---\n**View on Strava:**\n' +
          result.slice(0, 10).map((s: any) =>
            `• [${s.name || 'Segment'}](https://www.strava.com/segments/${s.id})`
          ).join('\n');
      } else if (name === 'explore-segments' && result?.segments) {
        stravaLinks = '\n\n---\n**View on Strava:**\n' +
          result.segments.slice(0, 10).map((s: any) =>
            `• [${s.name || 'Segment'}](https://www.strava.com/segments/${s.id})`
          ).join('\n');
      } else if ((name === 'get-activity-laps' || name === 'get-activity-kudos' || name === 'get-activity-comments') && args?.id) {
        stravaLinks = `\n\n[View activity on Strava](https://www.strava.com/activities/${args.id})`;
      } else if (name === 'get-segment' && result?.id) {
        stravaLinks = `\n\n[View segment on Strava](https://www.strava.com/segments/${result.id})`;
      } else if (name === 'get-segment-efforts' && args?.segment_id) {
        stravaLinks = `\n\n[View segment on Strava](https://www.strava.com/segments/${args.segment_id})`;
      } else if (name === 'get-segment-effort' && result?.activity?.id) {
        stravaLinks = `\n\n[View activity on Strava](https://www.strava.com/activities/${result.activity.id})`;
      } else if (name === 'get-route' && result?.id) {
        stravaLinks = `\n\n[View route on Strava](https://www.strava.com/routes/${result.id})`;
      } else if (name === 'get-athlete-clubs' && Array.isArray(result)) {
        stravaLinks = '\n\n---\n**View on Strava:**\n' +
          result.slice(0, 10).map((c: any) =>
            `• [${c.name || 'Club'}](https://www.strava.com/clubs/${c.id})`
          ).join('\n');
      } else if (name === 'get-club' && result?.id) {
        stravaLinks = `\n\n[View club on Strava](https://www.strava.com/clubs/${result.id})`;
      }

      const resultText = typeof result === 'string' ? result : JSON.stringify(result, null, 2);

      return {
        jsonrpc: '2.0',
        id: request.id,
        result: {
          content: [
            {
              type: 'text',
              text: resultText + stravaLinks
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
// Supports the legacy HTTP+SSE transport used by Claude Desktop and other clients.
// For the newer Streamable HTTP transport, use POST /mcp directly.
export async function handleMCPOverSSE(c: Context) {
  const env = c.env as Env;
  const mcpServer = new SportsMCPServer(env);

  return streamSSE(c, async (stream) => {
    let context: any = {
      baseUrl: (() => {
        const host = c.req.header('host');
        if (host?.includes('stravamcp.com')) return 'https://stravamcp.com';
        return `https://${host || 'your-worker.workers.dev'}`;
      })()
    };

    // --- Authentication: prefer token query param, then fall back to cookie/device ---
    const personalToken = c.req.query('token');
    let authenticatedAthleteId: number | null = null;

    if (personalToken) {
      try {
        const personalData = await env.STRAVA_SESSIONS.get(`personal_mcp:${personalToken}`);
        if (personalData) {
          const tokenInfo = JSON.parse(personalData);
          authenticatedAthleteId = tokenInfo.athlete_id;
        }
      } catch (_) {}
    }

    if (!authenticatedAthleteId) {
      // Fall back to AuthMiddleware (cookie / device fingerprint)
      try {
        const authMiddleware = new AuthMiddleware(env);
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
        if (context.session) {
          authenticatedAthleteId = context.session.athlete_id;
        }
      } catch (_) {}
    }

    if (authenticatedAthleteId && !context.session) {
      try {
        const { KVSessionManager } = await import('./session');
        const sessionManager = new KVSessionManager(env);
        const session = await sessionManager.getSession(authenticatedAthleteId);
        if (session) {
          const now = Math.floor(Date.now() / 1000);
          if (session.expires_at <= now + 300) {
            const refreshed = await sessionManager.refreshToken(session);
            context.session = refreshed;
            context.token = refreshed.access_token;
          } else {
            context.session = session;
            context.token = session.access_token;
          }
        }
      } catch (_) {}
    }

    // Send server capabilities
    await stream.writeSSE({
      event: 'endpoint',
      data: `${context.baseUrl}/messages${personalToken ? `?token=${personalToken}` : ''}`
    });

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