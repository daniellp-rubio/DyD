
// src/app/api/facebook/route.ts
import { NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";

const PIXEL_ID = process.env.META_PIXEL_ID!;
const ACCESS_TOKEN = process.env.META_CAPI_TOKEN!;
const TEST_CODE = process.env.META_TEST_EVENT_CODE; // opcional

function sha256(v?: string) {
  if (!v) return undefined;
  return crypto.createHash("sha256").update(v.trim().toLowerCase()).digest("hex");
}

export async function POST(req: Request) {
  try {
    const h = await headers();
    const ip =
      h.get("x-forwarded-for")?.split(",")[0] ||
      h.get("x-real-ip") ||
      undefined;
    const ua = h.get("user-agent") || undefined;

    const body = await req.json();
    // body esperado:
    // {
    //   event_name: "Purchase",
    //   event_id?: string,
    //   event_source_url?: string,
    //   custom_data?: object,
    //   email?: string,
    //   phone?: string,
    //   fbp?: string,
    //   fbc?: string,
    //   external_id?: string
    // }

    const user_data: Record<string, any> = {
      em: sha256(body.email),
      ph: sha256(body.phone),
      external_id: body.external_id ? sha256(body.external_id) : undefined,
      fbp: body.fbp,
      fbc: body.fbc,
      client_user_agent: ua,
      client_ip_address: ip,
    };

    // Eliminar campos undefined
    Object.keys(user_data).forEach(
      (k) => user_data[k] === undefined && delete user_data[k]
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
      }
    );

    const json = await res.json();
    return NextResponse.json(json, { status: res.ok ? 200 : 400 });
  } catch (err: any) {
    console.error("Error enviando evento a Facebook:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
