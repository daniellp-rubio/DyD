"use server";

import { auth } from "@/auth-config";
import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";

export const getUserAddress = async (userId?: string) => {
  const session = await auth();
  const sessionId = session?.user.id;
  if (!sessionId) return null;

  // Ignore externally-provided userId; always use session.
  const targetId = sessionId;
  if (userId && userId !== sessionId) {
    Logger.warn({
      title: "Address Access Mismatch",
      message: "userId param ignored; using session id",
    });
  }

  try {
    const address = await prisma.userAddress.findUnique({
      where: { userId: targetId },
    });
    if (!address) return null;
    const { address2, ...rest } = address;
    return { ...rest, address2: address2 ?? "" };
  } catch (err) {
    Logger.error({
      title: "Get Address Failed",
      message: "No se pudo obtener la dirección",
      error: err,
    });
    return null;
  }
};
