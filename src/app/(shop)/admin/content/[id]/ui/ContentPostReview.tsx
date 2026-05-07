"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveContentPost } from "@/actions/content/approve-content-post";
import { rejectContentPost } from "@/actions/content/reject-content-post";
import { triggerGeneration } from "@/actions/content/trigger-generation";
import { publishPost } from "@/actions/content/publish-content-post";
import { PlatformPreview } from "./PlatformPreview";
import type { ContentPostDetail } from "@/interfaces/content.interface";

interface Props {
  post: ContentPostDetail;
}

export function ContentPostReview({ post }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [adminNotes, setAdminNotes] = useState(post.adminNotes ?? "");
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  const handleApprove = () => {
    startTransition(async () => {
      const result = await approveContentPost(post.id, adminNotes);
      if (result.ok) {
        setMessage({ type: "ok", text: "Post aprobado correctamente." });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.message });
      }
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      const result = await rejectContentPost(post.id, adminNotes);
      if (result.ok) {
        setMessage({ type: "ok", text: "Post rechazado." });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.message });
      }
    });
  };

  const handlePublish = () => {
    startTransition(async () => {
      const result = await publishPost(post.id);
      if (result.ok) {
        setMessage({ type: "ok", text: "Post publicado en todas las plataformas." });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.message });
      }
    });
  };

  const handleRegenerate = () => {
    startTransition(async () => {
      const result = await triggerGeneration(post.product.id);
      if (result.ok) {
        router.push(`/admin/content/${result.contentPostId}`);
      } else {
        setMessage({ type: "error", text: result.message });
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Product info */}
      <div className="bg-brand-gray rounded-xl p-4 flex items-center gap-4">
        {post.product.primaryImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.product.primaryImageUrl}
            alt={post.product.title}
            className="w-16 h-16 object-cover rounded-lg"
          />
        )}
        <div>
          <p className="font-extrabold text-brand-black text-lg">{post.product.title}</p>
          <p className="text-brand-smoke text-sm">
            {post.product.categoryName} · Stock: {post.product.inStock}
          </p>
        </div>
      </div>

      {/* Base copy */}
      {post.baseCopy && (
        <div>
          <h3 className="font-bold text-brand-black mb-2">Copy base generado</h3>
          <pre className="bg-brand-gray rounded-xl p-4 text-sm whitespace-pre-wrap font-sans text-brand-black">
            {post.baseCopy}
          </pre>
        </div>
      )}

      {/* Platform previews */}
      {post.platforms.length > 0 && (
        <div>
          <h3 className="font-bold text-brand-black mb-3">Contenido por plataforma</h3>
          <PlatformPreview
            platforms={post.platforms}
            fallbackImageUrl={post.baseImageUrl ?? post.product.primaryImageUrl}
          />
        </div>
      )}

      {/* Error log */}
      {post.errorLog && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4">
          <p className="font-bold text-red-700 mb-1 text-sm">Error del pipeline</p>
          <pre className="text-xs text-red-600 whitespace-pre-wrap">{post.errorLog}</pre>
        </div>
      )}

      {/* Actions */}
      {(post.status === "ready" || post.status === "approved" || post.status === "rejected" || post.status === "failed") && (
        <div className="border-t border-gray-200 pt-5 space-y-4">
          {post.status === "ready" && (
            <>
              <div>
                <label className="block text-sm font-bold text-brand-black mb-1">
                  Notas del admin (opcional)
                </label>
                <textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={2}
                  placeholder="Agregar notas o motivo de rechazo..."
                  className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:outline-none focus:border-brand-orange resize-none"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleApprove}
                  disabled={isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 rounded-lg font-bold text-sm transition-all disabled:opacity-60"
                >
                  {isPending ? "Procesando..." : "✓ Aprobar"}
                </button>
                <button
                  onClick={handleReject}
                  disabled={isPending}
                  className="flex-1 border border-red-300 text-red-600 hover:bg-red-50 py-2.5 rounded-lg font-bold text-sm transition-all disabled:opacity-60"
                >
                  ✕ Rechazar
                </button>
              </div>
            </>
          )}

          {post.status === "approved" && (
            <button
              onClick={handlePublish}
              disabled={isPending}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-bold text-sm transition-all disabled:opacity-60"
            >
              {isPending ? "Publicando..." : "↑ Publicar en redes"}
            </button>
          )}

          {(post.status === "rejected" || post.status === "failed") && (
            <button
              onClick={handleRegenerate}
              disabled={isPending}
              className="w-full bg-brand-orange hover:bg-[#E64A19] text-white py-2.5 rounded-lg font-bold text-sm transition-all disabled:opacity-60"
            >
              {isPending ? "Generando..." : "↻ Regenerar para este producto"}
            </button>
          )}
        </div>
      )}

      {/* Feedback message */}
      {message && (
        <div
          className={`rounded-xl p-4 text-sm font-semibold ${
            message.type === "ok"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
