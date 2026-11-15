import type { Metadata } from 'next';
import { StoreSettingsType, defaultSettings } from './settings-shared';

/**
 * Official Canonical Production Domain.
 * All public-facing SEO, canonical tags, sitemaps, robots.txt, Open Graph,
 * and Schema.org structured data must resolve strictly to this domain.
 */
export const OFFICIAL_PRODUCTION_DOMAIN = 'https://mmgpartapur.com';
export const VERCEL_DEPLOYMENT_DOMAIN = 'mmg-zeta.vercel.app';
export const WWW_PRODUCTION_DOMAIN = 'www.mmgpartapur.com';

/**
 * Returns the normalized official site URL.
 * Never allows Vercel deployment URLs or localhost in production.
 */
export function getSiteUrl(): string {
    const rawEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();

    // In production or when env is missing/misconfigured
    if (!rawEnv) {
        if (process.env.NODE_ENV === 'production') {
            console.warn(
                '[SEO Config Warning] NEXT_PUBLIC_SITE_URL is not set. Defaulting safely to official custom domain: ' +
                OFFICIAL_PRODUCTION_DOMAIN
            );
        }
        return OFFICIAL_PRODUCTION_DOMAIN;
    }

    // Guard against Vercel deployment alias or old domains being set as canonical
    if (
        rawEnv.includes(VERCEL_DEPLOYMENT_DOMAIN) ||
        rawEnv.includes('mahadevmobilegallery.com') ||
        (process.env.NODE_ENV === 'production' && (rawEnv.includes('localhost') || rawEnv.includes('127.0.0.1')))
    ) {
        console.warn(
            `[SEO Config Override] Detected invalid or non-canonical site URL ("${rawEnv}"). Overriding to official domain: ${OFFICIAL_PRODUCTION_DOMAIN}`
        );
        return OFFICIAL_PRODUCTION_DOMAIN;
    }

    let url = rawEnv;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = `https://${url}`;
    }

    // Force https in production
    if (process.env.NODE_ENV === 'production' && url.startsWith('http://')) {
        url = url.replace('http://', 'https://');
    }

    // Strip trailing slash and www
    url = url.replace(/\/+$/, '');
    url = url.replace('://www.', '://');

    return url;
}

/**
 * Returns the exact self-referencing canonical URL for a given path.
 * - Homepage canonical: https://mmgpartapur.com/ (with trailing slash)
 * - Subpage canonicals: https://mmgpartapur.com/path (without trailing slash)
 */
export function getCanonicalUrl(path: string = ''): string {
    const siteUrl = getSiteUrl();
    const clean = path.trim().replace(/^\/+|\/+$/g, '');

    if (!clean) {
        return `${siteUrl}/`;
    }

    return `${siteUrl}/${clean}`;
}

/**
 * Resolves an absolute URL for assets or routes.
 */
export function getAbsoluteUrl(path: string = ''): string {
    const siteUrl = getSiteUrl();
    const clean = path.trim();
    if (clean.startsWith('http://') || clean.startsWith('https://')) {
        return clean;
    }
    const cleanPath = clean.startsWith('/') ? clean : `/${clean}`;
    return `${siteUrl}${cleanPath}`;
}

export interface MetadataOptions {
    title: string;
    description: string;
    path?: string;
    keywords?: string[];
    ogType?: 'website' | 'article';
    ogImage?: string;
    noindex?: boolean;
}

