import Image from "next/image";
import Link from "next/link";
import { FaArrowRight, FaStar, FaBolt } from "react-icons/fa";

export const HeroSection = () => {
  return (
    <section className="relative w-full bg-brand-white overflow-hidden py-16 md:py-24 lg:py-32">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 flex flex-col-reverse md:flex-row items-center justify-between gap-12">

        {/* Left Content */}
        <div className="flex-1 text-center md:text-left z-10 flex flex-col items-center md:items-start">
          <span className="inline-flex items-center gap-2 px-4 py-1 mb-6 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-bold tracking-wide uppercase border border-brand-orange/20">
            <FaBolt className="animate-pulse" /> Nueva Colección 2026
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-7xl font-black text-brand-black leading-[1.1] mb-6 tracking-tight">
            El verdadero estándar del <span className="text-transparent bg-clip-text bg-gradient-to-br from-brand-orange to-red-500">Audio Premium</span>
          </h1>
          <p className="text-brand-smoke text-lg sm:text-xl font-medium mb-8 max-w-xl leading-relaxed opacity-90">
            Descubre nuestra nueva línea de periféricos de alta fidelidad elaborada especialmente para los verdaderos amantes de la tecnología.
          </p>

          {/* Social Proof */}
          <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 mb-8">
            <div className="flex items-center gap-2">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="w-4 h-4" />
                ))}
              </div>
              <span className="text-brand-black font-bold text-sm">4.9/5</span>
              <span className="text-brand-smoke text-sm opacity-70">(2.000+ clientes)</span>
            </div>
            <div className="hidden sm:block h-4 w-px bg-black/20" />
            <span className="text-brand-smoke text-sm font-medium">
              <span className="text-brand-orange font-bold">✓</span> Envío express a todo Colombia
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Link
              href="#catalogo"
              className="bg-brand-orange hover:bg-[#E64A19] text-brand-white px-8 py-4 rounded-xl font-bold flex items-center justify-center transition-all shadow-lg shadow-brand-orange/30 hover:-translate-y-1"
            >
              Comprar Ahora <FaArrowRight className="ml-2" />
            </Link>
            <Link
              href="#catalogo"
              className="bg-black/5 hover:bg-black/10 border border-black/20 text-brand-black px-8 py-4 rounded-xl font-bold flex items-center justify-center transition-all backdrop-blur-sm"
            >
              Ver Catálogo
            </Link>
          </div>
        </div>

        {/* Right Product Showcase */}
        <div className="flex-1 relative w-full max-w-lg md:max-w-xl z-10 flex items-center justify-center">
           <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-brand-orange/20 rounded-full blur-[100px] z-0 pointer-events-none"></div>
           <div className="relative z-10 w-full">
            <Image
              src="/hero-gadgets.png"
              alt="Auriculares Premium DYD Tech"
              width={600}
              height={600}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="w-full h-auto object-contain drop-shadow-2xl rounded-2xl"
              priority
            />
           </div>
        </div>
      </div>

      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
    </section>
  );
};
