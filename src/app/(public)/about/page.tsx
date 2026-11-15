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
import { buildMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const brandName = settings.displayName || settings.businessName;
  const fullName = settings.businessName;

  return buildMetadata({
    title: `About ${brandName} | Trusted Mobile Shop in Partapur, Meerut`,
    description: `Learn more about ${fullName}. Trusted destination for smartphones, express mobile repairing, phone exchange, and genuine accessories in Partapur, Meerut.`,
    path: "/about",
    keywords: [
      `About ${brandName}`,
      "Mobile shop Partapur Meerut",
      "Phone gallery Meerut",
      "Mobile repairing shop Gagol Road",
    ],
  });
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
      <div className="container mx-auto px-6 pt-24 max-w-7xl">
        <Breadcrumbs items={[{ name: "About Us", path: "/about" }]} />
      </div>
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
