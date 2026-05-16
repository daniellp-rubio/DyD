"use client";

import React, { FC, useState } from "react";

interface StarRatingProps {
  value?: number; // Promedio de calificación
  max?: number;
  onChange?: (value: number) => void;
  size?: number;
  className?: string;
  readOnly?: boolean;
  totalRatings?: number; // 👈 Nuevo: total de calificaciones
  showCount?: boolean;   // 👈 Nuevo: activar/desactivar el contador
}

export const StarRating: FC<StarRatingProps> = ({
  value = 0,
  max = 5,
  onChange,
  size = 24,
  className = "mb-1.5",
  readOnly = false,
  totalRatings = 0,
  showCount = true,
}) => {
  const [hover, setHover] = useState<number | null>(null);

  const handleClick = (index: number) => {
    if (readOnly || !onChange) return;
    onChange(index + 1);
  };

  const renderStar = (index: number) => {
    const displayValue = hover !== null ? hover + 1 : value;
    const fillPercentage = Math.min(Math.max(displayValue - index, 0), 1) * 100;

    return (
      <svg
        key={index}
        onClick={() => handleClick(index)}
        onMouseEnter={() => !readOnly && setHover(index)}
        onMouseLeave={() => !readOnly && setHover(null)}
        xmlns="http://www.w3.org/2000/svg"
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className={`cursor-${readOnly ? "default" : "pointer"} transition`}
      >
        <defs>
          <linearGradient id={`grad-${index}`}>
            <stop offset={`${fillPercentage}%`} stopColor="#FF7043" />
            <stop offset={`${fillPercentage}%`} stopColor="transparent" />
          </linearGradient>
        </defs>
        <polygon
          points="12 2 15.09 8.26 22 9.27
                  17 14.14 18.18 21.02
                  12 17.77 5.82 21.02
                  7 14.14 2 9.27
                  8.91 8.26 12 2"
          stroke="#FF7043"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill={`url(#grad-${index})`}
        />
      </svg>
    );
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center gap-1">
        {Array.from({ length: max }).map((_, index) => renderStar(index))}
      </div>
      {showCount && (
        <div className="text-sm">
          <span className="font-medium">{value.toFixed(1)}</span>{" "}
          | {totalRatings} calificación{totalRatings !== 1 && "es"}
        </div>
      )}
    </div>
  );
};
