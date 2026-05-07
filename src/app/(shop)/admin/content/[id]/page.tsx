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
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center gap-2 text-sm text-brand-smoke mb-6">
        <Link href="/admin/content" className="hover:text-brand-orange transition-colors">
          ← Contenido Social
        </Link>
        <span>/</span>
        <span className="text-brand-black font-medium truncate max-w-xs">{post.product.title}</span>
      </div>

      <div className="flex items-baseline justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-brand-black">Revisión de post</h1>
        <div className="text-right">
          <span className={`font-bold text-sm ${STATUS_COLOR[post.status]}`}>
            {STATUS_LABEL[post.status]}
          </span>
          {post.generatedAt && (
            <p className="text-xs text-brand-smoke mt-0.5">
              Generado: {new Date(post.generatedAt).toLocaleString("es-CO")}
            </p>
          )}
        </div>
      </div>

      <ContentPostReview post={post} />
    </div>
  );
}
