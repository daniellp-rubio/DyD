
import Image from "next/image";
import Link from "next/link";

// Utils
import { formatToCOP } from "@/utils";

// Types
import type { Product } from "@/interfaces";

type Props = {
  product: Product
};

export const ProductCard = ({ product }: Props) => {
  console.log("product", product);
  return (
    <Link
      href={`/product/${product.slug}`}
    >
      <div className="relative rounded-xl shadow-md hover:shadow-lg transition group p-3">
        <div className="relative">
            <Image
              src={product.images[0]}
              alt={product.title}
              width={2000}
              height={2000}
              className="rounded-lg object-cover"
            />
        </div>

        <h3 className="mt-3 text-sm font-medium line-clamp-3" title={product.title}>{product.title}</h3>

        <div className="mt-1">
          <span className="text-palet-orange font-bold">
            {formatToCOP(product.price)}
          </span>
          <span className="ml-2 text-gray-400 line-through text-sm">
            {formatToCOP(product.priceInOffer)}
          </span>
        </div>
      </div>
    </Link>
  );
};
