export const revalidate = 0;

import { getOrdersByUser } from '@/actions';
import { Title } from '@/components';
import { formatToCOP } from '@/utils';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { IoBagHandleOutline, IoCheckmarkCircle, IoTimeOutline, IoChevronForward } from 'react-icons/io5';

const formatDate = (date: Date) =>
  new Intl.DateTimeFormat("es-CO", {
    day: "2-digit", month: "short", year: "numeric"
  }).format(new Date(date));

export default async function OrdersPage() {
  const { ok, orders = [] } = await getOrdersByUser();

  if (!ok) redirect("auth/login");

  const paidCount = orders.filter(o => o.isPaid).length;
  const pendingCount = orders.length - paidCount;

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-white">
        <IoBagHandleOutline size={80} className="text-palet-orange mb-6" />
        <h1 className="text-3xl font-semibold mb-2">Aún no tienes órdenes</h1>
        <p className="text-gray-400 mb-8">Cuando realices una compra aparecerá aquí.</p>
        <Link href="/" className="btn-primary">Ir a la tienda</Link>
      </div>
    );
  };

  return (
    <div className="mb-20">
      <Title title="Mis órdenes" subtitle={`${orders.length} ${orders.length === 1 ? "orden" : "órdenes"}`} />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-palet-found-black rounded-lg p-5">
          <p className="text-sm text-gray-400">Total</p>
          <p className="text-2xl font-semibold text-white">{orders.length}</p>
        </div>
        <div className="bg-palet-found-black rounded-lg p-5">
          <p className="text-sm text-gray-400">Pagadas</p>
          <p className="text-2xl font-semibold text-green-500">{paidCount}</p>
        </div>
        <div className="bg-palet-found-black rounded-lg p-5">
          <p className="text-sm text-gray-400">Pendientes</p>
          <p className="text-2xl font-semibold text-red-400">{pendingCount}</p>
        </div>
      </div>

      <div className="hidden md:block overflow-hidden rounded-lg border border-palet-found-black">
        <table className="min-w-full">
          <thead className="bg-palet-found-black">
            <tr>
              <th scope="col" className="text-xs uppercase tracking-wide font-medium text-gray-400 px-6 py-4 text-left">Orden</th>
              <th scope="col" className="text-xs uppercase tracking-wide font-medium text-gray-400 px-6 py-4 text-left">Fecha</th>
              <th scope="col" className="text-xs uppercase tracking-wide font-medium text-gray-400 px-6 py-4 text-left">Cliente</th>
              <th scope="col" className="text-xs uppercase tracking-wide font-medium text-gray-400 px-6 py-4 text-right">Items</th>
              <th scope="col" className="text-xs uppercase tracking-wide font-medium text-gray-400 px-6 py-4 text-right">Total</th>
              <th scope="col" className="text-xs uppercase tracking-wide font-medium text-gray-400 px-6 py-4 text-left">Estado</th>
              <th scope="col" className="px-6 py-4" aria-label="Acciones" />
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="bg-palet-black border-t border-palet-found-black transition hover:bg-palet-found-black group">
                <td className="text-sm text-white font-mono px-6 py-4 whitespace-nowrap">
                  <Link href={`/orders/${order.id}`} className="hover:text-palet-orange focus:outline-none focus:ring-2 focus:ring-palet-orange rounded">
                    #{order.id.slice(0, 8)}
                  </Link>
                </td>
                <td className="text-sm text-gray-300 px-6 py-4 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                <td className="text-sm text-white px-6 py-4 whitespace-nowrap">
                  {order.OrderAddress?.firstName} {order.OrderAddress?.lastName}
                </td>
                <td className="text-sm text-gray-300 px-6 py-4 text-right">{order.itemsInOrder}</td>
                <td className="text-sm text-white font-semibold px-6 py-4 text-right whitespace-nowrap">{formatToCOP(order.total)}</td>
                <td className="px-6 py-4">
                  <StatusBadge isPaid={order.isPaid} />
                </td>
                <td className="px-6 py-4 text-right">
                  <Link href={`/orders/${order.id}`} className="inline-flex items-center text-sm text-palet-orange hover:underline">
                    Ver <IoChevronForward className="ml-1" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden flex flex-col gap-3">
        {orders.map(order => (
          <Link
            key={order.id}
            href={`/orders/${order.id}`}
            className="block bg-palet-found-black rounded-lg p-5 active:scale-[0.99] transition"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-sm text-white">#{order.id.slice(0, 8)}</span>
              <StatusBadge isPaid={order.isPaid} />
            </div>
            <p className="text-white font-medium">
              {order.OrderAddress?.firstName} {order.OrderAddress?.lastName}
            </p>
            <p className="text-xs text-gray-400 mb-3">{formatDate(order.createdAt)}</p>
            <div className="flex items-center justify-between pt-3 border-t border-white/5">
              <span className="text-xs text-gray-400">{order.itemsInOrder} {order.itemsInOrder === 1 ? "item" : "items"}</span>
              <span className="text-white font-semibold">{formatToCOP(order.total)}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

const StatusBadge = ({ isPaid }: { isPaid: boolean }) => (
  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full ${
    isPaid
      ? "bg-green-500/15 text-green-400"
      : "bg-red-500/15 text-red-400"
  }`}>
    {isPaid ? <IoCheckmarkCircle /> : <IoTimeOutline />}
    {isPaid ? "Pagada" : "Pendiente"}
  </span>
);
