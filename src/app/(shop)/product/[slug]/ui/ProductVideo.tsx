interface Props {
  videoUrl: string;
  title: string;
}

function extractYoutubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  );
  return match?.[1] ?? null;
}

export function ProductVideo({ videoUrl, title }: Props) {
  const ytId = extractYoutubeId(videoUrl);

  if (ytId) {
    return (
      <section aria-label="Video del producto" className="mt-10">
        <h2 className="text-xl font-extrabold text-brand-black mb-4">
          Video del producto
        </h2>
        <div className="relative w-full overflow-hidden rounded-xl bg-black" style={{ paddingTop: "56.25%" }}>
          <iframe
            src={`https://www.youtube.com/embed/${ytId}?rel=0&modestbranding=1`}
            title={`Video: ${title}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            className="absolute inset-0 h-full w-full border-0"
          />
        </div>
      </section>
    );
  }

  // Direct video URL (MP4, Cloudinary, etc.)
  return (
    <section aria-label="Video del producto" className="mt-10">
      <h2 className="text-xl font-extrabold text-brand-black mb-4">
        Video del producto
      </h2>
      <video
        src={videoUrl}
        controls
        playsInline
        preload="metadata"
        className="w-full rounded-xl bg-black"
        aria-label={`Video: ${title}`}
      >
        <p>Tu navegador no soporta reproducción de video.</p>
      </video>
    </section>
  );
}
