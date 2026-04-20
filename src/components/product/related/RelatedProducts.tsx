import { getRelatedProducts } from "@/actions";
import { ProductGridItem } from "@/components/products/product-grid/ProductGridItem";

interface Props {
  categoryId: string;
  excludeSlug: string;
}

export const RelatedProducts = async ({ categoryId, excludeSlug }: Props) => {
  const products = await getRelatedProducts({ categoryId, excludeSlug, take: 4 });

  if (products.length === 0) return null;

  return (
    <section aria-label="Productos relacionados" className="mt-16 px-5 sm:px-0">
      <h2 className="text-xl md:text-2xl font-bold mb-6">También te puede interesar</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map(p => (
          <ProductGridItem key={p.slug} product={p} />
        ))}
      </div>
    </section>
  );
};
