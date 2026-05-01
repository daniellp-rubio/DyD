"use server";

import prisma from "@/lib/prisma";
import { Logger } from "@/lib/logger";

export const getCategories = async () => {
  try {
    return await prisma.category.findMany({ orderBy: { name: "asc" } });
  } catch (error) {
    Logger.error({
      title: "Get Categories Failed",
      message: "No se pudo cargar categorías",
      error,
    });
    return [];
  }
};
