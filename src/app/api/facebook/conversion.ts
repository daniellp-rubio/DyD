
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método no permitido" });
  }

  try {
    const PIXEL_ID = process.env.FB_PIXEL_ID as string;
    const TOKEN = process.env.FB_ACCESS_TOKEN as string;

    const url = `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${TOKEN}`;

    // Datos que recibes desde el frontend
    const { eventName, userEmail, value } = req.body;

    const payload = {
      data: [
        {
          event_name: eventName || "Purchase",
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          event_source_url: "https://tusitio.com/checkout",
          user_data: {
            // ⚠️ Facebook requiere SHA256 → aquí debería ir hasheado
            em: [userEmail],
          },
          custom_data: {
            currency: "USD",
            value: value || 0,
            content_ids: ["1234"],
            content_type: "product",
          },
        },
      ],
    };

    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json" },
    });

    const result = await response.json();
    return res.status(200).json(result);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: "Error enviando evento a Facebook" });
  }
}
