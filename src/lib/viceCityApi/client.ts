/**
 * Vice-City.app Official GTA VI Data API Client
 * Documentation: https://vice-city.app/developers
 * OpenAPI Spec: https://vice-city.app/openapi.json
 */

export interface ApiClientConfig {
  apiKey?: string;
  baseUrl?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    api_version?: string;
    data_version?: string;
    plan?: string;
    total?: number;
    docs?: string;
    attribution?: Array<{ name: string; url: string; license: string }>;
  };
  links?: {
    self?: string;
    next?: string | null;
    next_cursor?: string | null;
  };
  rateLimit?: {
    limit?: number;
    remaining?: number;
  };
}

export class ViceCityApiClient {
  private apiKey: string;
  private baseUrl: string;
  private timeoutMs: number;
  private maxRetries: number;

  constructor(config: ApiClientConfig = {}) {
    this.apiKey = config.apiKey || process.env.VICE_CITY_API_KEY || 'vc_demo';
    this.baseUrl = config.baseUrl || process.env.VICE_CITY_API_BASE_URL || 'https://vice-city.app/api/v1';
    this.timeoutMs = config.timeoutMs || 15000;
    this.maxRetries = config.maxRetries || 3;
  }

  public getPlanType(): 'demo' | 'developer' {
    return this.apiKey.startsWith('mn_live_') ? 'developer' : 'demo';
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseUrl}${endpoint}`;
    let attempt = 0;

    while (attempt <= this.maxRetries) {
      attempt++;
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

      try {
        const headers: Record<string, string> = {
          'x-api-key': this.apiKey,
          'Accept': 'application/json',
          'User-Agent': 'VicePulse-Sync/1.0 (+https://vicepulse.gg)',
          ...(options.headers as Record<string, string> || {}),
        };

        const response = await fetch(url, {
          ...options,
          headers,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const rateLimit = {
          limit: Number(response.headers.get('RateLimit-Limit')) || undefined,
          remaining: Number(response.headers.get('RateLimit-Remaining')) || undefined,
        };

        // Handle Rate Limiting (429)
        if (response.status === 429 && attempt <= this.maxRetries) {
          const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 500;
          console.warn(`[ViceCityAPI] Rate limited (429). Retrying in ${waitTime}ms (Attempt ${attempt}/${this.maxRetries})...`);
          await new Promise((r) => setTimeout(r, waitTime));
          continue;
        }

        // Handle Plan restriction (403 Developer key required)
        if (response.status === 403) {
          const errBody = await response.text();
          let parsedErr: any = {};
          try { parsedErr = JSON.parse(errBody); } catch {}
          const error: any = new Error(parsedErr.detail || `HTTP 403: Developer plan required for ${endpoint}`);
          error.status = 403;
          error.code = parsedErr.code || 'plan_upgrade_required';
          throw error;
        }

        if (!response.ok) {
          const errText = await response.text();
          const error: any = new Error(`ViceCity API error HTTP ${response.status}: ${errText.slice(0, 300)}`);
          error.status = response.status;
          throw error;
        }

        const json = await response.json();
        return {
          data: (json.data !== undefined ? json.data : json) as T,
          meta: json.meta,
          links: json.links,
          rateLimit,
        };
      } catch (err: any) {
        clearTimeout(timeoutId);

        if (err.status === 403) {
          throw err; // Do not retry 403
        }

        if (attempt > this.maxRetries) {
          console.error(`[ViceCityAPI] Request failed after ${this.maxRetries} attempts for ${url}:`, err.message);
          throw err;
        }

        const waitTime = Math.pow(2, attempt) * 1000;
        console.warn(`[ViceCityAPI] Request attempt ${attempt} failed (${err.message}). Retrying in ${waitTime}ms...`);
        await new Promise((r) => setTimeout(r, waitTime));
      }
    }

    throw new Error(`[ViceCityAPI] Failed to complete request to ${url}`);
  }

  // --- API Methods ---

  public async getIndex() {
    return this.request<any>('/');
  }

  public async getTypes() {
    return this.request<any>('/types');
  }

  public async getGameInfo() {
    return this.request<any>('/game');
  }

  public async getCollection(collection: string, params: { limit?: number; cursor?: string; lang?: string } = {}) {
    const q = new URLSearchParams();
    if (params.limit) q.set('limit', String(params.limit));
    if (params.cursor) q.set('cursor', params.cursor);
    if (params.lang) q.set('lang', params.lang);
    const queryString = q.toString() ? `?${q.toString()}` : '';
    return this.request<any[]>(`/${collection}${queryString}`);
  }

  public async getEntity(collection: string, slug: string, lang = 'en') {
    return this.request<any>(`/${collection}/${slug}?lang=${lang}`);
  }

  public async getRelated(collection: string, slug: string) {
    return this.request<any[]>(`/${collection}/${slug}/related`);
  }

  public async search(query: string, lang = 'en') {
    return this.request<any[]>(`/search?q=${encodeURIComponent(query)}&lang=${lang}`);
  }

  public async getMapLayer(layer: 'districts' | 'landmarks', bbox?: string, tag?: string) {
    const q = new URLSearchParams();
    if (bbox) q.set('bbox', bbox);
    if (tag) q.set('tag', tag);
    const queryString = q.toString() ? `?${q.toString()}` : '';
    return this.request<any>(`/map/${layer}${queryString}`);
  }

  public async getChanges(since: string) {
    return this.request<any[]>(`/changes?since=${encodeURIComponent(since)}`);
  }
}

export const viceCityApi = new ViceCityApiClient();
export default viceCityApi;
