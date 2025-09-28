import { Context } from 'hono';
import { StravaApiProxy } from './middleware';

// API handlers that mirror the original MCP tools
export class StravaApiHandlers {

  // GET /api/athlete/profile - Get authenticated athlete profile
  static async getAthleteProfile(c: Context) {
    try {
      const token = c.get('token') as string;
      const data = await StravaApiProxy.fetchJson('/athlete', token);
      
      return c.json(data);
    } catch (error) {
      console.error('Get athlete profile error:', error);
      return c.json(StravaApiProxy.formatError(error, 'get athlete profile'), 500);
    }
  }

  // GET /api/athlete/stats - Get athlete activity stats
  static async getAthleteStats(c: Context) {
    try {
      const token = c.get('token') as string;
      const session = c.get('session');
      const athleteId = session.athlete_id;
      
      const data = await StravaApiProxy.fetchJson(`/athletes/${athleteId}/stats`, token);
      
      return c.json(data);
    } catch (error) {
      console.error('Get athlete stats error:', error);
      return c.json(StravaApiProxy.formatError(error, 'get athlete stats'), 500);
    }
  }

  // GET /api/athlete/zones - Get heart rate and power zones
  static async getAthleteZones(c: Context) {
    try {
      const token = c.get('token') as string;
      const data = await StravaApiProxy.fetchJson('/athlete/zones', token);
      
      return c.json(data);
    } catch (error) {
      console.error('Get athlete zones error:', error);
      return c.json(StravaApiProxy.formatError(error, 'get athlete zones'), 500);
    }
  }

  // GET /api/activities/recent - Get recent activities
  static async getRecentActivities(c: Context) {
    try {
      const token = c.get('token') as string;
      const perPage = parseInt(c.req.query('per_page') || '30');
      
      const params: Record<string, number> = {};
      if (perPage) params.per_page = Math.min(perPage, 200); // Strava API limit
      
      const data = await StravaApiProxy.fetchJson('/athlete/activities', token, { params });
      
      return c.json(data);
    } catch (error) {
      console.error('Get recent activities error:', error);
      return c.json(StravaApiProxy.formatError(error, 'get recent activities'), 500);
    }
  }

  // GET /api/activities/all - Get all activities with pagination
  static async getAllActivities(c: Context) {
    try {
      const token = c.get('token') as string;
      const page = parseInt(c.req.query('page') || '1');
      const perPage = parseInt(c.req.query('per_page') || '30');
      
      const params: Record<string, number> = {
        page: Math.max(1, page),
        per_page: Math.min(perPage, 200)
      };
      
      const data = await StravaApiProxy.fetchJson('/athlete/activities', token, { params });
      
      return c.json(data);
    } catch (error) {
      console.error('Get all activities error:', error);
      return c.json(StravaApiProxy.formatError(error, 'get all activities'), 500);
    }
  }

  // GET /api/activities/:id - Get activity details by ID
  static async getActivityDetails(c: Context) {
    try {
      const token = c.get('token') as string;
      const activityId = c.req.param('id');
      
      if (!activityId || isNaN(parseInt(activityId))) {
        return c.json({ error: 'Invalid activity ID' }, 400);
      }
      
      const data = await StravaApiProxy.fetchJson(`/activities/${activityId}`, token);
      
      return c.json(data);
    } catch (error) {
      console.error('Get activity details error:', error);
      return c.json(StravaApiProxy.formatError(error, 'get activity details'), 500);
    }
  }

  // GET /api/activities/:id/streams - Get activity time-series data
  static async getActivityStreams(c: Context) {
    try {
      const token = c.get('token') as string;
      const activityId = c.req.param('id');
      
      if (!activityId || isNaN(parseInt(activityId))) {
        return c.json({ error: 'Invalid activity ID' }, 400);
      }
      
      const types = c.req.query('types') || 'time,distance,heartrate,cadence,watts';
      const resolution = c.req.query('resolution') || 'high';
      const seriesType = c.req.query('series_type') || 'distance';
      
      const params: Record<string, string> = {
        keys: types,
        key_by_type: 'true'
      };
      
      if (resolution) params.resolution = resolution;
      if (seriesType) params.series_type = seriesType;
      
      const data = await StravaApiProxy.fetchJson(`/activities/${activityId}/streams`, token, { params });
      
      return c.json(data);
    } catch (error) {
      console.error('Get activity streams error:', error);
      return c.json(StravaApiProxy.formatError(error, 'get activity streams'), 500);
    }
  }

