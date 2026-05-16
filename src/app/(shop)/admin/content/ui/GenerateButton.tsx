"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { triggerGeneration } from "@/actions/content/trigger-generation";

export function GenerateButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleClick = () => {
    startTransition(async () => {
      const result = await triggerGeneration();
      if (result.ok) {
        router.refresh();
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className="w-full rounded-lg bg-brand-orange px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#E64A19] disabled:opacity-60 sm:w-auto"
    >
      {isPending ? "Creando..." : "+ Generar ahora"}
    </button>
  );
}
