export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import { auth } from "@/auth-config";
import prisma from "@/lib/prisma";

export default async function TrendsPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/");

  const reports = await prisma.trendReport.findMany({
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-xl font-extrabold text-brand-black sm:text-2xl">Tendencias</h1>
        <p className="mt-1 text-sm text-brand-smoke">
          Reportes de oportunidades de producto detectadas por el scan diario.
        </p>
      </div>

      {reports.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center text-brand-smoke">
          <p className="text-base font-medium">No hay reportes de tendencias aún.</p>
          <p className="mt-1 text-sm">Se generan con el cron <code>/api/cron/trend-scan</code>.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reports.map((r) => {
            const opps = Array.isArray(r.opportunities) ? r.opportunities : [];
            return (
              <div key={r.id} className="rounded-2xl border border-gray-200 bg-white p-5">
                <p className="text-xs text-brand-smoke">
                  {new Date(r.createdAt).toLocaleString("es-CO", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                  {" · "}
                  {r.source}
                </p>
                <pre className="mt-2 whitespace-pre-wrap font-sans text-sm text-brand-black">
                  {r.report}
                </pre>
                {opps.length > 0 && (
                  <details className="mt-3">
                    <summary className="cursor-pointer text-sm font-bold text-brand-orange">
                      {opps.length} oportunidades (JSON)
                    </summary>
                    <pre className="mt-2 overflow-x-auto rounded-lg bg-brand-gray p-3 text-xs text-brand-black">
                      {JSON.stringify(r.opportunities, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