  // GET /api/activities/:id/laps - Get activity laps
  static async getActivityLaps(c: Context) {
    try {
      const token = c.get('token') as string;
      const activityId = c.req.param('id');
      
      if (!activityId || isNaN(parseInt(activityId))) {
        return c.json({ error: 'Invalid activity ID' }, 400);
      }
      
      const data = await StravaApiProxy.fetchJson(`/activities/${activityId}/laps`, token);
      
      return c.json(data);
    } catch (error) {
      console.error('Get activity laps error:', error);
      return c.json(StravaApiProxy.formatError(error, 'get activity laps'), 500);
    }
  }

  // GET /api/segments/starred - List starred segments
  static async getStarredSegments(c: Context) {
    try {
      const token = c.get('token') as string;
      const data = await StravaApiProxy.fetchJson('/segments/starred', token);
      
      return c.json(data);
    } catch (error) {
      console.error('Get starred segments error:', error);
      return c.json(StravaApiProxy.formatError(error, 'get starred segments'), 500);
    }
  }

  // GET /api/segments/:id - Get segment details
  static async getSegment(c: Context) {
    try {
      const token = c.get('token') as string;
      const segmentId = c.req.param('id');
      
      if (!segmentId || isNaN(parseInt(segmentId))) {
        return c.json({ error: 'Invalid segment ID' }, 400);
      }
      
      const data = await StravaApiProxy.fetchJson(`/segments/${segmentId}`, token);
      
      return c.json(data);
    } catch (error) {
      console.error('Get segment error:', error);
      return c.json(StravaApiProxy.formatError(error, 'get segment'), 500);
    }
  }

  // GET /api/segments/explore - Explore segments in bounds
  static async exploreSegments(c: Context) {
    try {
      const token = c.get('token') as string;
      const bounds = c.req.query('bounds');
      
      if (!bounds) {
        return c.json({ error: 'Missing bounds parameter' }, 400);
      }
      
      const params: Record<string, string> = { bounds };
      
      const activityType = c.req.query('activity_type');
      if (activityType) params.activity_type = activityType;
      
      const minCat = c.req.query('min_cat');
      if (minCat) params.min_cat = minCat;
      
      const maxCat = c.req.query('max_cat');
      if (maxCat) params.max_cat = maxCat;
      
      const data = await StravaApiProxy.fetchJson('/segments/explore', token, { params });
      
      return c.json(data);
    } catch (error) {
      console.error('Explore segments error:', error);
      return c.json(StravaApiProxy.formatError(error, 'explore segments'), 500);
    }
  }

  // POST /api/segments/:id/star - Star/unstar segment
  static async starSegment(c: Context) {
    try {
      const token = c.get('token') as string;
      const segmentId = c.req.param('id');
      
      if (!segmentId || isNaN(parseInt(segmentId))) {
        return c.json({ error: 'Invalid segment ID' }, 400);
      }
      
      const body = await c.req.json();
      const starred = body.starred;
      
      if (typeof starred !== 'boolean') {
        return c.json({ error: 'Missing or invalid starred parameter' }, 400);
      }
      
      const data = await StravaApiProxy.fetchJson(`/segments/${segmentId}/starred`, token, {
        method: 'PUT',
        body: { starred }
      });
      
      return c.json(data);
    } catch (error) {
      console.error('Star segment error:', error);
      return c.json(StravaApiProxy.formatError(error, 'star segment'), 500);
    }
  }

  // GET /api/segments/efforts/:id - Get segment effort details
  static async getSegmentEffort(c: Context) {
    try {
      const token = c.get('token') as string;
      const effortId = c.req.param('id');
      
      if (!effortId || isNaN(parseInt(effortId))) {
        return c.json({ error: 'Invalid effort ID' }, 400);
      }
      
      const data = await StravaApiProxy.fetchJson(`/segment_efforts/${effortId}`, token);
      
      return c.json(data);
    } catch (error) {
      console.error('Get segment effort error:', error);
      return c.json(StravaApiProxy.formatError(error, 'get segment effort'), 500);
    }
  }

