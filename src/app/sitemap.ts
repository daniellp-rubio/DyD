import type { MetadataRoute } from "next";
import { getPaginatedProductsWithImages } from "@/actions";

const BASE_URL = "https://dydtech.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products } = await getPaginatedProductsWithImages({ page: 1, take: 1000 });

  const productUrls: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${BASE_URL}/product/${p.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/products`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    ...productUrls,
  ];
}
