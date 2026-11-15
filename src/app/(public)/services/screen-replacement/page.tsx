import type { Metadata } from 'next';
import React from 'react';
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { Button } from '@/components/ui/Button';
import { getStoreSettings, getWhatsAppUrl, isWhatsAppEnabled, getPhoneHref } from "@/lib/settings";
import { buildMetadata, generateServiceSchema, generateFAQSchema } from "@/lib/seo";
import { Smartphone, ShieldCheck, Check, Clock, Phone, MessageCircle, MapPin } from 'lucide-react';
import Link from 'next/link';

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
    const settings = await getStoreSettings();
    const brandName = settings.displayName || settings.businessName;

    return buildMetadata({
        title: `Mobile Screen Replacement in Meerut | iPhone & Android Displays | ${brandName}`,
        description: `Cracked phone screen? Get same-day mobile screen replacement in Partapur, Meerut at ${settings.businessName}. Original & OEM displays for iPhone, Samsung, Realme, Vivo, OnePlus, and Oppo.`,
        path: "/services/screen-replacement",
        keywords: [
            "Screen replacement Meerut",
            "Mobile screen change Partapur",
            "iPhone screen replacement Meerut",
            "Samsung display replacement Partapur",
            "Touch screen repair near me Meerut",
            "AMOLED display repair Meerut",
        ],
    });
}

const screenFaqs = [
    {
        question: "What is the difference between original and OEM replacement screens?",
        answer: "Original screens come directly from certified parts distributors with 100% factory color calibration, brightness, and refresh rates. OEM screens are high-grade compatible units offering an economical solution while maintaining solid touch response and clarity."
    },
    {
        question: "How long does a mobile screen replacement take?",
        answer: "Most screen replacements take between 30 to 45 minutes at our Partapur store, including comprehensive touch, sensor, and fingerprint testing before delivery."
    },
    {
        question: "Will my data be lost during a screen replacement?",
        answer: "No. A screen replacement is purely a hardware replacement of the external digitizer and display panel. Your photos, contacts, and apps remain safe on your device storage."
    },
];

export default async function ScreenReplacementPage() {
    const settings = await getStoreSettings();

    const serviceSchema = generateServiceSchema({
        name: "Mobile Screen & Display Replacement",
        description: "Express mobile screen and display replacement services for iPhone, Samsung, OnePlus, Vivo, Realme, and Oppo in Partapur, Meerut.",
        path: "/services/screen-replacement",
    });

    const faqSchema = generateFAQSchema(screenFaqs);

    const breadcrumbs = [
        { name: "Services", path: "/services" },
        { name: "Screen Replacement", path: "/services/screen-replacement" },
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
                            Express Display Repair
                        </span>
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white mb-6">
                            Mobile Screen Replacement in Partapur, Meerut
                        </h1>
                        <p className="text-lg md:text-xl text-gray-300 leading-relaxed max-w-2xl mx-auto mb-8">
                            Shattered glass, unresponsive touch, black spots, or green lines? We fit high-grade OLED, AMOLED, and IPS displays with quick turnaround at {settings.businessName}.
                        </p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {isWhatsAppEnabled(settings) && (
                                <a
                                    href={getWhatsAppUrl(settings, "Hi Mahadev Mobile Gallery, I need a price quote for screen replacement on my phone.")}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full sm:w-auto"
                                >
                                    <Button variant="whatsapp" className="w-full sm:w-auto px-8 py-4">
                                        <MessageCircle className="mr-2 h-5 w-5" /> WhatsApp Screen Quote
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

            {/* SCREEN TYPES */}
            <Section className="py-16 md:py-24" contained={true}>
                <div className="max-w-5xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-10 text-center">
                        Screen Replacements For Every Brand
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-8 rounded-3xl bg-secondary/30 border border-white/5 flex flex-col">
                            <Smartphone className="w-10 h-10 text-accent mb-4" />
                            <h3 className="text-xl font-bold text-white mb-3">iPhone & Premium OLED Screens</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                Authentic replacement panels for iPhone 11 through iPhone 16 series, Samsung Galaxy S-series, and OnePlus Flagships. Full True Tone, HDR brightness, and 120Hz ProMotion support.
                            </p>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li className="flex items-center gap-2"><Check size={16} className="text-accent" /> True Tone restoration</li>
                                <li className="flex items-center gap-2"><Check size={16} className="text-accent" /> Oleophobic coating for smudge resistance</li>
                                <li className="flex items-center gap-2"><Check size={16} className="text-accent" /> 30-minute express installation</li>
                            </ul>
                        </div>

                        <div className="p-8 rounded-3xl bg-secondary/30 border border-white/5 flex flex-col">
                            <ShieldCheck className="w-10 h-10 text-accent mb-4" />
                            <h3 className="text-xl font-bold text-white mb-3">Android AMOLED & IPS LCD Displays</h3>
                            <p className="text-gray-400 text-sm leading-relaxed mb-6">
                                Factory-fitted screen assemblies for Xiaomi/Redmi, Realme, Vivo, Oppo, and Samsung A/M series. Color accuracy and high touch sampling rates guaranteed.
                            </p>
                            <ul className="space-y-2 text-sm text-gray-300">
                                <li className="flex items-center gap-2"><Check size={16} className="text-accent" /> High responsiveness for gaming and daily use</li>
                                <li className="flex items-center gap-2"><Check size={16} className="text-accent" /> In-display fingerprint sensor compatibility</li>
                                <li className="flex items-center gap-2"><Check size={16} className="text-accent" /> Full testing before final hand-off</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </Section>

            {/* FAQS */}
            <Section className="py-16 bg-secondary/20 border-t border-white/5" contained={true}>
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-8 text-center">
                        Screen Replacement FAQs
                    </h2>
                    <div className="space-y-4">
                        {screenFaqs.map((faq, i) => (
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

