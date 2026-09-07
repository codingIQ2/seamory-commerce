import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { betterAuth } from "better-auth";

import { PrismaClient, ProductStatus, UserRole } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is required to seed the database.");
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const seedAuth = betterAuth({
  appName: "HUKUPUKU Seed",
  baseURL: process.env.BETTER_AUTH_URL ?? "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET ?? "hukupuku-seed-secret-at-least-32-characters",
  database: prismaAdapter(db, { provider: "postgresql" }),
  emailAndPassword: { enabled: true },
  user: {
    additionalFields: {
      role: { type: ["MEMBER", "ADMIN"], required: false, defaultValue: "MEMBER", input: false },
    },
  },
  advanced: { database: { generateId: "uuid", joins: true } },
});

const brands = [
  ["HUKUPUKU LAB", "hukupuku-lab", "도시의 움직임을 연구하는 HUKUPUKU 오리지널 라인"],
  ["ORDINARY FORM", "ordinary-form", "오래 입을 수 있는 소재와 형태에 집중하는 서울 기반 레이블"],
  ["NAMI STUDIO", "nami-studio", "절제된 색과 유연한 실루엣을 만드는 도쿄 스튜디오"],
] as const;

const categories = [
  ["아우터", "outer", 10],
  ["상의", "tops", 20],
  ["하의", "bottoms", 30],
  ["가방", "bags", 40],
] as const;

const products = [
  {
    brand: "hukupuku-lab",
    category: "outer",
    name: "워시드 유틸리티 재킷",
    slug: "washed-utility-jacket-charcoal",
    description:
      "입체적인 포켓과 여유로운 드롭 숄더가 특징인 시그니처 재킷입니다. 가먼트 워싱으로 처음부터 자연스러운 질감을 완성했습니다.",
    material: "코튼 72%, 나일론 28%",
    listPrice: 219000,
    salePrice: 189000,
    image: "/products/charcoal-utility-jacket.png",
    alt: "차콜 워시드 유틸리티 재킷",
    colorName: "차콜",
    colorCode: "#303030",
    sizes: ["M", "L", "XL"],
  },
  {
    brand: "ordinary-form",
    category: "outer",
    name: "필드 셸 재킷",
    slug: "field-shell-jacket-black",
    description:
      "날씨 변화에 유연하게 대응하는 경량 셸입니다. 미니멀한 전면과 넉넉한 수납 구조를 함께 담았습니다.",
    material: "나일론 60%, 코튼 40%",
    listPrice: 198000,
    salePrice: 198000,
    image: "/products/charcoal-utility-jacket.png",
    alt: "블랙 필드 셸 재킷",
    colorName: "블랙",
    colorCode: "#171717",
    sizes: ["M", "L"],
  },
  {
    brand: "nami-studio",
    category: "tops",
    name: "헤비 니트 크루넥",
    slug: "heavy-knit-crewneck-oat",
    description:
      "도톰하지만 부드러운 울 코튼 혼방 니트입니다. 단독으로도 실루엣이 흐트러지지 않도록 촘촘하게 짰습니다.",
    material: "울 48%, 코튼 42%, 나일론 10%",
    listPrice: 149000,
    salePrice: 119000,
    image: "/products/oat-knit-crewneck.png",
    alt: "오트밀 헤비 니트 크루넥",
    colorName: "오트밀",
    colorCode: "#D8C8AA",
    sizes: ["S", "M", "L"],
  },
  {
    brand: "hukupuku-lab",
    category: "tops",
    name: "소프트 니트 풀오버",
    slug: "soft-knit-pullover-cream",
    description:
      "편안한 착용감과 정돈된 넥 라인을 가진 데일리 풀오버입니다. 사계절 레이어링에 적합합니다.",
    material: "코튼 70%, 리사이클 폴리에스터 30%",
    listPrice: 109000,
    salePrice: 89000,
    image: "/products/oat-knit-crewneck.png",
    alt: "크림 소프트 니트 풀오버",
    colorName: "크림",
    colorCode: "#E8DDC8",
    sizes: ["M", "L"],
  },
  {
    brand: "ordinary-form",
    category: "bottoms",
    name: "와이드 트랙 팬츠",
    slug: "wide-track-pants-cobalt",
    description:
      "가벼운 립스톱 소재와 넓은 레그 라인이 만드는 선명한 실루엣. 밑단 스트링으로 두 가지 핏을 연출할 수 있습니다.",
    material: "리사이클 나일론 100%",
    listPrice: 139000,
    salePrice: 111000,
    image: "/products/cobalt-track-pants.png",
    alt: "코발트 와이드 트랙 팬츠",
    colorName: "코발트",
    colorCode: "#2447C6",
    sizes: ["S", "M", "L"],
  },
  {
    brand: "nami-studio",
    category: "bottoms",
    name: "테크니컬 벌룬 팬츠",
    slug: "technical-balloon-pants-navy",
    description: "무릎의 입체 다트와 완만하게 좁아지는 밑단이 편안한 볼륨을 만듭니다.",
    material: "나일론 88%, 폴리우레탄 12%",
    listPrice: 159000,
    salePrice: 159000,
    image: "/products/cobalt-track-pants.png",
    alt: "네이비 테크니컬 벌룬 팬츠",
    colorName: "네이비",
    colorCode: "#1D2D53",
    sizes: ["M", "L"],
  },
  {
    brand: "hukupuku-lab",
    category: "bags",
    name: "컴팩트 메신저 백",
    slug: "compact-messenger-bag-wine",
    description:
      "필요한 물건만 간결하게 수납하는 컴팩트 백입니다. 길이 조절이 쉬운 웨빙 스트랩을 적용했습니다.",
    material: "리사이클 레더, 나일론 웨빙",
    listPrice: 129000,
    salePrice: 99000,
    image: "/products/wine-crossbody-bag.png",
    alt: "와인 컬러 컴팩트 메신저 백",
    colorName: "와인",
    colorCode: "#6D2634",
    sizes: ["ONE"],
  },
  {
    brand: "ordinary-form",
    category: "bags",
    name: "데일리 크로스백",
    slug: "daily-crossbag-burgundy",
    description: "정돈된 형태와 넉넉한 내부 포켓을 갖춘 데일리 크로스백입니다.",
    material: "비건 레더 100%",
    listPrice: 118000,
    salePrice: 94000,
    image: "/products/wine-crossbody-bag.png",
    alt: "버건디 데일리 크로스백",
    colorName: "버건디",
    colorCode: "#5F202D",
    sizes: ["ONE"],
  },
] as const;

