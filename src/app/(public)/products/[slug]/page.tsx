export const dynamic = 'force-dynamic';
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { getStoreSettings, getWhatsAppUrl, isWhatsAppEnabled } from "@/lib/settings";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { ProductImageGallery } from "@/components/ui/ProductImageGallery";



import { Metadata } from 'next';

export async function generateMetadata(props: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await props.params;
    const dbProduct = await prisma.product.findUnique({
        where: { slug: slug },
        include: { brand: true, category: true, images: { orderBy: { sortOrder: 'asc' } } }
    });

    if (!dbProduct) return {};

    const defaultUrl = 'https://mahadevmobilegallery.com';
    const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || defaultUrl;
    const baseUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
    const finalBaseUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;

    const images = dbProduct.images.map(i => i.imageUrl);
    const ogImage = images.length > 0 ? (images[0].startsWith('http') ? images[0] : `${finalBaseUrl}${images[0]}`) : undefined;
    const description = dbProduct.shortDescription || (dbProduct.description ? dbProduct.description.substring(0, 160) : 'High quality device');

    return {
        title: `${dbProduct.name} | ${dbProduct.brand?.name || 'Mobiles'}`,
        description,
        openGraph: {
            title: dbProduct.name,
            description,
            url: `${finalBaseUrl}/products/${slug}`,
            images: ogImage ? [{ url: ogImage, width: 800, height: 800, alt: dbProduct.name }] : [],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: dbProduct.name,
            description,
            images: ogImage ? [ogImage] : [],
        },
        alternates: {
            canonical: `${finalBaseUrl}/products/${slug}`
        }
    };
}

export default async function ProductDetailPage(props: { params: Promise<{ slug: string }> }) {
    const { slug } = await props.params;
    const dbProduct = await prisma.product.findUnique({
        where: { slug: slug },
        include: { brand: true, category: true, images: { orderBy: { sortOrder: 'asc' } } }
    });

    if (!dbProduct) {
        notFound();
    }

    // Convert to structure expected by UI
    const product = {
        ...dbProduct,
        brand: dbProduct.brand?.name || "Other",
        category: dbProduct.category?.name || "Other",
        images: dbProduct.images.map(i => i.imageUrl),
        imagePlaceholderId: 1, // Fallback placeholder index for dynamic logic
        preOwnedCondition: dbProduct.type,
    };

    const settings = await getStoreSettings();
    const whatsappMessage = encodeURIComponent(`Hi ${settings.displayName || settings.businessName}, I am interested in the ${product.name} (Brand: ${product.brand}, Type: ${product.type}). Is it currently available?`);
    const defaultUrl = 'https://mahadevmobilegallery.com';
    const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || defaultUrl;
    const baseUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
    const finalBaseUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;

    const renderJsonLd = () => {
        const jsonLd = {
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            image: product.images.map(i => i.startsWith('http') ? i : `${finalBaseUrl}${i}`),
            description: product.description,
            brand: {
                '@type': 'Brand',
                name: product.brand
            },
            ...(product.price !== null ? {
                offers: {
                    '@type': 'Offer',
                    url: `${finalBaseUrl}/products/${slug}`,
                    priceCurrency: 'INR',
                    price: product.price,
                    availability: product.availability === 'In Stock' ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                }
            } : {})
        };
        return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />;
    };

    return (
        <Section className="pt-24 pb-16">
            {renderJsonLd()}
            <div className="mb-8">
                <Link href="/products" className="text-gray-400 hover:text-accent flex items-center text-sm font-medium transition-colors w-fit">
                    <ChevronLeft size={16} className="mr-1" /> Back to Collection
                </Link>
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
                        <div className="text-accent text-xs font-bold uppercase tracking-[0.25em] mb-4">
                            {product.brand} &bull; {product.category}
                        </div>
                        <h1 className="text-3xl md:text-5xl font-bold text-white mb-6 leading-tight">
                            {product.name}
                        </h1>

                        {product.type !== 'NEW' && product.preOwnedCondition && (
                            <div className="mb-8 flex items-center bg-white/5 border border-white/10 w-fit px-4 py-2.5 rounded-xl">
                                <span className="w-2.5 h-2.5 rounded-full bg-green-500 mr-3 shadow-[0_0_12px_rgba(34,197,94,0.6)]"></span>
                                <span className="text-sm text-gray-400 font-medium tracking-wide uppercase text-xs">Condition: <strong className="text-white ml-2 text-sm">{product.preOwnedCondition}</strong></span>
                            </div>
                        )}

                        <div className="flex flex-col gap-2 mb-8">
                            <div className="flex items-end gap-3">
                                <span className="text-4xl font-bold text-white tracking-tight">
                                    {product.price === null ? "Price on Enquiry" : `₹${product.price.toLocaleString('en-IN')}`}
                                </span>
                                {product.price !== null && product.mrp && product.mrp > product.price && (
                                    <span className="text-xl text-gray-500 line-through mb-1">
                                        MRP ₹{product.mrp.toLocaleString('en-IN')}
                                    </span>
                                )}
                            </div>
                            <span className="text-sm text-gray-500 font-medium tracking-wide">
                                Availability: <span className={product.availability === "In Stock" ? "text-green-400" : "text-accent"}>{product.availability}</span>
                            </span>
                        </div>

                        <p className="text-gray-400 text-base leading-relaxed">
                            {product.description}
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 mb-10">
                        {isWhatsAppEnabled(settings) && (
                            <a href={getWhatsAppUrl(settings, whatsappMessage)} target="_blank" rel="noopener noreferrer" className="block w-full">
                                <Button variant="whatsapp" className="w-full text-sm uppercase font-bold tracking-widest py-4 border border-[#25D366]/30 shadow-[0_0_20px_rgba(37,211,102,0.15)] hover:shadow-[0_0_30px_rgba(37,211,102,0.3)]">
                                    WhatsApp Enquiry
                                </Button>
                            </a>
                        )}
                        <div className="grid grid-cols-2 gap-4">
                            <a href={`tel:+91${settings.phone}`}>
                                <Button variant="secondary" className="w-full text-xs uppercase font-bold tracking-widest py-4 border border-white/10 bg-white/5 hover:bg-white/10">
                                    Call Store
                                </Button>
                            </a>
                            <a href={settings.mapsUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="secondary" className="w-full text-xs uppercase font-bold tracking-widest py-4 border border-white/10 bg-white/5 hover:bg-white/10">
                                    Get Directions
                                </Button>
                            </a>
                        </div>
                    </div>

                    {/* Specifications removed as they are not part of the db schema */}
                </div>
            </div>
        </Section>
    );
}

