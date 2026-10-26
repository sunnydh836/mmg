"use client";

import React from "react";
import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { slideUp, staggerContainer } from "@/lib/animations";
import { Wrench, Headphones, RefreshCw, HandCoins } from "lucide-react";

export function AboutSupport() {
    const supports = [
        { title: "Mobile Repairing", icon: Wrench },
        { title: "Accessories", icon: Headphones },
        { title: "Old Phone Purchase", icon: HandCoins },
        { title: "Phone Exchange", icon: RefreshCw },
    ];

    return (
        <Section className="bg-background">
            <div className="max-w-5xl mx-auto flex flex-col items-center">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="text-center w-full"
                >
                    <motion.div variants={slideUp} className="mb-4">
                        <span className="text-gray-500 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase">
                            ALL UNDER ONE ROOF
                        </span>
                    </motion.div>

                    <motion.h2
                        variants={slideUp}
                        className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white"
                    >
                        Mobile Support Under One Roof
                    </motion.h2>

                    <motion.p
                        variants={slideUp}
                        className="text-gray-400 text-base md:text-lg leading-relaxed font-light mb-12 max-w-2xl mx-auto"
                    >
                        Whether you are looking for help with your current phone, planning an upgrade, or looking for accessories, our store provides mobile-related services in one place.
                    </motion.p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                        {supports.map((item, idx) => (
                            <motion.div
                                key={idx}
                                variants={slideUp}
                                className="bg-secondary/20 border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center text-center group transition-colors hover:bg-secondary/40"
                            >
                                <div className="mb-4 text-gray-400 group-hover:text-blue-500 transition-colors">
                                    <item.icon size={32} />
                                </div>
                                <span className="font-semibold text-white/90">{item.title}</span>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </Section>
    );
}
