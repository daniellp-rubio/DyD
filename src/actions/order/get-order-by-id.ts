"use server";

import crypto from "crypto";
import { auth } from "@/auth-config";
import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";

const hashToken = (raw: string) =>
  crypto.createHash("sha256").update(raw).digest("hex");

export const getOrderById = async (id: string, token?: string) => {
  const session = await auth();
  const isLoggedIn = !!session?.user?.id;

  if (!isLoggedIn && !token) {
    return { ok: false, message: "Debe estar autenticado" } as const;
  }

  // Access: logged-in owner/admin, or a guest presenting the order's token.
  const where = isLoggedIn
    ? session!.user.role === "admin"
      ? { id }
      : { id, userId: session!.user.id }
    : { id, userId: null, guestAccessToken: hashToken(token!) };

  try {
    const orderById = await prisma.order.findFirst({
      where,
      include: {
        OrderAddress: true,
        user: { select: { email: true } },
        OrderItem: {
          select: {
            price: true,
            quantity: true,
            product: {
              select: {
                title: true,
                slug: true,
                description: true,
                category: true,
                ProductImage: { select: { url: true }, take: 1 },
              },
            },
          },
        },
      },
    });

    if (!orderById) {
      return { ok: false, message: "Orden no existe" } as const;
    }

    return { ok: true, orderById } as const;
  } catch (err) {
    Logger.error({
      title: "Get Order Failed",
      message: "Error obteniendo orden",
      error: err,
    });
    return { ok: false, message: "Orden no existe" } as const;
  }
};
