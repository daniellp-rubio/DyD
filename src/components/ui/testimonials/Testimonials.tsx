import { FaStar, FaQuoteLeft } from "react-icons/fa";

interface Testimonial {
  id: string;
  name: string;
  role: string;
  rating: number;
  content: string;
  avatar?: string;
}

const testimonials: Testimonial[] = [
  {
    id: "1",
    name: "Carlos M.",
    role: "Medellín, Colombia",
    rating: 5,
    content: "Los AirPods llegaron en 2 días. La calidad del sonido es impresionante y el servicio al cliente fue excelente. 100% recomendado.",
    avatar: undefined,
  },
  {
    id: "2",
    name: "Laura P.",
    role: "Bogotá, Colombia",
    rating: 5,
    content: "Compré unos auriculares gaming y son increíbles. La cancelación de ruido es perfecta para trabajar. Definitivamente vuelvo a comprar.",
    avatar: undefined,
  },
  {
    id: "3",
    name: "Andrés R.",
    role: "Cali, Colombia",
    rating: 5,
    content: "Excelente tienda. Producto de calidad, envío rápido y cuando tuve una duda me respondieron al instante. No tienen competencia.",
    avatar: undefined,
  },
];

export const Testimonials = () => {
  return (
    <section className="w-full bg-brand-white py-16 md:py-24">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10">
        <div className="text-center mb-12">
          <span className="text-brand-orange text-sm font-bold uppercase tracking-wider">
            Clientes satisfechos
          </span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-brand-black mt-2 mb-3">
            Lo que dicen de nosotros
          </h2>
          <p className="text-brand-smoke max-w-2xl mx-auto">
            Miles de clientes confían en DYD Tech para sus gadgets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <article
              key={t.id}
              className="relative bg-brand-gray border border-gray-200 rounded-2xl p-6 md:p-8 hover:border-brand-orange hover:shadow-lg transition-all"
            >
              <FaQuoteLeft className="absolute top-6 right-6 text-brand-orange/20 w-10 h-10" />

              <div className="flex gap-1 text-yellow-400 mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <FaStar key={i} className="w-4 h-4" />
                ))}
              </div>

              <p className="text-brand-black/80 text-base leading-relaxed mb-6 min-h-[80px] italic">
                {t.content || (
                  <span className="text-brand-smoke/40 not-italic">
                    [Testimonio pendiente]
                  </span>
                )}
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                <div className="w-12 h-12 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange font-bold text-lg overflow-hidden">
                  {t.avatar ? (
                    <img src={t.avatar} alt={t.name} className="w-full h-full object-cover" />
                  ) : (
                    t.name.charAt(0).toUpperCase() || "?"
                  )}
                </div>
                <div>
                  <p className="text-brand-black font-bold text-sm">
                    {t.name || <span className="text-brand-smoke/40">[Nombre]</span>}
                  </p>
                  <p className="text-brand-smoke text-xs">
                    {t.role || <span className="text-brand-smoke/40">[Rol / ciudad]</span>}
                  </p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
