"use client";

import React from "react";
import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { slideUp, staggerContainer } from "@/lib/animations";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

import { StoreSettings } from "@prisma/client";

export function AboutPhones({ settings }: { settings: StoreSettings | null }) {
    if (!settings) return null;

    return (
        <Section className="bg-zinc-950/50 border-t border-white/5 py-16 md:py-24">
            <div className="max-w-4xl mx-auto text-center px-4 md:px-0">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="flex flex-col items-center"
                >
                    <motion.h2
                        variants={slideUp}
                        className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white"
                    >
                        New & Pre-Owned Phones
                    </motion.h2>

                    <motion.p
                        variants={slideUp}
                        className="text-gray-400 text-base md:text-lg leading-relaxed font-light mb-10 max-w-2xl"
                    >
                        Looking for a new smartphone or considering a pre-owned option? {settings.businessName} offers brand-new and eligible pre-owned/refurbished phones, with availability varying by current stock.
                    </motion.p>

                    <motion.div variants={slideUp} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
                        <Link href="/products" className="w-full sm:w-auto">
                            <Button variant="primary" size="lg" className="w-full sm:w-auto">
                                Browse Phones
                            </Button>
                        </Link>
                        <Link href="/pre-owned" className="w-full sm:w-auto">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto">
                                View Pre-Owned Phones
                            </Button>
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </Section>
    );
}
