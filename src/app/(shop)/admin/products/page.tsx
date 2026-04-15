export const revalidate = 0;

import Link from 'next/link';
import Image from 'next/image';
import { redirect } from 'next/navigation';

// Actions
import { getPaginatedProductsWithImages } from '@/actions';

// Components
import { If, Title } from '@/components';

// Utils
import { formatToCOP } from '@/utils';

interface Props {
  searchParams?: Promise<{
    page?: string
  }>;
};

export default async function OrdersPage({ searchParams }: Props) {
  const params = await searchParams;
  const page = params?.page ? parseInt(params.page) : 1;

  const { products } = await getPaginatedProductsWithImages({ page });

  return (
    <>
      <Title title="Mantenimiento de productos" />

      <If condition={products.length === 0}>
        <p>No hay productos</p>
      </If>

      <If condition={products.length !== 0}>
        <div className="flex justify-end mb-5">
          <Link href="/admin/product/new" className="btn-primary">
            Nuevo producto
          </Link>
        </div>

        <div className="mb-[32.8rem]">
          <table className="min-w-full">
            <thead className="bg-palet-found-black border-b border-palet-found-black">
              <tr>
                <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
                  Imagen
                </th>
                <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
                  Titulo
                </th>
                <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
                  Precio
                </th>
                <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
                  Inventario
                </th>
              </tr>
            </thead>
            <tbody>
              {
                products.map(product => (
                  <tr key={product.id} className="bg-palet-black border-b border-palet-found-black transition duration-300 ease-in-out hover:bg-palet-found-black">
                    <td className="text-sm text-white font-light px-6 py-4 whitespace-nowrap">

                      <Link href={`/product/${product.slug}`}>
                        <Image
                          src={`${product.ProductImage[0].url ?? "https://res.cloudinary.com/dtttwxbgr/image/upload/v1758891433/placeholder_wnvwmw.jpg"}`}
                          width={2000}
                          height={2000}
                          alt={product.title}
                          className="w-25 h-25 object-cover rounded"
                        />
                      </Link>
                    </td>
                    <td className="text-sm text-white font-light px-6 py-4 whitespace-nowrap">
                      <Link
                        href={`/admin/product/${product.slug}`}
                        className="hover:underline"
                      >
                        {product.title}
                      </Link>
                    </td>
                    <td className="text-sm  text-white px-6 py-4 whitespace-nowrap">
                      {formatToCOP(product.price)}
                    </td>
                    <td className="text-sm text-white font-bold px-6 ">
                      {product.inStock}
                    </td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </If>
    </>
  );
};