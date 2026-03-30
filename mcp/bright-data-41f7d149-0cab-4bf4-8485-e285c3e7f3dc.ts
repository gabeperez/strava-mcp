/**
 * MCP Integration: brightdata-mcp
 * Server: BRIGHT_DATA_MCP_SERVER (token provided via env.POKE_BRIGHT_DATA_TOKEN)
 */
import { callFunction, type CallToolResult } from "./call-function.ts";

const BRIGHT_DATA_MCP_TOKEN = (globalThis as any).process?.env?.POKE_BRIGHT_DATA_TOKEN ?? '';
const BRIGHT_DATA_MCP_SERVER = BRIGHT_DATA_MCP_TOKEN
  ? 'https://mcp.brightdata.com/mcp?token=' + BRIGHT_DATA_MCP_TOKEN
  : 'https://mcp.brightdata.com/mcp';

// --- search_engine ---
export interface Input {
  query: string;
  /**
   * Pagination cursor for next page
   */
  cursor?: string;
  engine?: "google" | "bing" | "yandex";
}

/** Scrape search results from Google, Bing or Yandex. Returns SERP results in JSON or Markdown (URL, title, description), Ideal forgathering current information, news, and detailed search results. */
export async function searchEngine(params: Input): Promise<CallToolResult> {
  return await callFunction("bright-data-41f7d149-0cab-4bf4-8485-e285c3e7f3dc", "search_engine", params);
}

// --- scrape_as_markdown ---
export interface Input {
  url: string;
}

/** Scrape a single webpage URL with advanced options for content extraction and get back the results in MarkDown language. This tool can unlock any webpage even if it uses bot detection or CAPTCHA. */
export async function scrapeAsMarkdown(params: Input): Promise<CallToolResult> {
  return await callFunction("bright-data-41f7d149-0cab-4bf4-8485-e285c3e7f3dc", "scrape_as_markdown", params);
}

// --- search_engine_batch ---
export interface Input {
  /**
   * @minItems 1
   * @maxItems 10
   */
  queries:
    | [
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        }
      ]
    | [
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        }
      ]
    | [
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        }
      ]
    | [
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        }
      ]
    | [
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        }
      ]
    | [
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        }
      ]
    | [
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        }
      ]
    | [
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        }
      ]
    | [
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        }
      ]
    | [
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        },
        {
          query: string;
          cursor?: string;
          engine?: "google" | "bing" | "yandex";
        }
      ];
}

/** Run multiple search queries simultaneously. Returns JSON for Google, Markdown for Bing/Yandex. */
export async function searchEngineBatch(params: Input): Promise<CallToolResult> {
  return await callFunction("bright-data-41f7d149-0cab-4bf4-8485-e285c3e7f3dc", "search_engine_batch", params);
}

// --- scrape_batch ---
export interface Input {
  /**
   * Array of URLs to scrape (max 10)
   *
   * @minItems 1
   * @maxItems 10
   */
  urls:
    | [string]
    | [string, string]
    | [string, string, string]
    | [string, string, string, string]
    | [string, string, string, string, string]
    | [string, string, string, string, string, string]
    | [string, string, string, string, string, string, string]
    | [string, string, string, string, string, string, string, string]
    | [string, string, string, string, string, string, string, string, string]
    | [string, string, string, string, string, string, string, string, string, string];
}

/** Scrape multiple webpages URLs with advanced options for content extraction and get back the results in MarkDown language. This tool can unlock any webpage even if it uses bot detection or CAPTCHA. */
export async function scrapeBatch(params: Input): Promise<CallToolResult> {
  return await callFunction("bright-data-41f7d149-0cab-4bf4-8485-e285c3e7f3dc", "scrape_batch", params);
}