"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import clsx from "clsx";

import { getProductReviews, submitProductRating } from "@/actions";
import type { ProductReviewsData } from "@/interfaces";
import { StarRating } from "./StarRating";

interface Props {
  productId: string;
  slug: string;
}

const formatDate = (date: Date | string) =>
  new Date(date).toLocaleDateString("es-CO", { day: "numeric", month: "short", year: "numeric" });

export const ProductReviews = ({ productId, slug }: Props) => {
  const [data, setData] = useState<ProductReviewsData | null>(null);
  const [loading, setLoading] = useState(true);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; message: string } | null>(null);

  const load = useCallback(async () => {
    const result = await getProductReviews(productId);
    setData(result);
    if (result.myReview) {
      setRating(result.myReview.rating);
      setComment(result.myReview.comment ?? "");
    }
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating < 1) {
      setFeedback({ ok: false, message: "Selecciona de 1 a 5 estrellas." });
      return;
    }
    setSubmitting(true);
    setFeedback(null);
    const res = await submitProductRating({ productId, slug, rating, comment });
    setFeedback({ ok: res.ok, message: res.message });
    setSubmitting(false);
    if (res.ok) await load();
  };

  const summary = data?.summary;
  const reviews = data?.reviews ?? [];
  const myReview = data?.myReview ?? null;
  const isAuthenticated = data?.isAuthenticated ?? false;
  const maxBar = summary ? Math.max(...Object.values(summary.distribution), 1) : 1;

  return (
    <section aria-label="Reseñas del producto" className="mt-12 border-t border-gray-200 pt-10">
      <h2 className="text-2xl font-extrabold text-brand-black mb-6">Reseñas de clientes</h2>

      {loading ? (
        <p className="text-brand-smoke">Cargando reseñas...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Resumen + formulario */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <div className="flex items-end gap-3">
                <span className="text-5xl font-extrabold text-brand-black leading-none">
                  {summary ? summary.average.toFixed(1) : "0.0"}
                </span>
                <div className="pb-1">
                  <StarRating value={summary?.average ?? 0} readOnly showCount={false} className="mb-1" size={20} />
                  <p className="text-sm text-brand-smoke">
                    {summary?.total ?? 0} reseña{summary?.total !== 1 && "s"}
                  </p>
                </div>
              </div>

              <div className="mt-4 space-y-1.5">
                {([5, 4, 3, 2, 1] as const).map((star) => {
                  const count = summary?.distribution[star] ?? 0;
                  return (
                    <div key={star} className="flex items-center gap-2 text-sm">
                      <span className="w-3 text-brand-smoke">{star}</span>
                      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full rounded-full bg-brand-orange transition-all"
                          style={{ width: `${(count / maxBar) * 100}%` }}
                        />
                      </div>
                      <span className="w-6 text-right text-brand-smoke">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Formulario */}
            <div className="rounded-2xl border border-gray-200 bg-white p-5">
              {!isAuthenticated ? (
                <p className="text-sm text-brand-smoke">
                  <Link href="/auth/login" className="font-bold text-brand-orange hover:underline">
                    Inicia sesión
                  </Link>{" "}
                  para dejar tu reseña.
                </p>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <p className="font-bold text-brand-black">
                    {myReview ? "Edita tu reseña" : "Escribe una reseña"}
                  </p>

                  {myReview && (
                    <p
                      className={clsx("rounded-lg px-3 py-2 text-xs font-medium", {
                        "bg-yellow-100 text-yellow-700": myReview.status === "pending",
                        "bg-green-100 text-green-700": myReview.status === "approved",
                        "bg-red-100 text-red-700": myReview.status === "rejected",
                      })}
                    >
                      {myReview.status === "pending" && "Tu reseña está en revisión y aún no es pública."}
                      {myReview.status === "approved" && "Tu reseña está publicada."}
                      {myReview.status === "rejected" && "Tu reseña no fue aprobada. Puedes editarla y reenviarla."}
                    </p>
                  )}

                  <StarRating value={rating} onChange={setRating} showCount={false} className="mb-0" />

                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    maxLength={1000}
                    placeholder="Cuenta tu experiencia con el producto (opcional)"
                    className="w-full resize-none rounded-lg border border-gray-300 p-3 text-sm focus:border-brand-orange focus:outline-none"
                  />

                  {feedback && (
                    <p className={clsx("text-sm font-medium", feedback.ok ? "text-green-600" : "text-red-600")}>
                      {feedback.message}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full rounded-lg bg-brand-orange py-2.5 font-bold text-white transition-all hover:bg-palet-hover-orange disabled:opacity-50"
                  >
                    {submitting ? "Enviando..." : myReview ? "Actualizar reseña" : "Enviar reseña"}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Listado */}
          <div className="lg:col-span-2">
            {reviews.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-gray-300 py-16 text-center text-brand-smoke">
                <p className="font-medium">Todavía no hay reseñas publicadas.</p>
                <p className="mt-1 text-sm">Sé el primero en opinar sobre este producto.</p>
              </div>
            ) : (
              <ul className="space-y-5">
                {reviews.map((r) => (
                  <li key={r.id} className="border-b border-gray-100 pb-5 last:border-b-0">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-brand-black">{r.authorName}</span>
                        {r.verifiedBuyer && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-bold text-green-700">
                            Compra verificada
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-brand-smoke">{formatDate(r.createdAt)}</span>
                    </div>
                    <StarRating value={r.rating} readOnly showCount={false} size={16} className="my-1.5" />
                    {r.comment && <p className="text-sm leading-relaxed text-brand-black/80">{r.comment}</p>}
                    {r.photoUrl && (
                      <div className="mt-2">
                        <Image
                          src={r.photoUrl}
                          alt="Foto de la reseña"
                          width={160}
                          height={160}
                          className="rounded-lg object-cover border border-gray-100"
                          onError={(e) => {
                            // Hide broken images silently
                            (e.target as HTMLImageElement).style.display = "none";
                          }}
                        />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
