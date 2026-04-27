'use client';

import { IoAddCircleOutline, IoRemoveCircleOutline } from "react-icons/io5";

interface Props {
  quantity: number;
  onQuantityChanged: (quantity: number) => void;
  compact?: boolean;
}

export const QuantitySelector = ({ quantity, onQuantityChanged, compact = false }: Props) => {
  const iconSize = compact ? 24 : 30;
  const pillClass = compact
    ? "w-10 mx-1 text-center rounded bg-brand-gray text-brand-black font-semibold"
    : "w-16 mx-2 py-1 text-center rounded bg-brand-gray text-brand-black font-semibold";

export const QuantitySelector = ({ quantity, inStock, onQuantityChanged }: Props) => {
  return (
    <div className="flex items-center" role="group" aria-label="Selector de cantidad">
      <button
        type="button"
        aria-label="Disminuir"
        className="cursor-pointer text-brand-black hover:text-brand-orange transition-colors disabled:opacity-40"
        disabled={quantity <= 1}
        onClick={() => onQuantityChanged(quantity > 1 ? quantity - 1 : 1)}
      >
        <IoRemoveCircleOutline size={iconSize} />
      </button>

      <span className={pillClass} aria-live="polite">
        {quantity}
      </span>

      <button
        type="button"
        aria-label="Aumentar"
        className="cursor-pointer text-brand-black hover:text-brand-orange transition-colors"
        onClick={() => onQuantityChanged(quantity + 1)}
      >
        <IoAddCircleOutline size={iconSize} />
      </button>
    </div>
  );
};
