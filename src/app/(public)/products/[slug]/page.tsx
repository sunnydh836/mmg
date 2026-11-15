export const dynamic = 'force-dynamic';

import { notFound } from "next/navigation";
import type { Metadata } from 'next';
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ProductCard } from "@/components/sections/Products";
import { ProductImageGallery } from "@/components/ui/ProductImageGallery";
import { getStoreSettings, getWhatsAppUrl, isWhatsAppEnabled } from "@/lib/settings";
import { withDatabaseFallback } from "@/lib/database-fallback";
import { buildMetadata, generateProductSchema, getAbsoluteUrl } from "@/lib/seo";
import { productCardSelect, toProductCardProduct } from "@/lib/product-card-data";
import { MapPin, Phone, ShieldCheck, Truck, RefreshCw } from "lucide-react";

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await props.params;
    const dbProduct = await withDatabaseFallback(
        prisma.product.findUnique({
            where: { slug },
            include: { brand: true, category: true, images: { orderBy: { sortOrder: 'asc' } } }
        }),
        null,
        `product metadata ${slug}`
    );

    if (!dbProduct) return {};

    const brandName = dbProduct.brand?.name || 'Smartphones';
    const firstImage = dbProduct.images?.[0]?.imageUrl;
    const ogImage = firstImage
        ? (firstImage.startsWith('http') ? firstImage : getAbsoluteUrl(firstImage))
        : undefined;

    const priceText = dbProduct.price ? `₹${dbProduct.price.toLocaleString('en-IN')}` : 'Best Price';
    const conditionText = dbProduct.type === 'NEW' ? 'New' : dbProduct.type === 'REFURBISHED' ? 'Refurbished' : 'Pre-Owned';

    const title = `${dbProduct.name} (${conditionText}) - Price, Specs & Availability in Partapur Meerut`;
    const description = dbProduct.shortDescription ||
        (dbProduct.description ? dbProduct.description.substring(0, 155) : `Buy ${conditionText} ${dbProduct.name} by ${brandName} at ${priceText} from Mahadev Mobile Gallery & Repairing, Partapur, Meerut.`);

    return buildMetadata({
        title,
        description,
        path: `/products/${slug}`,
        ogImage,
        keywords: [
            dbProduct.name,
            brandName,
            `${brandName} mobile shop Partapur`,
            `${dbProduct.name} price in Meerut`,
            `${conditionText} ${dbProduct.name}`,
            'mobile shop Partapur Meerut',
        ],
    });
}

