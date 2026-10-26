import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const defaultUrl = 'https://mahadevmobilegallery.com';
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
        ? (process.env.NEXT_PUBLIC_SITE_URL.startsWith('http') ? process.env.NEXT_PUBLIC_SITE_URL : `https://${process.env.NEXT_PUBLIC_SITE_URL}`)
        : defaultUrl;
    const cleanBaseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;

    return {
        rules: {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin/', '/api/', '/_next/'],
        },
        sitemap: `${cleanBaseUrl}/sitemap.xml`,
    }
}
