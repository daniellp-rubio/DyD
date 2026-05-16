"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { VideoStatus } from "@/interfaces/content.interface";

export function VideoPoller({ videoStatus }: { videoStatus: VideoStatus | null }) {
  const router = useRouter();

  useEffect(() => {
    if (videoStatus !== "generating") return;
    const interval = setInterval(() => router.refresh(), 10_000);
    return () => clearInterval(interval);
  }, [videoStatus, router]);

  return null;
}
