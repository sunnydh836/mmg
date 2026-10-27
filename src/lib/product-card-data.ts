import type { Prisma } from "@prisma/client";
import type { Product } from "@/types/product";

export const productCardSelect = {
  id: true,
  slug: true,
  name: true,
  type: true,
  price: true,
  mrp: true,
  availability: true,
  featured: true,
  isDemo: true,
  createdAt: true,
  updatedAt: true,
  brand: { select: { name: true } },
  category: { select: { name: true } },
  images: {
    select: { imageUrl: true },
    orderBy: { sortOrder: "asc" },
    take: 1,
  },
} satisfies Prisma.ProductSelect;

export type ProductCardRecord = Prisma.ProductGetPayload<{
  select: typeof productCardSelect;
}>;

export function toProductCardProduct(record: ProductCardRecord): Product {
  return {
    id: record.id,
    slug: record.slug,
    name: record.name,
    brand: (record.brand?.name || "Other") as Product["brand"],
    category: (record.category?.name || "Other") as Product["category"],
    type: record.type as Product["type"],
    price: record.price,
    mrp: record.mrp,
    description: "",
    shortDescription: "",
    images: record.images.map((image) => image.imageUrl),
    specifications: {},
    availability: record.availability as Product["availability"],
    featured: record.featured,
    createdAt: record.createdAt.toISOString(),
    updatedAt: record.updatedAt.toISOString(),
    imagePlaceholderId: 1,
    isDemo: record.isDemo,
    preOwnedCondition: record.type,
  };
}
