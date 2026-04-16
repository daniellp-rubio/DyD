// Components
import { ProductGridItem } from "./ProductGridItem";

// Types
import { Product } from "@/interfaces";
interface Props {
  products: Product[];
  tag: string;
};

export const ProductGrid = ({ products, tag }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-30 px-6 sm:px-0 mb-10">
      {
        [...products]
          .filter(product =>
            product.tags.some(t =>
              t.includes(tag)
            )
          )
          .sort((a, b) => a.position - b.position)
          .map(product => (
            <ProductGridItem
              key={product.slug}
              product={product}
            />
          ))
      }
    </div>
  );
};
