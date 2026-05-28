import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout/", "/orders/", "/profile/"],
      },
    ],
    sitemap: "https://dydtech.com/sitemap.xml",
  };
}
