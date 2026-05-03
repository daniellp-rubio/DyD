import { NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";

import { Logger } from "@/lib/logger";

const PIXEL_ID = process.env.META_PIXEL_ID;
const ACCESS_TOKEN = process.env.META_CAPI_TOKEN;
const TEST_CODE = process.env.META_TEST_EVENT_CODE;

function sha256(v?: string) {
  if (!v) return undefined;
  return crypto.createHash("sha256").update(v.trim().toLowerCase()).digest("hex");
}

interface FacebookEventBody {
  event_name?: string;
  event_id?: string;
  event_source_url?: string;
  custom_data?: Record<string, unknown>;
  email?: string;
  phone?: string;
  fbp?: string;
  fbc?: string;
  external_id?: string;
}

export async function POST(req: Request) {
  if (!PIXEL_ID || !ACCESS_TOKEN) {
    return NextResponse.json({ error: "tracking disabled" }, { status: 503 });
  }

  try {
    const h = await headers();
    const ip = h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || undefined;
    const ua = h.get("user-agent") || undefined;

    const body = (await req.json()) as FacebookEventBody;

    const user_data: Record<string, unknown> = {
      em: sha256(body.email),
      ph: sha256(body.phone),
      external_id: body.external_id ? sha256(body.external_id) : undefined,
      fbp: body.fbp,
      fbc: body.fbc,
      client_user_agent: ua,
      client_ip_address: ip,
    };
    Object.keys(user_data).forEach(
      (k) => user_data[k] === undefined && delete user_data[k],
    );

    const payload = {
      data: [
        {
          event_name: body.event_name || "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          event_id: body.event_id,
          action_source: "website",
          event_source_url: body.event_source_url,
          user_data,
          custom_data: body.custom_data,
        },
      ],
      ...(TEST_CODE ? { test_event_code: TEST_CODE } : {}),
    };

    const res = await fetch(
      `https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );

    const json = await res.json();
    return NextResponse.json(json, { status: res.ok ? 200 : 400 });
  } catch (err) {
    Logger.error({
      title: "Facebook CAPI Failed",
      message: "Error enviando evento a Facebook",
      error: err,
    });
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
