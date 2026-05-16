"use client";

import { useState } from "react";
import type { SocialPlatform } from "@prisma/client";

interface PlatformPost {
  id: string;
  platform: SocialPlatform;
  caption: string;
  hashtags: string[];
  imageUrl: string;
  hookLine: string | null;
  suggestedPostTime: string | null;
}

interface Props {
  platforms: PlatformPost[];
  fallbackImageUrl?: string;
  videoUrl?: string | null;
}

export function PlatformPreview({ platforms, fallbackImageUrl, videoUrl }: Props) {
  const ig = platforms.find((p) => p.platform === "instagram");
  const tt = platforms.find((p) => p.platform === "tiktok");

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      alert(`${label} copiado al portapapeles`);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {ig && (
        <PlatformCard
          title="Instagram"
          platform="instagram"
          post={ig}
          fallbackImageUrl={fallbackImageUrl}
          videoUrl={videoUrl}
          onCopy={copyToClipboard}
        />
      )}
      {tt && (
        <PlatformCard
          title="TikTok"
          platform="tiktok"
          post={tt}
          fallbackImageUrl={fallbackImageUrl}
          videoUrl={videoUrl}
          onCopy={copyToClipboard}
        />
      )}
    </div>
  );
}

function PlatformCard({
  title,
  platform,
  post,
  fallbackImageUrl,
  videoUrl,
  onCopy,
}: {
  title: string;
  platform: SocialPlatform;
  post: PlatformPost;
  fallbackImageUrl?: string;
  videoUrl?: string | null;
  onCopy: (text: string, label: string) => void;
}) {
  const [tab, setTab] = useState<"preview" | "video" | "copy">("preview");
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const res = await fetch(post.imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const date = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `dyd-${platform}-${date}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(post.imageUrl, "_blank");
    } finally {
      setIsDownloading(false);
    }
  };

  const isIG = platform === "instagram";
  const hashtags = post.hashtags.map((h) => `#${h}`).join(" ");
  const fullCopyText = isIG
    ? `${post.caption}\n\n${hashtags}`
    : `${post.hookLine ? post.hookLine + "\n\n" : ""}${post.caption}\n\n${hashtags}`;

  type TabId = "preview" | "video" | "copy";
  const tabs: TabId[] = ["preview", ...(videoUrl ? (["video"] as TabId[]) : []), "copy"];

  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white">
      <div className="flex items-center justify-between px-4 py-3 bg-brand-gray border-b border-gray-200">
        <span className="font-bold text-brand-black">{title}</span>
        {post.suggestedPostTime && (
          <span className="text-xs text-brand-smoke">📅 {post.suggestedPostTime}</span>
        )}
      </div>

      <div className="flex border-b border-gray-100">
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-bold capitalize transition-colors ${
              tab === t ? "text-brand-orange border-b-2 border-brand-orange" : "text-brand-smoke"
            }`}
          >
            {t === "preview" ? "Preview" : t === "video" ? "Video" : "Copiar"}
          </button>
        ))}
      </div>

      {tab === "preview" && (
        <div className="p-4 space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.imageUrl}
            alt="Preview"
            className={`w-full object-cover rounded-xl ${isIG ? "aspect-square" : "aspect-[9/16] max-h-[300px]"}`}
            loading="lazy"
            onError={(e) => {
              const img = e.currentTarget;
              if (!img.dataset.fallback && fallbackImageUrl) {
                img.dataset.fallback = "1";
                img.src = fallbackImageUrl;
              }
            }}
          />
          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full py-2 text-sm font-bold text-brand-orange border border-brand-orange rounded-lg hover:bg-brand-orange hover:text-white transition-colors disabled:opacity-50"
          >
            {isDownloading ? "Descargando..." : "↓ Descargar imagen"}
          </button>

          {!isIG && post.hookLine && (
            <p className="font-black text-brand-black text-base">{post.hookLine}</p>
          )}
          <p className="text-sm text-brand-black whitespace-pre-line line-clamp-6">{post.caption}</p>
          <div className="flex flex-wrap gap-1">
            {post.hashtags.slice(0, 8).map((h) => (
              <span key={h} className="text-xs bg-brand-orange/10 text-brand-orange px-2 py-0.5 rounded-full">
                #{h}
              </span>
            ))}
            {post.hashtags.length > 8 && (
              <span className="text-xs text-brand-smoke">+{post.hashtags.length - 8} más</span>
            )}
          </div>
        </div>
      )}

      {tab === "video" && videoUrl && (
        <div className="p-4 space-y-3">
          <video
            src={videoUrl}
            controls
            loop
            playsInline
            className={`w-full rounded-xl object-cover bg-black ${isIG ? "aspect-[9/16] max-h-[360px]" : "aspect-[9/16] max-h-[360px]"}`}
          />
          <a
            href={videoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="block w-full py-2 text-center text-sm font-bold text-brand-orange border border-brand-orange rounded-lg hover:bg-brand-orange hover:text-white transition-colors"
          >
            ↓ Descargar video
          </a>
          {!isIG && post.hookLine && (
            <p className="font-black text-brand-black text-base">{post.hookLine}</p>
          )}
          <p className="text-sm text-brand-black whitespace-pre-line line-clamp-4">{post.caption}</p>
        </div>
      )}

      {tab === "copy" && (
        <div className="p-4 space-y-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-brand-smoke uppercase">Caption completo</span>
              <button
                onClick={() => onCopy(fullCopyText, "Caption")}
                className="text-xs text-brand-orange font-bold hover:underline"
              >
                Copiar todo
              </button>
            </div>
            <pre className="text-xs bg-brand-gray rounded-lg p-3 whitespace-pre-wrap font-sans max-h-48 overflow-y-auto">
              {fullCopyText}
            </pre>
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-brand-smoke uppercase">Hashtags</span>
              <button
                onClick={() => onCopy(hashtags, "Hashtags")}
                className="text-xs text-brand-orange font-bold hover:underline"
              >
                Copiar
              </button>
            </div>
            <p className="text-xs text-brand-blue break-all">{hashtags}</p>
          </div>
        </div>
      )}
    </div>
  );
}
