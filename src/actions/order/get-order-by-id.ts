"use server";

// Config
import { auth } from "@/auth-config";

// Libraries
import prisma from "@/lib/prisma";

export const getOrderById = async(id: string) => {
  const session = await auth();

  if (!session) {
    return {
      ok: false,
      message: "Debe estar autenticado"
    };
  };

  try {
    const orderById = await prisma.order.findUnique({
      where: { id },
      include: {
        OrderAddress: {
          where: { orderId: id }
        },
        user: {
          select: {
            email: true
          }
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

    if (!orderById) throw `${id} no existe`;

    if(session.user.role === "user") {
      if (session.user.id !== orderById?.userId) {
        throw `${id} no existe`;
      };
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
