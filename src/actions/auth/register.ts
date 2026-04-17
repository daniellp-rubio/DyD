"use server";

import bcrypt from "bcryptjs";
import { z } from "zod";
import { Prisma } from "@/generated/prisma";

import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";
import { rateLimit, getClientIp } from "@/lib/security/rate-limit";
import { verifyTurnstile } from "@/lib/security/turnstile";
import {
  issueVerificationToken,
  sendVerificationEmail,
} from "@/lib/email/verification";

const BCRYPT_COST = 12;

const registerSchema = z.object({
  name: z.string().trim().min(2, "Nombre muy corto").max(80, "Nombre muy largo"),
  email: z.string().trim().toLowerCase().email("Correo inválido").max(254),
  password: z
    .string()
    .min(8, "La contraseña debe tener al menos 8 caracteres")
    .max(128, "Contraseña muy larga")
    .regex(/[A-Z]/, "Debe incluir una mayúscula")
    .regex(/[a-z]/, "Debe incluir una minúscula")
    .regex(/[0-9]/, "Debe incluir un número"),
});

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  turnstileToken?: string,
) => {
  const ip = await getClientIp();

  const rl = rateLimit(`register:${ip}`, 5, 60 * 60 * 1000);
  if (!rl.allowed) {
    return {
      ok: false,
      message: "Demasiados intentos. Intenta más tarde.",
    };
  }

  const captchaOk = await verifyTurnstile(turnstileToken, ip);
  if (!captchaOk) {
    return { ok: false, message: "Verificación anti-bot fallida" };
  }

  const parsed = registerSchema.safeParse({ name, email, password });
  if (!parsed.success) {
    return {
      ok: false,
      message: parsed.error.issues[0]?.message ?? "Datos inválidos",
    };
  }

  const { name: cleanName, email: cleanEmail, password: cleanPassword } = parsed.data;

  try {
    const hashed = await bcrypt.hash(cleanPassword, BCRYPT_COST);

    const user = await prisma.user.create({
      data: { name: cleanName, email: cleanEmail, password: hashed },
      select: { id: true, name: true, email: true, role: true },
    });

    try {
      const token = await issueVerificationToken(user.id);
      await sendVerificationEmail(cleanEmail, token);
    } catch (emailError) {
      Logger.error({
        title: "Verification Email Failed",
        message: "Usuario creado pero no se pudo enviar el correo de verificación",
        error: emailError,
      });
    }

    return {
      ok: true,
      user,
      message: "Usuario creado. Revisa tu correo para verificar la cuenta.",
    };
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      (error as { code?: string }).code === "P2002"
    ) {
      return { ok: false, message: "No se pudo crear el usuario" };
    }

    Logger.error({
      title: "Register Crash",
      message: "Fallo inesperado creando usuario",
      error,
    });

    return { ok: false, message: "No se pudo crear el usuario" };
  }
};
