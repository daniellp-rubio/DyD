"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { Role } from "@prisma/client";

import { auth } from "@/auth-config";
import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";

const inputSchema = z.object({
  userId: z.string().uuid(),
  role: z.nativeEnum(Role),
});

export const changeUserRole = async (userId: string, role: string) => {
  const session = await auth();
  if (session?.user.role !== "admin") {
    return { ok: false, message: "Debe ser administrador" } as const;
  }

  const parsed = inputSchema.safeParse({ userId, role });
  if (!parsed.success) {
    return { ok: false, message: "Parámetros inválidos" } as const;
  }

  if (parsed.data.userId === session.user.id) {
    return { ok: false, message: "No puedes cambiar tu propio rol" } as const;
  }

  try {
    await prisma.user.update({
      where: { id: parsed.data.userId },
      data: { role: parsed.data.role },
    });
    revalidatePath("/admin/users");
    return { ok: true } as const;
  } catch (error) {
    Logger.error({
      title: "Change User Role Failed",
      message: "No se pudo actualizar el rol",
      error,
    });
    return { ok: false, message: "No se pudo actualizar el rol" } as const;
  }
};
