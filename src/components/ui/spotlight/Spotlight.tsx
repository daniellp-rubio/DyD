import Image from "next/image";
import Link from "next/link";
import { FaArrowRight } from "react-icons/fa";

interface Props {
  title: string;
  subtitle: string;
  image: string;
  alt: string;
  ctaText?: string;
  ctaHref?: string;
  variant?: "dark" | "light";
}

export const Spotlight = ({
  title,
  subtitle,
  image,
  alt,
  ctaText = "Ver colección",
  ctaHref = "#catalogo",
  variant = "dark",
}: Props) => {
  const isDark = variant === "dark";

  return (
    <section className={`w-full py-16 md:py-24 ${isDark ? "bg-brand-white" : "bg-brand-white"}`}>
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10">
        <div className="text-center mb-10">
          <h2 className={`text-4xl md:text-6xl font-black tracking-tight ${isDark ? "text-brand-black" : "text-brand-black"}`}>
            {title}
          </h2>
          <p className={`mt-3 text-lg md:text-xl ${isDark ? "text-brand-smoke" : "text-brand-smoke"}`}>
            {subtitle}
          </p>
        </div>

        <div className={`relative rounded-3xl overflow-hidden shadow-2xl ${isDark ? "border border-gray-200" : "border border-gray-200"}`}>
          <Image
            src={image}
            alt={alt}
            width={2400}
            height={1200}
            sizes="(max-width: 1440px) 100vw, 1440px"
            className="w-full h-auto object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-brand-black/60 via-transparent to-transparent flex items-end justify-center pb-8 md:pb-12">
            <Link
              href={ctaHref}
              className="bg-brand-orange hover:bg-[#E64A19] text-brand-white px-8 py-4 rounded-xl font-bold flex items-center justify-center transition-all shadow-lg shadow-brand-orange/30 hover:-translate-y-1"
            >
              {ctaText} <FaArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
