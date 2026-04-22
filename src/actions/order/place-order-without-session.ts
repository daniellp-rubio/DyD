"use server";

import { auth } from "@/auth-config";
import { Address } from "@/interfaces";
import prisma from "@/lib/prisma";

interface ProductToOrder {
  productId: string;
  quantity: number;
};

export const placeOrderWithoutSession = async(productIds: ProductToOrder[], address: Address) => {
  const session = await auth();
  const userId = session?.user.id;

  if (userId) {
    return {
      ok: false,
      message: "Ya tienes una sesión de usuario."
    };
  };

  const products = await prisma.product.findMany({
    where: {
      id: {
        in: productIds.map(p => p.productId)
      }
    }
  });

  const itemsInOrder = productIds.reduce((count, p) => count + p.quantity, 0);

  const { subTotal, total } = productIds.reduce((totals, item) => {
    const productQuantity = item.quantity;
    const product = products.find(product => product.id === item.productId);

    if(!product) throw new Error(`${item.productId} no existe - 500`);

    const subTotal = product.price * productQuantity;

    totals.subTotal += subTotal;
    totals.total += subTotal * 1;

    return totals;
  }, {subTotal: 0, total:0});

  try {
    const prismaTx = await prisma.$transaction(async(tx) => {
      const updatedProductsPromises = products.map((product) => {
        const productQuantity = productIds.filter(
          p => p.productId === product.id
        ).reduce((acc, item) => item.quantity + acc, 0);

        if (productQuantity === 0) {
          throw new Error(`${product.id} no tiene cantidad definida`);
        };

        return tx.product.update({
          where: { id: product.id },
          data: {
            inStock: {
              decrement: productQuantity
            }
          }
        });
      });

      const updatedProducts = await Promise.all(updatedProductsPromises);

      console.log("updatedProducts", updatedProducts);
      updatedProducts.forEach(product => {
        console.log("product", product);
        if (product.inStock < 0) {
          throw new Error(`${product.title} no tiene inventario suficiente`)
        };
      });

      const order = await tx.order.create({
        data: {
          userId: userId,
          itemsInOrder: itemsInOrder,
          subTotal,
          total,

          OrderItem: {
            createMany: {
              data: productIds.map(p => ({
                quantity: p.quantity,
                productId: p.productId,
                price: products.find(product => product.id === p.productId)?.price ?? 0
              }))
            }
          }
        }
      });

      const orderAddress = await tx.orderAddress.create({
        data: {
          firstName: address.firstName,
          lastName: address.lastName,
          address: address.address,
          address2: address.address2,
          postalCode: address.postalCode,
          city: address.city,
          phone: address.phone,

          orderId: order.id,
        }
      });

      return {
        order,
        updatedProducts: updatedProducts,
        orderAddress: orderAddress
      }
    });

    return {
      ok: true,
      order: prismaTx.order,
      prismaTx: prismaTx
    }
  } catch (err) {
  if (err instanceof Error) {
    return {
      ok: false,
      message: err.message,
    };
  }

  return {
    ok: false,
    message: "Ocurrió un error desconocido",
  };
}
};
