# ga4-react-kit

A modern, TypeScript-first, hooks-based Google Analytics 4 integration for React.

- 🪝 Hooks-first API (`useGA4Init`, `usePageView`, `useTrackEvent`, `useConsent`)
- 🧠 Built-in **event queue** — events fired before init (or before consent) aren't lost
- ✅ First-class **consent management** for GDPR/CCPA cookie banners
- 📦 Tiny, zero runtime dependencies, ships ESM + CJS + types
- 🐛 Optional `debug` mode that logs every event to the console

## Install

```bash
npm install ga4-react-kit
```

## Quick start

```tsx
import { useGA4Init, usePageView, useTrackEvent } from "ga4-react-kit";
import { useLocation } from "react-router-dom";

function App() {
  useGA4Init({
    measurementId: "G-XXXXXXXXXX",
    debug: process.env.NODE_ENV === "development",
  });

  const location = useLocation();
  usePageView(location.pathname + location.search);

  return <YourApp />;
}

function AddToCartButton() {
  const trackEvent = useTrackEvent();

  return (
    <button onClick={() => trackEvent("add_to_cart", { item_id: "123", value: 29.99 })}>
      Add to cart
    </button>
  );
}
```

## Consent management

If your app needs a cookie banner before tracking, set `requireConsent: true`.
Events fired before consent is granted are queued and flushed automatically
once the user consents.

```tsx
useGA4Init({
  measurementId: "G-XXXXXXXXXX",
  requireConsent: true,
});

const setConsent = useConsent();

<button onClick={() => setConsent({ analytics_storage: "granted" })}>
  Accept analytics cookies
</button>;
```

## API

### `useGA4Init(options)`
Initializes GA4 once on mount.

| Option | Type | Default | Description |
|---|---|---|---|
| `measurementId` | `string` | — | Your GA4 Measurement ID |
| `requireConsent` | `boolean` | `false` | Queue events until `setConsent` grants consent |
| `debug` | `boolean` | `false` | Log every event to the console |
| `configParams` | `object` | `{}` | Extra params passed to `gtag('config', ...)` |
| `sendInitialPageView` | `boolean` | `false` | Send a `page_view` immediately on init |

### `usePageView(path, extraParams?)`
Sends a `page_view` event whenever `path` changes.

### `useTrackEvent()`
Returns `(name: string, params?: object) => void` for firing custom events.

### `useConsent()`
Returns `(consent: { analytics_storage: "granted" | "denied" }) => void`.

### `ga4` (advanced)
The underlying client singleton, if you need to call `ga4.event(...)` outside
of React components (e.g. in a non-React utility module).

## License

MIT
