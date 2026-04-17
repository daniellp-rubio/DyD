"use client";

import Image from "next/image";
import { MouseEvent, useEffect, useRef, useState } from "react";

type ZoomImageProps = {
  src: string;
  alt: string;
  lensSize?: number;
  zoom?: number;
  className?: string;
  width?: number;
  height?: number;
};

export const ZoomImage = ({ src, alt, lensSize = 160, zoom = 2, className, width = 2000, height = 2000 }: ZoomImageProps) => {
  const wrapRef = useRef<HTMLDivElement>(null);

  const [pos, setPos] = useState<{ x: number; y: number } | null>(null);
  const [rendered, setRendered] = useState({ w: 0, h: 0 });
  const [natural, setNatural] = useState({ w: 0, h: 0 });

  const measure = () => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (r) setRendered({ w: r.width, h: r.height });
  };

  useEffect(() => {
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [])

  const scaleX = rendered.w ? natural.w / rendered.w : 1;
  const scaleY = rendered.h ? natural.h / rendered.h : 1;

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const r = lensSize / 2;
    const cx = Math.max(r, Math.min(x, rect.width - r));
    const cy = Math.max(r, Math.min(y, rect.height - r));

    setPos({ x: cx, y: cy });
  };

  const bgW = natural.w * zoom;
  const bgH = natural.h * zoom;

  const maxZoom = natural.w / rendered.w;
  const appliedZoom = Math.min(zoom, maxZoom);

  const bgLeft = pos ? -(pos.x * scaleX * appliedZoom - lensSize / 2) : 0;
  const bgTop = pos ? -(pos.y * scaleY * appliedZoom - lensSize / 2) : 0;

  return (
    <div
      ref={wrapRef}
      className={`relative inline-block ${className ?? ""}`}
      onPointerMove={onMove}
      onPointerLeave={() => setPos(null)}
      onPointerDown={onMove}
      onPointerUp={() => setPos(null)}
      style={{ touchAction: "none" }}
    >
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="rounded mb-5"
        style={{ maxWidth: "100%", height: "auto" }}
        onLoadingComplete={(img) => setNatural({ w: img.naturalWidth, h: img.naturalHeight })}
        priority={false}
      />

      {pos && (
        <div
          className="absolute rounded-full border-2 border-gray-300 pointer-events-none z-10 shadow"
          style={{
            width: lensSize,
            height: lensSize,
            top: Math.max(lensSize / 2, Math.min(pos.y, rendered.h - lensSize / 2)) - lensSize / 2,
            left: Math.max(lensSize / 2, Math.min(pos.x, rendered.w - lensSize / 2)) - lensSize / 2,
            backgroundImage: `url(${src})`,
            backgroundRepeat: "no-repeat",
            backgroundSize: `${natural.w * appliedZoom}px ${natural.h * appliedZoom}px`,
            backgroundPosition: `
              ${-(Math.max(lensSize / 2, Math.min(pos.x, rendered.w - lensSize / 2)) * scaleX * appliedZoom - lensSize / 2)}px
              ${-(Math.max(lensSize / 2, Math.min(pos.y, rendered.h - lensSize / 2)) * scaleY * appliedZoom - lensSize / 2)}px
            `,
          }}
        />
      )}
    </div>
  );
};
