"use server";

import { auth } from "@/auth-config";
import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";

export const deleteUserAddress = async () => {
  const session = await auth();
  if (!session?.user.id) {
    return { ok: false, message: "No autenticado" };
  }

  try {
    await prisma.userAddress.deleteMany({ where: { userId: session.user.id } });
    return { ok: true, message: "Dirección eliminada correctamente" };
  } catch (err) {
    Logger.error({
      title: "Delete Address Failed",
      message: "No se pudo eliminar la dirección",
      error: err,
    });
    return { ok: false, message: "No se pudo eliminar la dirección del usuario" };
  }
};
