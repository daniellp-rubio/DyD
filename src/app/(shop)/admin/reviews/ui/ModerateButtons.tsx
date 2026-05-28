"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { moderateReview } from "@/actions";

export const ModerateButtons = ({ reviewId }: { reviewId: number }) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const act = (decision: "approved" | "rejected") => {
    setError(null);
    startTransition(async () => {
      const res = await moderateReview(reviewId, decision);
      if (!res.ok) setError(res.message);
      else router.refresh();
    });
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => act("approved")}
        disabled={pending}
        className="rounded-lg bg-green-600 px-3 py-1.5 text-sm font-bold text-white transition-all hover:bg-green-700 disabled:opacity-50"
      >
        Aprobar
      </button>
      <button
        onClick={() => act("rejected")}
        disabled={pending}
        className="rounded-lg bg-red-100 px-3 py-1.5 text-sm font-bold text-red-700 transition-all hover:bg-red-200 disabled:opacity-50"
      >
        Rechazar
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  );
};
