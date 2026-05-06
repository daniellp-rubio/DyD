// Components
import { ProductGridItem } from "./ProductGridItem";

// Types
import { Product } from "@/interfaces";
interface Props {
  products: Product[];
  tag?: string;
}

export const ProductGrid = ({ products, tag }: Props) => {
  const filtered = tag
    ? [...products].filter((product) => product.tags.some((t) => t.includes(tag)))
    : [...products];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mb-10">
      {filtered
        .sort((a, b) => a.position - b.position)
        .map((product) => (
          <ProductGridItem key={product.slug} product={product} />
        ))}
    </div>
  );
};
