const DEFAULT_SERVER_URL = 'http://localhost:3000';
const PING_TIMEOUT = 5000;

let serverUrl = process.env.SYNC_SERVER_URL || DEFAULT_SERVER_URL;

export function setServerUrl(url: string): void {
  serverUrl = url;
}

export async function checkConnection(): Promise<boolean> {
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), PING_TIMEOUT);

    const res = await fetch(`${serverUrl}/api/health`, {
      method: 'HEAD',
      signal: controller.signal,
    });

    clearTimeout(timer);
    return res.ok;
  } catch {
    return false;
  }
}

export function getServerUrl(): string {
  return serverUrl;
}
