"use client";

import React from "react";
import { motion } from "framer-motion";
import { Section, SectionHeader } from "@/components/ui/Section";
import { slideUp, staggerContainer } from "@/lib/animations";
import { StoreSettings } from "@prisma/client";
import { formatOpeningHours } from "@/lib/settings-shared";

export function AboutInfo({ settings }: { settings: StoreSettings | null }) {
    if (!settings) return null;

    const infoList = [
        { label: "BUSINESS NAME", value: settings.businessName },
        { label: "DISPLAY NAME", value: settings.displayName },
        { label: "TAGLINE", value: settings.tagline },
        { label: "PHONE / WHATSAPP", value: `+91 ${settings.phone}` },
        { label: "ADDRESS", value: settings.address },
        { label: "OPENING HOURS", value: formatOpeningHours(settings.openingTime, settings.closingTime) },
    ];

    if ((settings as any).openingHoursNote) {
        infoList.push({ label: "OPENING HOURS NOTE", value: (settings as any).openingHoursNote });
    } else if (settings.weeklyOff && settings.weeklyOff !== "unknown") {
        infoList.push({ label: "MONTHLY CLOSURE", value: settings.weeklyOff });
    }

    return (
        <Section className="bg-background py-16 md:py-24">
            <div className="max-w-4xl mx-auto flex flex-col items-center">
                <SectionHeader
                    title="Store Information"
                    className="text-center w-full mb-12"
                />

                <motion.div
                    className="w-full bg-secondary/10 border border-white/5 rounded-3xl p-8 md:p-12 overflow-hidden relative"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                >
                    <div className="absolute top-0 right-0 p-32 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                        {infoList.map((item, idx) => (
                            <motion.div key={idx} variants={slideUp} className="flex flex-col space-y-2">
                                <span className="text-xs font-bold text-gray-500 tracking-widest uppercase">
                                    {item.label}
                                </span>
                                <span className="text-white text-base font-medium">
                                    {item.value}
                                </span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </Section>
    );
}
