"use client";
import { getWhatsAppUrl } from "@/lib/settings";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Tag, Calendar } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { Offer } from "@prisma/client";
import { StoreSettings } from "@prisma/client";
import { formatOfferDateRange } from "@/lib/formatters";

interface OffersSectionProps {
    offers: (Offer & { id: string })[];
    settings: StoreSettings;
}

export function OffersSection({ offers, settings }: OffersSectionProps) {
    const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

    if (!offers || offers.length === 0) {
        return (
            <section className="bg-neutral-950 py-16 lg:py-24 border-b border-white/5 overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 flex flex-col items-center justify-center min-h-[300px]">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium mb-6">
                        <Tag className="w-4 h-4" />
                        <span>SPECIAL OFFERS</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 text-center">No current offers available</h3>
                    <p className="text-neutral-400 text-center">Check back later for new exclusive benefits.</p>
                </div>
            </section>
        );
    }

    return (
        <section className="bg-neutral-950 py-16 lg:py-24 border-b border-white/5 overflow-hidden">
            <div className="max-w-7xl mx-auto px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col items-center text-center space-y-4 mb-12"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-sm font-medium">
                        <Tag className="w-4 h-4" />
                        <span>SPECIAL OFFERS</span>
                    </div>
                    <p className="text-neutral-400 max-w-2xl text-lg">
                        Explore our latest store offers and exclusive benefits.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {offers.map((offer, index) => {
                        // Resolve CTA Link
                        let resolvedLink = offer.ctaLink || "";
                        if (resolvedLink.toLowerCase() === "whatsapp") {
                            resolvedLink = getWhatsAppUrl(settings, `Hi, I am inquiring about the ${offer.title} offer.`);
                        } else if (resolvedLink && !resolvedLink.startsWith("/") && !resolvedLink.startsWith("http")) {
                            resolvedLink = `/${resolvedLink}`;
                        }

                        return (
                            <motion.div
                                key={offer.id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true, margin: "-100px" }}
                                transition={{ duration: 0.5, delay: index * 0.1 }}
                                className="group relative bg-[#0F0F13] rounded-2xl overflow-hidden border border-white/5 hover:border-cyan-500/30 transition-all duration-500 shadow-2xl flex flex-col h-full hover:shadow-[0_0_30px_-5px_rgba(34,211,238,0.15)]"
                            >
                                {/* Image Area */}
                                {(offer.imageUrl || offer.badge) && (
                                    <div className="relative w-full aspect-[4/3] bg-neutral-900 overflow-hidden">
                                        {offer.imageUrl && (
                                            <div className="absolute inset-0">
                                                {failedImages[offer.id] ? (
                                                    <div className="w-full h-full bg-gradient-to-br from-slate-800 to-black flex items-center justify-center">
                                                        <Tag className="w-8 h-8 text-white/10" />
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Image
                                                            src={offer.imageUrl}
                                                            alt={offer.title}
                                                            fill
                                                            className="object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
                                                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                                            onError={() => setFailedImages(prev => ({ ...prev, [offer.id]: true }))}
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-[#0F0F13] to-transparent opacity-80" />
                                                    </>
                                                )}
                                            </div>
                                        )}

                                        {/* Badge overlay */}
                                        {offer.badge && (
                                            <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-cyan-500 text-neutral-950 text-xs font-bold tracking-wider rounded-md shadow-lg backdrop-blur-md">
                                                {offer.badge.toUpperCase()}
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Content Area */}
                                <div className="flex flex-col flex-1 p-6 relative z-10">
                                    <h3 className="text-xl font-bold text-white mb-2 leading-tight">
                                        {offer.title}
                                    </h3>

                                    {(offer.shortDescription || offer.description) && (
                                        <p className="text-neutral-400 text-sm mb-4 flex-1 line-clamp-3">
                                            {offer.shortDescription || offer.description}
                                        </p>
                                    )}

                                    {/* Date Row */}
                                    {(offer.startDate || offer.endDate) && (
                                        <div className="flex items-center gap-2 text-xs font-medium text-neutral-400 mb-6">
                                            <Calendar className="w-3.5 h-3.5 text-cyan-500/70" />
                                            <span>{formatOfferDateRange(offer.startDate, offer.endDate) || ''}</span>
                                        </div>
                                    )}

                                    {/* Action */}
                                    {offer.ctaText && resolvedLink && (
                                        <Link
                                            href={resolvedLink}
                                            {...(resolvedLink.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                                            className={`inline-flex items-center gap-2 text-cyan-400 hover:text-cyan-300 font-medium text-sm transition-colors group/btn ${!(offer.startDate || offer.endDate) ? "mt-auto" : ""}`}
                                        >
                                            {offer.ctaText}
                                            <ArrowRight className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
