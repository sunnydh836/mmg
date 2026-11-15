import type { Metadata } from 'next';
import React from 'react';
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from '@/components/ui/Button';
import { getStoreSettings, getWhatsAppUrl, isWhatsAppEnabled, getPhoneHref } from "@/lib/settings";
import { buildMetadata, generateServiceSchema, generateFAQSchema } from "@/lib/seo";
import { BatteryCharging, ShieldCheck, Check, Clock, Phone, MessageCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getStoreSettings();
    const brandName = settings.displayName || settings.businessName;

    return buildMetadata({
        title: `Mobile Battery Replacement in Partapur, Meerut | ${brandName}`,
        description: `Restore all-day battery life with certified phone battery replacement in Partapur, Meerut at ${settings.businessName}. High-capacity, safe batteries for iPhone, Samsung, Realme, Vivo, OnePlus & Xiaomi.`,
        path: "/services/battery-replacement",
        keywords: [
            "Battery replacement Meerut",
            "Phone battery change Partapur",
            "iPhone battery replacement Meerut",
            "Samsung battery replacement Partapur",
            "Mobile battery health service Meerut",
        ],
    });
}

const batteryFaqs = [
    {
        question: "When should I replace my mobile phone battery?",
        answer: "If your battery health drops below 80%, the phone unexpectedly shuts down at 20-30%, battery drains drastically within a few hours, or the back cover shows slight bulging, your battery needs immediate replacement."
    },
    {
        question: "Are your replacement batteries safe and certified?",
        answer: "Yes, we install grade-A lithium-ion and lithium-polymer batteries equipped with overcharge, over-discharge, and temperature protection circuits."
    },
    {
        question: "How long does a battery change take?",
        answer: "A battery replacement takes approximately 20 to 30 minutes at our Partapur store, followed by a charging and thermal check."
    },
];

export default async function BatteryReplacementPage() {
    const settings = await getStoreSettings();

    const serviceSchema = generateServiceSchema({
        name: "Mobile Battery Replacement Service",
        description: "Certified smartphone battery replacement services in Partapur, Meerut for iPhone, Samsung, OnePlus, Xiaomi, and other Android devices.",
        path: "/services/battery-replacement",
    });

    const faqSchema = generateFAQSchema(batteryFaqs);

    const breadcrumbs = [
        { name: "Services", path: "/services" },
        { name: "Battery Replacement", path: "/services/battery-replacement" },
    ];

    return (
        <div className="flex flex-col w-full bg-background min-h-screen">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([serviceSchema, faqSchema]) }}
            />

            <Section className="relative pt-28 pb-16 md:py-28 overflow-hidden bg-gradient-to-b from-secondary/80 to-background">
                <div className="container mx-auto px-4 md:px-6 max-w-5xl">
                    <Breadcrumbs items={breadcrumbs} />

                    <div className="text-center relative z-10 transition-all mt-6 max-w-4xl mx-auto">
                        <span className="text-accent text-xs font-bold uppercase tracking-widest block mb-3">
                            All-Day Power Restored
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
                            Smartphone Battery Replacement in Meerut
                        </h1>
                        <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto mb-8">
                            Suffering from fast battery drainage, unexpected power drops, or device overheating? Get a brand new, certified battery installed in 25 minutes at {settings.businessName}.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {isWhatsAppEnabled(settings) && (
                                <a
                                    href={getWhatsAppUrl(settings, "Hi Mahadev Mobile Gallery, I need an estimate for battery replacement on my phone.")}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto"
                                >
                                    <Button variant="whatsapp" className="w-full sm:w-auto px-8 py-4">
                                        <MessageCircle className="mr-2 h-5 w-5" /> Enquire on WhatsApp
                                    </Button>
                                </a>
                            )}
                            <a href={getPhoneHref(settings)}>
                                <Button variant="secondary" className="w-full sm:w-auto px-8 py-4 bg-white/5 border border-white/10">
                                    <Phone className="mr-2 h-5 w-5 text-accent" /> Call +91 {settings.phone}
                                </Button>
                            </a>
                        </div>
                    </div>
                </div>
            </Section>

            {/* SYMPTOMS */}
            <Section className="py-16 md:py-24" contained={true}>
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-4 text-center">
                        Signs Your Battery Needs Immediate Replacement
                    </h2>
                    <p className="text-gray-400 text-center max-w-2xl mx-auto mb-12 text-sm">
                        Delaying battery replacement on a degraded cell can damage internal circuitry or crack display panels.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="p-6 rounded-2xl bg-secondary/30 border border-white/5 flex flex-col">
                            <Clock className="w-8 h-8 text-accent mb-3" />
                            <h3 className="text-lg font-bold text-white mb-2">Rapid Battery Drain</h3>
                            <p className="text-gray-400 text-xs leading-relaxed">
                                Battery percentage drops by 20% to 30% within 15 minutes of light usage or browsing.
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl bg-secondary/30 border border-white/5 flex flex-col">
                            <AlertTriangle className="w-8 h-8 text-amber-500 mb-3" />
                            <h3 className="text-lg font-bold text-white mb-2">Sudden Shutdowns</h3>
                            <p className="text-gray-400 text-xs leading-relaxed">
                                Phone unexpectedly turns off during incoming calls or when opening the camera app.
                            </p>
                        </div>
                        <div className="p-6 rounded-2xl bg-secondary/30 border border-white/5 flex flex-col">
                            <BatteryCharging className="w-8 h-8 text-green-500 mb-3" />
                            <h3 className="text-lg font-bold text-white mb-2">Overheating While Charging</h3>
                            <p className="text-gray-400 text-xs leading-relaxed">
                                Back panel gets excessively hot or takes hours to reach 80% charge level.
                            </p>
                        </div>
                    </div>
                </div>
            </Section>

            {/* FAQS */}
            <Section className="py-16 bg-secondary/20 border-t border-white/5" contained={true}>
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-8 text-center">
                        Battery Replacement FAQs
                    </h2>
                    <div className="space-y-4">
                        {batteryFaqs.map((faq, i) => (
                            <div key={i} className="p-6 rounded-2xl bg-secondary/40 border border-white/5">
                                <h3 className="text-lg font-bold text-white mb-2">{faq.question}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>
        </div>
    );
}

