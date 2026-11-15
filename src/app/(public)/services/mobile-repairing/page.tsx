import type { Metadata } from 'next';
import React from 'react';
import { Section, SectionHeader } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from '@/components/ui/Button';
import { getStoreSettings, getWhatsAppUrl, formatOpeningHours, isWhatsAppEnabled, getPhoneHref } from "@/lib/settings";
import { buildMetadata, generateServiceSchema, generateFAQSchema } from "@/lib/seo";
import { Wrench, ShieldCheck, Clock, Zap, CheckCircle2, Phone, MessageCircle, MapPin } from 'lucide-react';
import Link from 'next/link';

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getStoreSettings();
    const brandName = settings.displayName || settings.businessName;

    return buildMetadata({
        title: `Mobile Repairing in Partapur, Meerut | Fast Screen & Hardware Fix | ${brandName}`,
        description: `Looking for reliable mobile repairing in Partapur, Meerut? ${settings.businessName} provides same-day smartphone repair, broken screen replacement, battery fixing, water damage recovery, and charging port repair.`,
        path: "/services/mobile-repairing",
        keywords: [
            "Mobile repairing in Partapur",
            "Mobile repair Meerut",
            "Smartphone repair shop Partapur",
            "Phone repairing near me Partapur",
            "iPhone repair Partapur Meerut",
            "Samsung repair Meerut",
        ],
    });
}

const repairFaqs = [
    {
        question: "How long does a typical mobile screen or battery repair take?",
        answer: "Most common repairs such as broken screen replacement, battery change, and charging port repair are completed in 30 to 60 minutes directly at our Partapur store."
    },
    {
        question: "Do you use genuine and tested replacement parts?",
        answer: "Yes, we exclusively use premium-grade and genuine OEM replacement screens, batteries, and internal components to ensure optimal performance and touchscreen responsiveness."
    },
    {
        question: "Which smartphone brands do you repair at Mahadev Mobile Gallery?",
        answer: "We repair all leading smartphone brands including Apple iPhone, Samsung Galaxy, OnePlus, Realme, Vivo, Oppo, Xiaomi/Redmi, POCO, and Motorola."
    },
    {
        question: "Is there a warranty on mobile repairs?",
        answer: "Yes, we offer testing and operational warranty on screen and battery replacements, giving you full peace of mind after your repair."
    },
];

