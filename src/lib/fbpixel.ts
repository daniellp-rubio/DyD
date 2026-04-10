
// lib/fbpixel.ts
export const fbq = (...args: any[]) => {
  if (typeof window === "undefined") return;
  (window as any).fbq?.(...args);
};

export function track(
  event: string,
  params?: Record<string, any>,
  eventId?: string
) {
  if (eventId) fbq("track", event, params || {}, { eventID: eventId });
  else fbq("track", event, params || {});
};
