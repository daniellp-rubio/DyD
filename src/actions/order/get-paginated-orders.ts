"use server";

import { z } from "zod";
import { auth } from "@/auth-config";
import prisma from "@/lib/prisma";

const optionsSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  take: z.coerce.number().int().min(1).max(100).default(20),
});

interface Options {
  page?: number;
  take?: number;
}

export const getPaginatedOrders = async (options: Options = {}) => {
  const session = await auth();
  if (session?.user.role !== "admin") {
    return { ok: false, message: "Debe estar autenticado" } as const;
  }

  const { page, take } = optionsSchema.parse(options);

  const [orders, totalCount] = await prisma.$transaction([
    prisma.order.findMany({
      take,
      skip: (page - 1) * take,
      orderBy: { createdAt: "desc" },
      include: {
        OrderAddress: { select: { firstName: true, lastName: true } },
      },
    }),
    prisma.order.count(),
  ]);

  return {
    ok: true,
    orders,
    currentPage: page,
    totalPages: Math.ceil(totalCount / take),
  } as const;
};
