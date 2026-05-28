import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import { IoCardOutline } from "react-icons/io5";

// Actions
import { getOrderById } from "@/actions";

// Components
import { Title } from "@/components";
import { ButtonPaid } from "./ui/ButtonPaid";
import { ButtonWompi } from "./ui/ButtonWompi";

// Utils
import { formatToCOP } from "@/utils";

interface Params {
  id: string;
}
interface Props {
  params: Promise<Params>;
}

export default async function OrderPage({ params }: Props) {
  const { id } = await params;

  const { ok, orderById } = await getOrderById(id);

  if (!ok) redirect("/");

  // Detect which payment gateways are configured (server-side only)
  const mpEnabled = !!process.env.MERCADOPAGO_ACCESS_TOKEN;
  const wompiEnabled =
    !!process.env.WOMPI_PUBLIC_KEY && !!process.env.WOMPI_INTEGRITY_SECRET;
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? "573000000000";

  const buyerEmail = orderById?.user?.email ?? orderById?.OrderAddress?.email ?? "";

  return (
    <div className="flex justify-center items-center mb-54 px-10 sm:px-0">
      <div className="flex flex-col w-[1000px]">
        <Title title={`Orden #${id.split("-").at(-1)}`} />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
          {/* Product list */}
          <div className="flex flex-col mt-5">
            {orderById?.OrderItem.map((product, index) => (
              <div
                className="flex mb-5"
                key={product.product.slug + "-" + index}
              >
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

          {/* Order summary + payment */}
          <div className="bg-palet-found-black rounded-xl shadow-xl p-7">
            <h2 className="text-2xl mb-2">Dirección de entrega</h2>
            <div className="mb-10">
              <p className="text-xl">
                {orderById?.OrderAddress?.firstName}{" "}
                {orderById?.OrderAddress?.lastName}
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
              <span className="text-right">
                {orderById!.itemsInOrder === 1
                  ? "1 producto"
                  : `${orderById!.itemsInOrder} productos`}
              </span>

              <span>Subtotal</span>
              <span className="text-right">
                {formatToCOP(orderById!.subTotal)}
              </span>

              <span>Total</span>
              <span className="text-right">
                {formatToCOP(orderById!.total)}
              </span>
            </div>

            <div className="mt-5 mb-2 w-full">
              {orderById!.isPaid ? (
                /* Already paid — show confirmation badge */
                <div className="flex items-center rounded-lg py-2 px-3.5 text-xs font-bold text-white mb-2 bg-green-700">
                  <IoCardOutline size={24} className="mr-2" />
                  Pagado
                </div>
              ) : (
                /* Unpaid — show available payment options */
                <div>
                  <p className="text-sm text-brand-smoke mb-3 font-medium">
                    Selecciona tu método de pago:
                  </p>

                  {/* Wompi — Colombia-first gateway */}
                  {wompiEnabled && <ButtonWompi orderId={orderById!.id} />}

                  {/* MercadoPago */}
                  {mpEnabled && (
                    <ButtonPaid
                      title="Carrito"
                      id={orderById!.id}
                      total={orderById!.total}
                      isPaid={orderById!.isPaid}
                      buyerEmail={buyerEmail}
                    />
                  )}

                  {/* WhatsApp fallback — shown always, primary if no gateway configured */}
                  <Link
                    href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
                      `Hola! Quiero pagar mi orden #${id.split("-").at(-1)} por ${formatToCOP(orderById!.total)}. ID: ${orderById!.id}`,
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center justify-center gap-2 w-full h-12 rounded-lg font-bold text-sm transition-colors ${
                      !wompiEnabled && !mpEnabled
                        ? "bg-[#25D366] hover:bg-[#1ebe5d] text-white"
                        : "bg-gray-100 hover:bg-gray-200 text-gray-700 mt-1"
                    }`}
                  >
                    <FaWhatsapp
                      size={20}
                      className={
                        !wompiEnabled && !mpEnabled
                          ? "text-white"
                          : "text-[#25D366]"
                      }
                    />
                    {!wompiEnabled && !mpEnabled
                      ? "Pagar por WhatsApp"
                      : "¿Necesitas ayuda? WhatsApp"}
                  </Link>

                  <p className="text-xs text-center text-brand-smoke mt-3">
                    🔒 Pago 100% seguro · Tu información está protegida
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}