"use client";

import { useState } from "react";
import { FaEnvelope, FaCheckCircle, FaGift } from "react-icons/fa";

export const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    // TODO: conectar a endpoint real
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 800);
  };

  return (
    <section className="w-full bg-brand-white py-16 md:py-24 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-brand-orange/20 rounded-full blur-[120px]" />
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-[400px] h-[400px] bg-brand-blue/20 rounded-full blur-[120px]" />

      <div className="max-w-3xl mx-auto px-6 sm:px-10 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1 mb-6 rounded-full bg-brand-orange/10 text-brand-orange text-sm font-bold tracking-wide uppercase border border-brand-orange/20">
          <FaGift /> Oferta exclusiva
        </div>

        <h2 className="text-3xl md:text-5xl font-black text-brand-black mb-4 leading-tight">
          Obtén <span className="text-brand-orange">10% OFF</span> en tu primera compra
        </h2>
        <p className="text-brand-smoke text-lg mb-8 max-w-xl mx-auto">
          Suscríbete y recibe lanzamientos, ofertas exclusivas y tips tech directo en tu correo.
        </p>

        {status === "success" ? (
          <div className="flex items-center justify-center gap-3 text-brand-black bg-green-500/10 border border-green-500/30 rounded-xl p-4 max-w-md mx-auto">
            <FaCheckCircle className="text-green-400 w-6 h-6" />
            <span className="font-semibold">¡Listo! Revisa tu correo para obtener tu cupón.</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="relative flex-1">
              <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-smoke" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full pl-11 pr-4 py-4 rounded-xl bg-black/5 border border-black/10 text-brand-black placeholder:text-brand-smoke focus:outline-none focus:border-brand-orange focus:bg-black/10 transition-all backdrop-blur-sm"
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="bg-brand-orange hover:bg-[#E64A19] text-brand-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg shadow-brand-orange/30 hover:-translate-y-0.5 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {status === "loading" ? "Enviando..." : "Suscribirme"}
            </button>
          </form>
        )}

        <p className="text-brand-smoke text-xs mt-4">
          No enviamos spam. Cancela cuando quieras.
        </p>
      </div>
    </section>
  );
};
