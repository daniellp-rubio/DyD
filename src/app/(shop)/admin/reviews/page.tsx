export const revalidate = 0;

import { redirect } from "next/navigation";
import Link from "next/link";

import { auth } from "@/auth-config";
import { getPendingReviews } from "@/actions";
import { ModerateButtons } from "./ui/ModerateButtons";

const formatDate = (date: Date) =>
  new Date(date).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" });

export default async function ReviewsAdminPage() {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/");

  const reviews = await getPendingReviews();

  return (
    <div className="mx-auto max-w-5xl p-4 sm:p-6">
      <div className="mb-6 sm:mb-8">
        <h1 className="text-xl font-extrabold text-brand-black sm:text-2xl">Moderación de reseñas</h1>
        <p className="mt-1 text-sm text-brand-smoke">
          Reseñas de usuarios no verificados pendientes de aprobación. Las de compradores verificados se publican
          automáticamente.
        </p>
      </div>

      {reviews.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 py-20 text-center text-brand-smoke">
          <p className="text-base font-medium sm:text-lg">No hay reseñas pendientes.</p>
          <p className="mt-1 text-sm">Todo al día.</p>
        </div>
      ) : (
        <ul className="space-y-4">
          {reviews.map((r) => (
            <li key={r.id} className="rounded-2xl border border-gray-200 bg-white p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/product/${r.productSlug}`}
                    className="font-bold text-brand-black hover:text-brand-orange"
                  >
                    {r.productTitle}
                  </Link>
                  <p className="mt-0.5 text-xs text-brand-smoke">
                    {r.authorName} · {r.authorEmail} · {formatDate(r.createdAt)}
                  </p>
                  <p className="mt-2 text-sm font-bold text-brand-orange">
                    {"★".repeat(r.rating)}
                    <span className="text-gray-300">{"★".repeat(5 - r.rating)}</span>
                    <span className="ml-2 text-brand-smoke">{r.rating}/5</span>
                  </p>
                  {r.comment && (
                    <p className="mt-2 text-sm leading-relaxed text-brand-black/80">{r.comment}</p>
                  )}
                </div>
                <div className="sm:shrink-0">
                  <ModerateButtons reviewId={r.id} />
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
