export const revalidate = 0;

import { getOrdersByUser } from '@/actions';
import { If, Title } from '@/components';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { IoCardOutline } from 'react-icons/io5';

export default async function OrdersPage() {
  const { ok, orders = [] } = await getOrdersByUser();

  if (!ok) {
    redirect("auth/login");
  };

  console.log("orders", orders);

  return (
    <>
      <Title title="Ordenes" />

      <If condition={orders.length === 0}>
        <p>No hay ordenes</p>
      </If>

      <If condition={orders.length !== 0}>
        <div className="mb-[32.8rem]">
          <table className="min-w-full">
            <thead className="bg-palet-found-black border-b border-palet-found-black">
              <tr>
                <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
                  #ID
                </th>
                <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
                  Nombre completo
                </th>
                <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
                  Estado
                </th>
                <th scope="col" className="text-sm font-medium text-white px-6 py-4 text-left">
                  Opciones
                </th>
              </tr>
            </thead>
            <tbody>
              {
                orders.map(order => (
                  <tr key={order.id} className="bg-palet-black border-b border-palet-found-black transition duration-300 ease-in-out hover:bg-palet-found-black">
                    <td className="text-sm text-white font-light px-6 py-4 whitespace-nowrap">
                      {order.id.split("-").at(-1)}
                    </td>
                    <td className="text-sm text-white font-light px-6 py-4 whitespace-nowrap">
                      {order.OrderAddress?.firstName} {order.OrderAddress?.lastName}
                    </td>
                    <td className="flex items-center text-sm  text-white font-light px-6 py-4 whitespace-nowrap">
                      <If condition={order.isPaid}>
                        <IoCardOutline className="text-green-800" />
                        <span className='mx-2 text-green-800'>Pagada</span>
                      </If>
                      <If condition={!order.isPaid}>
                        <IoCardOutline className="text-red-800" />
                        <span className='mx-2 text-red-800'>No Pagado</span>
                      </If>
                    </td>
                    <td className="text-sm text-white font-light px-6 ">
                      <If condition={order.isPaid}>
                        <Link href={`/orders/${order.id}/success`} className="hover:underline">
                          Ver orden
                        </Link>
                      </If>
                      <If condition={!order.isPaid}>
                        <Link href={`/orders/${order.id}`} className="hover:underline">
                          Ver orden
                        </Link>
                      </If>
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