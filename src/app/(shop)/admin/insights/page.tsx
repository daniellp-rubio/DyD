export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth } from "@/auth-config";
import prisma from "@/lib/prisma";

export default async function InsightsPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/");

  const insights = await prisma.adInsight.findMany({
    orderBy: { capturedAt: "desc" },
    take: 50,
  });

  const totalSpend = insights.reduce((s, i) => s + i.spend, 0);

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-brand-black sm:text-2xl">Insights de ads</h1>
        <p className="mt-1 text-sm text-brand-smoke">
          Métricas de Meta Ads capturadas por el cron de optimización.
        </p>
      </div>

      {insights.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center text-brand-smoke">
          <p className="text-base font-medium">No hay insights aún.</p>
          <p className="mt-1 text-sm">
            Se llenan con el cron <code>/api/cron/ads-optimize</code> cuando haya campañas activas.
          </p>
        </div>
      ) : (
        <>
          <p className="mb-3 text-sm text-brand-smoke">
            Spend total (últimas {insights.length} filas):{" "}
            <span className="font-bold text-brand-black">{totalSpend.toFixed(0)} COP</span>
          </p>
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
            <table className="w-full text-sm">
              <thead className="bg-brand-gray font-bold text-brand-black">
                <tr>
                  <th className="px-4 py-3 text-left">Campaña</th>
                  <th className="px-4 py-3 text-right">Spend</th>
                  <th className="px-4 py-3 text-right">Impr.</th>
                  <th className="px-4 py-3 text-right">Clicks</th>
                  <th className="px-4 py-3 text-right">CTR</th>
                  <th className="px-4 py-3 text-right">CPC</th>
                  <th className="px-4 py-3 text-left">Capturado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {insights.map((i) => (
                  <tr key={i.id} className="transition-colors hover:bg-gray-50">
                    <td className="max-w-[180px] truncate px-4 py-3 font-medium text-brand-black">
                      {i.campaignId}
                    </td>
                    <td className="px-4 py-3 text-right text-brand-smoke">{i.spend.toFixed(0)}</td>
                    <td className="px-4 py-3 text-right text-brand-smoke">{i.impressions}</td>
                    <td className="px-4 py-3 text-right text-brand-smoke">{i.clicks}</td>
                    <td className="px-4 py-3 text-right text-brand-smoke">{i.ctr.toFixed(2)}</td>
                    <td className="px-4 py-3 text-right text-brand-smoke">{i.cpc.toFixed(0)}</td>
                    <td className="px-4 py-3 text-brand-smoke">
                      {new Date(i.capturedAt).toLocaleString("es-CO", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
