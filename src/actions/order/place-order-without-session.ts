"use server";

import crypto from "crypto";
import { z } from "zod";
import { auth } from "@/auth-config";
import { Address } from "@/interfaces";
import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";
import { calculateShipping } from "@/config/shipping";

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

  const products = await prisma.product.findMany({
    where: { id: { in: items.map((p) => p.productId) } },
    select: { id: true, price: true, title: true },
  });

  if (products.length !== items.length) {
    return { ok: false, message: "Uno o más productos no existen" };
  }

  const itemsInOrder = items.reduce((c, p) => c + p.quantity, 0);
  let subTotal = 0;
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)!;
    subTotal += product.price * item.quantity;
  }
  const shipping = calculateShipping(subTotal);
  const total = subTotal + shipping;

  // Random unguessable token; only the hash is stored.
  const accessToken = crypto.randomBytes(32).toString("base64url");
  const accessTokenHash = hashToken(accessToken);

  try {
    const result = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, inStock: { gte: item.quantity } },
          data: { inStock: { decrement: item.quantity } },
        });
        if (updated.count !== 1) {
          throw new Error(`Stock insuficiente para ${item.productId}`);
        }
      }

      const order = await tx.order.create({
        data: {
          itemsInOrder,
          subTotal,
          total,
          guestAccessToken: accessTokenHash,
          OrderItem: {
            createMany: {
              data: items.map((p) => ({
                quantity: p.quantity,
                productId: p.productId,
                price: products.find((pr) => pr.id === p.productId)!.price,
              })),
            },
          },
          OrderAddress: {
            create: {
              firstName: cleanAddress.firstName,
              lastName: cleanAddress.lastName,
              address: cleanAddress.address,
              address2: cleanAddress.address2,
              postalCode: cleanAddress.postalCode,
              city: cleanAddress.city,
              phone: cleanAddress.phone,
              email: emailParsed.data,
            },
          },
        },
      });

      return { order };
    });

    return { ok: true, order: result.order, accessToken };
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
