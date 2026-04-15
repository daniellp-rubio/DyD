export const revalidate = 60;

import { redirect } from "next/navigation";

// Components
import { AnimateMoveLeft } from "@/components/ui/animate-move-left/AnimateMoveLeft";
import { Notification } from "@/components/ui/notification/Notification";

// Actions
import { getPaginatedProductsWithImages } from "@/actions";

// Components
import { MainSection, ProductGrid, PurchasePopup, TitleCenter } from "@/components";

interface Props {
  searchParams?: Promise<{
    page?: string
  }>;
};

export default async function Home({ searchParams }: Props) {
  const params = await searchParams;
  const page = params?.page ? parseInt(params.page) : 1;

  const { products } = await getPaginatedProductsWithImages({ page });

  if(products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <h2 className="text-2xl font-bold mb-4">No hay productos disponibles</h2>
        <p className="text-gray-500">Vuelve más tarde o revisa otra categoría.</p>
      </div>
    );
  }

  return (
    <div>
      <MainSection />

      <div>
        <TitleCenter
          title="AirPods"
          subtitle="Conoce todas las generaciones."
          className="mb-2"
        />

        <div
          className="mb-25"
        >
          <AnimateMoveLeft
            images={[
              {
                key: "1",
                src: "https://res.cloudinary.com/dtttwxbgr/image/upload/v1752350820/AUDIFONOS_DE_SEGUNDA_GENERACI%C3%93N_P%C3%81GINA_3125x3125px_200_x_200_px_peut2s.webp",
                alt: "AIRPODS DE PRIMERA GENERACIÓN"
              },
              {
                key: "2",
                src: "https://res.cloudinary.com/dtttwxbgr/image/upload/v1752350772/AUDIFONOS_PRO_DE_SEGUNDA_GENERACI%C3%93N_P%C3%81GINA_200x200px_x2ftne.webp",
                alt: "AIRPODS PRO DE SEGUNDA GENERACIÓN"
              },
              {
                key: "3",
                src: "https://res.cloudinary.com/dtttwxbgr/image/upload/v1752350777/AUDIFONOS_PRO_DE_SEGUNDA_GENERACI%C3%93N_CON_PANTALLA_P%C3%81GINA_200x200px_icywke.webp",
                alt: "AIRPODS DE SEGUNDA GENERACIÓN CON PANTALLA"
              },
              {
                key: "4",
                src: "https://res.cloudinary.com/dtttwxbgr/image/upload/v1752350773/AUDIFONOS_DE_TERCERA_GENERACI%C3%93N_P%C3%81GINA_200x200px_ut2dka.webp",
                alt: "AIRPODS DE TERCERA GENERACIÓN"
              },
              {
                key: "5",
                src: "https://res.cloudinary.com/dtttwxbgr/image/upload/v1752350772/AUDIFONOS_DE_CUARTA_GENERACI%C3%93N_P%C3%81GINA_200x200px_kkrivz.webp",
                alt: "AIRPODS DE CUARTA GENERACIÓN"
              },
            ]}
          />
        </div>

        <ProductGrid
          products={products}
          tag="airpods"
        />
      </div>

      <div className="mt-10">
        <TitleCenter
          title="Apple Watch"
          subtitle="Conoce todos los Apple Watch."
          className="mb-2"
        />

        <ProductGrid
          products={products}
          tag="applewatch"
        />
      </div>

      <div className="mt-10">
        <TitleCenter
          title="Samsung Galaxy Buds"
          subtitle="Conoce todos los Samsung Galaxy Buds."
          className="mb-2"
        />

        <ProductGrid
          products={products}
          tag="galaxybuds"
        />
      </div>

      <Notification timeout={10000}/>
    </div>
  );
};
