"use client";

import { useState, useTransition } from "react";
import { generateAdCopy } from "@/actions/intel/generate-ad-copy";
import type { AdCopyResult } from "@/interfaces/content.interface";

export function AdCopyButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AdCopyResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    setError(null);
    startTransition(async () => {
      const res = await generateAdCopy(productId);
      if (res.ok) {
        setResult(res.data);
      } else {
        setError(res.message);
        setResult(null);
      }
    });
  };

  return (
    <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="font-extrabold text-brand-black">Copy para Meta Ads</h3>
          <p className="text-sm text-brand-smoke">Genera 3 variaciones A/B con IA.</p>
        </div>
        <button
          onClick={handleClick}
          disabled={isPending}
          className="rounded-lg bg-brand-orange px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#E64A19] disabled:opacity-60 sm:shrink-0"
        >
          {isPending ? "Generando..." : "Generar copy"}
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {result && (
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {result.variations.map((v, i) => (
            <div key={i} className="rounded-xl border border-gray-200 p-4">
              <span className="inline-block rounded-full bg-brand-gray px-2.5 py-1 text-xs font-bold text-brand-black">
                {v.angle}
              </span>
              <p className="mt-2 font-bold text-brand-black">{v.headline}</p>
              <p className="mt-1 text-sm text-brand-smoke">{v.description}</p>
              <p className="mt-2 text-sm font-semibold text-brand-orange">{v.cta}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
