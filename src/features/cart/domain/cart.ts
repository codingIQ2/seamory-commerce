export const FREE_SHIPPING_THRESHOLD = 100_000;
export const STANDARD_SHIPPING_AMOUNT = 3_000;

export function calculateCartTotals(lines: { unitPrice: number; quantity: number }[]) {
  const itemsAmount = lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  const shippingAmount =
    itemsAmount >= FREE_SHIPPING_THRESHOLD || itemsAmount === 0 ? 0 : STANDARD_SHIPPING_AMOUNT;
  return { itemsAmount, shippingAmount, totalAmount: itemsAmount + shippingAmount };
}
