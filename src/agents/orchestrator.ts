import prisma from "@/lib/prisma";
import type { ProductContext } from "@/interfaces/content.interface";
import type { ContentAngle } from "@prisma/client";

const REPEAT_COOLDOWN_HOURS = 72;

export async function selectProductForToday(productId?: string): Promise<ProductContext> {
  const recentCutoff = new Date(Date.now() - REPEAT_COOLDOWN_HOURS * 60 * 60 * 1000);

  const recentlyUsed = await prisma.contentPost.findMany({
    where: { createdAt: { gte: recentCutoff } },
    select: { productId: true },
  });
  const usedIds = new Set(recentlyUsed.map((p) => p.productId));

  if (productId) {
    const product = await prisma.product.findUniqueOrThrow({
      where: { id: productId },
      include: { category: true, ProductImage: { orderBy: { position: "asc" } } },
    });
    return toContext(product);
  }

  const candidates = await prisma.product.findMany({
    where: { inStock: { gt: 0 } },
    include: { category: true, ProductImage: { orderBy: { position: "asc" } } },
    orderBy: { position: "asc" },
  });

  const available = candidates.filter((p) => !usedIds.has(p.id));
  const pool = available.length > 0 ? available : candidates;

  // Priority: low_stock → promotion → first by position
  const lowStock = pool.find((p) => p.inStock > 0 && p.inStock <= 3);
  const promotion = pool.find((p) => p.priceInOffer > p.price);
  const selected = lowStock ?? promotion ?? pool[0];

  if (!selected) throw new Error("No hay productos disponibles con stock para generar contenido.");

  return toContext(selected);
}

export function resolveAngle(product: ProductContext): ContentAngle {
  if (product.inStock > 0 && product.inStock <= 3) return "low_stock";
  if (product.priceInOffer > product.price) return "promotion";
  return "new_product";
}

function toContext(product: {
  id: string;
  title: string;
  slug: string;
  price: number;
  priceInOffer: number;
  inStock: number;
  description: string;
  tags: string[];
  contentId: string;
  category: { name: string };
  ProductImage: { url: string; position: number }[];
}): ProductContext {
  const images = product.ProductImage.map((i) => i.url);
  const squareImage =
    product.ProductImage.find((i) => i.position === 2)?.url ??
    images[0] ??
    "";

  return {
    id: product.id,
    title: product.title,
    slug: product.slug,
    price: product.price,
    priceInOffer: product.priceInOffer,
    inStock: product.inStock,
    description: product.description,
    tags: product.tags,
    contentId: product.contentId,
    categoryName: product.category.name,
    primaryImageUrl: squareImage,
    allImageUrls: images,
  };
}
