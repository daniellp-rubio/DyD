"use server";

import crypto from "crypto";
import { auth } from "@/auth-config";
import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";

const hashToken = (raw: string) =>
  crypto.createHash("sha256").update(raw).digest("hex");

export const getOrderByIdWithoutSession = async (id: string, accessToken: string) => {
  if (!id || !accessToken) {
    return { ok: false, message: "Solicitud inválida" } as const;
  }

  const session = await auth();
  if (session?.user.id) {
    return { ok: false, message: "Tienes una sesión activa." } as const;
  }

  try {
    const orderById = await prisma.order.findFirst({
      where: {
        id,
        userId: null,
        guestAccessToken: hashToken(accessToken),
      },
      include: {
        OrderAddress: true,
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
      return { ok: false, message: "Orden no encontrada" } as const;
    }

    return { ok: true, orderById } as const;
  } catch (err) {
    Logger.error({
      title: "Get Guest Order Failed",
      message: "Error obteniendo orden invitado",
      error: err,
    });
    return { ok: false, message: "Orden no encontrada" } as const;
  }
};
