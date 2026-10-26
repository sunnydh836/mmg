export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
    const settings = await import('@/lib/settings').then(m => m.getStoreSettings());
    return {
        title: `${settings.displayName || settings.businessName} | Mobile Collection`,
        description: `Explore the latest smartphones and mobile accessories at ${settings.displayName || settings.businessName} in Partapur, Meerut.`
    };
}

import { Section, SectionHeader } from "@/components/ui/Section";
import { ClientProductList } from "@/components/sections/ClientProductList";
import prisma from "@/lib/prisma";
import { getStoreSettings } from "@/lib/settings";

export default async function ProductsPage() {
    const products = await prisma.product.findMany({
        include: { brand: true, category: true, images: { orderBy: { sortOrder: 'asc' } } }
    });

    // We can map database models to the flat format the component expects or just pass them
    const brands = await prisma.brand.findMany({ select: { name: true } });
    const categories = await prisma.category.findMany({ select: { name: true } });
    const settings = await getStoreSettings();

    // Map products so ClientProductList doesn't break
    const mappedProducts = products.map(p => ({
        ...p,
        brand: p.brand?.name || "Other",
        category: p.category?.name || "Other",
        images: p.images.map(img => img.imageUrl),
        imagePlaceholderId: 1,
        preOwnedCondition: p.type,
        specifications: {},
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString(),
    })) as unknown as import("@/types/product").Product[];

    return (
        <Section>
            <SectionHeader
                title="Our Collection"
                subtitle="Explore all available smartphones and devices."
            />
            <ClientProductList
                products={mappedProducts}
                brands={brands.map(b => b.name)}
                categories={categories.map(c => c.name)}
                whatsappNumber={settings.whatsapp}
            />
        </Section>
    );
}
