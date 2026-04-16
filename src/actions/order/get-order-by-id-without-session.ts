"use server";

// Config
import { auth } from "@/auth-config";

// Libraries
import prisma from "@/lib/prisma";

export const getOrderByIdWithoutSession = async(id: string) => {
  const session = await auth();

  if (session) {
    return {
      ok: false,
      message: "Tienes una sesión de usuario activa."
    };
  };

  try {
    const orderById = await prisma.order.findUnique({
      where: { id },
      include: {
        OrderAddress: {
          where: { orderId: id }
        },
        OrderItem: {
          where: { orderId: id },
          select: {
            price: true,
            quantity: true,
            product: {
            select: {
              title: true,
              slug: true,
              description: true,
              category: true,
              ProductImage: {
                select: {
                  url: true
                },
                take: 1
              }
            },
          }}
          },
        },
    });

    console.log(orderById);
    if (!orderById) throw `${id} no existe`;

    if (orderById?.userId) {
      throw `Es imposible entrar a esta orden con un ID de sesión relacionado ${id}`;
    };

    return {
      ok: true,
      orderById
    };
  } catch (err) {
    console.log(err);
    throw new Error("Orden no existe");
  };
};
