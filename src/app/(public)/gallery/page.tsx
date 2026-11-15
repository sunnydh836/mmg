import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { InstagramGallery } from "@/components/sections/InstagramGallery";
import { GalleryClient } from "./GalleryClient";
import { MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getStoreSettings, getWhatsAppUrl } from "@/lib/settings";
import { withDatabaseFallback } from "@/lib/database-fallback";
import { buildMetadata } from "@/lib/seo";

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const brandName = settings.displayName || settings.businessName;

  return buildMetadata({
    title: `Store Gallery & Highlights | ${brandName} Partapur, Meerut`,
    description: `Take a visual tour inside ${settings.businessName} on Gagol Rd, Partapur, Meerut. Explore photos and reels of our store showroom, latest smartphone arrivals, and mobile accessories.`,
    path: "/gallery",
    keywords: [
      "Mahadev Mobile Gallery photos",
      "Mobile store Meerut images",
      "Smartphone shop showroom Partapur",
      "Mahadev Mobile Gallery Instagram reels",
    ],
  });
}

export default async function GalleryPage() {
  const settings = await getStoreSettings();

  // 1. Fetch Active Gallery Images
  const galleryImages = await withDatabaseFallback(prisma.galleryImage.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' }
  }), [], "gallery images");

  // 2. Fetch Active Instagram Reels
  const instagramReels = await withDatabaseFallback(prisma.instagramReel.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' }
  }), [], "Instagram reels");

  const breadcrumbs = [
    { name: "Gallery", path: "/gallery" },
  ];

  return (
    <div className="flex flex-col w-full pb-16 bg-black min-h-screen">
      {/* 1. GALLERY HERO */}
      <Section className="pb-8 pt-24 md:pt-32" contained={true}>
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs items={breadcrumbs} />

          <div className="flex flex-col items-center text-center mt-6">
            <span className="text-accent text-xs font-bold uppercase tracking-widest block mb-2">
              Visual Highlights
            </span>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
              Inside Our Store Showroom
            </h1>
            <p className="text-neutral-400 max-w-2xl text-sm md:text-base leading-relaxed">
              A glimpse inside {settings.displayName || settings.businessName} in Partapur, Meerut. Explore our smartphone displays, accessories counter, repair lab, and customer moments.
            </p>
          </div>
        </div>
      </Section>

      {/* 2. GALLERY COMPONENT */}
      <GalleryClient images={galleryImages} settings={settings!} />

      {/* 3. INSTAGRAM SECTION */}
      <InstagramGallery reels={instagramReels} settings={settings!} />

      {/* 4. VISIT OUR STORE CTA */}
      <Section className="py-16 md:py-24 bg-neutral-950 border-t border-white/5" contained={false}>
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <h2 className="text-3xl font-bold text-white mb-4 tracking-wide">Visit Our Store in Person</h2>
          <h3 className="text-xl text-white/90 font-medium mb-4">{settings.businessName}</h3>
          <p className="text-neutral-400 mx-auto max-w-md mb-8 text-sm">
            {settings.address}
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <a href={settings.mapsUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="primary" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 min-w-[200px]">
                <MapPin className="w-4 h-4" /> Get Directions
              </Button>
            </a>
            <a href={getWhatsAppUrl(settings)} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20 min-w-[200px]">
                <MessageCircle className="w-4 h-4" /> WhatsApp Us
              </Button>
            </a>
          </div>
        </div>
      </Section>
    </div>
  );
}
