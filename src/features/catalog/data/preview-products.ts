export type PreviewProduct = {
  id: string;
  brand: string;
  name: string;
  listPrice: number;
  salePrice: number;
  tone: "charcoal" | "oat" | "cobalt" | "wine";
  badge?: string;
};

export const previewProducts: PreviewProduct[] = [
  {
    id: "preview-01",
    brand: "MORROW STANDARD",
    name: "워시드 코튼 필드 재킷 · 차콜",
    listPrice: 238000,
    salePrice: 214200,
    tone: "charcoal",
    badge: "NEW",
  },
  {
    id: "preview-02",
    brand: "ORDINARY FORM",
    name: "울 블렌드 릴랙스드 니트 · 오트",
    listPrice: 129000,
    salePrice: 129000,
    tone: "oat",
  },
  {
    id: "preview-03",
    brand: "STILL LAYER",
    name: "시그니처 옥스퍼드 셔츠 · 코발트",
    listPrice: 108000,
    salePrice: 86400,
    tone: "cobalt",
    badge: "20%",
  },
  {
    id: "preview-04",
    brand: "AFTER MONO",
    name: "텍스처드 집업 카디건 · 와인",
    listPrice: 168000,
    salePrice: 151200,
    tone: "wine",
    badge: "LOW STOCK",
  },
];
