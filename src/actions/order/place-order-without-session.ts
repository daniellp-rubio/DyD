"use server";

import crypto from "crypto";
import { z } from "zod";
import { auth } from "@/auth-config";
import { Address } from "@/interfaces";
import { Logger } from "@/lib/logger";
import { createOrder } from "./create-order";

const productInputSchema = z.object({
  productId: z.string().uuid(),
  quantity: z.number().int().positive().max(100),
});

const addressSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  address: z.string().trim().min(1).max(160),
  address2: z.string().trim().max(160).optional(),
  postalCode: z.string().trim().min(1).max(20),
  city: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(5).max(30),
});

interface ProductToOrder {
  productId: string;
  quantity: number;
}

const hashToken = (raw: string) =>
  crypto.createHash("sha256").update(raw).digest("hex");

export const placeOrderWithoutSession = async (
  productIds: ProductToOrder[],
  address: Address,
  guestEmail?: string,
) => {
  const session = await auth();
  if (session?.user.id) {
    return { ok: false, message: "Ya tienes una sesión de usuario." };
  }

  const itemsParsed = z.array(productInputSchema).min(1).max(50).safeParse(productIds);
  if (!itemsParsed.success) return { ok: false, message: "Productos inválidos" };

  const addressParsed = addressSchema.safeParse(address);
  if (!addressParsed.success) return { ok: false, message: "Dirección inválida" };

  const emailParsed = z.string().trim().toLowerCase().email().max(254).optional().safeParse(guestEmail);
  if (!emailParsed.success) return { ok: false, message: "Correo inválido" };

  const items = itemsParsed.data;
  const cleanAddress = addressParsed.data;

  // Random unguessable token; only the hash is stored.
  const accessToken = crypto.randomBytes(32).toString("base64url");
  const accessTokenHash = hashToken(accessToken);

  try {
    const order = await createOrder(items, cleanAddress, {
      kind: "guest",
      email: emailParsed.data,
      accessTokenHash,
    });
    return { ok: true, order, accessToken };
  } catch (err) {
    Logger.error({
      title: "Place Order Without Session Failed",
      message: "Error en placeOrderWithoutSession",
      error: err,
    });
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Ocurrió un error desconocido",
    };
  }
};
