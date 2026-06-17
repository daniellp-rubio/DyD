declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** Thin wrapper around window.fbq, safe on the server. */
export const fbq = (...args: unknown[]) => {
  if (typeof window === "undefined") return;
  window.fbq?.(...args);
};

/** Generate a unique event id used to dedupe the browser pixel against CAPI. */
export function newEventId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function getCookie(name: string): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]+)"));
  return match ? decodeURIComponent(match[1]) : undefined;
}

interface TrackOptions {
  /** Provide a deterministic id (e.g. for Purchase) to dedupe across sessions. */
  eventId?: string;
  /** Optional PII to raise Event Match Quality; hashed server-side. */
  userData?: { email?: string; phone?: string; external_id?: string };
}

/**
 * Fire a Meta event through BOTH channels with a shared event_id:
 *  - the browser pixel (window.fbq with { eventID })
 *  - the Conversions API (POST /api/facebook), passing _fbp/_fbc cookies
 *
 * Meta deduplicates the two by event_id + event_name, so no double counting.
 * The CAPI call is fire-and-forget with keepalive so it survives navigation.
 */
export function trackMeta(
  eventName: string,
  customData: Record<string, unknown> = {},
  options: TrackOptions = {},
): string {
  const eventId = options.eventId ?? newEventId();
  if (typeof window === "undefined") return eventId;

  // 1) Browser pixel
  window.fbq?.("track", eventName, customData, { eventID: eventId });

  // 2) Conversions API (server) — deduped by eventId
  try {
    void fetch("/api/facebook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      keepalive: true,
      body: JSON.stringify({
        event_name: eventName,
        event_id: eventId,
        event_source_url: window.location.href,
        custom_data: customData,
        fbp: getCookie("_fbp"),
        fbc: getCookie("_fbc"),
        ...options.userData,
      }),
    }).catch(() => {});
  } catch {
    // Never let tracking break the UI.
  }

  return eventId;
}
