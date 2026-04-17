import Image from "next/image";

export const MainSection = () => {
  return (
    <>
      <div className="relative w-[100%] h-[300px] lg:hidden">
        <Image
          src="https://res.cloudinary.com/dtttwxbgr/image/upload/v1752348295/D_1000_x_600_mm_n1bz8x.webp"
          alt="Logo D&D Gadgets Mobile"
          fill
          style={{ objectFit: "contain" }}
          priority
        />
      </div>

      {/* Imagen para desktop */}
      <div className="relative w-[100%] h-[300px] hidden lg:block">
        <Image
          src="https://res.cloudinary.com/dtttwxbgr/image/upload/v1752348296/main-section-1000x250_mm_xptd9r_ago7ak.webp"
          alt="Logo D&D Gadgets Desktop"
          fill
          style={{ objectFit: "contain" }}
          priority
        />
      </div>
    </>
  );
};
