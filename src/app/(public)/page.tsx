export const dynamic = 'force-dynamic';
import prisma from "@/lib/prisma";
import { HeroSection } from "@/components/sections/Hero";
import { OffersSection } from "@/components/sections/Offers";
import { TrustSection } from "@/components/sections/Trust";
import { FeaturedProductsSection } from "@/components/sections/Products";
import { BrandShowcase } from "@/components/sections/Brands";
import { PreOwnedSection } from "@/components/sections/PreOwned";
import { ExchangeAndGiftSections } from "@/components/sections/ExchangeAndGift";
import { ServicesPreview } from "@/components/sections/Services";
import { InstagramGallery } from "@/components/sections/InstagramGallery";
import { LocationAndFAQ } from "@/components/sections/LocationAndFAQ";
import { getStoreSettings, isWhatsAppEnabled, canSellUsedRefurbished } from "@/lib/settings";
import { Metadata } from "next";

import { PremiumErrorFallback } from "@/components/ui/PremiumErrorFallback";
import { SectionErrorBoundary } from "@/components/ui/SectionErrorBoundary";
import { productCardSelect, toProductCardProduct } from "@/lib/product-card-data";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const title = `${settings.displayName || settings.businessName} | Mobile Shop in Partapur, Meerut`;
  const description = `Explore new and pre-owned smartphones, mobile accessories, mobile repairing and phone exchange at ${settings.displayName || settings.businessName} in Partapur, Meerut. Visit our shop or contact us.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

// --- Server Component Wrappers --- //

async function HeroBoundary({ settings }: { settings: any }) {
  try {
    const heroImages = await prisma.heroImage.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: { id: true, imageUrl: true }
    });
    return <HeroSection heroImages={heroImages} settings={settings} />;
  } catch (error) {
    console.error("Hero Data Error:", error);
    return <PremiumErrorFallback message="This section is temporarily unavailable." />;
  }
}

async function OffersBoundary({ settings }: { settings: any }) {
  try {
    const now = new Date();
    const offers = await prisma.offer.findMany({
      where: {
        isActive: true,
        AND: [
          { OR: [{ startDate: null }, { startDate: { lte: now } }] },
          { OR: [{ endDate: null }, { endDate: { gte: now } }] },
        ]
      },
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ]
    });
    return <OffersSection offers={offers} settings={settings} />;
  } catch (error) {
    console.error("Offers Data Error:", error);
    return (
      <div className="w-full max-w-7xl mx-auto px-6 py-12">
        <PremiumErrorFallback message="Offers are temporarily unavailable." />
      </div>
    );
  }
}

async function BrandsBoundary() {
  try {
    const brands = await prisma.brand.findMany({ select: { name: true } });
    return <BrandShowcase brands={brands.map(b => b.name)} />;
  } catch (error) {
    console.error("Brands Data Error:", error);
    return null;
  }
}

async function ProductsBoundaries({ settings }: { settings: any }) {
  try {
    const featuredQuery = prisma.product.findMany({
      where: { featured: true },
      orderBy: { createdAt: "desc" },
      take: 8,
      select: productCardSelect,
    });
    const preOwnedQuery = canSellUsedRefurbished(settings)
      ? prisma.product.findMany({
          where: { type: { in: ["USED", "REFURBISHED"] } },
          orderBy: { createdAt: "desc" },
          take: 4,
          select: productCardSelect,
        })
      : null;
    const [featuredRecords, preOwnedRecords] = await Promise.all([
      featuredQuery,
      preOwnedQuery || Promise.resolve([]),
    ]);
    const featuredProducts = featuredRecords.map(toProductCardProduct);
    const preOwnedProducts = preOwnedRecords.map(toProductCardProduct);

    return (
      <>
        <SectionErrorBoundary fallback={<PremiumErrorFallback message="Featured products are temporarily unavailable." />}>
          <FeaturedProductsSection products={featuredProducts} whatsappNumber={settings.whatsapp} isWhatsAppEnabled={isWhatsAppEnabled(settings)} />
        </SectionErrorBoundary>
        {canSellUsedRefurbished(settings) && (
          <SectionErrorBoundary fallback={<PremiumErrorFallback message="Pre-owned products are temporarily unavailable." />}>
            <PreOwnedSection products={preOwnedProducts} whatsappNumber={settings.whatsapp} isWhatsAppEnabled={isWhatsAppEnabled(settings)} />
          </SectionErrorBoundary>
        )}
      </>
    );
  } catch (error) {
    console.error("Products Data Error:", error);
    return (
      <div className="w-full max-w-7xl mx-auto px-6 py-12 flex flex-col gap-6">
        <PremiumErrorFallback message="Featured products are temporarily unavailable." />
        {canSellUsedRefurbished(settings) && (
          <PremiumErrorFallback message="Pre-owned products are temporarily unavailable." />
        )}
      </div>
    );
  }
}

async function ServicesBoundary() {
  try {
    const HOME_SERVICE_LIMIT = 6;
    const services = await prisma.service.findMany({
      where: { isActive: true },
      orderBy: [
        { sortOrder: 'asc' },
        { createdAt: 'asc' }
      ],
      take: HOME_SERVICE_LIMIT,
      select: { id: true, title: true, description: true, icon: true }
    });
    return <ServicesPreview services={services} />;
  } catch (error) {
    console.error("Services Data Error:", error);
    return (
      <div className="w-full max-w-7xl mx-auto px-6 py-12">
        <PremiumErrorFallback message="Services are temporarily unavailable." />
      </div>
    );
  }
}

async function InstagramGalleryBoundary({ settings }: { settings: any }) {
  try {
    const reels = await prisma.instagramReel.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      select: {
        id: true,
        title: true,
        reelUrl: true,
        thumbnailUrl: true
      }
    });
    return <InstagramGallery reels={reels} settings={settings} />;
  } catch (error) {
    console.error("Instagram Reels Data Error:", error);
    return (
      <div className="w-full max-w-7xl mx-auto px-6 py-12">
        <PremiumErrorFallback message="Instagram Reels are temporarily unavailable." />
      </div>
    );
  }
}

async function LocationAndFAQBoundary({ settings }: { settings: any }) {
  try {
    const faqs = await prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    });
    return <LocationAndFAQ faqs={faqs} settings={settings} />;
  } catch (error) {
    console.error("FAQ Data Error:", error);
    return (
      <div className="w-full max-w-7xl mx-auto px-6 py-12">
        <PremiumErrorFallback message="FAQs and Location data are temporarily unavailable." />
      </div>
    );
  }
}

export default async function Home() {
  const settings = await getStoreSettings();

  return (
    <div className="flex flex-col w-full">
      <SectionErrorBoundary>
        <HeroBoundary settings={settings} />
      </SectionErrorBoundary>

      <SectionErrorBoundary>
        <OffersBoundary settings={settings} />
      </SectionErrorBoundary>

      <SectionErrorBoundary>
        <TrustSection />
      </SectionErrorBoundary>

      <SectionErrorBoundary>
        <BrandsBoundary />
      </SectionErrorBoundary>

      <ProductsBoundaries settings={settings} />

      <SectionErrorBoundary>
        <ExchangeAndGiftSections settings={settings} />
      </SectionErrorBoundary>

      <SectionErrorBoundary>
        <ServicesBoundary />
      </SectionErrorBoundary>

      <SectionErrorBoundary>
        <InstagramGalleryBoundary settings={settings} />
      </SectionErrorBoundary>

      <SectionErrorBoundary>
        <LocationAndFAQBoundary settings={settings} />
      </SectionErrorBoundary>
    </div>
  );
}
