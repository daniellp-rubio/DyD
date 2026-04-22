"use server";

// Config
import { auth } from "@/auth-config";

// Libraries
import prisma from "@/lib/prisma";

export const getOrdersByUser = async() => {
  const session = await auth();

  if (!session?.user) {
    return {
      ok: false,
      message: "Debe estar autenticado"
    };
  };

  const orders = await prisma.order.findMany({
    where: {
      userId: session.user.id
    },
    orderBy: {
      createdAt: "desc"
    },
    include: {
      OrderAddress: {
        select: {
          firstName: true,
          lastName: true
        }
      }
    }
  });

  return {
    ok: true,
    orders
  }
};
