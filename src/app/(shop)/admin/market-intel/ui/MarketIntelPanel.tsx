"use client";

import { useState, useTransition } from "react";
import { runMarketIntel } from "@/actions/intel/run-market-intel";
import type { MarketIntelResult } from "@/interfaces/content.interface";

export function MarketIntelPanel() {
  const [category, setCategory] = useState("airpods replica colombia");
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<MarketIntelResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = () => {
    setError(null);
    startTransition(async () => {
      const res = await runMarketIntel(category);
      if (res.ok) {
        setResult(res.data);
      } else {
        setError(res.message);
        setResult(null);
      }
    });
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5">
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          placeholder="Nicho a analizar..."
          className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm text-brand-black focus:border-brand-orange focus:outline-none"
        />
        <button
          onClick={run}
          disabled={isPending}
          className="rounded-lg bg-brand-orange px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#E64A19] disabled:opacity-60 sm:shrink-0"
        >
          {isPending ? "Analizando..." : "Analizar"}
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      {result && (
        <div className="mt-5 space-y-4">
          <p className="text-xs text-brand-smoke">
            Fuentes externas analizadas: {result.sourcesAnalyzed}
          </p>

          <Section title="Lenguaje real de la audiencia">
            <ul className="list-disc space-y-1 pl-5 text-sm text-brand-black">
              {result.audienceLanguage.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </Section>

          <Section title="Objeciones de compra">
            <ul className="list-disc space-y-1 pl-5 text-sm text-brand-black">
              {result.buyingObjections.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </Section>

          <Section title="Oportunidad de contenido">
            <p className="text-sm text-brand-black">{result.contentOpportunity}</p>
          </Section>

          <Section title="Copy recomendado">
            <p className="whitespace-pre-wrap rounded-lg bg-brand-gray p-4 text-sm text-brand-black">
              {result.recommendedCopy}
            </p>
          </Section>
        </div>
      )}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="mb-1.5 text-sm font-extrabold text-brand-black">{title}</h4>
      {children}
    </div>
  );
}
