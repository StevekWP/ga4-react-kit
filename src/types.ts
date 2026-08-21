export interface GA4InitOptions {
  /** GA4 Measurement ID, e.g. "G-XXXXXXXXXX" */
  measurementId: string;
  /** Whether to send events immediately, or wait for consent via setConsent() */
  requireConsent?: boolean;
  /** Log every tracked event to the console */
  debug?: boolean;
  /** Extra gtag('config', ...) params */
  configParams?: Record<string, unknown>;
  /** Automatically send a page_view on init */
  sendInitialPageView?: boolean;
}

export interface GA4Event {
  name: string;
  params?: Record<string, unknown>;
}

export interface ConsentState {
  analytics_storage: "granted" | "denied";
  ad_storage?: "granted" | "denied";
}

export type GtagFunction = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: GtagFunction;
  }
}
