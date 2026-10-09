// API and Backend URL configuration for Netlify & Local Development
export const BACKEND_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '');

export function getApiUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  if (!BACKEND_URL) {
    return cleanPath;
  }
  return `${BACKEND_URL}${cleanPath}`;
}

/**
 * Automatically intercepts relative /api/* fetch requests to route to VITE_BACKEND_URL
 * when configured (e.g. on Netlify).
 */
export function setupFetchInterceptor(): void {
  if (!BACKEND_URL) return;

  const originalFetch = window.fetch;
  window.fetch = function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    if (typeof input === 'string' && input.startsWith('/api')) {
      return originalFetch(`${BACKEND_URL}${input}`, init);
    }
    return originalFetch(input, init);
  };
}
