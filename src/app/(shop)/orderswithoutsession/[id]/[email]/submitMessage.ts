"use server";

import { getUserAddress } from "@/actions";
import { auth } from "@/auth-config";
import { MercadoPagoConfig, Preference } from "mercadopago";

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function submitMessage(
  text: string,
  id: string,
  total: number,
  buyerEmail?: string
): Promise<string> {
  if (typeof text !== 'string' || !text.trim()) throw new Error('Texto inválido');
  if (typeof id !== 'string' || !id.trim()) throw new Error('ID inválido');
  if (typeof total !== 'number' || total <= 0) throw new Error('Total inválido');

  const notificationUrl = `${process.env.MERCADOPAGO_NOTIFICATION_URL}/api/mercadopago/pagos`;
  const backUrl = `${process.env.MERCADOPAGO_NOTIFICATION_URL}`;

  const session = await auth();

  if (!session?.user.id) {
    throw new Error('No se encontro el usuario');
  };

  const userAddress = await getUserAddress(session.user.id);
  const firstName = userAddress?.firstName || "Nombre";
  const lastName = userAddress?.lastName || "Apellido";

  try {
    const preference = await new Preference(mercadopago).create({
      body: {
        items: [
          {
            id: id,
            title: `Orden #${id.split("-").at(-1)}`,
            description: "Audífonos Bluetooth inalámbricos con estuche de carga",
            category_id: "electronics",
            quantity: 1,
            unit_price: total,
            currency_id: "COP",
          },
        ],
        payer: buyerEmail
          ? {
              email: buyerEmail,
              name: firstName,
              surname: lastName,
            }
          : undefined,
        metadata: {
          orderId: id,
          text
        },
        external_reference: id,
        back_urls: {
          success: `${backUrl}/orders/${id}/success`,
          failure: `${backUrl}/orders/${id}/failure`,
          pending: `${backUrl}/orders/${id}/pending`
        },
        auto_return: "approved",
        statement_descriptor: "D&D Gadgets",
        notification_url: notificationUrl
      },
    });

    if (!preference.init_point) throw new Error('No se pudo generar el link de pago');
    return preference.init_point!;
  } catch (error: any) {
    console.error('❌ Error al crear preferencia de Mercado Pago:', error);
    throw new Error('No se pudo crear la preferencia de pago');
  }
};
