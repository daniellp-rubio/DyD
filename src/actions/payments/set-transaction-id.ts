"use server";

import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";

export const setTransactionId = async (orderId: string, transactionId: string) => {
  try {
    await prisma.order.update({
      where: { id: orderId },
      data: { transactionId },
    });
    return { ok: true as const };
  } catch (err) {
    Logger.error({
      title: "Set Transaction Failed",
      message: `No se pudo guardar transactionId en orden ${orderId}`,
      error: err,
    });
    return {
      ok: false as const,
      message: "No se pudo actualizar el id de transacción",
    };
  }
};
