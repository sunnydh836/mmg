import { Metadata } from 'next';
import prisma from "@/lib/prisma";
import { AboutHero } from "@/components/sections/about/about-hero";
import { AboutIntro } from "@/components/sections/about/about-intro";
import { AboutServices } from "@/components/sections/about/about-services";
import { AboutPhones } from "@/components/sections/about/about-phones";
import { AboutSupport } from "@/components/sections/about/about-support";
import { AboutGallery } from "@/components/sections/about/about-gallery";
import { AboutBenefits } from "@/components/sections/about/about-benefits";
import { AboutWhyUs } from "@/components/sections/about/about-why-us";
import { AboutInfo } from "@/components/sections/about/about-info";
import { AboutCTA } from "@/components/sections/about/about-cta";
import { AboutSocials } from "@/components/sections/about/about-socials";

import { getStoreSettings } from "@/lib/settings";
import { withDatabaseFallback } from "@/lib/database-fallback";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  return {
    title: `${settings.displayName || settings.businessName} | About Us`,
    description: `Learn more about ${settings.businessName} offering new and pre-owned phones, mobile repairing, accessories, old phone purchase and exchange.`
  };
}

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  // Parallel data fetching for performance
  const [settings, services, galleryImages, heroImages, offers] = await Promise.all([
    getStoreSettings(),
    withDatabaseFallback(prisma.service.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    }), [], "about services"),
    withDatabaseFallback(prisma.galleryImage.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      take: 3
    }), [], "about gallery"),
    withDatabaseFallback(prisma.heroImage.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
      take: 3
    }), [], "about hero images"),
    withDatabaseFallback(prisma.offer.findMany({
      where: { isActive: true },
      orderBy: { createdAt: 'desc' },
      take: 1
    }), [], "about offers")
  ]);

  // Use GalleryImage if available, fallback to HeroImage for the "A Glimpse of Our Store" section
  const displayImages = galleryImages.length > 0 ? galleryImages : heroImages;
  const hasGifts = settings?.hasGifts ?? true;

  return (
    <div className="flex flex-col w-full bg-background min-h-screen">
      <AboutHero settings={settings} />
      <AboutIntro settings={settings} />
      <AboutServices services={services} />
      <AboutPhones settings={settings} />
      <AboutSupport />
      <AboutGallery images={displayImages} />
      <AboutBenefits offers={offers} hasGifts={hasGifts} />
      <AboutWhyUs settings={settings} />
      <AboutInfo settings={settings} />
      <AboutCTA settings={settings} />
      <AboutSocials settings={settings} />
    </div>
  );
}
