import { FaShippingFast, FaLock, FaHeadset, FaUndoAlt } from "react-icons/fa";

export const TrustBadges = () => {
  const badges = [
    {
      icon: <FaShippingFast className="w-8 h-8 md:w-10 md:h-10 text-brand-blue mb-4" />,
      title: "Envío Express",
      description: "A todo el país en compras superiores a $150.000 COP"
    },
    {
      icon: <FaLock className="w-8 h-8 md:w-10 md:h-10 text-brand-blue mb-4" />,
      title: "Pagos 100% Seguros",
      description: "Tus datos protegidos con alto cifrado SSL"
    },
    {
      icon: <FaHeadset className="w-8 h-8 md:w-10 md:h-10 text-brand-blue mb-4" />,
      title: "Soporte Técnico 24/7",
      description: "Atención inmediata por profesionales"
    },
    {
      icon: <FaUndoAlt className="w-8 h-8 md:w-10 md:h-10 text-brand-blue mb-4" />,
      title: "Garantía Extendida",
      description: "Devoluciones sin costo por 30 días"
    }
  ];

  return (
    <section className="bg-brand-gray border-y border-gray-200 py-12 md:py-16">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 divide-y sm:divide-y-0 sm:divide-x divide-gray-300">
          {badges.map((badge, i) => (
            <div key={i} className="flex flex-col items-center text-center px-4 pt-8 sm:pt-0">
              {badge.icon}
              <h3 className="text-brand-black font-extrabold text-lg mb-2">{badge.title}</h3>
              <p className="text-brand-smoke font-medium text-sm">{badge.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
