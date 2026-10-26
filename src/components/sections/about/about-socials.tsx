"use client";

import React from "react";
import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { slideUp, staggerContainer } from "@/lib/animations";
import Link from "next/link";
import { StoreSettings } from "@prisma/client";

export function AboutSocials({ settings }: { settings: StoreSettings | null }) {
    if (!settings) return null;

    const instagramHandle = settings.instagram ? `@${settings.instagram.split('/').pop()}` : "";
    const youtubeHandle = settings.youtube ? `@${settings.youtube.split('@').pop()}` : "";

    const InstagramIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
    );

    const YoutubeIcon = () => (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
    );

    return (
        <Section className="bg-background pt-0 pb-16 md:pb-24">
            <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-50px" }}
                >
                    <motion.div variants={slideUp} className="mb-8">
                        <span className="text-gray-500 text-sm font-semibold tracking-[0.2em] uppercase">
                            FOLLOW {settings.displayName || settings.businessName}
                        </span>
                    </motion.div>

                    <motion.div variants={slideUp} className="flex flex-col sm:flex-row gap-6 items-center justify-center">
                        {settings.instagram && (
                            <Link href={settings.instagram} target="_blank" rel="noopener noreferrer" className="group">
                                <div className="flex items-center space-x-3 p-4 rounded-xl border border-white/5 bg-secondary/20 hover:bg-white/5 hover:border-white/20 transition-all">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-500 flex items-center justify-center">
                                        <InstagramIcon />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-white font-medium group-hover:text-pink-400 transition-colors">Instagram</div>
                                        <div className="text-gray-400 text-sm">{instagramHandle}</div>
                                    </div>
                                </div>
                            </Link>
                        )}

                        {settings.youtube && (
                            <Link href={settings.youtube} target="_blank" rel="noopener noreferrer" className="group">
                                <div className="flex items-center space-x-3 p-4 rounded-xl border border-white/5 bg-secondary/20 hover:bg-white/5 hover:border-white/20 transition-all">
                                    <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center">
                                        <YoutubeIcon />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-white font-medium group-hover:text-red-400 transition-colors">YouTube</div>
                                        <div className="text-gray-400 text-sm">{youtubeHandle}</div>
                                    </div>
                                </div>
                            </Link>
                        )}
                    </motion.div>
                </motion.div>
            </div>
        </Section>
    );
}
