export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation";
import type { Metadata } from 'next';
import prisma from "@/lib/prisma";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductCard } from "@/components/sections/Products";
import { getStoreSettings, isWhatsAppEnabled } from "@/lib/settings";
import { withDatabaseFallback } from "@/lib/database-fallback";
import { buildMetadata, generateCategorySchema } from "@/lib/seo";
import { productCardSelect, toProductCardProduct } from "@/lib/product-card-data";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await props.params;
    const category = await withDatabaseFallback(
        prisma.category.findUnique({
            where: { slug },
            select: { name: true }
        }),
        null,
        `category metadata ${slug}`
    );

    if (!category) return {};

    const name = category.name;

    return buildMetadata({
        title: `${name} in Partapur, Meerut | Mahadev Mobile Gallery`,
        description: `Explore the best collection of ${name.toLowerCase()} at Mahadev Mobile Gallery & Repairing in Partapur, Meerut. Genuine products, best prices, testing, and store warranty.`,
        path: `/categories/${slug}`,
        keywords: [
            `${name} Meerut`,
            `${name} in Partapur`,
            `buy ${name.toLowerCase()} Meerut`,
            'Mahadev Mobile Gallery',
        ],
    });
}

export default async function CategoryDetailPage(props: { params: Promise<{ slug: string }> }) {
    const { slug } = await props.params;

    const [category, settings] = await Promise.all([
        withDatabaseFallback(
            prisma.category.findUnique({
                where: { slug },
                include: {
                    products: {
                        orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
                        select: productCardSelect,
                    }
                }
            }),
            null,
            `category page ${slug}`
        ),
        getStoreSettings(),
    ]);

    if (!category) {
        notFound();
    }

    const products = category.products.map(toProductCardProduct);

    const categorySchema = generateCategorySchema({
        name: category.name,
        slug: category.slug,
        description: `Explore ${category.name} available at Mahadev Mobile Gallery & Repairing in Partapur, Meerut.`,
        products: category.products.map((p) => ({ name: p.name, slug: p.slug })),
    });

    const breadcrumbs = [
        { name: "Products", path: "/products" },
        { name: category.name, path: `/categories/${slug}` },
    ];

    return (
        <Section className="pt-24 pb-16">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(categorySchema) }}
            />

            <div className="mb-6">
                <Breadcrumbs items={breadcrumbs} />
            </div>

            <div className="mb-10 text-center max-w-3xl mx-auto">
                <span className="text-accent text-xs font-bold uppercase tracking-widest block mb-2">
                    Category Collection
                </span>
                <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
                    {category.name} in Partapur, Meerut
                </h1>
                <p className="text-gray-400 text-base md:text-lg leading-relaxed">
                    Browse all available {category.name.toLowerCase()} at {settings.displayName || settings.businessName}. Visit our showroom on Gagol Road for in-person testing and immediate pickup.
                </p>
            </div>

            {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            whatsappNumber={settings.whatsapp}
                            isWhatsAppEnabled={isWhatsAppEnabled(settings)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 bg-secondary/20 rounded-2xl border border-white/5 max-w-xl mx-auto">
                    <h2 className="text-xl font-bold text-white mb-2">No products currently in this category</h2>
                    <p className="text-gray-400 text-sm mb-6">
                        Fresh stock arrives regularly. Contact our store directly or explore our full collection.
                    </p>
                    <Link href="/products">
                        <Button variant="primary">View All Products</Button>
                    </Link>
                </div>
            )}
        </Section>
    );
}

