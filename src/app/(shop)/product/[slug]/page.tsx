export const revalidate = 604800;

import { Metadata } from "next";
import { notFound } from "next/navigation";

// Actions
import { getPaginatedProductsWithImages, getProductBySlug } from "@/actions";

// Components
import { DescriptionProductMobile } from "@/components/product/description/DescriptionProductMobile";
import { DescriptionProduct } from "@/components/product/description/DescriptionProduct";
import { ProductMobileSlideshow, ProductSlideshow } from "@/components";
import StockLabel from "@/components/product/stock-label/StockLabel";
import { ProductCard } from "@/components/product/card/Card";
import { ProductViewTracker } from "./ui/ProductViewTracker";
import { ViewerCount } from "./ui/ViewerCount";
import { StarRating } from "./ui/StarRating";
import ButtonSlide from "./ui/ButtonSlide";
import AddToCart from "./ui/AddToCart";

// Icons
import { FaTruck, FaShieldAlt, FaCheckCircle } from "react-icons/fa";

// Fonts
import { inter } from "@/config/fonts";

// Utils
import { formatToCOP } from "@/utils";

interface Params {
  slug: string
}

interface Props {
  params: Promise<Params>
};

export async function generateMetadata(
  { params }: Props,
  // parent: ResolvingMetadata
): Promise<Metadata> {
  const slug = (await params).slug;

  const product = await getProductBySlug(slug);

  // const post = await fetch(`https://api.vercel.app/blog/${slug}`).then((res) =>
  //   res.json()
  // )

  return {
    title: product?.title ?? "Producto no encontrado",
    description: product?.description ?? "",
    openGraph: {
      title: product?.title ?? "Producto no encontrado",
      description: product?.description ?? "",
      images: [`/products/${product?.images[1]}`]
    }
  };
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const { products } = await getPaginatedProductsWithImages({ page: 1 });

  if(!product) notFound();

  return (
    <>
      <div className="mt-5 mb-20 grid grid-cols-1 md:grid-cols-6 gap-3">
        <ProductViewTracker product={product} />

        <div className="col-span-1 md:col-span-3">
          <ProductMobileSlideshow
            title={product.title}
            images={product.images.slice(2)}
            className="block md:hidden"
          />

          <ProductSlideshow
            title={product.title}
            images={product.images.slice(2)}
            className="hidden md:block"
          />

          <ButtonSlide />
        </div>

        <div className="col-span-3 px-5">
          <div className="relative inline-block">
            {/* Etiqueta con flecha */}
            <div className="bg-palet-orange text-white font-semibold px-4 py-2 rounded-l-md relative mb-5 top-0 left-[-0.2rem]">
              <div className="absolute top-0 right-[-15px] w-0 h-0 border-t-[20px] border-t-transparent border-l-[15px] border-l-palet-orange border-b-[20px] border-b-transparent"></div>
              <div className="flex items-center gap-2">
                <FaCheckCircle />
                Producto recomendado
              </div>
            </div>
          </div>

          <StockLabel slug={product.slug} />
          <h1 className={`${inter.className} antialiased font-bold text-lg`}>
            {product.title}
          </h1>

          <div className="flex items-center gap-2 mb-5">
            {/* Precio actual */}
            <span className="text-palet-orange-dyd font-bold text-lg">
              {formatToCOP(product.price)}
            </span>
            {/* Precio anterior tachado */}
            <span className="text-gray-500 line-through text-md">
              {formatToCOP(product.priceInOffer)}
            </span>
          </div>

          <StarRating value={4.8} totalRatings={18} readOnly />
          <ViewerCount min={3} max={8} refreshMs={10000} />
          <AddToCart product={product} mode="normal" />

          <div className="text-white text-sm space-y-2">
            <div className="flex items-center gap-2">
              <FaTruck className="text-blue-400 text-lg" />
              <span>
                Entrega estimada:{" "}
                <strong>1-3 días</strong> (Colombia),{" "}
                <strong>Envío Flash Contraentrega</strong> (Medellín)
              </span>
            </div>

            <div className="flex items-center gap-2">
              <FaShieldAlt className="text-green-400 text-lg" />
              <span><strong>Compra con seguridad</strong>, calidad, confianza y garantía</span>
            </div>
          </div>
        </div>

      </div>

      <div id="product-description" className="col-span-6 md:px-25 mt-5">
        <h3 className="font-bold text-[1.25rem]">Descripción</h3>
        <DescriptionProductMobile
          title={product.title}
          descriptionImages={product.descriptionImagesMobile}
          className="block md:hidden"
        />

        <DescriptionProduct
          title={product.title}
          descriptionImages={product.descriptionImages}
          className="hidden md:block"
        />
      </div>

      <div className="col-span-6 md:px-25 mt-5">
        <h3 className="font-bold text-[1.25rem]">Nuestros clientes también compraron</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4">
          {products
            .filter(item => item.tags.includes("airpods") && item.id !== product.id)
            .slice(0, 4)
            .map(item => (
              <ProductCard
                key={item.id}
                product={item}
              />
          ))}
        </div>
      </div>

      {/* <InsersectionObserver product={product} /> */}
    </>
  );
};
