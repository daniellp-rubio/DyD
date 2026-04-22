export const revalidate = 60

import { notFound } from "next/navigation";

// Components
import { ProductGrid, Title } from "@/components";

// Actions
import { getPaginatedProductsWithImages } from "@/actions";

interface Params {
  id: string;
};

interface Props {
  params: Promise<Params>;
};

export default async function CategoryPage({ params }: Props) {
  const { id } = await params;
  const page = 1;

  if (id !== "products" && id !== "airpods") notFound();

  const { products } = await getPaginatedProductsWithImages({ page });

  const labels = {
    'products': "Productos",
    'airpods': "AirPods"
  }

  return (
    <div>
      <Title
        title={labels[id]}
        subtitle="Todos los productos"
        className="mb-2"
      />

      <ProductGrid
        products={products}
        tag={id}
      />
    </div>
  );
};