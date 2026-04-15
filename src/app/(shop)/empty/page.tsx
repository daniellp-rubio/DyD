import Link from "next/link";

// Icons
import { IoCartOutline } from "react-icons/io5";

export default function EmptyPage() {
  return (
    <div className="flex justify-center items-center h-[690px]">
      <IoCartOutline size={80} className="mx-5" />

      <div className="flex flex-col items-center">
        <h1 className="text-xl font-semibold">
          Tu carrito está vacio
        </h1>

        <Link
          href="/"
          className="text-palet-orange mt-2 text-4xl"
        >
          Regresar
        </Link>
      </div>
    </div>
  );
};