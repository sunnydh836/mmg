"use client";
import { getWhatsAppUrl } from "@/lib/settings";

import React from "react";
import { motion } from "framer-motion";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { OptimizedProductImage } from "@/components/ui/OptimizedProductImage";
import { staggerContainer, slideUp } from "@/lib/animations";
import { Product } from "@/types/product";
import Link from "next/link";



export const ProductCard = ({ product, whatsappNumber, isWhatsAppEnabled }: { product: Product, whatsappNumber: string, isWhatsAppEnabled: boolean }) => {
    const whatsappMessage = encodeURIComponent(`Hi, I'm interested in the ${product.name} listed on your website. Please share the price and availability.`);

    return (
        <Card hoverEffect className="group flex flex-col h-full bg-[#0a0a0c] border border-white/10 hover:border-accent/40 rounded-2xl overflow-hidden transition-all duration-500">
            <Link href={`/products/${product.slug}`} className="block overflow-hidden relative bg-gradient-to-b from-zinc-900/80 to-[#0a0a0c] aspect-[4/5] flex items-center justify-center border-b border-white/5 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent group/image">
                <OptimizedProductImage
                    src={product.images?.[0]}
                    alt={product.name}
                    placeholderId={product.imagePlaceholderId}
                    className="group-hover:scale-105 transition-transform duration-500"
                />

                {/* Badges */}
                <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
                    {product.type !== 'NEW' && (
                        <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-white border border-white/20 tracking-wider shadow-lg">
                            {product.type}
                        </div>
                    )}
                    <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-bold text-white border border-white/10 tracking-widest shadow-lg uppercase self-end">
                        DEMO
                    </div>
                </div>
            </Link>

            <div className="p-3 sm:p-5 md:p-8 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-1 md:mb-2">
                    <div className="text-gray-400 text-[10px] md:text-xs font-semibold uppercase tracking-[0.2em] truncate">
                        {product.brand}
                    </div>
                </div>

                <h3 className="text-base sm:text-lg md:text-2xl font-bold text-white mb-3 md:mb-6 leading-tight group-hover:text-accent transition-colors line-clamp-2 flex-grow">
                    {product.name}
                </h3>

                {product.type !== 'NEW' && product.preOwnedCondition && (
                    <div className="mb-6 flex items-center">
                        <span className="w-2 h-2 rounded-full bg-green-500 mr-2 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
                        <span className="text-xs text-gray-400 uppercase tracking-widest font-medium">Condition: {product.preOwnedCondition}</span>
                    </div>
                )}

                <div className="pt-3 md:pt-5 border-t border-white/5 flex flex-col gap-3 md:gap-4">
                    <div className="flex flex-col">
                        {product.price === null ? (
                            <>
                                <span className="text-sm sm:text-base md:text-lg font-bold text-white mb-0.5 md:mb-1 truncate">
                                    Price on Enquiry
                                </span>
                                <span className="text-[9px] md:text-[11px] text-gray-500 uppercase tracking-widest font-medium truncate">
                                    Check availability
                                </span>
                            </>
                        ) : (
                            <>
                                <div className="flex items-baseline gap-1 md:gap-2 mb-0.5 md:mb-1 flex-wrap">
                                    <span className="text-base sm:text-lg md:text-xl font-bold text-white">
                                        ₹{product.price.toLocaleString('en-IN')}
                                    </span>
                                    {product.mrp && product.mrp > product.price && (
                                        <span className="text-[10px] md:text-sm text-gray-500 line-through mb-[2px]">
                                            ₹{product.mrp.toLocaleString('en-IN')}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[9px] md:text-[11px] text-gray-500 uppercase tracking-widest font-medium truncate">
                                    {product.availability || "In Stock"}
                                </span>
                            </>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 mt-1 md:mt-2">
                        <Link href={`/products/${product.slug}`} className="w-full">
                            <Button variant="secondary" className="w-full text-xs md:text-sm font-semibold tracking-wide py-2 md:py-3 bg-white/5 hover:bg-white/15 border border-white/10" size="sm">
                                View Details
                            </Button>
                        </Link>
                        {isWhatsAppEnabled && (
                            <a href={getWhatsAppUrl({ whatsapp: whatsappNumber }, whatsappMessage)} target="_blank" rel="noopener noreferrer" className="w-full">
                                <Button variant="whatsapp" className="w-full text-xs md:text-sm font-semibold tracking-wide py-2 md:py-3 border border-[#25D366]/30 shadow-[0_0_15px_rgba(37,211,102,0.15)] hover:shadow-[0_0_20px_rgba(37,211,102,0.3)]" size="sm">
                                    WhatsApp
                                </Button>
                            </a>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
};

export const FeaturedProductsSection = ({ products, whatsappNumber, isWhatsAppEnabled }: { products: Product[], whatsappNumber: string, isWhatsAppEnabled: boolean }) => {
    return (
        <Section id="featured-products">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12">
                <SectionHeader
                    title="Featured Devices"
                    subtitle="Explore our handpicked selection of premium smartphones."
                    className="mb-0"
                />
                <motion.div variants={slideUp} className="mt-6 md:mt-0">
                    <Link href="/products" className="text-accent hover:text-white transition-colors flex items-center font-medium">
                        View All Collection
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
