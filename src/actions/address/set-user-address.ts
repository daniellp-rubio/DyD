"use server";

import { z } from "zod";
import { auth } from "@/auth-config";
import { Address } from "@/interfaces";
import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";

const addressSchema = z.object({
  firstName: z.string().trim().min(1).max(80),
  lastName: z.string().trim().min(1).max(80),
  address: z.string().trim().min(1).max(160),
  address2: z.string().trim().max(160).optional(),
  postalCode: z.string().trim().min(1).max(20),
  city: z.string().trim().min(1).max(80),
  phone: z.string().trim().min(5).max(30),
});

export const setUserAddress = async (address: Address) => {
  const session = await auth();
  if (!session?.user.id) {
    return { ok: false, message: "No autenticado" };
  }

  const parsed = addressSchema.safeParse(address);
  if (!parsed.success) {
    return { ok: false, message: "Dirección inválida" };
  }

  try {
    const userId = session.user.id;
    const newAddress = await prisma.userAddress.upsert({
      where: { userId },
      create: { ...parsed.data, userId },
      update: { ...parsed.data },
    });
    return { ok: true, address: newAddress };
  } catch (err) {
    Logger.error({
      title: "Set Address Failed",
      message: "No se pudo establecer la dirección del usuario",
      error: err,
    });
    return { ok: false, message: "No se pudo establecer la dirección del usuario" };
  }
};
