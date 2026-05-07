export const revalidate = 0;

import { redirect } from "next/navigation";
import { auth } from "@/auth-config";
import Link from "next/link";
import { getContentPosts } from "@/actions/content/get-content-posts";
import { triggerGeneration } from "@/actions/content/trigger-generation";
import type { PostStatus } from "@prisma/client";

const STATUS_BADGE: Record<PostStatus, { label: string; class: string }> = {
  draft:     { label: "Generando...",       class: "bg-gray-100 text-gray-600" },
  ready:     { label: "Pend. revisión",     class: "bg-yellow-100 text-yellow-700" },
  approved:  { label: "Aprobado",           class: "bg-green-100 text-green-700" },
  published: { label: "Publicado",          class: "bg-blue-100 text-blue-700" },
  rejected:  { label: "Rechazado",          class: "bg-red-100 text-red-700" },
  failed:    { label: "Error",              class: "bg-red-200 text-red-800" },
};

const STATUS_BADGE_FULL: Record<PostStatus, string> = {
  draft:     "Generando...",
  ready:     "Pendiente revisión",
  approved:  "Aprobado",
  published: "Publicado",
  rejected:  "Rechazado",
  failed:    "Error",
};

const ANGLE_LABEL: Record<string, string> = {
  new_product: "Nuevo producto",
  low_stock:   "Stock bajo",
  promotion:   "Promoción",
  educational: "Educativo",
};

interface Props {
  searchParams?: Promise<{ page?: string }>;
}

function Pagination({ page, totalPages }: { page: number; totalPages: number }) {
  return (
    <div className="flex justify-center gap-2 pt-4">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <Link
          key={p}
          href={`/admin/content?page=${p}`}
          className={`rounded-lg px-3 py-1.5 text-sm font-bold transition-all ${
            p === page
              ? "bg-brand-orange text-white"
              : "bg-brand-gray text-brand-black hover:bg-gray-200"
          }`}
        >
          {p}
        </Link>
      ))}
    </div>
  );
}

export default async function ContentAdminPage({ searchParams }: Props) {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/");

  const params = await searchParams;
  const page = params?.page ? parseInt(params.page) : 1;

  const { posts, totalPages } = await getContentPosts(page);

  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">

      {/* Header */}
      <div className="mb-6 flex flex-col gap-3 sm:mb-8 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-extrabold text-brand-black sm:text-2xl">Contenido Social</h1>
          <p className="mt-1 text-sm text-brand-smoke">
            Genera, revisa y aprueba publicaciones para Instagram y TikTok.
          </p>
        </div>
        <form action={async () => { "use server"; await triggerGeneration(); }} className="sm:shrink-0">
          <button
            type="submit"
            className="w-full rounded-lg bg-brand-orange px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#E64A19] sm:w-auto"
          >
            + Generar ahora
          </button>
        </form>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 py-20 text-center text-brand-smoke">
          <p className="text-base font-medium sm:text-lg">No hay posts generados aún.</p>
          <p className="mt-1 text-sm">Haz clic en &quot;Generar ahora&quot; para crear el primer post.</p>
        </div>
      ) : (
        <>
          {/* Mobile: card list */}
          <div className="space-y-3 md:hidden">
            {posts.map((post) => {
              const badge = STATUS_BADGE[post.status];
              return (
                <Link
                  key={post.id}
                  href={`/admin/content/${post.id}`}
                  className="flex items-start justify-between gap-3 rounded-2xl border border-gray-200 bg-white p-4 transition-colors active:bg-gray-50"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-brand-black">{post.productTitle}</p>
                    <p className="mt-0.5 text-xs text-brand-smoke">
                      {post.angle ? ANGLE_LABEL[post.angle] : "Sin ángulo"}
                      {" · "}
                      <span className="capitalize">{post.triggerSource}</span>
                    </p>
                    {post.generatedAt && (
                      <p className="mt-0.5 text-xs text-brand-smoke">
                        {new Date(post.generatedAt).toLocaleString("es-CO", {
                          dateStyle: "short",
                          timeStyle: "short",
                        })}
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${badge.class}`}>
                      {badge.label}
                    </span>
                    <span className="text-sm font-bold text-brand-orange">Ver →</span>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Desktop: table */}
          <div className="hidden overflow-hidden rounded-2xl border border-gray-200 bg-white md:block">
            <table className="w-full text-sm">
              <thead className="bg-brand-gray font-bold text-brand-black">
                <tr>
                  <th className="px-5 py-3 text-left">Producto</th>
                  <th className="px-5 py-3 text-left">Ángulo</th>
                  <th className="px-5 py-3 text-left">Estado</th>
                  <th className="px-5 py-3 text-left">Trigger</th>
                  <th className="px-5 py-3 text-left">Generado</th>
                  <th className="px-5 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((post) => {
                  const badge = STATUS_BADGE[post.status];
                  return (
                    <tr key={post.id} className="transition-colors hover:bg-gray-50">
                      <td className="max-w-[220px] truncate px-5 py-4 font-medium text-brand-black">
                        {post.productTitle}
                      </td>
                      <td className="px-5 py-4 text-brand-smoke">
                        {post.angle ? ANGLE_LABEL[post.angle] : "—"}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${badge.class}`}>
                          {STATUS_BADGE_FULL[post.status]}
                        </span>
                      </td>
                      <td className="px-5 py-4 capitalize text-brand-smoke">{post.triggerSource}</td>
                      <td className="px-5 py-4 text-brand-smoke">
                        {post.generatedAt
                          ? new Date(post.generatedAt).toLocaleString("es-CO", {
                              dateStyle: "short",
                              timeStyle: "short",
                            })
                          : "—"}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          href={`/admin/content/${post.id}`}
                          className="font-bold text-brand-orange hover:underline"
                        >
                          Ver →
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && <Pagination page={page} totalPages={totalPages} />}
        </>
      )}
    </div>
  );
}
