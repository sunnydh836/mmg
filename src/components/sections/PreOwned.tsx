"use client";

import React from "react";
import { motion } from "framer-motion";
import { Section, SectionHeader } from "@/components/ui/Section";
import { ProductCard } from "@/components/sections/Products";
import { staggerContainer, slideUp } from "@/lib/animations";
import Link from "next/link";
import { Product } from "@/types/product";

export const PreOwnedSection = ({ products, whatsappNumber, isWhatsAppEnabled }: { products: Product[], whatsappNumber: string, isWhatsAppEnabled: boolean }) => {
    return (
        <Section id="pre-owned">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                <SectionHeader
                    title="Certified Pre-Owned"
                    subtitle="Premium devices, rigorously tested and restored to excellent condition."
                    className="mb-0"
                />
                <motion.div variants={slideUp} className="mt-6 md:mt-0">
                    <Link href="/pre-owned" className="text-accent hover:text-white transition-colors flex items-center font-medium">
                        View All Pre-Owned
                        <span className="ml-2">→</span>
                    </Link>
                </motion.div>
            </div>

            <motion.div
                className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                {products.map((product) => (
                    <motion.div key={product.id} variants={slideUp} className="h-full">
                        <ProductCard product={product} whatsappNumber={whatsappNumber} isWhatsAppEnabled={isWhatsAppEnabled} />
                    </motion.div>
                ))}
            </motion.div>
        </Section>
    );
};
