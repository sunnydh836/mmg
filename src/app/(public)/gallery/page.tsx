import { Metadata } from "next";
import prisma from "@/lib/prisma";
import { Section, SectionHeader } from "@/components/ui/Section";
import { InstagramGallery } from "@/components/sections/InstagramGallery";
import { GalleryClient } from "./GalleryClient";
import { MapPin, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { getStoreSettings, getWhatsAppUrl } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  return {
    title: `${settings.displayName || settings.businessName} | Gallery`,
    description: `Explore photos of ${settings.businessName}, including our store, phones, accessories and shop moments.`
  };
}

export const dynamic = 'force-dynamic';

export default async function GalleryPage() {
  const settings = await getStoreSettings();
  // 1. Fetch Active Gallery Images
  const galleryImages = await prisma.galleryImage.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' }
  });

  // 2. Fetch Active Instagram Reels
  const instagramReels = await prisma.instagramReel.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: 'asc' }
  });

  return (
    <div className="flex flex-col w-full pb-12 bg-black min-h-screen">

      {/* 1. GALLERY HERO */}
      <Section className="pb-8 pt-24 md:pt-32" contained={false}>
        <div className="container mx-auto px-4 md:px-6 max-w-7xl flex flex-col items-center text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight">GALLERY</h1>
          <h2 className="text-xl md:text-2xl text-white/90 font-medium mb-4">
            Inside {settings.displayName || settings.businessName}
          </h2>
          <p className="text-neutral-400 max-w-2xl text-sm md:text-base">
            A glimpse of our store, smartphones, products and moments from {settings.businessName}.
          </p>
        </div>
      </Section>

      {/* 2. GALLERY COMPONENT */}
      <GalleryClient images={galleryImages} settings={settings!} />

      {/* 3. INSTAGRAM SECTION (Existing component expects 'reels' prop) */}
      <InstagramGallery reels={instagramReels} settings={settings!} />

      {/* 4. VISIT OUR STORE CTA */}
      <Section className="py-16 md:py-24 bg-neutral-950 border-t border-white/5" contained={false}>
        <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center">
          <h3 className="text-3xl font-bold text-white mb-6 tracking-wide">VISIT OUR STORE</h3>
          <h4 className="text-xl text-white/90 font-medium mb-4">{settings.businessName}</h4>
          <p className="text-neutral-400 mx-auto max-w-md mb-8">
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
