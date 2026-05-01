"use server";

import { auth } from "@/auth-config";
import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";

export const getOrderById = async (id: string) => {
  const session = await auth();
  if (!session?.user.id) {
    return { ok: false, message: "Debe estar autenticado" } as const;
  }

  const isAdmin = session.user.role === "admin";

  try {
    const orderById = await prisma.order.findFirst({
      where: isAdmin ? { id } : { id, userId: session.user.id },
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
