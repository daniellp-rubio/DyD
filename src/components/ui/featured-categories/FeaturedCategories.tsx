import Link from "next/link";
import { FaHeadphones, FaGamepad, FaMobileAlt, FaPlug } from "react-icons/fa";

interface Category {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  image?: string;
}

const categories: Category[] = [
  {
    id: "audio",
    name: "Audio Premium",
    description: "Auriculares y parlantes",
    href: "/category/audio",
    icon: <FaHeadphones className="w-8 h-8" />,
    image: undefined,
  },
  {
    id: "gaming",
    name: "Gaming",
    description: "Equipos de alto rendimiento",
    href: "/category/gaming",
    icon: <FaGamepad className="w-8 h-8" />,
    image: undefined,
  },
  {
    id: "smart",
    name: "Smart Tech",
    description: "Wearables y accesorios",
    href: "/category/smart",
    icon: <FaMobileAlt className="w-8 h-8" />,
    image: undefined,
  },
  {
    id: "accesorios",
    name: "Accesorios",
    description: "Cargadores y conectividad",
    href: "/category/accesorios",
    icon: <FaPlug className="w-8 h-8" />,
    image: undefined,
  },
];

export const FeaturedCategories = () => {
  return (
    <section className="w-full bg-brand-white py-16 md:py-20">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10">
        <div className="text-center mb-12">
          <span className="text-brand-orange text-sm font-bold uppercase tracking-wider">Explora</span>
          <h2 className="text-3xl md:text-5xl font-extrabold text-brand-black mt-2 mb-3">
            Categorías Destacadas
          </h2>
          <p className="text-brand-smoke max-w-2xl mx-auto">
            Encuentra lo que buscas en nuestras colecciones curadas.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.href}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-brand-gray border border-gray-200 hover:border-brand-orange transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              {cat.image ? (
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-500"
                  style={{ backgroundImage: `url(${cat.image})` }}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-br from-brand-gray to-gray-200 flex items-center justify-center">
                  <div className="text-brand-smoke/40 group-hover:text-brand-orange/60 transition-colors">
                    {cat.icon}
                  </div>
                </div>
              )}

              <div className="absolute inset-0 bg-gradient-to-t from-brand-black/80 via-brand-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                <h3 className="text-brand-black group-hover:text-brand-white font-extrabold text-lg md:text-xl transition-colors">
                  {cat.name}
                </h3>
                <p className="text-brand-smoke group-hover:text-brand-gray text-sm opacity-0 group-hover:opacity-100 transition-all">
                  {cat.description}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
