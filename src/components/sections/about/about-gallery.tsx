"use client";

import React from "react";
import { motion } from "framer-motion";
import { Section, SectionHeader } from "@/components/ui/Section";
import { slideUp, staggerContainer } from "@/lib/animations";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Camera } from "lucide-react";

interface GalleryItem {
    id: string;
    imageUrl: string;
}

export function AboutGallery({ images }: { images: GalleryItem[] }) {
    return (
        <Section className="bg-zinc-950/50 border-t border-white/5 py-16 md:py-24">
            <div className="max-w-6xl mx-auto flex flex-col items-center">
                <SectionHeader
                    title="A Glimpse of Our Store"
                    className="text-center w-full mb-12"
                />

                {images && images.length > 0 ? (
                    <motion.div
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-12"
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true, margin: "-50px" }}
                    >
                        {images.slice(0, 3).map((img, idx) => (
                            <motion.div
                                key={img.id}
                                variants={slideUp}
                                className={`relative aspect-square md:aspect-[4/5] rounded-2xl overflow-hidden bg-secondary border border-white/10 group ${idx === 1 ? 'md:translate-y-8' : ''}`}
                            >
                                <Image
                                    src={img.imageUrl}
                                    alt="Mahadev Mobile Gallery Store"
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                                    sizes="(max-width: 768px) 100vw, 33vw"
                                />
                                <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500" />
                            </motion.div>
                        ))}
                    </motion.div>
                ) : (
                    <motion.div
                        variants={slideUp}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="w-full max-w-3xl aspect-video rounded-3xl bg-zinc-900 border border-white/10 flex flex-col items-center justify-center mb-12 p-6"
                    >
                        <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                            <Camera className="w-8 h-8 text-neutral-500" />
                        </div>
                        <h3 className="text-xl font-medium text-white mb-2">Premium visuals coming soon</h3>
                        <p className="text-neutral-400 text-center">We're updating our gallery to showcase our store.</p>
                    </motion.div>
                )}

                <motion.div
                    variants={slideUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <Link href="/gallery">
                        <Button variant="outline" size="lg">View Gallery</Button>
                    </Link>
                </motion.div>
            </div>
        </Section>
    );
}
