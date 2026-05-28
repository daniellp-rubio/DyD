'use client';

import { FaWhatsapp } from 'react-icons/fa';

const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '573000000000';
const WHATSAPP_MESSAGE = encodeURIComponent('Hola, me interesa uno de sus productos 👋');

export const WhatsAppButton = () => {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Contactar por WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 bg-[#25D366] rounded-full shadow-lg hover:bg-[#20BA5A] hover:scale-110 transition-all duration-200 group"
    >
      <FaWhatsapp className="w-7 h-7 text-white" />
      <span className="absolute right-16 bg-white text-brand-black text-sm font-medium px-3 py-1.5 rounded-lg shadow-md whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
        ¿Tienes dudas? Escríbenos
      </span>
    </a>
  );
};
