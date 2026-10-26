"use client";

import React from "react";
import { motion } from "framer-motion";
import { Section, SectionHeader } from "@/components/ui/Section";
import { staggerContainer, slideUp } from "@/lib/animations";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import * as LucideIcons from "lucide-react";
import { ServiceItem } from "@/components/sections/Services";

export function AboutServices({ services }: { services: ServiceItem[] }) {
    if (!services || services.length === 0) return null;

    return (
        <Section className="bg-background">
            <div className="flex flex-col items-center">
                <SectionHeader
                    title="What You Can Find Here"
                    className="text-center w-full mb-12"
                />

                <motion.div
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                >
                    {services.map((service, idx) => {
                        const isImage = service.icon?.startsWith("/");
                        // @ts-ignore
                        const IconComponent = !isImage && service.icon ? LucideIcons[service.icon] || LucideIcons.CheckCircle : LucideIcons.CheckCircle;

                        return (
                            <motion.div
                                key={service.id || idx}
                                variants={slideUp}
                                className="p-6 rounded-2xl bg-secondary/30 hover:bg-secondary/60 border border-white/5 transition-colors group cursor-default flex flex-col items-center text-center"
                            >
                                <div className="mb-4 bg-background w-14 h-14 rounded-full flex items-center justify-center border border-white/10 group-hover:border-accent/30 transition-colors">
                                    {isImage ? (
                                        <Image src={service.icon!} width={28} height={28} alt={service.title} />
                                    ) : (
                                        <IconComponent size={28} className="text-gray-300 group-hover:text-accent transition-colors" />
                                    )}
                                </div>
                                <h4 className="text-lg font-bold text-white mb-2">{service.title}</h4>
                                <p className="text-gray-400 text-sm hidden sm:block">{service.description}</p>
                            </motion.div>
                        );
                    })}
                </motion.div>

                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="mt-12"
                >
                    <motion.div variants={slideUp}>
                        <Link href="/services">
                            <Button variant="outline" size="lg">View All Services</Button>
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </Section>
    );
}