export function buildMetadata({
    title,
    description,
    path = '',
    keywords = [],
    ogType = 'website',
    ogImage,
    noindex = false,
}: MetadataOptions): Metadata {
    const siteUrl = getSiteUrl();
    const canonical = getCanonicalUrl(path);

    const defaultKeywords = [
        'Mahadev Mobile Gallery',
        'Mobile shop in Partapur Meerut',
        'Mobile repairing in Partapur',
        'Smartphones in Meerut',
        'Mobile accessories Meerut',
        'Second-hand mobile phones in Meerut',
        'Phone exchange Meerut',
        'Refurbished smartphones Meerut',
    ];

    const allKeywords = Array.from(new Set([...keywords, ...defaultKeywords]));

    const defaultOgImage = `${siteUrl}/icon.png`;
    const imageToUse = ogImage ? getAbsoluteUrl(ogImage) : defaultOgImage;

    const metadata: Metadata = {
        title,
        description,
        keywords: allKeywords,
        alternates: {
            canonical,
        },
        openGraph: {
            title,
            description,
            url: canonical,
            siteName: 'Mahadev Mobile Gallery',
            locale: 'en_IN',
            type: ogType,
            images: [
                {
                    url: imageToUse,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title,
            description,
            images: [imageToUse],
        },
        robots: noindex
            ? {
                index: false,
                follow: false,
                nocache: true,
            }
            : {
                index: true,
                follow: true,
                nocache: false,
                googleBot: {
                    index: true,
                    follow: true,
                    'max-video-preview': -1,
                    'max-image-preview': 'large',
                    'max-snippet': -1,
                },
            },
    };

    const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
    if (googleVerification) {
        metadata.verification = {
            google: googleVerification,
        };
    }

    return metadata;
}

/**
 * Schema.org LocalBusiness (MobilePhoneStore) Structured Data
 */
export function generateLocalBusinessSchema(settings: Partial<StoreSettingsType> = {}) {
    const siteUrl = getSiteUrl();
    const businessName = settings.businessName || defaultSettings.businessName;
    const phone = settings.phone || defaultSettings.phone;
    const cleanPhone = phone.replace(/\D/g, '');
    const address = settings.address || defaultSettings.address;
    const openingTime = settings.openingTime || defaultSettings.openingTime;
    const closingTime = settings.closingTime || defaultSettings.closingTime;

    const sameAs = [
        settings.instagram || defaultSettings.instagram,
        settings.youtube || defaultSettings.youtube,
        settings.facebook || defaultSettings.facebook,
    ].filter((url): url is string => Boolean(url && url.trim().length > 0));

    return {
        '@context': 'https://schema.org',
        '@type': 'MobilePhoneStore',
        '@id': `${siteUrl}/#localbusiness`,
        name: businessName,
        alternateName: settings.displayName || defaultSettings.displayName,
        description: `Premier mobile store and smartphone repairing center in Partapur, Meerut offering new smartphones, certified pre-owned devices, genuine accessories, phone exchange, and fast screen and battery repair services.`,
        url: `${siteUrl}/`,
        telephone: `+91${cleanPhone}`,
        priceRange: '₹₹',
        image: settings.logoUrl ? getAbsoluteUrl(settings.logoUrl) : `${siteUrl}/icon.png`,
        logo: settings.logoUrl ? getAbsoluteUrl(settings.logoUrl) : `${siteUrl}/icon.png`,
        address: {
            '@type': 'PostalAddress',
            streetAddress: address,
            addressLocality: 'Partapur, Meerut',
            addressRegion: 'Uttar Pradesh',
            postalCode: '250103',
            addressCountry: 'IN',
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: 28.9156044,
            longitude: 77.6438418,
        },
        hasMap: settings.mapsUrl || defaultSettings.mapsUrl,
        openingHoursSpecification: [
            {
                '@type': 'OpeningHoursSpecification',
                dayOfWeek: [
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                    'Sunday',
                ],
                opens: openingTime,
                closes: closingTime,
            },
        ],
        currenciesAccepted: 'INR',
        paymentAccepted: 'Cash, UPI, Credit Card, Debit Card',
        areaServed: [
            {
                '@type': 'AdministrativeArea',
                name: 'Partapur',
            },
            {
                '@type': 'City',
                name: 'Meerut',
            },
            {
                '@type': 'AdministrativeArea',
                name: 'Uttar Pradesh',
            },
        ],
        sameAs,
    };
}

/**
 * Schema.org WebSite Structured Data (supports Sitelinks Searchbox)
 */
export function generateWebSiteSchema(settings: Partial<StoreSettingsType> = {}) {
    const siteUrl = getSiteUrl();
    const businessName = settings.businessName || defaultSettings.businessName;

    return {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: `${siteUrl}/`,
        name: businessName,
        alternateName: settings.displayName || defaultSettings.displayName,
        description: 'New smartphones, pre-owned certified devices, mobile repairing, and phone exchange in Partapur, Meerut.',
        publisher: {
            '@id': `${siteUrl}/#localbusiness`,
        },
        potentialAction: {
            '@type': 'SearchAction',
            target: `${siteUrl}/products?search={search_term_string}`,
            'query-input': 'required name=search_term_string',
        },
    };
}

/**
 * Schema.org Organization Structured Data
 */
export function generateOrganizationSchema(settings: Partial<StoreSettingsType> = {}) {
    const siteUrl = getSiteUrl();
    const businessName = settings.businessName || defaultSettings.businessName;
    const phone = settings.phone || defaultSettings.phone;
    const cleanPhone = phone.replace(/\D/g, '');

    const sameAs = [
        settings.instagram || defaultSettings.instagram,
        settings.youtube || defaultSettings.youtube,
        settings.facebook || defaultSettings.facebook,
    ].filter((url): url is string => Boolean(url && url.trim().length > 0));

    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        '@id': `${siteUrl}/#organization`,
        name: businessName,
        alternateName: settings.displayName || defaultSettings.displayName,
        url: `${siteUrl}/`,
        logo: settings.logoUrl ? getAbsoluteUrl(settings.logoUrl) : `${siteUrl}/icon.png`,
        contactPoint: {
            '@type': 'ContactPoint',
            telephone: `+91${cleanPhone}`,
            contactType: 'customer service',
            areaServed: 'IN',
            availableLanguage: ['en', 'hi'],
        },
        sameAs,
    };
}

/**
 * Schema.org Product Structured Data
 */
export interface ProductSchemaInput {
    id: string;
    slug: string;
    name: string;
    description?: string | null;
    shortDescription?: string | null;
    price?: number | null;
    mrp?: number | null;
    type?: string; // NEW, USED, REFURBISHED
    availability?: string;
    brandName?: string | null;
    categoryName?: string | null;
    images: string[];
    updatedAt?: Date;
}

export function generateProductSchema(product: ProductSchemaInput) {
    const siteUrl = getSiteUrl();
    const productUrl = getCanonicalUrl(`/products/${product.slug}`);

    const formattedImages = product.images.map((img) =>
        img.startsWith('http') ? img : getAbsoluteUrl(img)
    );

    const conditionMap: Record<string, string> = {
        NEW: 'https://schema.org/NewCondition',
        REFURBISHED: 'https://schema.org/RefurbishedCondition',
        USED: 'https://schema.org/UsedCondition',
    };

    const itemCondition = conditionMap[product.type || 'NEW'] || 'https://schema.org/NewCondition';

    const availabilityMap: Record<string, string> = {
        'In Stock': 'https://schema.org/InStock',
        'Limited Stock': 'https://schema.org/LimitedAvailability',
        'Out of Stock': 'https://schema.org/OutOfStock',
    };

    const schema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'Product',
        '@id': `${productUrl}#product`,
        name: product.name,
        description: product.description || product.shortDescription || `${product.name} available at Mahadev Mobile Gallery & Repairing`,
        image: formattedImages.length > 0 ? formattedImages : [`${siteUrl}/icon.png`],
        url: productUrl,
        sku: product.slug,
        category: product.categoryName || 'Smartphones',
    };

    if (product.brandName) {
        schema.brand = {
            '@type': 'Brand',
            name: product.brandName,
        };
    }

    if (product.price !== null && product.price !== undefined && Number.isFinite(product.price) && product.price > 0) {
        const priceValidUntil = new Date();
        priceValidUntil.setFullYear(priceValidUntil.getFullYear() + 1);

        schema.offers = {
            '@type': 'Offer',
            url: productUrl,
            priceCurrency: 'INR',
            price: product.price,
            priceValidUntil: priceValidUntil.toISOString().split('T')[0],
            itemCondition,
            availability: availabilityMap[product.availability || 'In Stock'] || 'https://schema.org/InStock',
            seller: {
                '@id': `${siteUrl}/#localbusiness`,
            },
        };
    }

    return schema;
}

