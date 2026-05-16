"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { approveContentPost } from "@/actions/content/approve-content-post";
import { rejectContentPost } from "@/actions/content/reject-content-post";
import { triggerGeneration } from "@/actions/content/trigger-generation";
import { publishPost } from "@/actions/content/publish-content-post";
import { generateVideo } from "@/actions/content/generate-video";
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

  const handleGenerateVideo = () => {
    startTransition(async () => {
      const result = await generateVideo(post.id);
      if (result.ok) {
        setMessage({ type: "ok", text: "Generación de video iniciada. Puede tardar 2–5 min." });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.message });
      }
    });
  };

  const handleRetryVideo = () => {
    startTransition(async () => {
      const result = await generateVideo(post.id);
      if (result.ok) {
        setMessage({ type: "ok", text: "Reintentando generación de video…" });
        router.refresh();
      } else {
        setMessage({ type: "error", text: result.message });
      }
    });
  };

  return (
    <div className="space-y-5 sm:space-y-6">

      {/* Product info */}
      <div className="flex items-center gap-3 rounded-xl bg-brand-gray p-3 sm:gap-4 sm:p-4">
        {post.product.primaryImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.product.primaryImageUrl}
            alt={post.product.title}
            className="size-14 shrink-0 rounded-lg object-cover sm:size-16"
          />
        )}
        <div className="min-w-0">
          <p className="truncate font-extrabold text-brand-black sm:text-lg">{post.product.title}</p>
          <p className="mt-0.5 text-xs text-brand-smoke sm:text-sm">
            {post.product.categoryName} · Stock: {post.product.inStock}
          </p>
        </div>
      </div>

      {/* Base copy */}
      {post.baseCopy && (
        <div>
          <h3 className="mb-2 font-bold text-brand-black">Copy base generado</h3>
          <pre className="whitespace-pre-wrap rounded-xl bg-brand-gray p-3 font-sans text-sm text-brand-black sm:p-4">
            {post.baseCopy}
          </pre>
        </div>
      )}

      {/* Platform previews */}
      {post.platforms.length > 0 && (
        <div>
          <h3 className="mb-3 font-bold text-brand-black">Contenido por plataforma</h3>
          <PlatformPreview
            platforms={post.platforms}
            fallbackImageUrl={post.baseImageUrl ?? post.product.primaryImageUrl}
            videoUrl={post.videoUrl}
          />
        </div>
      )}

      {/* Video section — only shown for approved posts */}
      {post.status === "approved" && (
        <div className="rounded-xl border border-gray-200 p-4 space-y-3">
          <h3 className="font-bold text-brand-black">Video generado por IA</h3>

          {/* No video yet */}
          {!post.videoStatus && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-brand-smoke">
                Genera un video animado del producto para Reels y TikTok.
              </p>
              <button
                onClick={handleGenerateVideo}
                disabled={isPending}
                className="shrink-0 rounded-lg bg-purple-600 px-4 py-2.5 text-sm font-bold text-white transition-all hover:bg-purple-700 disabled:opacity-60"
              >
                {isPending ? "Iniciando…" : "▶ Generar Video"}
              </button>
            </div>
          )}

          {/* Generating */}
          {post.videoStatus === "generating" && (
            <div className="flex items-center gap-3 rounded-lg bg-purple-50 border border-purple-200 p-3">
              <svg className="size-5 animate-spin text-purple-600 shrink-0" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              <div>
                <p className="text-sm font-bold text-purple-700">Generando video…</p>
                <p className="text-xs text-purple-600">Puede tardar 2–5 minutos. La página se actualiza automáticamente.</p>
              </div>
            </div>
          )}

          {/* Pending (queued) */}
          {post.videoStatus === "pending" && (
            <div className="rounded-lg bg-yellow-50 border border-yellow-200 p-3">
              <p className="text-sm font-bold text-yellow-700">En cola…</p>
              <p className="text-xs text-yellow-600">El video comenzará a generarse en breve.</p>
            </div>
          )}

          {/* Ready */}
          {post.videoStatus === "ready" && post.videoUrl && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-bold text-green-700">✓ Video listo</span>
              </div>
              <video
                src={post.videoUrl}
                controls
                loop
                className="w-full max-w-sm rounded-xl aspect-[9/16] object-cover bg-black"
              />
              <div className="flex gap-2">
                <a
                  href={post.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-lg border border-brand-orange px-3 py-2 text-xs font-bold text-brand-orange hover:bg-brand-orange hover:text-white transition-colors"
                >
                  ↓ Descargar
                </a>
                <button
                  onClick={handleGenerateVideo}
                  disabled={isPending}
                  className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-bold text-brand-smoke hover:bg-gray-50 disabled:opacity-60 transition-colors"
                >
                  ↻ Regenerar
                </button>
              </div>
            </div>
          )}

          {/* Failed */}
          {post.videoStatus === "failed" && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 space-y-2">
              <p className="text-sm font-bold text-red-700">Error generando video</p>
              <button
                onClick={handleRetryVideo}
                disabled={isPending}
                className="rounded-lg bg-red-600 px-3 py-2 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60 transition-colors"
              >
                {isPending ? "Reintentando…" : "↻ Reintentar"}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error log */}
      {post.errorLog && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 sm:p-4">
          <p className="mb-1 text-sm font-bold text-red-700">Error del pipeline</p>
          <pre className="whitespace-pre-wrap text-xs text-red-600">{post.errorLog}</pre>
        </div>
      )}

      {/* Actions */}
      {(post.status === "ready" || post.status === "approved" || post.status === "rejected" || post.status === "failed") && (
        <div className="space-y-4 border-t border-gray-200 pt-5">

          {post.status === "ready" && (
            <>
              <div>
                <label htmlFor="admin-notes" className="mb-1 block text-sm font-bold text-brand-black">
                  Notas del admin (opcional)
                </label>
                <textarea
                  id="admin-notes"
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  rows={2}
                  placeholder="Agregar notas o motivo de rechazo..."
                  className="w-full resize-none rounded-lg border border-gray-300 p-3 text-sm focus:border-brand-orange focus:outline-none"
                />
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  onClick={handleApprove}
                  disabled={isPending}
                  className="flex-1 rounded-lg bg-green-600 py-3 text-sm font-bold text-white transition-all hover:bg-green-700 disabled:opacity-60 sm:py-2.5"
                >
                  {isPending ? "Procesando..." : "✓ Aprobar"}
                </button>
                <button
                  onClick={handleReject}
                  disabled={isPending}
                  className="flex-1 rounded-lg border border-red-300 py-3 text-sm font-bold text-red-600 transition-all hover:bg-red-50 disabled:opacity-60 sm:py-2.5"
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
              className="w-full rounded-lg bg-blue-600 py-3 text-sm font-bold text-white transition-all hover:bg-blue-700 disabled:opacity-60 sm:py-2.5"
            >
              {isPending ? "Publicando..." : "↑ Publicar en redes"}
            </button>
          )}

          {(post.status === "rejected" || post.status === "failed") && (
            <button
              onClick={handleRegenerate}
              disabled={isPending}
              className="w-full rounded-lg bg-brand-orange py-3 text-sm font-bold text-white transition-all hover:bg-[#E64A19] disabled:opacity-60 sm:py-2.5"
            >
              {isPending ? "Generando..." : "↻ Regenerar para este producto"}
            </button>
          )}
        </div>
      )}

      {/* Feedback */}
      {message && (
        <div
          className={`rounded-xl border p-4 text-sm font-semibold ${
            message.type === "ok"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {message.text}
        </div>
      )}
    </div>
  );
}
