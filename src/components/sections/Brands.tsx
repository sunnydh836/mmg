"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { staggerContainer, slideUp } from "@/lib/animations";
import Image from "next/image";
import { LayoutGrid } from "lucide-react";

export const brandLogos: Record<string, string> = {
    Apple: "/brands/apple.svg",
    Samsung: "/brands/samsung.svg",
    OnePlus: "/brands/oneplus.svg",
    Oppo: "/brands/oppo.svg",
    Vivo: "/brands/vivo.svg",
    Realme: "/brands/realme.svg",
    Xiaomi: "/brands/xiaomi.svg",
    Redmi: "/brands/redmi.png",
    Motorola: "/brands/motorola.svg",
    Nothing: "/brands/nothing-logo.svg",
    Google: "/brands/google.svg",
    Infinix: "/brands/infinix.svg",
    Tecno: "/brands/tecno.png",
    Poco: "/brands/poco.png",
    iQOO: "/brands/iqoo.png",
};

export const BrandShowcase = ({ brands }: { brands: string[] }) => {
    const [failedLogos, setFailedLogos] = useState<Record<string, boolean>>({});
    return (
        <Section id="brands" className="bg-secondary/20 py-12 border-y border-border">
            <div className="text-center mb-8">
                <motion.h3
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-sm uppercase tracking-[0.3em] text-gray-500 font-semibold"
                >
                    Supported Brands
                </motion.h3>
            </div>

            <motion.div
                className="flex flex-wrap justify-center gap-4 md:gap-8"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
            >
                {brands.map((brand, i) => {
                    const logoPath = brandLogos[brand];

                    return (
                        <motion.div
                            key={i}
                            variants={slideUp}
                            className="px-6 py-3 rounded-full border border-white/5 bg-background hover:border-accent/40 transition-colors cursor-default flex items-center gap-3"
                        >
                            <div className="flex-shrink-0 flex items-center justify-center w-5 h-5 md:w-6 md:h-6 overflow-hidden">
                                {logoPath && !failedLogos[brand] ? (
                                    <Image
                                        src={logoPath}
                                        alt={`${brand} logo`}
                                        width={24}
                                        height={24}
                                        className="object-contain w-full h-full"
                                        unoptimized={logoPath.endsWith(".svg")}
                                        onError={() => setFailedLogos(prev => ({ ...prev, [brand]: true }))}
                                    />
                                ) : (
                                    <LayoutGrid className="w-5 h-5 text-gray-400" aria-label="Brand category icon" />
                                )}
                            </div>
                            <span className="text-gray-300 font-medium text-sm md:text-base tracking-wide whitespace-nowrap">
                                {brand}
                            </span>
                        </motion.div>
                    );
                })}
            </motion.div>
        </Section>
    );
};
