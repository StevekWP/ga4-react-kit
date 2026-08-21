import type { ConsentState, GA4Event, GA4InitOptions, GtagFunction } from "./types";

class GA4Client {
  private initialized = false;
  private consentGranted = false;
  private requireConsent = false;
  private debug = false;
  private queue: GA4Event[] = [];
  private measurementId = "";

  private log(...args: unknown[]) {
    if (this.debug) {
      // eslint-disable-next-line no-console
      console.log("[ga4-react-kit]", ...args);
    }
  }

  private loadScript(measurementId: string) {
    if (typeof document === "undefined") return;
    if (document.querySelector(`script[src*="gtag/js?id=${measurementId}"]`)) return;

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(script);

    window.dataLayer = window.dataLayer || [];
    const gtag: GtagFunction = (...args) => {
      window.dataLayer.push(args);
    };
    window.gtag = window.gtag || gtag;
    window.gtag("js", new Date());
  }

  init(options: GA4InitOptions) {
    if (typeof window === "undefined") {
      this.log("Skipping init: not in a browser environment");
      return;
    }
    if (this.initialized) {
      this.log("Already initialized, ignoring duplicate init() call");
      return;
    }

    this.measurementId = options.measurementId;
    this.requireConsent = options.requireConsent ?? false;
    this.debug = options.debug ?? false;

    this.loadScript(options.measurementId);

    window.gtag("config", options.measurementId, {
      send_page_view: false,
      ...options.configParams,
    });

    this.initialized = true;
    this.consentGranted = !this.requireConsent;
    this.log("Initialized", options);

    if (options.sendInitialPageView) {
      this.pageview(window.location.pathname + window.location.search);
    }

    if (this.consentGranted) {
      this.flushQueue();
    }
  }

  setConsent(consent: ConsentState) {
    if (typeof window === "undefined" || !window.gtag) return;
    window.gtag("consent", "update", consent);
    this.consentGranted = consent.analytics_storage === "granted";
    this.log("Consent updated", consent);
    if (this.consentGranted) {
      this.flushQueue();
    }
  }

  private flushQueue() {
    if (this.queue.length === 0) return;
    this.log(`Flushing ${this.queue.length} queued event(s)`);
    const pending = [...this.queue];
    this.queue = [];
    pending.forEach((event) => this.sendEvent(event));
  }

  private sendEvent(event: GA4Event) {
    if (typeof window === "undefined" || !window.gtag) return;
    window.gtag("event", event.name, event.params ?? {});
    this.log("Event sent", event);
  }

  event(name: string, params?: Record<string, unknown>) {
    const evt: GA4Event = { name, params };

    if (!this.initialized) {
      this.log("Not initialized yet, queuing event", evt);
      this.queue.push(evt);
      return;
    }

    if (this.requireConsent && !this.consentGranted) {
      this.log("Consent not granted, queuing event", evt);
      this.queue.push(evt);
      return;
    }

    this.sendEvent(evt);
  }

  pageview(path: string, extraParams?: Record<string, unknown>) {
    this.event("page_view", {
      page_path: path,
      ...extraParams,
    });
  }

  isInitialized() {
    return this.initialized;
  }

  hasConsent() {
    return this.consentGranted;
  }
}

/** Singleton instance shared across the app */
export const ga4 = new GA4Client();
