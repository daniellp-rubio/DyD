export const revalidate = 0;

import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth-config";
import Link from "next/link";
import { getContentPostById } from "@/actions/content/get-content-post-by-id";
import { ContentPostReview } from "./ui/ContentPostReview";
import type { PostStatus } from "@prisma/client";

const STATUS_LABEL: Record<PostStatus, string> = {
  draft:     "Generando...",
  ready:     "Pendiente revisión",
  approved:  "Aprobado",
  published: "Publicado",
  rejected:  "Rechazado",
  failed:    "Error en pipeline",
};

const STATUS_COLOR: Record<PostStatus, string> = {
  draft:     "text-gray-500",
  ready:     "text-yellow-600",
  approved:  "text-green-600",
  published: "text-blue-600",
  rejected:  "text-red-600",
  failed:    "text-red-800",
};

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ContentPostPage({ params }: Props) {
  const session = await auth();
  if (session?.user?.role !== "admin") redirect("/");

  const { id } = await params;
  const post = await getContentPostById(id);
  if (!post) notFound();

  return (
    <div className="mx-auto max-w-4xl p-4 sm:p-6">

      {/* Breadcrumb */}
      <div className="mb-5 flex items-center gap-1.5 text-sm text-brand-smoke sm:mb-6">
        <Link href="/admin/content" className="hover:text-brand-orange transition-colors shrink-0">
          ← Contenido Social
        </Link>
        <span>/</span>
        <span className="truncate text-brand-black font-medium">{post.product.title}</span>
      </div>

      {/* Page header */}
      <div className="mb-5 flex flex-col gap-2 sm:mb-6 sm:flex-row sm:items-baseline sm:justify-between">
        <h1 className="text-xl font-extrabold text-brand-black sm:text-2xl">Revisión de post</h1>
        <div className="sm:text-right">
          <span className={`font-bold text-sm ${STATUS_COLOR[post.status]}`}>
            {STATUS_LABEL[post.status]}
          </span>
          {post.generatedAt && (
            <p className="mt-0.5 text-xs text-brand-smoke">
              Generado:{" "}
              {new Date(post.generatedAt).toLocaleString("es-CO", {
                dateStyle: "short",
                timeStyle: "short",
              })}
            </p>
          )}
        </div>
      </div>

      <ContentPostReview post={post} />
    </div>
  );
}
