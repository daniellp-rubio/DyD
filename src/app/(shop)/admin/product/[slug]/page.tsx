
import { redirect } from "next/navigation";

// Actions
import { getCategories, getProductBySlug } from "@/actions";

// Interfaces
import { Product, ProductImage } from "@/interfaces";

// Components
import { Title } from "@/components";
import { ProductForm } from "./ui/ProductForm";
import { AdCopyButton } from "./ui/AdCopyButton";

interface Params {
  slug: string
}

interface Props {
  params: Promise<Params>
};

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

  const [product, categories] = await Promise.all([
    getProductBySlug(slug),
    getCategories()
  ])

  if (!product && slug !== "new") {
    redirect("/admin/products")
  };

  const title = slug === "new" ? "Nuevo Producto" : "Editar producto";

  return (
    <>
      <Title title={title} />

      <ProductForm product={product ?? ({} as Partial<Product> & { ProductImage?: ProductImage[] })} categories={categories} />

      {product?.id && <AdCopyButton productId={product.id} />}
    </>
  );
};
