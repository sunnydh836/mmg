"use client";

import React from "react";
import { motion } from "framer-motion";
import { Section, SectionHeader } from "@/components/ui/Section";
import { staggerContainer, slideUp } from "@/lib/animations";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import * as LucideIcons from "lucide-react";

export interface ServiceItem {
    id: string;
    title: string;
    description: string;
    icon: string | null;
}

export const ServicesPreview = ({ services }: { services: ServiceItem[] }) => {
    return (
        <Section id="services" className="bg-background relative border-t border-border/50">
            <div className="flex flex-col md:flex-row gap-12 items-center">
                <div className="w-full md:w-1/3">
                    <SectionHeader
                        title="Our Services"
                        subtitle="More than just a store. We are a complete mobile service center."
                        className="mb-8"
                    />
                    <motion.div variants={slideUp} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                        <Link href="/services">
                            <Button variant="outline">View All Services</Button>
                        </Link>
                    </motion.div>
                </div>

                <div className="w-full md:w-2/3">
                    <motion.div
                        className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                    >
                        {services.map((service, idx) => {
                            const isImage = service.icon?.startsWith("/");
                            const IconComponent = !isImage && service.icon
                                ? (LucideIcons as any)[service.icon] || LucideIcons.Wrench
                                : LucideIcons.Wrench;

                            return (
                                <motion.div
                                    key={service.id || idx}
                                    variants={slideUp}
                                    className="p-6 rounded-2xl bg-secondary/30 hover:bg-secondary/60 border border-white/5 transition-colors group cursor-default"
                                >
                                    <div className="mb-4 bg-background w-12 h-12 rounded-full flex items-center justify-center border border-white/10 group-hover:border-accent/30 transition-colors">
                                        {isImage ? (
                                            <Image src={service.icon!} width={24} height={24} alt={service.title} />
                                        ) : (
                                            <IconComponent size={24} className="text-gray-300 group-hover:text-accent transition-colors" />
                                        )}
                                    </div>
                                    <h4 className="text-lg font-bold text-white mb-2">{service.title}</h4>
                                    <p className="text-gray-400 text-sm">{service.description}</p>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                </div>
            </div>
        </Section>
    );
};
