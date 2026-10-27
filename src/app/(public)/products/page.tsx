import type { Metadata } from "next";
import type { Prisma } from "@prisma/client";
import { Section, SectionHeader } from "@/components/ui/Section";
import { ClientProductList } from "@/components/sections/ClientProductList";
import prisma from "@/lib/prisma";
import { getStoreSettings } from "@/lib/settings";
import { withDatabaseFallback } from "@/lib/database-fallback";
import { productCardSelect, toProductCardProduct } from "@/lib/product-card-data";

const PAGE_SIZE = 12;
type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function firstParam(value: string | string[] | undefined) {
    return Array.isArray(value) ? value[0] : value;
}

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getStoreSettings();
    return {
        title: `${settings.displayName || settings.businessName} | Mobile Collection`,
        description: `Explore the latest smartphones and mobile accessories at ${settings.displayName || settings.businessName} in Partapur, Meerut.`,
    };
}

export default async function ProductsPage({ searchParams }: { searchParams: SearchParams }) {
    const params = await searchParams;
    const search = (firstParam(params.search) || "").trim().slice(0, 100);
    const brand = firstParam(params.brand) || "";
    const category = firstParam(params.category) || "";
    const requestedType = firstParam(params.type) || "";
    const requestedAvailability = firstParam(params.availability) || "";
    const sort = firstParam(params.sort) || "Featured";
    const featuredOnly = firstParam(params.featured) === "true";
    const pageParam = Number.parseInt(firstParam(params.page) || "1", 10);
    const page = Number.isFinite(pageParam) && pageParam > 0 ? pageParam : 1;

    const conditions: Prisma.ProductWhereInput[] = [];
    if (search) {
        conditions.push({
            OR: [
                { name: { contains: search, mode: "insensitive" } },
                { brand: { is: { name: { contains: search, mode: "insensitive" } } } },
            ],
        });
    }
    if (brand) conditions.push({ brand: { is: { name: brand } } });
    if (category) conditions.push({ category: { is: { name: category } } });
    if (["NEW", "USED", "REFURBISHED"].includes(requestedType)) {
        conditions.push({ type: requestedType });
    }
    if (["In Stock", "Limited Stock", "Out of Stock"].includes(requestedAvailability)) {
        conditions.push({ availability: requestedAvailability });
    }
    if (featuredOnly) conditions.push({ featured: true });

    const where: Prisma.ProductWhereInput = conditions.length ? { AND: conditions } : {};
    const orderBy: Prisma.ProductOrderByWithRelationInput[] = sort === "Name A-Z"
        ? [{ name: "asc" }, { id: "asc" }]
        : sort === "Newest"
            ? [{ createdAt: "desc" }, { id: "desc" }]
            : [{ featured: "desc" }, { createdAt: "desc" }, { id: "desc" }];

    const [records, brands, categories, settings] = await Promise.all([
        withDatabaseFallback(prisma.product.findMany({
            where,
            orderBy,
            skip: (page - 1) * PAGE_SIZE,
            take: PAGE_SIZE + 1,
            select: productCardSelect,
        }), [], "product page"),
        withDatabaseFallback(prisma.brand.findMany({ select: { name: true }, orderBy: { name: "asc" } }), [], "brand list"),
        withDatabaseFallback(prisma.category.findMany({ select: { name: true }, orderBy: { name: "asc" } }), [], "category list"),
        getStoreSettings(),
    ]);
    const hasNext = records.length > PAGE_SIZE;
    const products = records.slice(0, PAGE_SIZE).map(toProductCardProduct);

    return (
        <Section>
            <SectionHeader
                title="Our Collection"
                subtitle="Explore all available smartphones and devices."
            />
            <ClientProductList
                key={JSON.stringify(params)}
                products={products}
                brands={brands.map((item) => item.name)}
                categories={categories.map((item) => item.name)}
                whatsappNumber={settings.whatsapp}
                page={page}
                hasNext={hasNext}
            />
        </Section>
    );
}
