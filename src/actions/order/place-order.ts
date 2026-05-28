"use server";

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
  postalCode: z.string().trim().max(20).optional().default(""),
  city: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(5).max(30),
});

interface ProductToOrder {
  productId: string;
  quantity: number;
}

export const placeOrder = async (productIds: ProductToOrder[], address: Address) => {
  const session = await auth();
  const userId = session?.user.id;

  if (!userId) return { ok: false, message: "No hay sesión de usuario" };

  const itemsParsed = z.array(productInputSchema).min(1).max(50).safeParse(productIds);
  if (!itemsParsed.success) return { ok: false, message: "Productos inválidos" };

  const addressParsed = addressSchema.safeParse(address);
  if (!addressParsed.success) return { ok: false, message: "Dirección inválida" };

  const items = itemsParsed.data;
  const cleanAddress = addressParsed.data;

  try {
    const order = await createOrder(items, cleanAddress, { kind: "user", userId });
    return { ok: true, order };
  } catch (err) {
    Logger.error({
      title: "Place Order Failed",
      message: "Error en placeOrder",
      error: err,
    });
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Ocurrió un error desconocido",
    };
  }
};
