export const dynamic = "force-dynamic";

import { redirect } from "next/navigation";
import Image from "next/image";

// Actions
import { getOrderByIdWithoutSession } from "@/actions";

// Components
import { Title } from "@/components";

// Utils
import { formatToCOP } from "@/utils";

// Icons
import { IoCardOutline } from "react-icons/io5";
interface Params {
  id: string;
};
interface Props {
  params: Promise<Params>
};

export default async function OrderPendingPage({ params }: Props) {
  const { id } = await params;

  const { ok, orderById} = await getOrderByIdWithoutSession(id);

  if (!ok) redirect("/");

  if (orderById?.isPaid) redirect("/orders");

  return (
    <div className="flex justify-center items-center mb-54 px-10 sm:px-0">
      <div className="flex flex-col w-[1000px]">
        <Title
          title={`Orden  #${id.split("-").at(-1)}`}
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          <div className="flex flex-col mt-5">

            {
              orderById?.OrderItem.map((product, index) => (
                <div
                  className="flex mb-5"
                  key={product.product.slug + "-" + index}
                >
                  <Image
                    src={product.product.ProductImage[0].url}
                    width={100}
                    height={100}
                    style={{
                      width: "100px",
                      height: "100px"
                    }}
                    alt={product.product.title}
                    className="mr-5 rounded"
                  />

                  <div>
                    <p>{product.product.title}</p>
                    <p>{formatToCOP(product.price)}</p>
                    <p>Cantidad: {product.quantity}</p>
                    <p className="font-bold">Subtotal: {formatToCOP(product.price * product.quantity)}</p>
                  </div>
                </div>
              ))
            }
          </div>

          <div className="bg-palet-found-black rounded-xl shadow-xl p-7">
            <h2 className="text-2xl mb-2">Dirección de entrega</h2>
            <div className="mb-10">
              <p className="text-xl">
                {orderById?.OrderAddress?.firstName} {orderById?.OrderAddress?.lastName}
              </p>
              <p>{orderById?.OrderAddress?.address}</p>
              <p>{orderById?.OrderAddress?.address2}</p>
              <p>{orderById?.OrderAddress?.postalCode}</p>
              <p>{orderById?.OrderAddress?.city}</p>
              <p>{orderById?.OrderAddress?.phone}</p>
            </div>

            <div className="w-full h-0.5 rounded bg-gray-200 mb-10" />

            <h2 className="text-2xl mb-2">Resumen de orden</h2>

            <div className="grid grid-cols-2">
              <span>No. Productos</span>
              <span className="text-right">{orderById!.itemsInOrder === 1 ? "1 producto" : `${orderById!.itemsInOrder} productos`}</span>

              <span>Subtotal</span>
              <span className="text-right">{formatToCOP(orderById!.subTotal)}</span>

              <span>Total</span>
              <span className="text-right">{formatToCOP(orderById!.total)}</span>
            </div>

            <div className="mt-5 mb-2 w-full">
              <div className="flex items-center rounded-lg py-2 px-3.5 text-xs font-bold text-white mb-5 bg-red-500">
                <IoCardOutline size={30} />
                <span className="mx-2">
                  No pago
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};