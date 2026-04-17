
// Libraries
import prisma from "@/lib/prisma";

export const setPaidId = async(orderId: string, paidAt: Date, isPaid: boolean) => {
  try {
    const order = await prisma.order.update({
      where: {id: orderId},
      data: {
        paidAt: paidAt,
        isPaid: isPaid
      }
    });

    if (!order) {
      return {
        ok: false,
        message: `No se encontro una orden con el id ${orderId}`
      };
    };

    return { ok: true };
  } catch (err) {
    console.log(err);
    return {
      ok: false,
      message: "No se pudo actualizar el paid con el id de la transacción"
    };
  };
};
