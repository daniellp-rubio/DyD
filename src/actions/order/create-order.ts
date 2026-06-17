import prisma from "@/lib/prisma";
import { calculateShipping } from "@/config/shipping";

interface OrderLineInput {
  productId: string;
  quantity: number;
}

interface CleanAddress {
  firstName: string;
  lastName: string;
  address: string;
  address2?: string;
  postalCode: string;
  city: string;
  phone: string;
}

type OrderOwner =
  | { kind: "user"; userId: string }
  | { kind: "guest"; email?: string; accessTokenHash: string };

/** Meta click identifiers captured at checkout (cookies _fbp/_fbc). */
export interface OrderTracking {
  fbp?: string;
  fbc?: string;
}

/** Drop anything that isn't a short non-empty string before persisting. */
export const cleanTracking = (t?: OrderTracking): OrderTracking | undefined => {
  if (!t) return undefined;
  const pick = (v?: string) =>
    typeof v === "string" && v.length > 0 && v.length <= 256 ? v : undefined;
  return { fbp: pick(t.fbp), fbc: pick(t.fbc) };
};

/**
 * Shared order-creation logic for both the authenticated and guest checkout
 * actions. Prices come from the DB (never the client). Stock is decremented
 * atomically inside the transaction; total = subTotal + shipping, which is the
 * amount every payment gateway charges. Throws on stock/product errors so the
 * calling action can map the message to its { ok, message } response.
 */
export async function createOrder(
  items: OrderLineInput[],
  address: CleanAddress,
  owner: OrderOwner,
  tracking?: OrderTracking,
) {
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((p) => p.productId) } },
    select: { id: true, price: true, title: true },
  });

  if (products.length !== items.length) {
    throw new Error("Uno o más productos no existen");
  }

  const itemsInOrder = items.reduce((c, p) => c + p.quantity, 0);
  let subTotal = 0;
  for (const item of items) {
    const product = products.find((p) => p.id === item.productId)!;
    subTotal += product.price * item.quantity;
  }
  const shipping = calculateShipping(subTotal);
  const total = subTotal + shipping;

  return prisma.$transaction(async (tx) => {
    for (const item of items) {
      const updated = await tx.product.updateMany({
        where: { id: item.productId, inStock: { gte: item.quantity } },
        data: { inStock: { decrement: item.quantity } },
      });
      if (updated.count !== 1) {
        throw new Error(`Stock insuficiente para ${item.productId}`);
      }
    }

    return tx.order.create({
      data: {
        userId: owner.kind === "user" ? owner.userId : undefined,
        guestAccessToken: owner.kind === "guest" ? owner.accessTokenHash : undefined,
        itemsInOrder,
        subTotal,
        total,
        fbp: tracking?.fbp,
        fbc: tracking?.fbc,
        OrderItem: {
          createMany: {
            data: items.map((p) => ({
              quantity: p.quantity,
              productId: p.productId,
              price: products.find((pr) => pr.id === p.productId)!.price,
            })),
          },
        },
        OrderAddress: {
          create: {
            firstName: address.firstName,
            lastName: address.lastName,
            address: address.address,
            address2: address.address2,
            postalCode: address.postalCode,
            city: address.city,
            phone: address.phone,
            email: owner.kind === "guest" ? owner.email : undefined,
          },
        },
      },
    });
  });
}
