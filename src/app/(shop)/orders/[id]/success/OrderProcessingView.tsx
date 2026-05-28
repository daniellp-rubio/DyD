import Link from "next/link";

interface Props {
  orderId: string;
}

/**
 * Shown when user arrives at /orders/{id}/success from a payment gateway
 * redirect but the webhook hasn't confirmed payment yet (race condition).
 *
 * This is a server component — no interactivity. The user can refresh or wait
 * for the confirmation email.
 */
export function OrderProcessingView({ orderId }: Props) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-6">
      <div className="w-full max-w-md text-center">
        {/* Spinner icon */}
        <div className="mb-6 flex justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-yellow-100">
            <svg
              className="h-10 w-10 text-yellow-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z"
              />
            </svg>
          </div>
        </div>

        <h1 className="mb-3 text-2xl font-extrabold text-brand-black">
          Verificando tu pago...
        </h1>

        <p className="mb-2 leading-relaxed text-brand-smoke">
          Tu transacción está siendo procesada. Esto suele tardar unos segundos.
        </p>
        <p className="mb-8 text-sm text-brand-smoke">
          Recibirás una confirmación en tu correo electrónico cuando el pago
          quede registrado.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            href={`/orders/${orderId}`}
            className="btn-primary block text-center"
          >
            Ver estado de mi pedido
          </Link>

          <p className="text-xs text-brand-smoke">
            ¿El estado no actualiza?{" "}
            <a
              href={`/orders/${orderId}`}
              className="font-medium text-brand-orange hover:underline"
            >
              Recarga esta página
            </a>{" "}
            en unos segundos.
          </p>

          <Link
            href="/"
            className="text-sm text-brand-smoke hover:text-brand-orange transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