export default async function ProductDetailPage(props: { params: Promise<{ slug: string }> }) {
    const { slug } = await props.params;

    const dbProduct = await withDatabaseFallback(
        prisma.product.findUnique({
            where: { slug },
            include: { brand: true, category: true, images: { orderBy: { sortOrder: 'asc' } } }
        }),
        null,
        `product page ${slug}`
    );

    if (!dbProduct) {
        notFound();
    }

    const settings = await getStoreSettings();

    // Fetch related products (same brand or category, excluding current product)
    const relatedRecords = await withDatabaseFallback(
        prisma.product.findMany({
            where: {
                id: { not: dbProduct.id },
                OR: [
                    { brandId: dbProduct.brandId },
                    { categoryId: dbProduct.categoryId },
                ],
            },
            take: 4,
            orderBy: [{ featured: 'desc' }, { createdAt: 'desc' }],
            select: productCardSelect,
        }),
        [],
        `related products for ${slug}`
    );
    const relatedProducts = relatedRecords.map(toProductCardProduct);

    // Convert to structure expected by UI
    const product = {
        ...dbProduct,
        brand: dbProduct.brand?.name || "Other",
        category: dbProduct.category?.name || "Other",
        images: dbProduct.images.map(i => i.imageUrl),
        imagePlaceholderId: 1,
        preOwnedCondition: dbProduct.type,
    };

    const whatsappMessage = encodeURIComponent(
        `Hi ${settings.displayName || settings.businessName}, I am interested in the ${product.name} (Brand: ${product.brand}, Condition: ${product.type}, Price: ${product.price ? `₹${product.price}` : 'Enquiry'}). Is it currently in stock at your Partapur store?`
    );

    const productSchema = generateProductSchema({
        id: dbProduct.id,
        slug: dbProduct.slug,
        name: dbProduct.name,
        description: dbProduct.description,
        shortDescription: dbProduct.shortDescription,
        price: dbProduct.price,
        mrp: dbProduct.mrp,
        type: dbProduct.type,
        availability: dbProduct.availability,
        brandName: dbProduct.brand?.name,
        categoryName: dbProduct.category?.name,
        images: product.images,
        updatedAt: dbProduct.updatedAt,
    });

    const breadcrumbs = [
        { name: "Products", path: "/products" },
        ...(product.brand ? [{ name: product.brand, path: `/products?brand=${encodeURIComponent(product.brand)}` }] : []),
        { name: product.name, path: `/products/${slug}` },
    ];

    return (
        <Section className="pt-24 pb-16">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
            />

            <div className="mb-6">
                <Breadcrumbs items={breadcrumbs} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 xl:gap-20">
                {/* Image Gallery Area */}
                <ProductImageGallery
                    images={product.images}
                    name={product.name}
                    placeholderId={product.imagePlaceholderId}
                    type={product.type}
                    isDemo={product.isDemo}
                />

                {/* Product Details Area */}
                <div className="flex flex-col">
                    <div className="mb-8 border-b border-white/10 pb-8">
                        <div className="text-accent text-xs font-bold uppercase tracking-[0.25em] mb-3">
                            {product.brand} &bull; {product.category}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                            {product.name}
                        </h1>

                        {product.type !== 'NEW' && product.preOwnedCondition && (
                            <div className="mb-6 flex items-center bg-white/5 border border-white/10 w-fit px-4 py-2.5 rounded-xl">
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-3 shadow-[0_0_12px_rgba(34,197,94,0.6)]"></span>
                                <span className="text-xs text-gray-400 font-medium tracking-wide uppercase">
                                    Certified Condition: <strong className="text-white ml-2 text-sm">{product.preOwnedCondition}</strong>
                                </span>
                            </div>
                        )}

                        <div className="flex flex-col gap-2 mb-6">
                            <div className="flex items-end gap-3 flex-wrap">
                                <span className="text-4xl font-bold text-white tracking-tight">
                                    {product.price === null ? "Price on Enquiry" : `₹${product.price.toLocaleString('en-IN')}`}
                                </span>
                                {product.price !== null && product.mrp && product.mrp > product.price && (
                                    <span className="text-xl text-gray-500 line-through mb-1">
                                        MRP ₹{product.mrp.toLocaleString('en-IN')}
                                    </span>
                                )}
                            </div>
                            <span className="text-sm text-gray-400 font-medium tracking-wide">
                                Availability: <span className={product.availability === "In Stock" ? "text-green-400 font-semibold" : "text-accent font-semibold"}>{product.availability}</span>
                            </span>
                        </div>

                        {product.description && (
                            <div className="prose prose-invert max-w-none text-gray-300 text-base leading-relaxed">
                                <p>{product.description}</p>
                            </div>
                        )}
                    </div>

                    {/* Trust Badges */}
                    <div className="grid grid-cols-2 gap-3 mb-8 text-xs text-gray-400">
                        <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-xl border border-white/5">
                            <ShieldCheck className="text-accent w-5 h-5 flex-shrink-0" />
                            <span>100% Genuine Device</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-xl border border-white/5">
                            <RefreshCw className="text-accent w-5 h-5 flex-shrink-0" />
                            <span>Old Phone Exchange</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-xl border border-white/5">
                            <Truck className="text-accent w-5 h-5 flex-shrink-0" />
                            <span>In-Store Pick & Test</span>
                        </div>
                        <div className="flex items-center gap-2 p-3 bg-secondary/30 rounded-xl border border-white/5">
                            <MapPin className="text-accent w-5 h-5 flex-shrink-0" />
                            <span>Partapur, Meerut</span>
                        </div>
                    </div>

                    {/* Call to Actions */}
                    <div className="flex flex-col gap-4 mb-10">
                        {isWhatsAppEnabled(settings) && (
                            <a href={getWhatsAppUrl(settings, whatsappMessage)} target="_blank" rel="noopener noreferrer" className="block w-full">
                                <Button variant="whatsapp" className="w-full text-sm uppercase font-bold tracking-widest py-4 border border-[#25D366]/30 shadow-[0_0_20px_rgba(37,211,102,0.15)] hover:shadow-[0_0_30px_rgba(37,211,102,0.3)]">
                                    Enquire on WhatsApp
                                </Button>
                            </a>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <a href={`tel:+91${settings.phone}`}>
                                <Button variant="secondary" className="w-full text-xs uppercase font-bold tracking-widest py-4 border border-white/10 bg-white/5 hover:bg-white/10">
                                    <Phone size={14} className="mr-1.5" /> Call Store
                                </Button>
                            </a>
                            <a href={settings.mapsUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="secondary" className="w-full text-xs uppercase font-bold tracking-widest py-4 border border-white/10 bg-white/5 hover:bg-white/10">
                                    <MapPin size={14} className="mr-1.5" /> Get Directions
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            {/* Related Products Contextual Linking */}
            {relatedProducts.length > 0 && (
                <div className="mt-20 border-t border-white/10 pt-16">
                    <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                        <div>
                            <span className="text-accent text-xs font-bold uppercase tracking-widest block mb-2">Explore More</span>
                            <h2 className="text-2xl md:text-3xl font-bold text-white">Similar & Related Devices</h2>
                        </div>
                        <Link href="/products" className="text-sm font-semibold text-accent hover:underline">
                            View All Phones &rarr;
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {relatedProducts.map((relProduct) => (
                            <ProductCard
                                key={relProduct.id}
                                product={relProduct}
                                whatsappNumber={settings.whatsapp}
                                isWhatsAppEnabled={isWhatsAppEnabled(settings)}
                            />
                        ))}
                    </div>
                </div>
            )}
        </Section>
    );
}
