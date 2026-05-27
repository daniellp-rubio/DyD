export const revalidate = 0;

import { redirect } from "next/navigation";
import { auth } from "@/auth-config";
import { MarketIntelPanel } from "./ui/MarketIntelPanel";

export default async function MarketIntelPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/");

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-brand-black sm:text-2xl">
          Inteligencia de mercado
        </h1>
        <p className="mt-1 text-sm text-brand-smoke">
          Analiza el nicho (Reddit + IA) y obtén lenguaje de audiencia, objeciones y ángulos.
        </p>
      </div>
      <MarketIntelPanel />
    </div>
  );
}
