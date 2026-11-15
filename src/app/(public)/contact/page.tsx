import type { Metadata } from 'next';
import prisma from "@/lib/prisma";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LocationAndFAQ } from "@/components/sections/LocationAndFAQ";
import { getStoreSettings, formatOpeningHours, getPhoneHref, getWhatsAppUrl, isWhatsAppEnabled } from "@/lib/settings";
import { withDatabaseFallback } from "@/lib/database-fallback";
import { buildMetadata } from "@/lib/seo";
import { MapPin, Phone, Clock, MessageCircle, Navigation } from "lucide-react";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const brandName = settings.displayName || settings.businessName;

  return buildMetadata({
    title: `Contact Us | ${brandName} Partapur, Meerut`,
    description: `Visit ${settings.businessName} on Gagol Rd, Partapur, Meerut. Call +91-${settings.phone}, get directions, view opening hours (09:00 AM - 10:00 PM), or chat on WhatsApp.`,
    path: "/contact",
    keywords: [
      "Contact Mahadev Mobile Gallery",
      "Mobile shop Gagol Road Partapur",
      "Mobile repairing shop near me Meerut",
      "Mahadev Mobile Gallery phone number",
      "Mahadev Mobile Gallery Meerut address",
    ],
  });
}

export default async function ContactPage() {
  const [settings, faqs] = await Promise.all([
    getStoreSettings(),
    withDatabaseFallback(
      prisma.fAQ.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: 'asc' },
        take: 6,
      }),
      [],
      "contact FAQs"
    ),
  ]);

  return (
    <div className="flex flex-col w-full pb-16">
      <Section className="pt-24 pb-8" contained={true}>
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs items={[{ name: "Contact Us", path: "/contact" }]} />

          <div className="text-center max-w-3xl mx-auto mt-6 mb-12">
            <span className="text-accent text-xs font-bold uppercase tracking-widest block mb-2">
              Get In Touch
            </span>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
              Visit Our Store in Partapur, Meerut
            </h1>
            <p className="text-gray-400 text-base md:text-lg leading-relaxed">
              Have questions about a new smartphone, pre-owned stock, phone exchange value, or need instant mobile repair? Visit our shop, call us, or message us directly on WhatsApp.
            </p>
          </div>

          {/* Quick Contact Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="p-6 rounded-2xl bg-secondary/30 border border-white/5 flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                <MapPin size={24} />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Our Location</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-grow">
                {settings.address}
              </p>
              <a
                href={settings.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-accent hover:underline flex items-center gap-1 mt-auto"
              >
                <Navigation size={14} /> Open in Google Maps
              </a>
            </div>

            <div className="p-6 rounded-2xl bg-secondary/30 border border-white/5 flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                <Phone size={24} />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Call Directly</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-grow">
                Speak directly with our store team for stock availability and repair quotes.
              </p>
              <a
                href={getPhoneHref(settings)}
                className="text-sm font-bold text-white hover:text-accent transition-colors mt-auto"
              >
                +91 {settings.phone}
              </a>
            </div>

            <div className="p-6 rounded-2xl bg-secondary/30 border border-white/5 flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-[#25D366]/10 text-[#25D366] flex items-center justify-center mb-4">
                <MessageCircle size={24} />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">WhatsApp Enquiry</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-4 flex-grow">
                Fast responses for phone photos, prices, trade-in valuations, and repair updates.
              </p>
              {isWhatsAppEnabled(settings) && (
                <a
                  href={getWhatsAppUrl(settings, "Hello Mahadev Mobile Gallery, I would like to enquire about your products and services.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#25D366] hover:underline flex items-center gap-1 mt-auto"
                >
                  <MessageCircle size={14} /> Chat on WhatsApp
                </a>
              )}
            </div>

            <div className="p-6 rounded-2xl bg-secondary/30 border border-white/5 flex flex-col">
              <div className="w-12 h-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4">
                <Clock size={24} />
              </div>
              <h2 className="text-lg font-bold text-white mb-2">Store Timings</h2>
              <p className="text-gray-400 text-sm leading-relaxed mb-2">
                Open All 7 Days: <br />
                <span className="text-white font-semibold">
                  {formatOpeningHours(settings.openingTime, settings.closingTime)}
                </span>
              </p>
              {settings.openingHoursNote && (
                <p className="text-xs text-gray-500 italic mt-auto">
                  {settings.openingHoursNote}
                </p>
              )}
            </div>
          </div>
        </div>
      </Section>

      {/* Embedded Map and Interactive Location/FAQ */}
      <LocationAndFAQ faqs={faqs} settings={settings} />
    </div>
  );
}
