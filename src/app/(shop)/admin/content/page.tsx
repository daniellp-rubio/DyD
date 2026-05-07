export const revalidate = 0;

import { redirect } from "next/navigation";
import { auth } from "@/auth-config";
import Link from "next/link";
import { getContentPosts } from "@/actions/content/get-content-posts";
import { triggerGeneration } from "@/actions/content/trigger-generation";
import type { PostStatus } from "@prisma/client";

const STATUS_BADGE: Record<PostStatus, { label: string; class: string }> = {
  draft:    { label: "Generando...", class: "bg-gray-100 text-gray-600" },
  ready:    { label: "Pendiente revisión", class: "bg-yellow-100 text-yellow-700" },
  approved: { label: "Aprobado", class: "bg-green-100 text-green-700" },
  published:{ label: "Publicado", class: "bg-blue-100 text-blue-700" },
  rejected: { label: "Rechazado", class: "bg-red-100 text-red-700" },
  failed:   { label: "Error", class: "bg-red-200 text-red-800" },
};

const ANGLE_LABEL: Record<string, string> = {
  new_product:  "Nuevo producto",
  low_stock:    "Stock bajo",
  promotion:    "Promoción",
  educational:  "Educativo",
};

interface Props {
  searchParams?: Promise<{ page?: string }>;
}

export default async function ContentAdminPage({ searchParams }: Props) {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/");

  const params = await searchParams;
  const page = params?.page ? parseInt(params.page) : 1;

  const { posts, totalPages } = await getContentPosts(page);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-brand-black">Contenido Social</h1>
          <p className="text-brand-smoke text-sm mt-1">
            Genera, revisa y aprueba publicaciones para Instagram y TikTok.
          </p>
        </div>
        <form action={async () => { "use server"; await triggerGeneration(); }}>
          <button
            type="submit"
            className="bg-brand-orange hover:bg-[#E64A19] text-white px-5 py-2.5 rounded-lg font-bold text-sm transition-all shadow-sm"
          >
            + Generar ahora
          </button>
        </form>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-brand-smoke">
          <p className="text-lg font-medium">No hay posts generados aún.</p>
          <p className="text-sm mt-1">Haz clic en &quot;Generar ahora&quot; para crear el primer post.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-brand-gray text-brand-black font-bold">
              <tr>
                <th className="text-left px-5 py-3">Producto</th>
                <th className="text-left px-5 py-3">Ángulo</th>
                <th className="text-left px-5 py-3">Estado</th>
                <th className="text-left px-5 py-3">Trigger</th>
                <th className="text-left px-5 py-3">Generado</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((post) => {
                const badge = STATUS_BADGE[post.status];
                return (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4 font-medium text-brand-black max-w-[220px] truncate">
                      {post.productTitle}
                    </td>
                    <td className="px-5 py-4 text-brand-smoke">
                      {post.angle ? ANGLE_LABEL[post.angle] : "—"}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${badge.class}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-brand-smoke capitalize">{post.triggerSource}</td>
                    <td className="px-5 py-4 text-brand-smoke">
                      {post.generatedAt
                        ? new Date(post.generatedAt).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" })
                        : "—"}
                    </td>
                    <td className="px-5 py-4 text-right">
                      <Link
                        href={`/admin/content/${post.id}`}
                        className="text-brand-orange font-bold hover:underline"
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 py-4 border-t border-gray-100">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/admin/content?page=${p}`}
                  className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all ${
                    p === page
                      ? "bg-brand-orange text-white"
                      : "bg-brand-gray text-brand-black hover:bg-gray-200"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
