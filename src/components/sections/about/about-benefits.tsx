"use client";

import React from "react";
import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { slideUp, staggerContainer } from "@/lib/animations";
import { Gift } from "lucide-react";

interface OfferItem {
    id: string;
    title: string;
    description: string;
    isActive: boolean;
}

export function AboutBenefits({ offers, hasGifts = true }: { offers: OfferItem[], hasGifts: boolean }) {
    if (!hasGifts) return null;

    const activeOffer = offers.find(o => o.isActive);

    return (
        <Section className="bg-background pt-0 pb-16 md:pb-24">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                    className="bg-gradient-to-br from-blue-900/20 to-black border border-blue-500/20 rounded-3xl p-8 md:p-12 text-center flex flex-col items-center"
                >
                    <motion.div variants={slideUp} className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
                        <Gift className="w-8 h-8 text-blue-400" />
                    </motion.div>

                    <motion.h2
                        variants={slideUp}
                        className="text-2xl md:text-3xl font-bold tracking-tight mb-4 text-white"
                    >
                        {activeOffer ? activeOffer.title : "Gift Benefits"}
                    </motion.h2>

                    <motion.p
                        variants={slideUp}
                        className="text-gray-400 text-base md:text-lg leading-relaxed font-light max-w-2xl"
                    >
                        {activeOffer
                            ? activeOffer.description
                            : "Gift benefits may be available with eligible mobile purchases. Offers can vary depending on the phone and current store offer, so please ask in-store for the latest details."
                        }
                    </motion.p>
                </motion.div>
            </div>
        </Section>
    );
}
