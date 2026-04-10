
"use client";
import { FC, useCallback, useEffect, useState } from "react";

export interface ViewerCountProps {
  count?: number;
  min?: number;
  max?: number;
  refreshMs?: number;
  /** Texto personalizado (singular) – por defecto "Persona". */
  singularText?: string;
  /** Texto personalizado (plural) – por defecto "Personas". */
  pluralText?: string;
  /** Mensaje final (puedes cambiar “este producto”). Usa `{{label}}` para insertar singular/plural. */
  messageTemplate?: string;
  /** Clase extra para wrapper. */
  className?: string;
  /** Clase extra para el ícono. */
  iconClassName?: string;
};

export const ViewerCount: FC<ViewerCountProps> = ({
  count,
  min = 5,
  max = 25,
  refreshMs = 20000,
  singularText = "Persona",
  pluralText = "Personas",
  messageTemplate = "{{label}} están viendo este producto ahora",
  className = "inline-flex items-center gap-1 text-sm mb-6",
  iconClassName = "w-4 h-4",
}) => {
  const uncontrolled = count === undefined;

  // Always initialize with min for SSR, update on client
  const [internalCount, setInternalCount] = useState<number>(
    uncontrolled ? min : count!
  );

  // Only update with random value after mount (client)
  useEffect(() => {
    if (uncontrolled) {
      const randomInRange = () => Math.floor(Math.random() * (max - min + 1)) + min;
      setInternalCount(randomInRange());
    }
  }, [uncontrolled, min, max]);

  useEffect(() => {
    if (!uncontrolled && typeof count === "number") {
      setInternalCount(count);
    }
  }, [uncontrolled, count]);

  useEffect(() => {
    if (!uncontrolled && refreshMs) return;
    if (!refreshMs) return;
    if (uncontrolled) {
      const randomInRange = () => Math.floor(Math.random() * (max - min + 1)) + min;
      const id = setInterval(() => {
        setInternalCount(randomInRange());
      }, refreshMs);
      return () => clearInterval(id);
    }
  }, [uncontrolled, refreshMs, min, max]);

  const c = internalCount;
  const isSingular = c === 1;

  const label = isSingular ? singularText : pluralText;
  // Ajustar verbo según singular/plural
  const verb = isSingular ? "está" : "están";

  // messageTemplate permite personalizar; si incluye "{{label}}" lo reemplazamos,
  // de lo contrario usamos patrón por defecto con verb.
  const hasPlaceholder = messageTemplate.includes("{{label}}");
  const text = hasPlaceholder
    ? messageTemplate.replace("{{label}}", label).replace("están", verb) // fallback simple
    : `${label} ${verb} viendo este producto ahora`;

  return (
    <div
      role="status"
      aria-live="polite"
      className={className}
      title={`${c} ${label.toLowerCase()} ${verb} viendo este producto ahora`}
    >
      <EyeIcon className={iconClassName} aria-hidden="true" />
      <span>
        {c} {text}
      </span>
    </div>
  );
};

const EyeIcon: FC<React.SVGProps<SVGSVGElement>> = ({
  className,
  ...rest
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...rest}
  >
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);