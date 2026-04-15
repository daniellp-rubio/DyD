import Link from "next/link";

// Icons
import { FaFacebook } from "react-icons/fa";
import { AiFillInstagram } from "react-icons/ai";
import { BsWhatsapp } from "react-icons/bs";

export const Footer = () => {
  return (
    <div className="flex w-full justify-center text-xs mb-10">
      <Link
        href="/"
      >
        <span className={`antialiased font-bold`}>DYD Tech</span>
        <span> | Shop</span>
        <span>  {new Date().getFullYear()}</span>
      </Link>

      <Link
        href="/"
        className="mx-3"
      >
        Privacidad & Legal
      </Link>

        <div className="flex space-x-4">
          <a href="https://www.facebook.com/profile.php?id=61570094964123" target="_blank" aria-label="Facebook" className="hover:opacity-75">
            <FaFacebook className="w-5 h-5" />
          </a>
          <a href="https://www.instagram.com/gadgets_dyd/" target="_blank" aria-label="Instagram" className="hover:opacity-75">
            <AiFillInstagram className="w-6 h-6" />
          </a>
          <a href="https://wa.me/573137671413" target="_blank" aria-label="Whatsapp" className="hover:opacity-75">
            <BsWhatsapp className="w-5 h-5" />
          </a>
        </div>
      </div>
    </footer>
  );
};
