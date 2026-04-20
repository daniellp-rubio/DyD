"use client";

import { useState } from "react";

interface Props {
  description: string;
  tags?: string[];
}

type TabKey = "description" | "specs" | "shipping";

const tabs: { key: TabKey; label: string }[] = [
  { key: "description", label: "Descripción" },
  { key: "specs", label: "Especificaciones" },
  { key: "shipping", label: "Envío y devoluciones" }
];

export const ProductTabs = ({ description, tags = [] }: Props) => {
  const [active, setActive] = useState<TabKey>("description");

  return (
    <section aria-label="Información del producto" className="mt-10 px-5 sm:px-0">
      <div role="tablist" className="flex gap-2 border-b border-gray-200 overflow-x-auto">
        {tabs.map(t => {
          const isActive = active === t.key;
          return (
            <button
              key={t.key}
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${t.key}`}
              id={`tab-${t.key}`}
              onClick={() => setActive(t.key)}
              className={`px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-colors cursor-pointer ${
                isActive
                  ? "border-brand-orange text-brand-orange"
                  : "border-transparent text-brand-smoke hover:text-brand-black"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="py-5 text-sm leading-relaxed text-brand-black">
        {active === "description" && (
          <div role="tabpanel" id="panel-description" aria-labelledby="tab-description">
            <p className="font-light whitespace-pre-line">{description}</p>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {tags.map(tag => (
                  <span key={tag} className="text-xs bg-brand-gray text-brand-smoke px-3 py-1 rounded-full">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {active === "specs" && (
          <div role="tabpanel" id="panel-specs" aria-labelledby="tab-specs">
            <ul className="space-y-2">
              <li><strong>Garantía:</strong> 6 meses por defectos de fábrica</li>
              <li><strong>Origen:</strong> Importado</li>
              <li><strong>Condición:</strong> Nuevo</li>
              <li><strong>Compatibilidad:</strong> Consulta en la descripción</li>
            </ul>
          </div>
        )}

        {active === "shipping" && (
          <div role="tabpanel" id="panel-shipping" aria-labelledby="tab-shipping">
            <ul className="space-y-2">
              <li><strong>Envío nacional:</strong> 2 a 5 días hábiles</li>
              <li><strong>Costo:</strong> Calculado al finalizar la compra</li>
              <li><strong>Devoluciones:</strong> 7 días para cambios por defectos</li>
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};
