import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const defaultUrl = 'https://mahadevmobilegallery.com';
    const rawUrl = process.env.NEXT_PUBLIC_SITE_URL || defaultUrl;
    const baseUrl = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;
    const finalBaseUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;

    let productEntries: MetadataRoute.Sitemap = [];

    try {
        const products = await prisma.product.findMany({
            select: { slug: true, updatedAt: true }
        });

        productEntries = products.map((product) => ({
            url: `${finalBaseUrl}/products/${product.slug}`,
            lastModified: product.updatedAt,
            changeFrequency: 'weekly' as const,
            priority: 0.8,
        }));
    } catch (error) {
        console.error("Sitemap generation error fetching products:", error);
        // Fallback to empty product list, continue generating static routes
    }

    const staticRoutes = [
        '',
        '/products',
        '/services',
        '/exchange',
        '/pre-owned',
        '/gallery',
        '/about',
        '/faq',
        '/contact',
    ].map((route) => ({
        url: `${finalBaseUrl}${route}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: route === '' ? 1 : 0.8,
    }));

    return [...staticRoutes, ...productEntries];
}
