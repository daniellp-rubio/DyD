export const revalidate = 60;

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { getPaginatedProductsWithImages } from "@/actions";

import {
  HeroSection,
  TrustBadges,
  FeaturedCategories,
  BestSellers,
  Spotlight,
  ProductGrid,
  Testimonials,
  InstagramFeed,
  Newsletter,
} from "@/components";

export const metadata: Metadata = {
  title: "DYD Tech | Gadgets y Audio Premium en Colombia",
  description:
    "Descubre auriculares, AirPods, gaming y smart tech de alta fidelidad. Envío express en Colombia, pagos seguros y garantía extendida.",
  keywords: ["gadgets", "audio premium", "AirPods", "auriculares", "tecnología", "Colombia"],
  openGraph: {
    title: "DYD Tech | Gadgets y Audio Premium",
    description: "El verdadero estándar del audio premium. Envío express a todo Colombia.",
    type: "website",
    locale: "es_CO",
  },
};

interface Props {
  searchParams?: Promise<{
    page?: string;
  }>;
}

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const page = params?.page ? parseInt(params.page) : 1;

  const { products } = await getPaginatedProductsWithImages({ page });

  if (products.length === 0) {
    redirect("/");
  }

  const bestSellers = products.slice(0, 8);

  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "DYD Tech",
    url: "https://dydtech.com",
    logo: "https://dydtech.com/logo_compact_(640x640px).png",
    sameAs: [
      "https://www.instagram.com/tecnologiadyd/",
    ],
  };

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: products.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.title,
      url: `/product/${p.slug}`,
      image: p.images[0],
    })),
  };

  return (
    <div className="flex flex-col w-full bg-brand-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />

      <HeroSection />
      <TrustBadges />
      <FeaturedCategories />
      <BestSellers products={bestSellers} />

      <Spotlight
        title="Siente el ecosistema."
        subtitle="Conoce todas las generaciones de AirPods."
        image="https://res.cloudinary.com/dtttwxbgr/image/upload/v1748839317/airpods_-_Copy_bqx4t1.png"
        alt="AirPods"
        ctaText="Ver AirPods"
        ctaHref="#catalogo"
        variant="dark"
      />

      <section id="catalogo" className="max-w-[1440px] w-full mx-auto px-6 sm:px-10 py-16 scroll-mt-20">
        <div className="flex flex-col sm:flex-row items-baseline justify-between mb-10 w-full border-b border-gray-200 pb-4">
          <div>
            <span className="text-brand-orange text-sm font-bold uppercase tracking-wider">
              Todos los productos
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-brand-black mt-1">
              Catálogo Completo
            </h2>
          </div>
          <span className="text-brand-smoke font-medium">{products.length} Productos</span>
        </div>

        <ProductGrid products={products} />
      </section>

      <Testimonials />
      <Suspense fallback={null}>
        <InstagramFeed />
      </Suspense>
      <Newsletter />
    </div>
  );
}
