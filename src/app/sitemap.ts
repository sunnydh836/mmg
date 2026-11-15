import { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
import { getCanonicalUrl } from '@/lib/seo';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const sitemapMap = new Map<string, MetadataRoute.Sitemap[number]>();

    // 1. Core public static pages
    const staticPaths = [
        '',
        '/products',
        '/services',
        '/services/mobile-repairing',
        '/services/screen-replacement',
        '/services/battery-replacement',
        '/exchange',
        '/pre-owned',
        '/gallery',
        '/about',
        '/faq',
        '/contact',
    ];

    for (const path of staticPaths) {
        const url = getCanonicalUrl(path);
        sitemapMap.set(url, {
            url,
            lastModified: new Date(),
        });
    }

    // 2. Dynamic Category Pages from Database
    try {
        const categories = await prisma.category.findMany({
            select: {
                slug: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        for (const category of categories) {
            if (category.slug) {
                const url = getCanonicalUrl(`/categories/${category.slug}`);
                sitemapMap.set(url, {
                    url,
                    lastModified: category.createdAt || new Date(),
                });
            }
        }
    } catch (error) {
        console.error('Sitemap generation: error fetching categories from database:', error);
    }

    // 3. Dynamic Product Pages from Database (Published products only)
    try {
        const products = await prisma.product.findMany({
            where: {
                slug: { not: '' },
            },
            select: {
                slug: true,
                updatedAt: true,
            },
            orderBy: {
                updatedAt: 'desc',
            },
        });

        for (const product of products) {
            if (product.slug) {
                const url = getCanonicalUrl(`/products/${product.slug}`);
                sitemapMap.set(url, {
                    url,
                    lastModified: product.updatedAt || new Date(),
                });
            }
        }
    } catch (error) {
        console.error('Sitemap generation: error fetching products from database:', error);
    }

    return Array.from(sitemapMap.values());
}
