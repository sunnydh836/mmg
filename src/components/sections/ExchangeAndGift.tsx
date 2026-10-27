"use client";
import { getWhatsAppUrl, canExchangeOldPhones, areGiftsAvailable, type StoreSettingsType } from "@/lib/settings-shared";

import React from "react";
import { motion } from "framer-motion";
import { RefreshCw, Gift } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { slideUp } from "@/lib/animations";
import Link from "next/link";

export const ExchangeAndGiftSections = ({ settings }: { settings: Partial<StoreSettingsType> }) => {
    const showExchange = canExchangeOldPhones(settings);
    const showGifts = areGiftsAvailable(settings);

    if (!showExchange && !showGifts) return null;

    return (
        <Section id="offers" className="py-4 md:py-8 lg:py-12">
            <div className={`grid gap-6 ${showExchange && showGifts ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1 max-w-3xl mx-auto'}`}>

                {showExchange && (
                    <motion.div
                        className="bg-secondary/40 rounded-3xl p-8 md:p-12 border border-border relative overflow-hidden group"
                        variants={slideUp}
                    >
                        {/* Background element */}
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-accent/5 rounded-full blur-3xl group-hover:bg-accent/10 transition-colors duration-700" />

                        <div className="relative z-10">
                            <div className="mb-6 p-4 bg-background/80 rounded-2xl inline-block">
                                <RefreshCw className="text-accent" size={32} />
                            </div>
                            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                                Upgrade Your Phone.<br />Exchange Your Old One.
                            </h3>
                            <p className="text-gray-400 text-lg mb-8 max-w-md">
                                Get the best value for your existing device when you trade it in for a new smartphone in our store.
                            </p>
                            <Link href="/exchange">
                                <Button variant="outline" size="md">
                                    Start Exchange Enquiry
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                )}

                {showGifts && (
                    <motion.div
                        className="bg-secondary/40 rounded-3xl p-8 md:p-12 border border-border relative overflow-hidden group"
                        variants={slideUp}
                    >
                        {/* Background element */}
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-green-500/5 rounded-full blur-3xl group-hover:bg-green-500/10 transition-colors duration-700" />

                        <div className="relative z-10">
                            <div className="mb-6 p-4 bg-background/80 rounded-2xl inline-block">
                                <Gift className="text-green-500" size={32} />
                            </div>
                            <h3 className="text-3xl md:text-4xl font-bold mb-4 text-white">
                                Buy a Phone.<br />Get a Gift.
                            </h3>
                            <p className="text-gray-400 text-lg mb-8 max-w-md">
                                Gift benefits may be available with eligible mobile purchases. Ask in-store for current exclusive offers.
                            </p>
                            <a href={getWhatsAppUrl(settings, "Hi, I would like to know about the current gift offers on new mobile purchases.")} target="_blank" rel="noopener noreferrer">
                                <Button variant="secondary" size="md" className="hover:bg-green-900/30 hover:text-green-400 hover:border-green-600/50 transition-colors">
                                    Enquire Offers on WhatsApp
                                </Button>
                            </a>
                        </div>
                    </motion.div>
                )}

            </div>
        </Section>
    );
};
