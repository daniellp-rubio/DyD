import Link from "next/link";
import { FaFacebook, FaWhatsapp } from "react-icons/fa";
import { AiFillInstagram } from "react-icons/ai";

export const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-brand-black text-white mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 sm:px-10 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">

          {/* Brand */}
          <div>
            <p className="font-black text-xl mb-2">DYD Tech</p>
            <p className="text-sm text-white/60 leading-relaxed">
              Gadgets y audio premium para los verdaderos amantes de la tecnología. Envío express a todo Colombia.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-white/60 hover:text-brand-orange transition-colors">
                <AiFillInstagram size={22} />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-white/60 hover:text-brand-orange transition-colors">
                <FaFacebook size={20} />
              </a>
              <a href="https://wa.me/573000000000" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="text-white/60 hover:text-brand-orange transition-colors">
                <FaWhatsapp size={20} />
              </a>
            </div>
          </div>

          {/* Tienda */}
          <div>
            <p className="font-bold text-sm uppercase tracking-wider mb-4 text-white/80">Tienda</p>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/category/products" className="hover:text-brand-orange transition-colors">Todos los productos</Link></li>
              <li><Link href="/category/airpods" className="hover:text-brand-orange transition-colors">AirPods</Link></li>
              <li><Link href="/cart" className="hover:text-brand-orange transition-colors">Mi carrito</Link></li>
              <li><Link href="/orders" className="hover:text-brand-orange transition-colors">Mis pedidos</Link></li>
            </ul>
          </div>

          {/* Soporte */}
          <div>
            <p className="font-bold text-sm uppercase tracking-wider mb-4 text-white/80">Soporte</p>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link href="/contactus" className="hover:text-brand-orange transition-colors">Contáctanos</Link></li>
              <li><Link href="/termsandconditions" className="hover:text-brand-orange transition-colors">Términos y condiciones</Link></li>
              <li><Link href="/orderswithoutsession" className="hover:text-brand-orange transition-colors">Rastrear pedido</Link></li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <p className="font-bold text-sm uppercase tracking-wider mb-4 text-white/80">Contacto</p>
            <ul className="space-y-2 text-sm text-white/60">
              <li>Medellín, Colombia</li>
              <li>
                <a href="https://wa.me/573000000000" target="_blank" rel="noopener noreferrer" className="hover:text-brand-orange transition-colors">
                  WhatsApp: +57 300 000 0000
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <span>© {year} DYD Tech. Todos los derechos reservados.</span>
          <span>Pagos seguros con Mercado Pago</span>
        </div>
      </div>
    </footer>
  );
};
