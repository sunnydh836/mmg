"use client";

import React from "react";
import { motion } from "framer-motion";
import { Section, SectionHeader } from "@/components/ui/Section";
import { slideUp, staggerContainer } from "@/lib/animations";
import { CheckCircle2 } from "lucide-react";
import { StoreSettings } from "@prisma/client";

export function AboutWhyUs({ settings }: { settings: StoreSettings | null }) {
    if (!settings) return null;

    const reasons = [
        "New and pre-owned phone options",
        "Multiple smartphone brands",
        "Mobile repairing",
        "Accessories",
        "Old phone purchase",
        "Phone exchange",
        "WhatsApp enquiries",
        "Convenient store timings"
    ];

    return (
        <Section className="bg-zinc-950/50 border-t border-white/5 py-16 md:py-24">
            <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
                <SectionHeader
                    title={`Why Visit ${settings.businessName}`}
                    className="w-full mb-12"
                />

                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full text-left"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                >
                    {reasons.map((reason, idx) => (
                        <motion.div
                            key={idx}
                            variants={slideUp}
                            className="flex items-center space-x-3 bg-secondary/20 p-4 rounded-xl border border-white/5"
                        >
                            <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                            <span className="text-gray-200">{reason}</span>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </Section>
    );
}
