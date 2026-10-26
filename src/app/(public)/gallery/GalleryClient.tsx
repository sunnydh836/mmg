"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Camera } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";

interface GalleryImage {
    id: string;
    imageUrl: string;
    title: string | null;
    category: string;
    displayOrder: number;
}

const CATEGORIES = ["ALL", "STORE", "PHONES", "ACCESSORIES", "EVENTS"];

import { StoreSettings } from "@prisma/client";

export function GalleryClient({ images, settings }: { images: GalleryImage[], settings: StoreSettings }) {
    const [selectedCategory, setSelectedCategory] = useState("ALL");
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

    const filteredImages = selectedCategory === "ALL"
        ? images
        : images.filter(img => img.category === selectedCategory);

    // Keyboard navigation for lightbox
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (lightboxIndex === null) return;
        if (e.key === "Escape") setLightboxIndex(null);
        if (e.key === "ArrowLeft") {
            setLightboxIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : filteredImages.length - 1));
        }
        if (e.key === "ArrowRight") {
            setLightboxIndex((prev) => (prev !== null && prev < filteredImages.length - 1 ? prev + 1 : 0));
        }
    }, [lightboxIndex, filteredImages.length]);

    useEffect(() => {
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [handleKeyDown]);

    // Prevent scrolling when lightbox is open
    useEffect(() => {
        if (lightboxIndex !== null) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => { document.body.style.overflow = "unset"; };
    }, [lightboxIndex]);

    const handleNext = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (lightboxIndex !== null) {
            setLightboxIndex(lightboxIndex < filteredImages.length - 1 ? lightboxIndex + 1 : 0);
        }
    };

    const handlePrev = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (lightboxIndex !== null) {
            setLightboxIndex(lightboxIndex > 0 ? lightboxIndex - 1 : filteredImages.length - 1);
        }
    };

    return (
        <div className="flex flex-col w-full min-h-[50vh]">

            {/* Category Filter */}
            <div className="container mx-auto px-4 md:px-6 max-w-7xl mb-8">
                <div className="flex overflow-x-auto pb-4 gap-2 md:justify-center scrollbar-hide snap-x">
                    {CATEGORIES.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`snap-center px-4 py-2 rounded-full text-sm font-medium tracking-wide transition-all whitespace-nowrap
                                ${selectedCategory === category
                                    ? "bg-white text-black shadow-lg shadow-white/10"
                                    : "bg-white/5 text-neutral-400 hover:bg-white/10 hover:text-white"
                                }
                            `}
                        >
                            {category.charAt(0) + category.slice(1).toLowerCase()}
                        </button>
                    ))}
                </div>
            </div>

            {/* Gallery Grid */}
            <div className="container mx-auto px-4 md:px-6 max-w-7xl">
                {filteredImages.length > 0 ? (
                    <motion.div
                        layout
                        className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6"
                    >
                        <AnimatePresence>
                            {filteredImages.map((image, idx) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.3 }}
                                    key={image.id}
                                    className="relative break-inside-avoid rounded-2xl overflow-hidden cursor-zoom-in group bg-neutral-900 border border-white/5"
                                    onClick={() => setLightboxIndex(idx)}
                                >
                                    <div className="relative w-full overflow-hidden" style={{ paddingTop: '100%' /* square aspect as fallback */ }}>
                                        <Image
                                            src={image.imageUrl}
                                            alt={image.title || "Gallery photo"}
                                            fill
                                            className="object-cover transition-transform duration-700 group-hover:scale-105"
                                            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
                                        />
                                    </div>
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                                        <div className="text-white">
                                            {image.title && <p className="font-medium text-sm drop-shadow-md">{image.title}</p>}
                                            <p className="text-xs text-white/70 mt-1 uppercase tracking-wider">{image.category}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-neutral-900/30 rounded-3xl border border-white/5 border-dashed">
                        <Camera className="w-12 h-12 text-neutral-600 mb-4" />
                        <h3 className="text-xl font-medium text-white mb-2">Gallery coming soon</h3>
                        <p className="text-neutral-400 text-center max-w-md">
                            {selectedCategory === "ALL"
                                ? `More moments from ${settings.businessName} will appear here.`
                                : `No photos available in the ${selectedCategory.toLowerCase()} category yet.`
                            }
                        </p>
                    </div>
                )}
            </div>

            {/* Lightbox */}
            <AnimatePresence>
                {lightboxIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center"
                        onClick={() => setLightboxIndex(null)}
                    >
                        <button
                            className="absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-[110]"
                            onClick={(e) => { e.stopPropagation(); setLightboxIndex(null); }}
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <button
                            className="absolute left-4 md:left-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-[110] hidden sm:block"
                            onClick={handlePrev}
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        <button
                            className="absolute right-4 md:right-8 top-1/2 -translate-y-1/2 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors z-[110] hidden sm:block"
                            onClick={handleNext}
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>

                        <div className="relative w-full max-w-5xl h-[80vh] px-4 md:px-16" onClick={(e) => e.stopPropagation()}>
                            <Image
                                src={filteredImages[lightboxIndex].imageUrl}
                                alt={filteredImages[lightboxIndex].title || "Gallery fullscreen viewer"}
                                fill
                                className="object-contain"
                                sizes="100vw"
                                priority
                            />
                            {filteredImages[lightboxIndex].title && (
                                <div className="absolute bottom-[-40px] left-0 right-0 text-center">
                                    <p className="text-white font-medium">{filteredImages[lightboxIndex].title}</p>
                                </div>
                            )}
                        </div>

                        {/* Mobile Swipe / Controls Hint could be added, but native scroll works with object-contain */}
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
