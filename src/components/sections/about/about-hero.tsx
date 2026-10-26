"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { slideUp, staggerContainer } from "@/lib/animations";

import { StoreSettings } from "@prisma/client";

export function AboutHero({ settings }: { settings: StoreSettings | null }) {
    if (!settings) return null;

    return (
        <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-[#09090b]">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[10%] p-[20%] right-0 bg-blue-600/5 rounded-full blur-[150px] opacity-70" />
                <div className="absolute bottom-[20%] left-[-10%] p-[30%] bg-zinc-600/10 rounded-full blur-[180px] opacity-50" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
            </div>

            <div className="container mx-auto px-6 md:px-8 max-w-4xl relative z-10 text-center">
                <motion.div
                    className="flex flex-col items-center"
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                >
                    <motion.div variants={slideUp} className="mb-6">
                        <span className="text-gray-400 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase">
                            ABOUT {settings.displayName || settings.businessName}
                        </span>
                    </motion.div>

                    <motion.h1
                        variants={slideUp}
                        className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-8 leading-[1.1] text-white"
                    >
                        Your Local Mobile<br />
                        <span className="text-gray-500">
                            Destination
                        </span>
                    </motion.h1>

                    <motion.p
                        variants={slideUp}
                        className="text-lg sm:text-xl text-gray-400 mb-10 leading-relaxed font-light max-w-2xl mx-auto"
                    >
                        {settings.businessName} helps customers with smartphones, mobile repairing, accessories, old phone purchase and exchange, with both new and pre-owned phone options.
                    </motion.p>
                </motion.div>
            </div>
        </section>
    );
}
