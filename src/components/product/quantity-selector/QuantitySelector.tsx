'use client';

// Icons
import { IoAddCircleOutline, IoRemoveCircleOutline } from "react-icons/io5";

interface Props {
  quantity: number;
  inStock: number;

  onQuantityChanged: (quantity: number) => void;
};

export const QuantitySelector = ({ quantity, inStock, onQuantityChanged }: Props) => {
  return (
    <div className="flex">
      <button className="cursor-pointer" onClick={() => onQuantityChanged(quantity > 1 ? quantity - 1 : 1)}>
        <IoRemoveCircleOutline size={25} />
      </button>

      <span className="w-16 mx-3 px-5 bg-palet-found-black text-center rounded">
        {quantity}
      </span>

      <button className="cursor-pointer" onClick={() => onQuantityChanged(inStock > quantity ? quantity + 1 : quantity)}>
        <IoAddCircleOutline size={25} />
      </button>
    </div>
  )
};
