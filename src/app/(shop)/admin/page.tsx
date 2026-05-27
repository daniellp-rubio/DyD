import Link from "next/link";

const SECTIONS: { href: string; title: string; desc: string }[] = [
  { href: "/admin/content", title: "Contenido social", desc: "Genera, revisa y aprueba posts IG/TikTok." },
  { href: "/admin/products", title: "Productos", desc: "Catálogo, precios y stock." },
  { href: "/admin/orders", title: "Órdenes", desc: "Pedidos y estados de pago." },
  { href: "/admin/users", title: "Usuarios", desc: "Roles y cuentas." },
  { href: "/admin/market-intel", title: "Inteligencia de mercado", desc: "Análisis del nicho con IA." },
  { href: "/admin/trends", title: "Tendencias", desc: "Oportunidades de producto detectadas." },
  { href: "/admin/insights", title: "Insights de ads", desc: "Métricas de Meta Ads." },
];

export default function AdminPage() {
  return (
    <div className="mx-auto max-w-6xl p-4 sm:p-6">
      <h1 className="mb-6 text-xl font-extrabold text-brand-black sm:text-2xl">Panel de administración</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="rounded-2xl border border-gray-200 bg-white p-5 transition-all hover:border-brand-orange hover:shadow-sm"
          >
            <h2 className="font-extrabold text-brand-black">{s.title}</h2>
            <p className="mt-1 text-sm text-brand-smoke">{s.desc}</p>
            <span className="mt-3 inline-block text-sm font-bold text-brand-orange">Abrir →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
