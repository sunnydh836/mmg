"use client";

import React from "react";
import { motion } from "framer-motion";
import { Camera, Play } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { staggerContainer, slideUp } from "@/lib/animations";

interface Reel {
    id: string;
    title: string | null;
    reelUrl: string;
    thumbnailUrl: string | null;
}

export const InstagramGallery = ({ reels, settings }: { reels?: Reel[], settings: any }) => {
    // Determine the reels to display: fallback to empty if nothing works
    const activeReels = reels || [];
    const hasReels = activeReels.length > 0;
    const instagramHandle = settings.instagram ? `@${settings.instagram.split('/').pop()}` : "@mmgpartapur";

    return (
        <Section id="instagram" className="bg-secondary/10">
            <div className="flex flex-col items-center text-center mb-16">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    className="w-16 h-16 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-purple-500/20"
                >
                    <Camera size={32} className="text-white" />
                </motion.div>

                <motion.h2
                    variants={slideUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="text-3xl md:text-5xl font-bold mb-4 text-white"
                >
                    Join Our Community
                </motion.h2>

                <motion.p
                    variants={slideUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="text-gray-400 mb-8 max-w-lg"
                >
                    Follow <span className="text-white font-medium">{instagramHandle}</span> on Instagram. Join our community of {settings.instagramFollowers}
                </motion.p>

                <motion.a
                    href={settings.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    variants={slideUp}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                >
                    <Button variant="secondary" className="px-8 font-semibold tracking-wide">
                        Follow on Instagram
                    </Button>
                </motion.a>
            </div>

            {hasReels && (
                <motion.div
                    className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6"
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {activeReels.slice(0, 4).map((reel) => (
                        <motion.a
                            key={reel.id}
                            href={reel.reelUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            variants={slideUp}
                            className="group block relative aspect-[9/16] md:aspect-[4/5] rounded-2xl overflow-hidden bg-background border border-border"
                        >
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10 opacity-40 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                                <div className="flex items-center text-white font-medium text-sm">
                                    <Play size={16} className="mr-2" />
                                    Watch Reel
                                </div>
                                {reel.title && (
                                    <div className="text-white text-xs mt-1 truncate opacity-80">{reel.title}</div>
                                )}
                            </div>

                            {reel.thumbnailUrl ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img
                                    src={reel.thumbnailUrl}
                                    alt={reel.title || "Instagram Reel"}
                                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                />
                            ) : (
                                <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/40 to-pink-900/40 flex items-center justify-center p-6 group-hover:scale-105 transition-transform duration-700">
                                    <div className="text-center">
                                        <Camera size={48} className="mx-auto mb-2 text-white/50" />
                                        <span className="text-white/70 text-xs tracking-widest font-medium">INSTAGRAM REEL</span>
                                        <div className="text-white/50 text-xs mt-2">{instagramHandle}</div>
                                    </div>
                                </div>
                            )}
                        </motion.a>
                    ))}
                </motion.div>
            )}
        </Section>
    );
};
