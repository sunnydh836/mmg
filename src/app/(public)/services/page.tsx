import type { Metadata } from 'next';
import React from 'react';
import prisma from "@/lib/prisma";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import * as LucideIcons from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

import { getStoreSettings, getWhatsAppUrl, formatOpeningHours, isWhatsAppEnabled, canBuyOldPhones, canExchangeOldPhones, canSellUsedRefurbished } from "@/lib/settings";
import { withDatabaseFallback } from "@/lib/database-fallback";
import { buildMetadata, generateServiceSchema } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getStoreSettings();
    const brandName = settings.displayName || settings.businessName;

    return buildMetadata({
        title: `Mobile Sales, Repairing & Exchange Services in Meerut | ${brandName}`,
        description: `Comprehensive mobile phone services at ${settings.businessName} in Partapur, Meerut. Mobile repairing, screen replacement, battery replacement, old phone exchange, and genuine accessories.`,
        path: "/services",
        keywords: [
            "Mobile repairing in Partapur",
            "Smartphone repair Meerut",
            "Screen replacement Partapur Meerut",
            "Phone exchange Meerut",
            "Battery replacement Meerut",
            "Mobile accessories Partapur",
        ],
    });
}

export default async function ServicesPage() {
    const settings = await getStoreSettings();
    const rawServices = await withDatabaseFallback(prisma.service.findMany({
        where: { isActive: true },
        orderBy: [
            { sortOrder: 'asc' },
            { createdAt: 'asc' }
        ],
        // @ts-ignore
        select: { id: true, title: true, description: true, icon: true, features: true }
    }), [], "services page");

    const services = rawServices.filter(service => {
        if (service.title === "Old Phone Purchase" && !canBuyOldPhones(settings)) return false;
        if (service.title === "Phone Exchange" && !canExchangeOldPhones(settings)) return false;
        if (service.title === "New & Pre-Owned Phones" && !canSellUsedRefurbished(settings)) return false;
        return true;
    });

    const serviceSchemas = services.map(s => generateServiceSchema({
        name: s.title,
        description: s.description,
        path: '/services',
    }));

    return (
        <div className="flex flex-col w-full bg-background min-h-screen">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchemas) }}
            />

            {/* HERO SECTION */}
            <Section className="relative pt-28 pb-16 md:py-28 overflow-hidden bg-gradient-to-b from-secondary/80 to-background">
                <div className="container mx-auto px-4 md:px-6 max-w-5xl">
                    <Breadcrumbs items={[{ name: "Services", path: "/services" }]} />

                    <div className="text-center relative z-10 transition-all mt-6">
                        <span className="text-accent text-xs font-bold uppercase tracking-widest block mb-3">
                            Expert Mobile Solutions
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
                            Mobile Sales, Repairing & Exchange in Meerut
                        </h1>
                        <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
                            From buying your next smartphone to instant screen replacement, battery repair, or exchanging your existing device, {settings.businessName} has you covered.
                        </p>
                    </div>
                </div>
            </Section>

            {/* SPECIALIZED REPAIR HUBS */}
            <Section className="py-8 bg-secondary/10 border-b border-white/5" contained={true}>
                <div className="max-w-5xl mx-auto">
                    <span className="text-xs uppercase tracking-widest text-gray-400 font-bold block mb-4 text-center">
                        Specialized Repair & Support Hubs
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Link
                            href="/services/mobile-repairing"
                            className="p-5 rounded-2xl bg-secondary/30 hover:bg-secondary/60 border border-white/5 hover:border-accent/40 transition-all text-center group"
                        >
                            <LucideIcons.Wrench className="w-6 h-6 text-accent mx-auto mb-2 group-hover:scale-110 transition-transform" />
                            <h2 className="text-base font-bold text-white mb-1">Mobile Repairing</h2>
                            <p className="text-xs text-gray-400">Complete hardware, motherboard & water damage diagnosis</p>
                        </Link>
                        <Link
                            href="/services/screen-replacement"
                            className="p-5 rounded-2xl bg-secondary/30 hover:bg-secondary/60 border border-white/5 hover:border-accent/40 transition-all text-center group"
                        >
                            <LucideIcons.Smartphone className="w-6 h-6 text-accent mx-auto mb-2 group-hover:scale-110 transition-transform" />
                            <h2 className="text-base font-bold text-white mb-1">Screen Replacement</h2>
                            <p className="text-xs text-gray-400">Original display fitting for iPhone, Samsung, Realme & more</p>
                        </Link>
                        <Link
                            href="/services/battery-replacement"
                            className="p-5 rounded-2xl bg-secondary/30 hover:bg-secondary/60 border border-white/5 hover:border-accent/40 transition-all text-center group"
                        >
                            <LucideIcons.BatteryCharging className="w-6 h-6 text-accent mx-auto mb-2 group-hover:scale-110 transition-transform" />
                            <h2 className="text-base font-bold text-white mb-1">Battery Replacement</h2>
                            <p className="text-xs text-gray-400">High-capacity battery replacements with health warranty</p>
                        </Link>
                    </div>
                </div>
            </Section>

            {/* SERVICES CARDS */}
            <Section className="py-12 md:py-20" contained={true}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {services.map((service, idx) => {
                        const IconComponent = service.icon && (LucideIcons as any)[service.icon]
                            ? (LucideIcons as any)[service.icon]
                            : LucideIcons.Wrench;

                        const whatsappMessage = encodeURIComponent(`Hello, I would like to enquire about ${service.title} at ${settings.businessName}.`);
                        const featuresArray: string[] = (service as any).features || [];

                        return (
                            <div
                                key={service.id || idx}
                                className="group relative flex flex-col p-8 rounded-3xl bg-secondary/30 hover:bg-secondary/60 border border-white/5 transition-all duration-300 overflow-hidden h-full"
                            >
                                <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-bl-[100px] -z-10 transition-colors group-hover:bg-accent/10" />

                                <div className="mb-6 w-14 h-14 bg-background/80 backdrop-blur rounded-2xl flex items-center justify-center border border-white/10 group-hover:border-accent/30 group-hover:scale-110 transition-all shadow-lg">
                                    <IconComponent size={28} className="text-gray-300 group-hover:text-accent transition-colors" />
                                </div>

                                <h3 className="text-2xl font-bold text-white mb-3">{service.title}</h3>
                                <p className="text-gray-400 leading-relaxed mb-6 flex-grow">{service.description}</p>

                                {featuresArray.length > 0 && (
                                    <ul className="space-y-2 mb-8 flex-grow">
                                        {featuresArray.map((feature, i) => (
                                            <li key={i} className="flex items-start text-sm text-gray-300">
                                                <LucideIcons.Check size={16} className="text-accent mr-2 mt-0.5 flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {isWhatsAppEnabled(settings) && (
                                    <div className="mt-auto pt-4 border-t border-white/5">
                                        <a
                                            href={getWhatsAppUrl(settings, whatsappMessage)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center text-accent hover:text-white font-medium transition-colors text-sm"
                                        >
                                            <LucideIcons.MessageCircle size={16} className="mr-2" />
                                            Enquire on WhatsApp
                                        </a>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </Section>

            {/* WHY VISIT US SECTION */}
            <Section className="py-16 md:py-24 bg-secondary/20 border-y border-border/50" contained={true}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                    <div>
                        <SectionHeader
                            title={`Why Choose ${settings.displayName || settings.businessName}?`}
                            subtitle="Local trust, verified parts, transparent pricing, and fast turnaround."
                            className="mb-8"
                        />
                        <p className="text-gray-400 mb-8 max-w-lg leading-relaxed text-lg">
                            We have served thousands of smartphone users across Partapur, Aminagar Urf Bhurbaral, and Greater Meerut with genuine products, authentic parts, and fair trade valuations.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                            "All Top Smartphone Brands (Apple, Samsung, OnePlus, Realme, Vivo, Oppo)",
                            "Certified Pre-Owned & Refurbished Devices with In-Store Testing",
                            "Fair Old Phone Trade-In & Instant Spot Cash Options",
                            "Same-Day Screen, Battery & Charging Port Repairs",
                            "Quick WhatsApp & Direct Call Consultation",
                            `Open 7 Days a Week: ${formatOpeningHours(settings.openingTime, settings.closingTime)}`
                        ].map((point, i) => (
                            <div key={i} className="flex items-center p-4 rounded-xl bg-background border border-white/5 shadow-sm">
                                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center mr-4 flex-shrink-0">
                                    <LucideIcons.Check size={20} className="text-accent" />
                                </div>
                                <span className="text-white font-medium text-sm md:text-base leading-snug">{point}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* CTA SECTION */}
            <Section className="py-20 md:py-32 relative overflow-hidden" contained={true}>
                <div className="absolute inset-0 bg-accent/5" />
                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Need Repair Assistance or Phone Valuation?
                    </h2>
                    <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                        Visit {settings.businessName} on Gagol Road, Partapur, Meerut or reach out on WhatsApp for a fast quote.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        {isWhatsAppEnabled(settings) && (
                            <a
                                href={getWhatsAppUrl(settings, "Hi Mahadev Mobile Gallery, I need help with mobile repairing/exchange.")}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-[#25D366]/20"
                            >
                                <LucideIcons.MessageCircle size={20} />
                                WhatsApp Us
                            </a>
                        )}
                        <a
                            href={settings.mapsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <Button
                                variant="outline"
                                size="lg"
                                className="w-full sm:w-auto h-14 px-8 text-base font-bold bg-secondary hover:bg-secondary-focus hover:scale-105 transition-all text-white border-white/10"
                            >
                                <LucideIcons.MapPin size={20} className="mr-2" />
                                Get Directions to Store
                            </Button>
                        </a>
                    </div>
                </div>
            </Section>
        </div>
    );
}
