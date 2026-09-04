import { describe, expect, it } from "vitest";

import { calculateDiscountRate, formatKrw } from "@/lib/money";

describe("formatKrw", () => {
  it("원 단위 정수에 천 단위 구분과 통화 단위를 붙인다", () => {
    expect(formatKrw(158400)).toBe("158,400원");
  });

  it("음수와 소수 금액을 거부한다", () => {
    expect(() => formatKrw(-1)).toThrow(RangeError);
    expect(() => formatKrw(100.5)).toThrow(RangeError);
  });
});

describe("calculateDiscountRate", () => {
  it("할인율을 가장 가까운 정수로 계산한다", () => {
    expect(calculateDiscountRate(108000, 86400)).toBe(20);
  });

  it("판매가가 정가보다 크면 거부한다", () => {
    expect(() => calculateDiscountRate(10000, 12000)).toThrow(RangeError);
  });
});
