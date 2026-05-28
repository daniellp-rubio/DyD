'use client';

import { usePathname } from 'next/navigation';

const steps = [
  { label: 'Dirección', path: '/checkout/address' },
  { label: 'Verificar', path: '/checkout' },
  { label: 'Confirmar', path: '/orders' },
];

export const CheckoutProgress = () => {
  const pathname = usePathname();

  const currentStep = pathname.includes('/checkout/address') ? 0
    : pathname.includes('/checkout') ? 1
    : 2;

  return (
    <nav aria-label="Progreso del checkout" className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, i) => (
        <div key={step.label} className="flex items-center">
          <div className="flex flex-col items-center">
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-colors
              ${i <= currentStep
                ? 'bg-brand-orange border-brand-orange text-white'
                : 'bg-white border-gray-300 text-gray-400'}
            `}>
              {i < currentStep ? '✓' : i + 1}
            </div>
            <span className={`text-xs mt-1 font-medium ${i <= currentStep ? 'text-brand-orange' : 'text-gray-400'}`}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div className={`w-16 h-0.5 mx-1 mb-5 transition-colors ${i < currentStep ? 'bg-brand-orange' : 'bg-gray-300'}`} />
          )}
        </div>
      ))}
    </nav>
  );
};
