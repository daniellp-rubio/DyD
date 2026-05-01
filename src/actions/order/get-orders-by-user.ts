"use server";

import { auth } from "@/auth-config";
import prisma from "@/lib/prisma";

export const getOrdersByUser = async () => {
  const session = await auth();
  if (!session?.user.id) {
    return { ok: false, message: "Debe estar autenticado" } as const;
  }

  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    include: {
      OrderAddress: { select: { firstName: true, lastName: true } },
    },
  });

  return { ok: true, orders } as const;
};