async function seed() {
  for (const [name, slug, description] of brands) {
    await db.brand.upsert({
      where: { slug },
      update: { name, description, isActive: true },
      create: { name, slug, description },
    });
  }

  for (const [name, slug, sortOrder] of categories) {
    await db.category.upsert({
      where: { slug },
      update: { name, sortOrder, isActive: true },
      create: { name, slug, sortOrder },
    });
  }

  for (const item of products) {
    const [brand, category] = await Promise.all([
      db.brand.findUniqueOrThrow({ where: { slug: item.brand } }),
      db.category.findUniqueOrThrow({ where: { slug: item.category } }),
    ]);

    const product = await db.product.upsert({
      where: { slug: item.slug },
      update: {
        brandId: brand.id,
        name: item.name,
        description: item.description,
        material: item.material,
        listPrice: item.listPrice,
        salePrice: item.salePrice,
        status: ProductStatus.ACTIVE,
        publishedAt: new Date("2026-09-04T00:00:00.000Z"),
      },
      create: {
        brandId: brand.id,
        name: item.name,
        slug: item.slug,
        description: item.description,
        material: item.material,
        listPrice: item.listPrice,
        salePrice: item.salePrice,
        status: ProductStatus.ACTIVE,
        publishedAt: new Date("2026-09-04T00:00:00.000Z"),
      },
    });

    await db.productCategory.upsert({
      where: {
        productId_categoryId: { productId: product.id, categoryId: category.id },
      },
      update: {},
      create: { productId: product.id, categoryId: category.id },
    });

    await db.productImage.upsert({
      where: { productId_sortOrder: { productId: product.id, sortOrder: 0 } },
      update: { url: item.image, alt: item.alt },
      create: { productId: product.id, url: item.image, alt: item.alt },
    });

    for (const [index, size] of item.sizes.entries()) {
      const sku = `${item.slug.toUpperCase().replaceAll("-", "_")}_${size}`;
      await db.productVariant.upsert({
        where: { sku },
        update: { stock: index === item.sizes.length - 1 ? 0 : 8 + index * 3, isActive: true },
        create: {
          productId: product.id,
          sku,
          colorName: item.colorName,
          colorCode: item.colorCode,
          size,
          stock: index === item.sizes.length - 1 ? 0 : 8 + index * 3,
        },
      });
    }
  }

  const adminEmail = process.env.ADMIN_SEED_EMAIL?.toLowerCase();
  const adminPassword = process.env.ADMIN_SEED_PASSWORD;
  if (adminEmail && adminPassword) {
    const existingAdmin = await db.user.findUnique({ where: { email: adminEmail } });
    let adminId = existingAdmin?.id;
    if (!adminId) {
      const result = await seedAuth.api.signUpEmail({
        body: {
          email: adminEmail,
          password: adminPassword,
          name: process.env.ADMIN_SEED_NAME ?? "HUKUPUKU Admin",
        },
      });
      adminId = result.user.id;
    }
    await db.user.update({ where: { id: adminId }, data: { role: UserRole.ADMIN } });
    console.log(`Prepared local admin: ${adminEmail}`);
  }
}

seed()
  .then(() => console.log(`Seeded ${products.length} HUKUPUKU products.`))
  .finally(() => db.$disconnect());
