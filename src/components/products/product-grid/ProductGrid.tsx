// Components
import { ProductGridItem } from "./ProductGridItem";

// Types
import { Product } from "@/interfaces";

interface Props {
  products: Product[];
};

export const ProductGrid = ({ products }: Props) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 mb-10">
      {
        products.map(product => (
          <ProductGridItem
            key={product.slug}
            product={product}
          />
        ))
      }
    </div>
  );
};
