"use client";

import React from "react";
import { motion } from "framer-motion";
import { Section, SectionHeader } from "@/components/ui/Section";
import { slideUp, staggerContainer } from "@/lib/animations";

import { StoreSettings } from "@prisma/client";

export function AboutIntro({ settings }: { settings: StoreSettings | null }) {
    if (!settings) return null;

    return (
        <Section className="bg-zinc-950/50 border-t border-white/5 py-16 md:py-24">
            <div className="max-w-3xl mx-auto text-center px-4 md:px-0">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <motion.div variants={slideUp} className="mb-4">
                        <span className="text-blue-500 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase">
                            ABOUT US
                        </span>
                    </motion.div>

                    <motion.h2
                        variants={slideUp}
                        className="text-3xl md:text-4xl font-bold tracking-tight mb-6 text-white"
                    >
                        More Than Just a Mobile Store
                    </motion.h2>

                    <motion.p
                        variants={slideUp}
                        className="text-gray-400 text-base md:text-lg leading-relaxed font-light"
                    >
                        {settings.businessName} is a local mobile store. We provide a range of mobile-related products and services, from new smartphones and pre-owned devices to mobile repairing, accessories, old phone purchase and phone exchange.
                    </motion.p>
                </motion.div>
            </div>
        </Section>
    );
}