  // GET /api/segments/:id/efforts - List athlete's efforts on segment
  static async getSegmentEfforts(c: Context) {
    try {
      const token = c.get('token') as string;
      const segmentId = c.req.param('id');
      
      if (!segmentId || isNaN(parseInt(segmentId))) {
        return c.json({ error: 'Invalid segment ID' }, 400);
      }
      
      const params: Record<string, string | number> = {
        segment_id: parseInt(segmentId)
      };
      
      const startDate = c.req.query('start_date_local');
      if (startDate) params.start_date_local = startDate;
      
      const endDate = c.req.query('end_date_local');
      if (endDate) params.end_date_local = endDate;
      
      const perPage = c.req.query('per_page');
      if (perPage) params.per_page = Math.min(parseInt(perPage), 200);
      
      const data = await StravaApiProxy.fetchJson('/segment_efforts', token, { params });
      
      return c.json(data);
    } catch (error) {
      console.error('Get segment efforts error:', error);
      return c.json(StravaApiProxy.formatError(error, 'get segment efforts'), 500);
    }
  }

  // GET /api/routes - List athlete's routes
  static async getAthleteRoutes(c: Context) {
    try {
      const token = c.get('token') as string;
      const session = c.get('session');
      const athleteId = session.athlete_id;
      
      const params: Record<string, number> = {};
      
      const page = c.req.query('page');
      if (page) params.page = Math.max(1, parseInt(page));
      
      const perPage = c.req.query('per_page');
      if (perPage) params.per_page = Math.min(parseInt(perPage), 200);
      
      const data = await StravaApiProxy.fetchJson(`/athletes/${athleteId}/routes`, token, { params });
      
      return c.json(data);
    } catch (error) {
      console.error('Get athlete routes error:', error);
      return c.json(StravaApiProxy.formatError(error, 'get athlete routes'), 500);
    }
  }

  // GET /api/routes/:id - Get route details
  static async getRoute(c: Context) {
    try {
      const token = c.get('token') as string;
      const routeId = c.req.param('id');
      
      if (!routeId || isNaN(parseInt(routeId))) {
        return c.json({ error: 'Invalid route ID' }, 400);
      }
      
      const data = await StravaApiProxy.fetchJson(`/routes/${routeId}`, token);
      
      return c.json(data);
    } catch (error) {
      console.error('Get route error:', error);
      return c.json(StravaApiProxy.formatError(error, 'get route'), 500);
    }
  }

  // GET /api/routes/:id/export/gpx - Export route as GPX
  static async exportRouteGpx(c: Context) {
    try {
      const token = c.get('token') as string;
      const routeId = c.req.param('id');
      
      if (!routeId || isNaN(parseInt(routeId))) {
        return c.json({ error: 'Invalid route ID' }, 400);
      }
      
      const response = await StravaApiProxy.fetch(`/routes/${routeId}/export_gpx`, token);
      
      if (!response.ok) {
        const errorData = await response.text();
        return c.json({ error: `Failed to export GPX: ${response.status} ${errorData}` }, response.status);
      }
      
      const gpxData = await response.text();
      
      return c.text(gpxData, 200, {
        'Content-Type': 'application/gpx+xml',
        'Content-Disposition': `attachment; filename="route_${routeId}.gpx"`
      });
    } catch (error) {
      console.error('Export route GPX error:', error);
      return c.json(StravaApiProxy.formatError(error, 'export route GPX'), 500);
    }
  }

  // GET /api/routes/:id/export/tcx - Export route as TCX
  static async exportRouteTcx(c: Context) {
    try {
      const token = c.get('token') as string;
      const routeId = c.req.param('id');
      
      if (!routeId || isNaN(parseInt(routeId))) {
        return c.json({ error: 'Invalid route ID' }, 400);
      }
      
      const response = await StravaApiProxy.fetch(`/routes/${routeId}/export_tcx`, token);
      
      if (!response.ok) {
        const errorData = await response.text();
        return c.json({ error: `Failed to export TCX: ${response.status} ${errorData}` }, response.status);
      }
      
      const tcxData = await response.text();
      
      return c.text(tcxData, 200, {
        'Content-Type': 'application/tcx+xml',
        'Content-Disposition': `attachment; filename="route_${routeId}.tcx"`
      });
    } catch (error) {
      console.error('Export route TCX error:', error);
      return c.json(StravaApiProxy.formatError(error, 'export route TCX'), 500);
    }
  }

  // GET /api/clubs - List athlete's clubs
  static async getAthleteClubs(c: Context) {
    try {
      const token = c.get('token') as string;
      const data = await StravaApiProxy.fetchJson('/athlete/clubs', token);
      
      return c.json(data);
    } catch (error) {
      console.error('Get athlete clubs error:', error);
      return c.json(StravaApiProxy.formatError(error, 'get athlete clubs'), 500);
    }
  }
}