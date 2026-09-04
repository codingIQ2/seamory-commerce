export function formatKrw(amount: number): string {
  if (!Number.isSafeInteger(amount) || amount < 0) {
    throw new RangeError("금액은 0 이상의 안전한 정수여야 합니다.");
  }

  return `${new Intl.NumberFormat("ko-KR").format(amount)}원`;
}

export function calculateDiscountRate(listPrice: number, salePrice: number): number {
  if (
    !Number.isSafeInteger(listPrice) ||
    !Number.isSafeInteger(salePrice) ||
    listPrice <= 0 ||
    salePrice < 0 ||
    salePrice > listPrice
  ) {
    throw new RangeError("판매가는 0 이상이며 정가보다 클 수 없습니다.");
  }

  return Math.round(((listPrice - salePrice) / listPrice) * 100);
}
