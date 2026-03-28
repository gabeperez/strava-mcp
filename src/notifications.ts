/**
 * Notification Provider Abstraction
 * Supports multiple LLM/notification providers: Poke, OpenClaw, and Manus
 */

export type NotificationProvider = 'poke' | 'openclaw' | 'manus';

export interface NotificationConfig {
  provider: NotificationProvider;
  api_key: string;
  /** OpenClaw gateway endpoint (e.g. http://localhost:18789 or a public URL) */
  endpoint?: string;
}

export interface NotificationResult {
  success: boolean;
  error?: string;
  data?: any;
}

/** Human-readable metadata for each provider */
export const PROVIDER_INFO: Record<NotificationProvider, {
  name: string;
  description: string;
  url: string;
  keyPlaceholder: string;
  keyLabel: string;
  needsEndpoint: boolean;
  endpointPlaceholder?: string;
  endpointLabel?: string;
}> = {
  poke: {
    name: 'Poke',
    description: 'Get pinged on Poke.com after each workout.',
    url: 'https://poke.com',
    keyPlaceholder: 'poke_xxxxxxxxxxxxxxxx',
    keyLabel: 'Poke API Key',
    needsEndpoint: false,
  },
  openclaw: {
    name: 'OpenClaw',
    description: 'Send workout notifications to your OpenClaw AI agent.',
    url: 'https://openclaw.ai',
    keyPlaceholder: 'your-gateway-token',
    keyLabel: 'Gateway Token',
    needsEndpoint: true,
    endpointPlaceholder: 'https://your-openclaw-instance:18789',
    endpointLabel: 'Gateway URL',
  },
  manus: {
    name: 'Manus',
    description: 'Create a task in Manus with your workout data.',
    url: 'https://manus.im',
    keyPlaceholder: 'your-manus-api-key',
    keyLabel: 'API Key',
    needsEndpoint: false,
  },
};

/**
 * Send a notification through the configured provider
 */
export async function sendNotification(
  message: string,
  config: NotificationConfig
): Promise<NotificationResult> {
  switch (config.provider) {
    case 'poke':
      return sendToPoke(message, config.api_key);
    case 'openclaw':
      return sendToOpenClaw(message, config.api_key, config.endpoint);
    case 'manus':
      return sendToManus(message, config.api_key);
    default:
      return { success: false, error: `Unknown provider: ${config.provider}` };
  }
}

/**
 * Send notification via Poke API
 * Docs: https://poke.com
 */
async function sendToPoke(message: string, apiKey: string): Promise<NotificationResult> {
  const response = await fetch('https://poke.com/api/v1/inbound/api-message', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return { success: false, error: `Poke API error: ${response.status} - ${errorText}` };
  }

  const data = await response.json();
  return { success: true, data };
}

/**
 * Send notification via OpenClaw Gateway API
 * Docs: https://docs.openclaw.ai
 * Endpoint: POST /api/sessions/main/messages
 * Auth: Bearer token in Authorization header
 * Default port: 18789
 */
async function sendToOpenClaw(
  message: string,
  gatewayToken: string,
  endpoint?: string
): Promise<NotificationResult> {
  const baseUrl = (endpoint || 'http://localhost:18789').replace(/\/+$/, '');
  const url = `${baseUrl}/api/sessions/main/messages`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${gatewayToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ message }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return { success: false, error: `OpenClaw API error: ${response.status} - ${errorText}` };
  }

  const data = await response.json().catch(() => ({}));
  return { success: true, data };
}

/**
 * Send notification via Manus API (create a task)
 * Docs: https://open.manus.im/docs
 * Endpoint: POST https://api.manus.ai/v1/tasks
 * Auth: API_KEY header
 */
async function sendToManus(message: string, apiKey: string): Promise<NotificationResult> {
  const response = await fetch('https://api.manus.ai/v1/tasks', {
    method: 'POST',
    headers: {
      'API_KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      prompt: message,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return { success: false, error: `Manus API error: ${response.status} - ${errorText}` };
  }

  const data = await response.json();
  return { success: true, data };
}

/** Mask an API key for display: first 5 chars + dots + last 4 chars */
export function maskKey(key: string): string {
  if (key.length > 9) {
    return key.slice(0, 5) + '••••••••' + key.slice(-4);
  }
  return '••••••••••••';
}
