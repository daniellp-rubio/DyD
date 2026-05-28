export const revalidate = 604800;

import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { getProductBySlug, getTopProductSlugs, getPaginatedProductsWithImages } from "@/actions";

import {
  Breadcrumbs,
  ProductMobileSlideshow,
  ProductReviews,
  ProductSlideshow,
  ProductTabs,
  RelatedProducts
} from "@/components";
import StockLabel from "@/components/product/stock-label/StockLabel";
import AddToCart from "./ui/AddToCart";
import { ProductVideo } from "./ui/ProductVideo";

import { inter } from "@/config/fonts";
import { formatToCOP } from "@/utils";

interface Params {
  slug: string;
}

interface Props {
  params: Promise<Params>;
}

export async function generateStaticParams() {
  const slugs = await getTopProductSlugs(20);
  return slugs.map(slug => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return { title: "Producto no encontrado" };
  }

  const image = product.images[0];
  const description = product.description.slice(0, 160);

  return {
    title: product.title,
    description,
    keywords: product.tags,
    alternates: {
      canonical: `/product/${product.slug}`
    },
    openGraph: {
      title: product.title,
      description,
      type: "website",
      url: `/product/${product.slug}`,
      images: image ? [{ url: image, alt: product.title }] : []
    },
    twitter: {
      card: "summary_large_image",
      title: product.title,
      description,
      images: image ? [image] : []
    }
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.description,
    image: product.images,
    sku: product.id,
    category: product.category?.name,
    brand: { "@type": "Brand", name: "DYD Tech" },
    offers: {
      "@type": "Offer",
      priceCurrency: "COP",
      price: product.price,
      availability:
        product.inStock > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      url: `https://dydtech.com/product/${product.slug}`
    }
  };

  return (
    <article className="mt-5 mb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Breadcrumbs
        className="mb-4"
        items={[
          { label: "Inicio", href: "/" },
          ...(product.category
            ? [{ label: product.category.name, href: `/category/${product.category.id}` }]
            : []),
          { label: product.title }
        ]}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <section aria-label="Imágenes del producto" className="col-span-1 md:col-span-2">
          <ProductMobileSlideshow
            title={product.title}
            images={product.images}
            className="block md:hidden"
          />
          <ProductSlideshow
            title={product.title}
            images={product.images}
            className="hidden md:block"
          />
        </section>

        <section aria-label="Detalles del producto" className="col-span-1 px-5">
          <StockLabel slug={product.slug} className="mb-2" />

          <h1 className={`${inter.className} antialiased font-bold text-2xl md:text-3xl leading-tight mb-3`}>
            {product.title}
          </h1>

          <p className="text-3xl md:text-4xl font-extrabold text-brand-orange mb-5">
            {formatToCOP(product.price)}
          </p>

          <p className="text-sm text-green-600 font-medium mb-4">
            🚚 Pide hoy → Recibe en 2-3 días hábiles a todo Colombia
          </p>

          <StockLabel slug={product.slug} className="mb-3" />

          <AddToCart product={product} />
        </section>
      </div>

      {/* Video section — only renders when a videoUrl is set for this product.
          Cast handles the case where prisma generate hasn't been run yet. */}
      {(product as { videoUrl?: string | null }).videoUrl && (
        <ProductVideo
          videoUrl={(product as { videoUrl?: string | null }).videoUrl!}
          title={product.title}
        />
      )}

      <ProductTabs description={product.description} tags={product.tags} />

      <ProductReviews productId={product.id} slug={product.slug} />

      {product.category?.id && (
        <Suspense fallback={null}>
          <RelatedProducts categoryId={product.category.id} excludeSlug={product.slug} />
        </Suspense>
      )}
    </article>
  );
}
