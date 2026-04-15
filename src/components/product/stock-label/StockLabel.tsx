"use client";

import { getStockBySlug } from "@/actions";
import { If } from "@/components/if/If";
import { useEffect, useState } from "react";

interface Props {
  slug: string
};

const StockLabel = ({ slug }: Props) => {
  const [stock, setStock] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const getStock = async() => {
    const stock = await getStockBySlug(slug);
    console.log("stock", stock);
    setStock(stock);
    setIsLoading(false);
  };

  useEffect(() => {
    getStock();
  }, []);

  return (
    <>
      <If condition={!isLoading}>
        <h1 className={`antialiased font-bold text-sm`}>
          Disponibles: {stock}
        </h1>
      </If>

      <If condition={isLoading}>
        <h1 className={`antialiased font-bold text-lg bg-gray-200 animate-pulse`}>
          &nbsp;
        </h1>
      </If>

    </>
  );
};

export default StockLabel;