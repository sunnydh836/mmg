"use client";

import React from "react";
import { motion } from "framer-motion";
import { Section } from "@/components/ui/Section";
import { slideUp, staggerContainer } from "@/lib/animations";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { MessageSquare, Phone, MapPin } from "lucide-react";
import { StoreSettings } from "@prisma/client";
import { getWhatsAppUrl } from "@/lib/settings-shared";

export function AboutCTA({ settings }: { settings: StoreSettings | null }) {
    if (!settings) return null;

    return (
        <Section className="bg-zinc-950/50 border-t border-white/5 py-16 md:py-24">
            <div className="max-w-4xl mx-auto text-center px-4 md:px-0">
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="flex flex-col items-center"
                >
                    <motion.h2
                        variants={slideUp}
                        className="text-3xl md:text-5xl font-bold tracking-tight mb-6 text-white"
                    >
                        Looking for a phone or need help?
                    </motion.h2>

                    <motion.p
                        variants={slideUp}
                        className="text-gray-400 text-base md:text-lg leading-relaxed font-light mb-10 max-w-xl"
                    >
                        Visit Mahadev Mobile Gallery or contact us on WhatsApp for your mobile needs.
                    </motion.p>

                    <motion.div variants={slideUp} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center">
                        <Link href={getWhatsAppUrl(settings)} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                            <Button variant="whatsapp" size="lg" className="w-full sm:w-auto flex items-center gap-2">
                                <MessageSquare size={20} />
                                WhatsApp Us
                            </Button>
                        </Link>
                        <Link href={`tel:+91${settings.phone}`} className="w-full sm:w-auto">
                            <Button variant="secondary" size="lg" className="w-full sm:w-auto flex items-center gap-2">
                                <Phone size={20} />
                                Call Us
                            </Button>
                        </Link>
                        <Link href={settings.mapsUrl} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                            <Button variant="outline" size="lg" className="w-full sm:w-auto flex items-center gap-2">
                                <MapPin size={20} />
                                Get Directions
                            </Button>
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
        </Section>
    );
}
