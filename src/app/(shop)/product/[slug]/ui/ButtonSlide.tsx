"use client";

import { FaArrowDown } from "react-icons/fa";

const ButtonSlide = () => {

  return (
    <button
      onClick={() => {
        const descriptionElement = document.getElementById("product-description");
        if (descriptionElement) {
          descriptionElement.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }
      }}
      className="hidden md:flex absolute right-2 z-20 px-4 h-14 bg-white hover:bg-gray-100 rounded-full shadow-2xl transition-all duration-300 items-center justify-center gap-2 border-2 border-gray-200 hover:border-black"
      aria-label="Ver descripción del producto"
    >
      <FaArrowDown className="text-gray-700 text-xl group-hover:text-palet-orange transition-all" />
      <span className="text-gray-700 font-medium group-hover:text-palet-orange transition-all">
        DESCRIPCIÓN
      </span>
    </button>
  );
};

export default ButtonSlide;