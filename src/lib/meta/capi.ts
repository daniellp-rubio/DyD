import crypto from "crypto";

import { Logger } from "@/lib/logger";

const PIXEL_ID = process.env.META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CAPI_TOKEN;
const TEST_CODE = process.env.META_TEST_EVENT_CODE;
const GRAPH_VERSION = "v18.0";

/** SHA-256 lower-cased + trimmed, as Meta requires for PII fields. */
function sha256(value?: string): string | undefined {
  if (!value) return undefined;
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export interface MetaUserData {
  email?: string;
  phone?: string;
  external_id?: string;
  /** _fbp cookie — sent raw (already a hashed token). */
  fbp?: string;
  /** _fbc cookie — sent raw. */
  fbc?: string;
  client_ip_address?: string;
  client_user_agent?: string;
}

export interface MetaServerEvent {
  event_name: string;
  event_id?: string;
  event_source_url?: string;
  custom_data?: Record<string, unknown>;
  user_data?: MetaUserData;
}

/**
 * Send a single event to the Meta Conversions API (server-side).
 * Shared by the /api/facebook route (browser-originated) and the
 * Mercado Pago webhook (server-originated Purchase). Deduplication with the
 * browser pixel happens via a shared `event_id`.
 *
 * Returns `false` (never throws) when tracking is disabled or the call fails,
 * so callers can fire-and-forget without breaking the main flow.
 */
export async function sendMetaServerEvent(event: MetaServerEvent): Promise<boolean> {
  if (!PIXEL_ID || !ACCESS_TOKEN) return false;

  const u = event.user_data ?? {};
  const user_data: Record<string, unknown> = {
    em: sha256(u.email),
    ph: sha256(u.phone),
    external_id: sha256(u.external_id),
    fbp: u.fbp,
    fbc: u.fbc,
    client_ip_address: u.client_ip_address,
    client_user_agent: u.client_user_agent,
  };
  Object.keys(user_data).forEach(
    (k) => user_data[k] === undefined && delete user_data[k],
  );

  const payload = {
    data: [
      {
        event_name: event.event_name,
        event_time: Math.floor(Date.now() / 1000),
        event_id: event.event_id,
        action_source: "website",
        event_source_url: event.event_source_url,
        user_data,
        custom_data: event.custom_data,
      },
    ],
    ...(TEST_CODE ? { test_event_code: TEST_CODE } : {}),
  };

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    if (!res.ok) {
      const detail = await res.text();
      Logger.error({
        title: "Meta CAPI Rejected",
        message: `Graph API respondió ${res.status} para ${event.event_name}`,
        metadata: { status: res.status, detail: detail.slice(0, 500) },
      });
      return false;
    }
    return true;
  } catch (error) {
    Logger.error({
      title: "Meta CAPI Failed",
      message: `Error enviando ${event.event_name} a Meta`,
      error,
    });
    return false;
  }
}
