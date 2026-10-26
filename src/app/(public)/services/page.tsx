import { Metadata } from 'next';
import React from 'react';
import prisma from "@/lib/prisma";
import { Section, SectionHeader } from "@/components/ui/Section";
import * as LucideIcons from "lucide-react";
import Link from 'next/link';
import { Button } from '@/components/ui/Button';

import { getStoreSettings, getWhatsAppUrl, formatOpeningHours, isWhatsAppEnabled, canBuyOldPhones, canExchangeOldPhones, canSellUsedRefurbished } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getStoreSettings();
    return {
        title: `Mobile Services | ${settings.businessName}`,
        description: `Explore mobile sales, repairing, accessories, old phone purchase, phone exchange, and new & pre-owned phones at ${settings.businessName}.`
    };
}

export default async function ServicesPage() {
    const settings = await getStoreSettings();
    const rawServices = await prisma.service.findMany({
        where: { isActive: true },
        orderBy: [
            { sortOrder: 'asc' },
            { createdAt: 'asc' }
        ],
        // @ts-ignore
        select: { id: true, title: true, description: true, icon: true, features: true }
    });

    const services = rawServices.filter(service => {
        if (service.title === "Old Phone Purchase" && !canBuyOldPhones(settings)) return false;
        if (service.title === "Phone Exchange" && !canExchangeOldPhones(settings)) return false;
        if (service.title === "New & Pre-Owned Phones" && !canSellUsedRefurbished(settings)) return false;
        return true;
    });

    return (
        <div className="flex flex-col w-full bg-background min-h-screen">
            {/* HERO SECTION */}
            <Section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-b from-secondary/80 to-background">
                <div className="absolute inset-0 bg-grid-white/[0.02]" />
                <div className="absolute top-0 right-0 w-96 h-96 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="container mx-auto px-4 md:px-6 max-w-4xl text-center relative z-10 transition-all">
                    <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
                        Services That Keep You Connected
                    </h1>
                    <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto">
                        From buying your next smartphone to repairing or exchanging your current device, {settings.businessName} helps you with your everyday mobile needs.
                    </p>
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

                        // Parse features since the backend typing has it inherently now
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
                            title={`Why Visit ${settings.displayName || settings.businessName}?`}
                            subtitle="Providing reliable, everyday mobile solutions for our customers."
                            className="mb-8"
                        />
                        <p className="text-gray-400 mb-8 max-w-lg leading-relaxed text-lg">
                            We are committed to delivering the best store experience with all the services you need under one roof.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {[
                            "Multiple smartphone brands",
                            "New & pre-owned phone options",
                            "Old phone purchase & exchange",
                            "In-store mobile repairing",
                            "WhatsApp enquiries",
                            `Convenient store timings: ${formatOpeningHours(settings.openingTime, settings.closingTime)}`
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
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/10 rounded-full blur-[120px] pointer-events-none -z-10" />

                <div className="max-w-3xl mx-auto text-center relative z-10">
                    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                        Looking for a phone or need help with your current one?
                    </h2>
                    <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
                        Visit {settings.businessName} or contact us on WhatsApp.
                        <br />
                        <span className="block mt-4 text-sm text-gray-500 font-medium bg-secondary/50 inline-block px-4 py-2 rounded-full border border-white/5">
                            {(settings as any).openingHoursNote || settings.weeklyOff}
                        </span>
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        {isWhatsAppEnabled(settings) && (
                            <a
                                href={getWhatsAppUrl(settings)}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#25D366] hover:bg-[#20bd5a] text-white px-8 py-4 rounded-xl font-bold transition-all hover:scale-105 shadow-lg shadow-[#25D366]/20"
                            >
                                <LucideIcons.Phone size={20} />
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
                                Get Directions
                            </Button>
                        </a>
                    </div>
                </div>
            </Section>
        </div>
    );
}
