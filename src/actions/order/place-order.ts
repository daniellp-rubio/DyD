"use server";

import { z } from "zod";
import { auth } from "@/auth-config";
import { Address } from "@/interfaces";
import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";

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
  const total = subTotal;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Atomic stock decrement: only succeeds if inStock >= quantity
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
          userId,
          itemsInOrder,
          subTotal,
          total,
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
            },
          },
        },
      });

      return { order };
    });

    return { ok: true, order: result.order };
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