/**
 * Schema.org BreadcrumbList Structured Data
 */
export interface BreadcrumbItem {
    name: string;
    path: string;
}

export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => {
            return {
                '@type': 'ListItem',
                position: index + 1,
                name: item.name,
                item: getCanonicalUrl(item.path),
            };
        }),
    };
}

/**
 * Schema.org FAQPage Structured Data
 */
export interface FAQItem {
    question: string;
    answer: string;
}

export function generateFAQSchema(faqs: FAQItem[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
}

/**
 * Schema.org Service Structured Data
 */
export interface ServiceSchemaInput {
    name: string;
    description: string;
    path?: string;
}

export function generateServiceSchema(service: ServiceSchemaInput) {
    const siteUrl = getSiteUrl();
    const serviceUrl = service.path ? getCanonicalUrl(service.path) : getCanonicalUrl('/services');

    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: service.name,
        description: service.description,
        url: serviceUrl,
        provider: {
            '@id': `${siteUrl}/#localbusiness`,
        },
        areaServed: {
            '@type': 'City',
            name: 'Meerut',
        },
    };
}

/**
 * Schema.org Category / CollectionPage Structured Data
 */
export interface CategorySchemaInput {
    name: string;
    slug: string;
    description?: string;
    products?: { name: string; slug: string }[];
}

export function generateCategorySchema(category: CategorySchemaInput) {
    const siteUrl = getSiteUrl();
    const categoryUrl = getCanonicalUrl(`/categories/${category.slug}`);

    const schema: Record<string, unknown> = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        '@id': `${categoryUrl}#collection`,
        name: `${category.name} Collection`,
        description: category.description || `Browse ${category.name} at Mahadev Mobile Gallery & Repairing, Partapur, Meerut.`,
        url: categoryUrl,
        isPartOf: {
            '@id': `${siteUrl}/#website`,
        },
    };

    if (category.products && category.products.length > 0) {
        schema.mainEntity = {
            '@type': 'ItemList',
            itemListElement: category.products.map((p, index) => ({
                '@type': 'ListItem',
                position: index + 1,
                url: getCanonicalUrl(`/products/${p.slug}`),
                name: p.name,
            })),
        };
    }

    return schema;
}
