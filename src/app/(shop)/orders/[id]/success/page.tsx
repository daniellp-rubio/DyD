export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Image from "next/image";

import { getOrderById } from "@/actions";
import { Title } from "@/components";
import { formatToCOP } from "@/utils";
import { IoCardOutline } from "react-icons/io5";

import { PurchaseTracker } from "./PurchaseTracker";
import { OrderProcessingView } from "./OrderProcessingView";

interface Params {
  id: string;
}
interface Props {
  params: Promise<Params>;
  searchParams: Promise<Record<string, string>>;
}

export default async function OrderSuccessPage({ params, searchParams }: Props) {
  const { id } = await params;
  const sp = await searchParams;

  const result = await getOrderById(id);
  if (!result.ok) redirect("/");

  const orderById = result.orderById;

  if (!orderById?.isPaid) {
    // Detect gateway callbacks (Wompi: sp.status, MercadoPago: sp.collection_status / sp.payment_id)
    const isGatewayCallback =
      sp.status === "APPROVED" ||
      sp.status === "PENDING" ||
      !!sp.collection_id ||
      !!sp.payment_id ||
      !!sp.collection_status;

    if (isGatewayCallback) {
      // Show "processing" view — don't redirect, payment webhook may arrive shortly
      return <OrderProcessingView orderId={id} />;
    }

    // No callback params and not paid → send to the specific order page to retry
    redirect(`/orders/${id}`);
  }

  return (
    <div className="flex justify-center items-center mb-54 px-10 sm:px-0">
      <PurchaseTracker orderId={orderById.id} total={orderById.total} />
      <div className="flex flex-col w-[1000px]">
        <Title title={`Orden  #${id.split("-").at(-1)}`} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          <div className="flex flex-col mt-5">
            {orderById.OrderItem.map((product, index) => (
              <div className="flex mb-5" key={product.product.slug + "-" + index}>
                <Image
                  src={product.product.ProductImage[0].url}
                  width={100}
                  height={100}
                  style={{ width: "100px", height: "100px" }}
                  alt={product.product.title}
                  className="mr-5 rounded"
                />
                <div>
                  <p>{product.product.title}</p>
                  <p>{formatToCOP(product.price)}</p>
                  <p>Cantidad: {product.quantity}</p>
                  <p className="font-bold">
                    Subtotal: {formatToCOP(product.price * product.quantity)}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-palet-found-black rounded-xl shadow-xl p-7">
            <h2 className="text-2xl mb-2">Dirección de entrega</h2>
            <div className="mb-10">
              <p className="text-xl">
                {orderById.OrderAddress?.firstName} {orderById.OrderAddress?.lastName}
              </p>
              <p>{orderById.OrderAddress?.address}</p>
              <p>{orderById.OrderAddress?.address2}</p>
              <p>{orderById.OrderAddress?.postalCode}</p>
              <p>{orderById.OrderAddress?.city}</p>
              <p>{orderById.OrderAddress?.phone}</p>
            </div>

            <div className="w-full h-0.5 rounded bg-gray-200 mb-10" />

            <h2 className="text-2xl mb-2">Resumen de orden</h2>

            <div className="grid grid-cols-2">
              <span>No. Productos</span>
              <span className="text-right">
                {orderById.itemsInOrder === 1
                  ? "1 producto"
                  : `${orderById.itemsInOrder} productos`}
              </span>

              <span>Subtotal</span>
              <span className="text-right">{formatToCOP(orderById.subTotal)}</span>

              <span>Total</span>
              <span className="text-right">{formatToCOP(orderById.total)}</span>
            </div>

            <div className="mt-5 mb-2 w-full">
              <div className="flex items-center rounded-lg py-2 px-3.5 text-xs font-bold text-white mb-5 bg-green-700">
                <IoCardOutline size={30} />
                <span className="mx-2">Pagado</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
