/**
 * Privacy-Conscious Client-Side Analytics Engine
 *
 * Implements Section 19 event tracking without third-party cookies or PII.
 * Configurable via NEXT_PUBLIC_ANALYTICS_ENABLED.
 */

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp: string;
}

const isAnalyticsEnabled = typeof process !== 'undefined' && process.env.NEXT_PUBLIC_ANALYTICS_ENABLED !== 'false';

export function trackEvent(eventName: string, properties: Record<string, any> = {}) {
  if (typeof window === 'undefined' || !isAnalyticsEnabled) return;

  const payload: AnalyticsEvent = {
    event: eventName,
    properties: {
      ...properties,
      path: window.location.pathname,
      referrer: document.referrer ? new URL(document.referrer).hostname : 'direct',
    },
    timestamp: new Date().toISOString(),
  };

  // Log in development or dispatch custom event for pluggable collectors
  if (process.env.NODE_ENV === 'development') {
    // Silent in production
  }

  // Dispatch custom DOM event for lightweight analytics collectors (e.g. Plausible, Umami, or custom endpoint)
  try {
    const customEvent = new CustomEvent('vicepulse:telemetry', { detail: payload });
    window.dispatchEvent(customEvent);
  } catch (err) {
    // Non-blocking
  }
}

export const analytics = {
  trackDiscoveryView: (discoveryId: string, title: string, category: string) => {
    trackEvent('discovery_view', { discoveryId, title, category });
  },
  trackMapMarkerClick: (discoveryId: string, district: string, inGameGrid?: string) => {
    trackEvent('map_marker_click', { discoveryId, district, inGameGrid });
  },
  trackSearchPerformed: (query: string, resultCount: number) => {
    trackEvent('search_performed', { query: query.slice(0, 50), resultCount });
  },
  trackCategorySelected: (category: string) => {
    trackEvent('category_selected', { category });
  },
  trackExternalSourceClick: (url: string, platform: string) => {
    trackEvent('source_link_click', { url, platform });
  },
};
