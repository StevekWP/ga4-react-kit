import { useCallback, useEffect, useRef } from "react";
import { ga4 } from "./client";
import type { ConsentState, GA4InitOptions } from "./types";

/**
 * Initializes GA4 once on mount. Safe to call from your root App component;
 * re-renders and remounts won't re-initialize or duplicate the script tag.
 */
export function useGA4Init(options: GA4InitOptions) {
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    ga4.init(options);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}

/**
 * Sends a page_view event whenever `path` changes. Pass your router's
 * current pathname (+ search, if you want query params tracked).
 */
export function usePageView(path: string, extraParams?: Record<string, unknown>) {
  useEffect(() => {
    if (!path) return;
    ga4.pageview(path, extraParams);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);
}

/**
 * Returns a stable function for firing custom GA4 events.
 *
 * const trackEvent = useTrackEvent();
 * trackEvent("add_to_cart", { item_id: "123", value: 29.99 });
 */
export function useTrackEvent() {
  return useCallback((name: string, params?: Record<string, unknown>) => {
    ga4.event(name, params);
  }, []);
}

/**
 * Returns a function to update the user's analytics consent state,
 * e.g. from a cookie banner.
 */
export function useConsent() {
  return useCallback((consent: ConsentState) => {
    ga4.setConsent(consent);
  }, []);
}
