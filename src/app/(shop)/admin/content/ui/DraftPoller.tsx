"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function DraftPoller({ hasDrafts }: { hasDrafts: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!hasDrafts) return;
    const interval = setInterval(() => router.refresh(), 5000);
    return () => clearInterval(interval);
  }, [hasDrafts, router]);

  return null;
}
