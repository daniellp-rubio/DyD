import sgMail from "@sendgrid/mail";
import { NextRequest, NextResponse } from "next/server";

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export async function POST(req: NextRequest) {
  const { to, subject, html } = await req.json();

  const msg = {
    to,
    from: "notificaciones@gadgetsdyd.com",
    subject,
    html
  };

  try {
    await sgMail.send(msg);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error al enviar el correo:", err);
    return NextResponse.json({ success: false, err }, { status: 500 });
  }
};
