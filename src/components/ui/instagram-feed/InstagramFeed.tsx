import Image from "next/image";
import { FaInstagram, FaPlay } from "react-icons/fa6";

import { getInstagramFeed } from "@/lib/instagram/getInstagramFeed";

const PROFILE_URL = process.env.NEXT_PUBLIC_INSTAGRAM_PROFILE_URL;

export const InstagramFeed = async () => {
  const posts = await getInstagramFeed(8);

  // Sin posts y sin perfil configurado: no renderizar nada (degradación elegante).
  if (posts.length === 0 && !PROFILE_URL) return null;

  return (
    <section
      aria-label="Instagram"
      className="max-w-[1440px] w-full mx-auto px-6 sm:px-10 py-16"
    >
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
        <div>
          <span className="text-brand-orange text-sm font-bold uppercase tracking-wider">
            Comunidad
          </span>
          <h2 className="text-3xl md:text-4xl font-extrabold text-brand-black mt-1">
            Síguenos en Instagram
          </h2>
        </div>
        {PROFILE_URL && (
          <a
            href={PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-brand-black px-5 py-2.5 font-bold text-white transition-all hover:bg-brand-orange self-start sm:self-auto"
          >
            <FaInstagram className="text-lg" />
            Seguir
          </a>
        )}
      </div>

      {posts.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
          {posts.map((post) => (
            <a
              key={post.id}
              href={post.permalink}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square overflow-hidden rounded-xl bg-brand-gray"
            >
              <Image
                src={post.imageUrl}
                alt={post.caption?.slice(0, 100) ?? "Publicación de Instagram"}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {post.isVideo && (
                <span className="absolute right-2 top-2 text-white drop-shadow">
                  <FaPlay />
                </span>
              )}
              <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/60 via-transparent to-transparent p-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <div className="flex items-center gap-2 text-white">
                  <FaInstagram className="shrink-0 text-lg" />
                  {post.caption && (
                    <span className="line-clamp-2 text-xs font-medium">{post.caption}</span>
                  )}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </section>
  );
};
