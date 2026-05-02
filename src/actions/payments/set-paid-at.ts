"use server";

import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";

export const setPaidId = async (orderId: string, paidAt: Date, isPaid: boolean) => {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { paidAt, isPaid },
    });
    return { ok: true as const };
  } catch (err) {
    Logger.error({
      title: "Set Paid Failed",
      message: `No se pudo marcar como pagada la orden ${orderId}`,
      error: err,
    });
    return {
      ok: false as const,
      message: "No se pudo actualizar el estado de pago",
    };
  }
};