export default async function MobileRepairingPage() {
    const settings = await getStoreSettings();

    const serviceSchema = generateServiceSchema({
        name: "Mobile Repairing & Screen Replacement",
        description: "Professional smartphone repair services in Partapur, Meerut including screen replacement, battery change, water damage restoration, and charging port repair.",
        path: "/services/mobile-repairing",
    });

    const faqSchema = generateFAQSchema(repairFaqs);

    const breadcrumbs = [
        { name: "Services", path: "/services" },
        { name: "Mobile Repairing", path: "/services/mobile-repairing" },
    ];

    const repairIssues = [
        {
            title: "Screen & Glass Replacement",
            desc: "Cracked glass, touch unresponsiveness, bleeding pixels, black display or green line issues resolved with authentic display units.",
            href: "/services/screen-replacement",
        },
        {
            title: "Battery Health & Replacement",
            desc: "Fix rapid battery drain, phone turning off at 20%, swollen batteries, and slow charging with certified high-capacity batteries.",
            href: "/services/battery-replacement",
        },
        {
            title: "Charging Port & Jack Fix",
            desc: "Loose charger cables, intermittent charging, moisture detected in port, or non-functional Type-C / Lightning ports cleaned and repaired.",
        },
        {
            title: "Water & Liquid Damage Recovery",
            desc: "Ultrasonic motherboard cleaning, corrosion elimination, short circuit detection, and component level microsoldering.",
        },
        {
            title: "Camera & Speaker Issues",
            desc: "Blurry camera lens, cracked lens glass, distorted ear speaker, or malfunctioning mic repaired for crisp calls and photos.",
        },
        {
            title: "Software & OS Troubleshooting",
            desc: "Bootloop recovery, phone hanging, software updates, data backup assistance, and unlocking support with valid proof of ownership.",
        },
    ];

    return (
        <div className="flex flex-col w-full bg-background min-h-screen">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify([serviceSchema, faqSchema]) }}
            />

            {/* HERO */}
            <Section className="relative pt-28 pb-16 md:py-28 overflow-hidden bg-gradient-to-b from-secondary/80 to-background">
                <div className="container mx-auto px-4 md:px-6 max-w-5xl">
                    <Breadcrumbs items={breadcrumbs} />

                    <div className="text-center relative z-10 transition-all mt-6 max-w-4xl mx-auto">
                        <span className="text-accent text-xs font-bold uppercase tracking-widest block mb-3">
                            Certified Technicians &bull; Same-Day Service
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
                            Professional Mobile Repairing in Partapur, Meerut
                        </h1>
                        <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto mb-8">
                            Fast, reliable smartphone repairs at {settings.businessName}. We fix shattered screens, failing batteries, water damaged logic boards, and charging issues for all major brands.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {isWhatsAppEnabled(settings) && (
                                <a
                                    href={getWhatsAppUrl(settings, "Hello Mahadev Mobile Gallery, I need an estimate for mobile repairing.")}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto"
                                >
                                    <Button variant="whatsapp" className="w-full sm:w-auto px-8 py-4">
                                        <MessageCircle className="mr-2 h-5 w-5" /> Get Repair Estimate on WhatsApp
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

            {/* REPAIR SERVICES GRID */}
            <Section className="py-16 md:py-24" contained={true}>
                <div className="max-w-6xl mx-auto">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <span className="text-accent text-xs font-bold uppercase tracking-widest block mb-2">
                            What We Fix
                        </span>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                            Complete Smartphone Repair Solutions
                        </h2>
                        <p className="text-gray-400 text-base leading-relaxed">
                            No matter the problem, our in-store technicians provide transparent diagnostics before performing any hardware fixes.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {repairIssues.map((issue, idx) => (
                            <div
                                key={idx}
                                className="p-8 rounded-3xl bg-secondary/30 hover:bg-secondary/60 border border-white/5 hover:border-accent/30 transition-all flex flex-col"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-6">
                                    <Wrench size={24} />
                                </div>
                                <h3 className="text-xl font-bold text-white mb-3">{issue.title}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed mb-6 flex-grow">
                                    {issue.desc}
                                </p>
                                {issue.href && (
                                    <Link href={issue.href} className="text-xs font-bold text-accent hover:underline mt-auto">
                                        Learn more about {issue.title.toLowerCase()} &rarr;
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* WHY CHOOSE US */}
            <Section className="py-16 md:py-24 bg-secondary/20 border-y border-white/5" contained={true}>
                <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="p-6 rounded-2xl bg-background border border-white/5 text-center">
                        <Clock className="w-10 h-10 text-accent mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">Fast Turnaround</h3>
                        <p className="text-gray-400 text-xs leading-relaxed">
                            Most repairs completed in 30 to 60 minutes while you wait in store.
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-background border border-white/5 text-center">
                        <ShieldCheck className="w-10 h-10 text-accent mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">Quality Parts & Warranty</h3>
                        <p className="text-gray-400 text-xs leading-relaxed">
                            Tested authentic parts backed by testing and operational warranties.
                        </p>
                    </div>
                    <div className="p-6 rounded-2xl bg-background border border-white/5 text-center">
                        <Zap className="w-10 h-10 text-accent mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-white mb-2">Transparent Pricing</h3>
                        <p className="text-gray-400 text-xs leading-relaxed">
                            No surprise costs. You receive an upfront estimate before any work begins.
                        </p>
                    </div>
                </div>
            </Section>

            {/* FAQ SECTION */}
            <Section className="py-16 md:py-24" contained={true}>
                <div className="max-w-4xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">
                            Frequently Asked Questions About Mobile Repairing
                        </h2>
                        <p className="text-gray-400 text-sm">
                            Answers to common questions about repair times, parts, and warranties at our Partapur center.
                        </p>
                    </div>

                    <div className="space-y-4">
                        {repairFaqs.map((faq, index) => (
                            <div key={index} className="p-6 rounded-2xl bg-secondary/30 border border-white/5">
                                <h3 className="text-lg font-bold text-white mb-2">{faq.question}</h3>
                                <p className="text-gray-400 text-sm leading-relaxed">{faq.answer}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </Section>

            {/* LOCATION VISIT CTA */}
            <Section className="py-16 bg-secondary/30 border-t border-white/5" contained={true}>
                <div className="max-w-4xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-4">
                        Visit Our Repair Counter in Partapur, Meerut
                    </h2>
                    <p className="text-gray-400 mb-8 max-w-xl mx-auto">
                        Located on Gagol Rd, Sector 2, MDA, Partapur. Walk in with your device or call ahead for parts availability.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <a href={settings.mapsUrl} target="_blank" rel="noopener noreferrer">
                            <Button variant="primary" className="px-8 py-4">
                                <MapPin className="mr-2 h-5 w-5" /> Get Directions
                            </Button>
                        </a>
                        <Link href="/contact">
                            <Button variant="secondary" className="px-8 py-4 bg-white/5 border border-white/10">
                                View Store Details & Hours
                            </Button>
                        </Link>
                    </div>
                </div>
            </Section>
        </div>
    );
}

