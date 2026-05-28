export const FREE_SHIPPING_THRESHOLD = 150000;
export const SHIPPING_FEE = 10000;

/** Flat fee below the free-shipping threshold; free at or above it. Empty cart pays nothing. */
export const calculateShipping = (subTotal: number): number =>
  subTotal > 0 && subTotal < FREE_SHIPPING_THRESHOLD ? SHIPPING_FEE : 0;
