declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export const fbq = (...args: unknown[]) => {
  if (typeof window === "undefined") return;
  window.fbq?.(...args);
};

export function track(
  event: string,
  params?: Record<string, unknown>,
  eventId?: string,
) {
  if (eventId) fbq("track", event, params ?? {}, { eventID: eventId });
  else fbq("track", event, params ?? {});
}
