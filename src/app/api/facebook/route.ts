import { NextResponse } from "next/server";
import { headers } from "next/headers";

import { sendMetaServerEvent } from "@/lib/meta/capi";

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
  try {
    const h = await headers();

    // Same-origin guard: this endpoint only serves our own pages. Blocks casual
    // cross-origin abuse that would poison pixel data (not a substitute for a
    // signed token, but proportional for a tracking relay).
    const host = h.get("host");
    const origin = h.get("origin") ?? h.get("referer");
    if (origin && host) {
      let originHost: string | null = null;
      try {
        originHost = new URL(origin).host;
      } catch {
        originHost = null;
      }
      if (originHost !== host) {
        return NextResponse.json({ error: "forbidden" }, { status: 403 });
      }
    }

    const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || undefined;
    const ua = h.get("user-agent") || undefined;

    const body = (await req.json()) as FacebookEventBody;

    const ok = await sendMetaServerEvent({
      event_name: body.event_name || "Purchase",
      event_id: body.event_id,
      event_source_url: body.event_source_url,
      custom_data: body.custom_data,
      user_data: {
        email: body.email,
        phone: body.phone,
        external_id: body.external_id,
        fbp: body.fbp,
        fbc: body.fbc,
        client_ip_address: ip,
        client_user_agent: ua,
      },
    });

    if (!ok) {
      return NextResponse.json({ ok: false }, { status: 503 });
    }
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "internal" }, { status: 500 });
  }
}
