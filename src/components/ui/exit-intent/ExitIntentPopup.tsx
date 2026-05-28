'use client';

import { useEffect, useState } from 'react';
import { IoCloseOutline } from 'react-icons/io5';

const STORAGE_KEY = 'dyd_exit_popup_dismissed';
const DISMISS_DAYS = 7;

export const ExitIntentPopup = () => {
  const [show, setShow] = useState(false);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY);
    if (dismissed) {
      const dismissedAt = parseInt(dismissed, 10);
      const daysSince = (Date.now() - dismissedAt) / (1000 * 60 * 60 * 24);
      if (daysSince < DISMISS_DAYS) return;
    }

    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0) {
        setShow(true);
        document.removeEventListener('mouseleave', handleMouseLeave);
      }
    };

    // Mobile: show after 30s of inactivity
    const mobileTimer = setTimeout(() => {
      if (window.innerWidth < 768) {
        setShow(true);
      }
    }, 30000);

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(mobileTimer);
    };
  }, []);

  const dismiss = () => {
    setShow(false);
    localStorage.setItem(STORAGE_KEY, Date.now().toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    try {
      await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      setSubscribed(true);
      setTimeout(() => dismiss(), 3000);
    } catch {
      dismiss();
    }
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === e.currentTarget && dismiss()}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <button
          onClick={dismiss}
          aria-label="Cerrar"
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <IoCloseOutline size={24} />
        </button>

        {subscribed ? (
          <div className="py-4">
            <div className="text-4xl mb-3">🎉</div>
            <h3 className="text-xl font-bold text-brand-black mb-2">¡Listo!</h3>
            <p className="text-brand-smoke">Tu cupón <strong className="text-brand-orange">BIENVENIDO10</strong> está en camino.</p>
          </div>
        ) : (
          <>
            <div className="text-4xl mb-3">⏰</div>
            <h3 className="text-2xl font-black text-brand-black mb-2">
              ¡Espera! Antes de irte...
            </h3>
            <p className="text-brand-smoke mb-1">
              Obtén <span className="text-brand-orange font-bold text-xl">10% OFF</span> en tu primera compra
            </p>
            <p className="text-xs text-brand-smoke mb-6">Suscríbete gratis. Solo por hoy.</p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-orange focus:outline-none text-brand-black"
              />
              <button
                type="submit"
                className="w-full bg-brand-orange hover:bg-[#E64A19] text-white font-bold py-3 rounded-xl transition-colors"
              >
                Quiero mi 10% OFF →
              </button>
            </form>

            <button onClick={dismiss} className="mt-3 text-xs text-gray-400 hover:text-gray-600 underline">
              No, prefiero pagar precio completo
            </button>
          </>
        )}
      </div>
    </div>
  );
};
