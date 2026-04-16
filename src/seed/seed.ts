import bcryptjs from "bcryptjs";

interface SeedProduct {
  position: number;
  description: string;
  images: string[];
  descriptionImages: string[];
  descriptionImagesMobile: string[];
  inStock: number;
  price: number;
  priceInOffer: number;
  slug: string;
  tags: string[];
  title: string;
  type: ValidTypes;
  contentId: string;
};

interface SeedUser {
  email: string;
  password: string;
  name: string;
  role: "admin" | "user";
};

type ValidTypes = "apple" | "airpods" | "headphones" | "covers" | "chargers" | "portable chargers" | "watch";

interface seedData {
  users: SeedUser[];
  categories: string[];
  products: SeedProduct[];
};

export const initialData: seedData = {
  users: [
    {
      email: "correo@correo.com",
      name: "Correo",
      password: bcryptjs.hashSync("123456"),
      role: "admin"
    },
    {
      email: "dafeloru@correo.com",
      name: "Daniel",
      password: bcryptjs.hashSync("123456"),
      role: "user"
    }
  ],
  categories: [
    "Apple",
    "Airpods",
    "Headphones",
    "Galaxy Buds",
    "Watch",
    "Apple Watch",
    "Covers",
    "Chargers",
    "Portable chargers"
  ],
  products: [
    {
      position: 1,
      description: "Airpods de segunda generación",
      images: [
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1752360837/AUDIFONOS_DE_SEGUNDA_GENERACI%C3%93N_P%C3%81GINA_1200x400px_lanfdv.webp",
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1752362107/AUDIFONOS_DE_SEGUNDA_GENERACI%C3%93N_P%C3%81GINA_2_1200x400px_neirmy.webp",
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1751687640/AUDIFONOS_DE_SEGUNDA_GENERACI%C3%93N_P%C3%81GINA_3125x3125px_aus9ts.png"
      ],
      descriptionImages: [
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1755971865/PUBLICIDAD_DE_SEGUNDA_GENERACI%C3%93N_1_1800_x_800_px_mongsz.webp"
      ],
      descriptionImagesMobile: [
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1755971865/PUBLICIDAD_DE_SEGUNDA_GENERACI%C3%93N_1_1800_x_800_px_mongsz.webp"
      ],
      inStock: 5,
      price: 64990,
      priceInOffer: 79990,
      slug: "airpods_2nd_gen",
      tags: ["products", "apple", "airpods", "headphones"],
      title: "AIRPODS DE SEGUNDA GENERACIÓN",
      type: "headphones",
      contentId: "AIR-SEG-GEN-01"
    },
    {
      position: 2,
      description: "Airpods pro de segunda generación",
      images: [
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1752360840/AUDIFONOS-PRO-DE-SEGUNDA-GENERACI%C3%93N-P%C3%81GINA-1200x400px_d70xez.webp",
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1752362103/AUDIFONOS_PRO_DE_SEGUNDA_GENERACI%C3%93N_P%C3%81GINA_2_1200x400px_hp1rxk.webp",
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1752238817/AUDIFONOS_PRO_DE_SEGUNDA_GENERACI%C3%93N_P%C3%81GINA_2_4800_x_1600px_g574jb.webp"
      ],
      descriptionImages: [
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1755879614/META_ADS_PUBLICIDAD_PRO_DE_SEGUNDA_GENERACI%C3%93N_2_1800_x_800_px_pfj4kk.webp"
      ],
      descriptionImagesMobile: [
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1755879614/META_ADS_PUBLICIDAD_PRO_DE_SEGUNDA_GENERACI%C3%93N_2_1800_x_800_px_pfj4kk.webp"
      ],
      inStock: 5,
      price: 79990,
      priceInOffer: 104990,
      slug: "airpods_pro_2nd_gen",
      tags: ["products", "apple", "airpods", "headphones"],
      title: "AIRPODS PRO DE SEGUNDA GENERACIÓN",
      type: "headphones",
      contentId: "AIR-PRO-SEG-GEN-01"
    },
    {
      position: 3,
      description: "Airpods pro de segunda generación ANC",
      images: [
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1752360840/AUDIFONOS-PRO-DE-SEGUNDA-GENERACI%C3%93N-P%C3%81GINA-1200x400px_d70xez.webp",
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1752362103/AUDIFONOS_PRO_DE_SEGUNDA_GENERACI%C3%93N_P%C3%81GINA_2_1200x400px_hp1rxk.webp",
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1752238817/AUDIFONOS_PRO_DE_SEGUNDA_GENERACI%C3%93N_P%C3%81GINA_2_4800_x_1600px_g574jb.webp"
      ],
      descriptionImages: [
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1755875531/META_ADS_PUBLICIDAD_TERCERA_GENERACI%C3%93N_2_1800_x_800_px_swxfe7.webp"
      ],
      descriptionImagesMobile: [
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1755982029/PUBLICIDAD_PRO_DE_SEGUNDA_GENERACI%C3%93N_ANC_2_800_x_800_px_sypfav.webp"
      ],
      inStock: 5,
      price: 89990,
      priceInOffer: 119990,
      slug: "airpods_pro_2nd_gen_anc",
      tags: ["products", "apple", "airpods", "headphones"],
      title: "AIRPODS PRO DE SEGUNDA GENERACIÓN ANC",
      type: "headphones",
      contentId: "AIR-PRO-SEG-GEN-02"
    },
    {
      position: 4,
      description: "Airpods pro de segunda generación con pantalla",
      images: [
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1752360837/AUDIFONOS_PRO_DE_SEGUNDA_GENERACI%C3%93N_CON_PANTALLA_P%C3%81GINA_1200x400px_o8neck.webp",
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1752362103/AUDIFONOS_PRO_DE_SEGUNDA_GENERACI%C3%93N_CON_PANTALLA_P%C3%81GINA_2_1200x400px_s55jfw.webp",
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1751687617/AUDIFONOS_PRO_DE_SEGUNDA_GENERACI%C3%93N_CON_PANTALLA_P%C3%81GINA_3125x3125px_dr9hkx.png"
      ],
      descriptionImages: [

      ],
      descriptionImagesMobile: [

      ],
      inStock: 5,
      price: 119990,
      priceInOffer: 134990,
      slug: "airpods_pro_2nd_gen_with_screen",
      tags: ["products", "apple", "airpods", "headphones"],
      title: "AIRPODS PRO DE SEGUNDA GENERACIÓN CON PANTALLA",
      type: "headphones",
      contentId: "AIR-PRO-SEG-GEN-03"
    },
    {
      position: 5,
      description: "Airpods de tercera generación",
      images: [
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1752360843/AUDIFONOS-DE-TERCERA-GENERACI%C3%93N-P%C3%81GINA-1200x400px_f2ebmi.webp",
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1752362099/AUDIFONOS_DE_TERCERA_GENERACI%C3%93N_P%C3%81GINA_2_1200x400px_xl8ckp.webp",
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1751687348/AUDIFONOS_DE_TERCERA_GENERACI%C3%93N_P%C3%81GINA_3125x3125px_s2i0ja.png"
      ],
      descriptionImages: [
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1755892053/PUBLICIDAD_TERCERA_GENERACI%C3%93N_1_1800_x_800_px_vhwrk0.webp"
      ],
      descriptionImagesMobile: [
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1755892053/PUBLICIDAD_TERCERA_GENERACI%C3%93N_1_1800_x_800_px_vhwrk0.webp"
      ],
      inStock: 5,
      price: 79990,
      priceInOffer: 104990,
      slug: "airpods_3nd_gen",
      tags: ["products", "apple", "airpods", "headphones"],
      title: "AIRPODS DE TERCERA GENERACIÓN",
      type: "headphones",
      contentId: "AIR-TER-GEN-01"
    },
    {
      position: 6,
      description: "Airpods de cuarta generación",
      images: [
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1753754006/AUDIFONOS-DE-CUARTA-GENERACI%C3%93N-P%C3%81GINA-1200x400px_guyvvt.webp",
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1752362098/AUDIFONOS_DE_CUARTA_GENERACI%C3%93N_P%C3%81GINA_2_1200x400px_mvwfgg.webp",
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1751687348/AUDIFONOS_DE_CUARTA_GENERACI%C3%93N_P%C3%81GINA_3125x3125px_i3bddh.png"
      ],
      descriptionImages: [
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1755893457/PUBLICIDAD_CUARTA_GENERACI%C3%93N_1_1800_x_800_px_lvnpk9.webp"
      ],
      descriptionImagesMobile: [
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1755893457/PUBLICIDAD_CUARTA_GENERACI%C3%93N_1_1800_x_800_px_lvnpk9.webp"
      ],
      inStock: 5,
      price: 89990,
      priceInOffer: 119990,
      slug: "airpods_4nd_gen",
      tags: ["products", "apple", "airpods", "headphones"],
      title: "AIRPODS DE CUARTA GENERACIÓN",
      type: "headphones",
      contentId: "AIR-CUA-GEN-01"
    },
    {
      position: 1,
      description: "Apple Watch Series 10",
      images: [
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1753796848/APPLE_WATCH_SERIES_10_P%C3%81GINA_2_1200x400px_rhhwql.webp",
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1753796847/APPLE_WATCH_SERIES_10_P%C3%81GINA_1200x400px_d7orch.webp",
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1753796953/97006445-DBC8-4734-BD32-512C58A280B5_avvp8v.jpg"
      ],
      descriptionImages: [

      ],
      descriptionImagesMobile: [

      ],
      inStock: 5,
      price: 129990,
      priceInOffer: 159990,
      slug: "apple_watch_series_10",
      tags: ["products", "apple", "applewatch", "watch"],
      title: "APPLE WATCH SERIES 10",
      type: "watch",
      contentId: "APP-WAT-SER-10"
    },
    {
      position: 2,
      description: "Apple Watch Ultra",
      images: [
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1753797291/APPLE_WATCH_ULTRA_P%C3%81GINA_2_1200x400px_nsmamj.webp",
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1753797291/APPLE_WATCH_ULTRA_P%C3%81GINA_1200x400px_mremhc.webp",
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1753797406/IMG_3721_igfnio.jpg"
      ],
      descriptionImages: [

      ],
      descriptionImagesMobile: [

      ],
      inStock: 5,
      price: 189990,
      priceInOffer: 229990,
      slug: "apple_watch_ultra",
      tags: ["products", "apple", "applewatch", "watch"],
      title: "APPLE WATCH ULTRA",
      type: "watch",
      contentId: "APP-WAT-ULT"
    },
    {
      position: 1,
      description: "Samsung Galaxy Buds 3 Pro Blancos",
      images: [
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1753798785/SAMSUNG_GALAXY_BUDS_3_PRO_BLANCO_P%C3%81GINA_2_1200x400px_yitmaz.webp",
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1753798786/SAMSUNG_GALAXY_BUDS_3_PRO_BLANCO_P%C3%81GINA_1200x400px_eb3qja.webp",
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1753798808/IMG_3990_ycwo6f.jpg"
      ],
      descriptionImages: [

      ],
      descriptionImagesMobile: [

      ],
      inStock: 5,
      price: 89990,
      priceInOffer: 119990,
      slug: "samsung_galaxy_buds_3_pro_blancos",
      tags: ["products", "apple", "galaxybuds", "headphones"],
      title: "SAMSUNG GALAXY BUDS 3 PRO",
      type: "headphones",
      contentId: "SAM-GAL-BUD-THR-PRO-BLA"
    },
    {
      position: 1,
      description: "Samsung Galaxy Buds 3 Pro Negros",
      images: [
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1753798000/SAMSUNG_GALAXY_BUDS_PRO_P%C3%81GINA_2_1200x400px_pyuozm.webp",
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1753797999/SAMSUNG_GALAXY_BUDS_PRO_P%C3%81GINA_1200x400px_mgg9k3.webp",
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1753798026/IMG_4050_h7rmqc.jpg"
      ],
      descriptionImages: [

      ],
      descriptionImagesMobile: [

      ],
      inStock: 5,
      price: 89990,
      priceInOffer: 119990,
      slug: "samsung_galaxy_buds_3_pro_negros",
      tags: ["products", "apple", "galaxybuds", "headphones"],
      title: "SAMSUNG GALAXY BUDS 3 PRO",
      type: "headphones",
      contentId: "SAM-GAL-BUD-THR-PRO-NEG"
    },
    {
      position: 1,
      description: "Samsung Galaxy Buds FE",
      images: [
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1753798000/SAMSUNG_GALAXY_BUDS_PRO_P%C3%81GINA_2_1200x400px_pyuozm.webp",
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1753797999/SAMSUNG_GALAXY_BUDS_PRO_P%C3%81GINA_1200x400px_mgg9k3.webp",
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1753798026/IMG_4050_h7rmqc.jpg"
      ],
      descriptionImages: [

      ],
      descriptionImagesMobile: [

      ],
      inStock: 5,
      price: 119990,
      priceInOffer: 169990,
      slug: "samsung_galaxy_buds_fe",
      tags: ["products", "apple", "galaxybuds", "headphones"],
      title: "SAMSUNG GALAXY BUDS FE",
      type: "headphones",
      contentId: "SAM-GAL-BUD-FE"
    },
    {
      position: 1,
      description: "Cargador iPhone 25w",
      images: [
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1753798000/SAMSUNG_GALAXY_BUDS_PRO_P%C3%81GINA_2_1200x400px_pyuozm.webp",
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1753797999/SAMSUNG_GALAXY_BUDS_PRO_P%C3%81GINA_1200x400px_mgg9k3.webp",
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1753798026/IMG_4050_h7rmqc.jpg"
      ],
      descriptionImages: [

      ],
      descriptionImagesMobile: [

      ],
      inStock: 5,
      price: 119990,
      priceInOffer: 169990,
      slug: "cargador_iphone_25w",
      tags: ["products", "apple", "charger"],
      title: "CARGADOR IPHONE 25W",
      type: "headphones",
      contentId: "CAR-IPH-25W"
    },
    {
      position: 1,
      description: "Cargador iPhone 35w",
      images: [
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1753798000/SAMSUNG_GALAXY_BUDS_PRO_P%C3%81GINA_2_1200x400px_pyuozm.webp",
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1753797999/SAMSUNG_GALAXY_BUDS_PRO_P%C3%81GINA_1200x400px_mgg9k3.webp",
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1753798026/IMG_4050_h7rmqc.jpg"
      ],
      descriptionImages: [

      ],
      descriptionImagesMobile: [

      ],
      inStock: 5,
      price: 119990,
      priceInOffer: 169990,
      slug: "cargador_iphone_35w",
      tags: ["products", "apple", "charger"],
      title: "CARGADOR IPHONE 35W",
      type: "headphones",
      contentId: "CAR-IPH-35W"
    },
    {
      position: 1,
      description: "Cargador Original iPhone 20w",
      images: [
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1753798000/SAMSUNG_GALAXY_BUDS_PRO_P%C3%81GINA_2_1200x400px_pyuozm.webp",
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1753797999/SAMSUNG_GALAXY_BUDS_PRO_P%C3%81GINA_1200x400px_mgg9k3.webp",
        "https://res.cloudinary.com/dtttwxbgr/image/upload/v1753798026/IMG_4050_h7rmqc.jpg"
      ],
      descriptionImages: [

      ],
      descriptionImagesMobile: [

      ],
      inStock: 5,
      price: 199990,
      priceInOffer: 219990,
      slug: "cargador_iphone_20w",
      tags: ["products", "apple", "charger"],
      title: "CARGADOR ORIGINAL IPHONE 20W",
      type: "headphones",
      contentId: "CAR-IPH-20W"
    },
  ]
};
