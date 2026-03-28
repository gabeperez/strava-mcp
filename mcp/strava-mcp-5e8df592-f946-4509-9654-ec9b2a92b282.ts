/**
 * MCP Integration: Strava MCP Server
 * Server: STRAVA_MCP_SERVER (token provided via env.POKE_STRAVA_TOKEN)
 */
import { callFunction, type CallToolResult } from "./call-function.ts";

const STRAVA_MCP_TOKEN = (globalThis as any).process?.env?.POKE_STRAVA_TOKEN ?? '';
const STRAVA_MCP_SERVER = STRAVA_MCP_TOKEN
  ? 'https://strava-mcp-oauth.perez-jg22.workers.dev/mcp?token=' + STRAVA_MCP_TOKEN
  : 'https://strava-mcp-oauth.perez-jg22.workers.dev/mcp';

// --- welcome-strava-mcp ---
export interface Input {
  [k: string]: unknown;
}

/** Welcome message and setup instructions for new users. Use this first to help users get started. */
export async function welcomeStravaMcp(params: Input): Promise<CallToolResult> {
  return await callFunction("strava-mcp-5e8df592-f946-4509-9654-ec9b2a92b282", "welcome-strava-mcp", params);
}

// --- authenticate-strava ---
export interface Input {
  [k: string]: unknown;
}

/** Get the Strava OAuth authentication URL to connect your account */
export async function authenticateStrava(params: Input): Promise<CallToolResult> {
  return await callFunction("strava-mcp-5e8df592-f946-4509-9654-ec9b2a92b282", "authenticate-strava", params);
}

// --- get-recent-activities ---
export interface Input {
  /**
   * Number of activities to retrieve (max 200)
   */
  per_page?: number;
  [k: string]: unknown;
}

/** Get recent Strava activities for the authenticated athlete */
export async function getRecentActivities(params: Input): Promise<CallToolResult> {
  return await callFunction("strava-mcp-5e8df592-f946-4509-9654-ec9b2a92b282", "get-recent-activities", params);
}

// --- get-athlete-profile ---
export interface Input {
  [k: string]: unknown;
}

/** Get the authenticated athlete profile information */
export async function getAthleteProfile(params: Input): Promise<CallToolResult> {
  return await callFunction("strava-mcp-5e8df592-f946-4509-9654-ec9b2a92b282", "get-athlete-profile", params);
}

// --- get-athlete-stats ---
export interface Input {
  [k: string]: unknown;
}

/** Get athlete activity statistics (recent, YTD, all-time) */
export async function getAthleteStats(params: Input): Promise<CallToolResult> {
  return await callFunction("strava-mcp-5e8df592-f946-4509-9654-ec9b2a92b282", "get-athlete-stats", params);
}

// --- get-activity-details ---
export interface Input {
  /**
   * The unique identifier of the activity
   */
  activityId: number;
  [k: string]: unknown;
}

/** Get detailed information about a specific activity */
export async function getActivityDetails(params: Input): Promise<CallToolResult> {
  return await callFunction("strava-mcp-5e8df592-f946-4509-9654-ec9b2a92b282", "get-activity-details", params);
}

// --- get-activity-streams ---
export interface Input {
  /**
   * The Strava activity identifier
   */
  id: number;
  /**
   * Comma-separated list of stream types
   */
  types?: string;
  /**
   * Data resolution
   */
  resolution?: "low" | "medium" | "high";
  [k: string]: unknown;
}

/** Get time-series data streams from a Strava activity */
export async function getActivityStreams(params: Input): Promise<CallToolResult> {
  return await callFunction("strava-mcp-5e8df592-f946-4509-9654-ec9b2a92b282", "get-activity-streams", params);
}

// --- get-starred-segments ---
export interface Input {
  [k: string]: unknown;
}

/** List the segments starred by the authenticated athlete */
export async function getStarredSegments(params: Input): Promise<CallToolResult> {
  return await callFunction("strava-mcp-5e8df592-f946-4509-9654-ec9b2a92b282", "get-starred-segments", params);
}

// --- explore-segments ---
export interface Input {
  /**
   * Comma-separated: south_west_lat,south_west_lng,north_east_lat,north_east_lng
   */
  bounds: string;
  /**
   * Filter by activity type
   */
  activity_type?: "running" | "riding";
  [k: string]: unknown;
}

/** Explore popular segments in a geographical area */
export async function exploreSegments(params: Input): Promise<CallToolResult> {
  return await callFunction("strava-mcp-5e8df592-f946-4509-9654-ec9b2a92b282", "explore-segments", params);
}

// --- get-athlete-routes ---
export interface Input {
  /**
   * Page number for pagination
   */
  page?: number;
  /**
   * Number of routes per page
   */
  per_page?: number;
  [k: string]: unknown;
}

/** List routes created by the authenticated athlete */
export async function getAthleteRoutes(params: Input): Promise<CallToolResult> {
  return await callFunction("strava-mcp-5e8df592-f946-4509-9654-ec9b2a92b282", "get-athlete-routes", params);
}