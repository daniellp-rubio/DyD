
import Link from "next/link";

// Icons
import { BsWhatsapp } from "react-icons/bs";
import { IoChatbubblesOutline } from "react-icons/io5";

const ContactUsPage = async() => {
  return (
    <section className="w-full text-center py-16">
      <div className="max-w-5xl mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-extrabold italic mb-2">
          MEDIOS DE CONTACTO
        </h2>
        <p className="font-medium mb-12">
          Nosotros amamos mantenerte en contacto, por eso disponemos de diferentes medios de comunicación para ti.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contacto WhatsApp */}
          <div className="bg-palet-found-black rounded-3xl shadow-md p-8 flex flex-col items-center">
            <BsWhatsapp className="w-10 h-10  mb-4" />
            <h3 className="text-lg font-bold">CONTACTANOS</h3>
            <p className="mt-2 mb-4">
              ¿Estás interesado y quieres asesoramiento? <br />
              Solo contáctanos por WhatsApp y con gusto te atenderemos.
            </p>
            <Link
              href="https://wa.me/573137671413"
              target="_blank"
              className="text-palet-orange border-2 border-palet-orange font-bold px-6 py-2 rounded-md hover:bg-palet-black transition"
            >
              +57 3137671413
            </Link>
          </div>

          {/* Contacto Soporte */}
          <div className="bg-palet-found-black rounded-3xl shadow-md p-8 flex flex-col items-center">
            <IoChatbubblesOutline className="w-11 h-11 mb-4" />
            <h3 className="text-lg font-bold italic">CONTACTO EQUIPO DE SOPORTE</h3>
            <p className=" mt-2 mb-4">
              ¿Necesitas ayuda? Contacta al equipo de soporte y resolveremos tu problema de inmediato.
            </p>
            <Link
              href="https://wa.me/573137671413"
              className="text-palet-orange border-2 border-palet-orange font-bold px-6 py-2 rounded-md hover:bg-palet-black transition"
            >
              CONTACTO SOPORTE
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactUsPage;