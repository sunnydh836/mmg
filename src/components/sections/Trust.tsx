"use client";

import React from "react";
import { motion } from "framer-motion";
import { Smartphone, Wrench, Headphones, RefreshCw, ShieldCheck, Gift } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/Section";
import { staggerContainer, slideUp } from "@/lib/animations";

export const TrustSection = () => {
    const highlights = [
        {
            icon: <Smartphone className="text-accent" size={32} />,
            title: "New Smartphones",
            desc: "Latest models from top brands.",
        },
        {
            icon: <ShieldCheck className="text-accent" size={32} />,
            title: "Pre-Owned Phones",
            desc: "Carefully checked pre-owned devices at great prices.",
        },
        {
            icon: <Wrench className="text-accent" size={32} />,
            title: "Mobile Repairing",
            desc: "Mobile repairing services available in-store.",
        },
        {
            icon: <RefreshCw className="text-accent" size={32} />,
            title: "Phone Exchange",
            desc: "Upgrade your phone and get the best exchange value.",
        },
        {
            icon: <Headphones className="text-accent" size={32} />,
            title: "Premium Accessories",
            desc: "Mobile accessories are available in-store.",
        },
        {
            icon: <Gift className="text-accent" size={32} />,
            title: "Gift Benefits",
            desc: "Gift benefits may be available with eligible mobile purchases. Ask in-store for current offers.",
        },
    ];

    return (
        <Section id="features" className="bg-secondary/30 relative">
            <SectionHeader
                title="Everything You Need"
                subtitle="From getting your first smartphone to professional repairs, we provide a complete mobile experience under one roof."
                className="text-center flex flex-col items-center"
            />

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-16"
                variants={staggerContainer}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: "-100px" }}
            >
                {highlights.map((item, i) => (
                    <motion.div
                        key={i}
                        variants={slideUp}
                        className="bg-secondary/50 p-8 rounded-2xl border border-white/5 hover:border-accent/40 transition-colors group"
                    >
                        <div className="mb-6 p-4 bg-background/80 rounded-xl inline-block group-hover:bg-accent/10 transition-colors">
                            {item.icon}
                        </div>
                        <h3 className="text-xl font-semibold mb-3 text-white">{item.title}</h3>
                        <p className="text-gray-400 group-hover:text-gray-300 transition-colors">
                            {item.desc}
                        </p>
                    </motion.div>
                ))}
            </motion.div>
        </Section>
    );
};
