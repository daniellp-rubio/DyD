import Link from "next/link";

// Icons
import { FaFacebook } from "react-icons/fa";
import { AiFillInstagram } from "react-icons/ai";
import { BsWhatsapp } from "react-icons/bs";

export const Footer = () => {
  return (
    <div className="flex w-full justify-center text-xs mb-10">
      <Link href="/">
        <span className="antialiased font-bold text-brand-black hover:text-brand-orange transition-colors">
          DYD Tech
        </span>
        <span className="text-brand-smoke mx-1">| Shop</span>
        <span className="text-brand-smoke">{new Date().getFullYear()}</span>
      </Link>

      <Link href="/" className="mx-3 text-brand-smoke hover:text-brand-orange transition-colors">
        Privacidad & Legal
      </Link>

      <Link href="/" className="mx-3 text-brand-smoke hover:text-brand-orange transition-colors">
        Ubicaciones
      </Link>
    </div>
  );
};
