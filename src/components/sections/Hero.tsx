"use client";
import { getWhatsAppUrl, isWhatsAppEnabled } from "@/lib/settings";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { slideUp, staggerContainer } from "@/lib/animations";
import { ChevronRight, ArrowLeft, ArrowRight, Camera } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeroImage {
    id: string;
    imageUrl: string;
}

import { StoreSettings } from "@prisma/client";

export const HeroSection = ({ heroImages = [], settings }: { heroImages?: HeroImage[], settings: StoreSettings }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});
    const router = useRouter();

    // Revalidate data when switching back to this tab
    useEffect(() => {
        const onFocus = () => {
            router.refresh();
        };
        window.addEventListener("focus", onFocus);
        return () => window.removeEventListener("focus", onFocus);
    }, [router]);

    const nextImage = useCallback(() => {
        if (heroImages.length <= 1) return;
        setCurrentIndex((prev) => (prev + 1) % heroImages.length);
    }, [heroImages.length]);

    const prevImage = useCallback(() => {
        if (heroImages.length <= 1) return;
        setCurrentIndex((prev) => (prev - 1 + heroImages.length) % heroImages.length);
    }, [heroImages.length]);

    // Auto-rotation 5s
    useEffect(() => {
        if (heroImages.length > 1 && !isHovered) {
            const timer = setInterval(nextImage, 5000);
            return () => clearInterval(timer);
        }
    }, [heroImages.length, isHovered, nextImage]);

    // Handle touch/swipe using native events on a wrapper
    const [touchStart, setTouchStart] = useState<number | null>(null);
    const [touchEnd, setTouchEnd] = useState<number | null>(null);

    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe) {
            nextImage();
        }
        if (isRightSwipe) {
            prevImage();
        }
    };

    return (
        <section className="relative min-h-[90vh] flex items-center pt-24 pb-12 overflow-hidden bg-[#09090b]">
            <div className="absolute inset-0 z-0 pointer-events-none">
                <div className="absolute top-[10%] p-[20%] right-0 bg-blue-600/5 rounded-full blur-[150px] opacity-70" />
                <div className="absolute bottom-[20%] left-[-10%] p-[30%] bg-zinc-600/10 rounded-full blur-[180px] opacity-50" />
                <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.02]" />
            </div>

            <div className="container mx-auto px-6 md:px-8 max-w-7xl relative z-10 flex border-t border-transparent h-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center w-full">

                    {/* Left Content */}
                    <motion.div
                        className="flex flex-col items-start text-left max-w-2xl py-10"
                        variants={staggerContainer}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={slideUp} className="mb-6">
                            <span className="text-gray-400 text-xs sm:text-sm font-semibold tracking-[0.2em] uppercase">
                                WELCOME TO {settings.businessName.toUpperCase()}
                            </span>
                        </motion.div>

                        <motion.h1
                            variants={slideUp}
                            className="text-4xl md:text-5xl lg:text-[4.5rem] font-bold tracking-tight mb-8 leading-[1.05] text-white"
                        >
                            Your Next Phone <br />
                            <span className="text-gray-500">
                                Is Waiting.
                            </span>
                        </motion.h1>

                        <motion.p
                            variants={slideUp}
                            className="text-lg sm:text-xl text-gray-400 mb-10 leading-relaxed font-light max-w-xl"
                        >
                            Smartphones, accessories, repairing and phone exchange — all under one roof.
                        </motion.p>

                        <motion.div variants={slideUp} className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto items-start">
                            <Link href="/products" className="w-full sm:w-auto">
                                <Button variant="primary" size="lg" className="w-full sm:w-auto font-semibold px-8 tracking-wide">
                                    Explore Phones
                                </Button>
                            </Link>
                            {isWhatsAppEnabled(settings) && (
                                <Link href={getWhatsAppUrl(settings)} target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto">
                                    <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold px-8 tracking-wide">
                                        WhatsApp Us
                                    </Button>
                                </Link>
                            )}
                        </motion.div>

                        <motion.div variants={slideUp} className="mt-12">
                            <a
                                href="#location"
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById('location')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                className="text-sm font-semibold text-gray-500 hover:text-white flex items-center transition-colors group tracking-wide uppercase"
                            >
                                <span>Get Directions</span>
                                <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-transform" />
                            </a>
                        </motion.div>
                    </motion.div>

                    {/* Right Content - Image Carousel */}
                    <div
                        className="w-full h-full min-h-[400px] lg:min-h-[500px] relative mt-10 lg:mt-0 flex flex-col items-center justify-center overflow-visible"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        {heroImages.length === 0 ? (
                            // Placeholder State
                            <motion.div
                                className="relative w-full max-w-md aspect-[4/3] rounded-[2rem] bg-gradient-to-br from-zinc-900 to-black overflow-hidden flex flex-col items-center justify-center border border-white/10 shadow-2xl shadow-black/80 p-6"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            >
                                <div className="absolute top-0 inset-x-0 h-[40%] bg-gradient-to-b from-blue-600/10 to-transparent" />
                                <div className="relative z-10 w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-md mb-6">
                                    <Camera className="w-8 h-8 text-white/40" />
                                </div>
                                <h3 className="text-xl font-bold text-white relative z-10 text-center tracking-wide">
                                    {settings.displayName || settings.businessName}
                                </h3>
                                <p className="text-sm text-neutral-500 mt-2 relative z-10 text-center">
                                    Premium visuals coming soon.
                                </p>
                            </motion.div>
                        ) : (
                            // Active Carousel State
                            <div className="relative w-full flex items-center justify-center h-[300px] sm:h-[350px] md:h-[450px]">
                                <AnimatePresence initial={false}>
                                    {heroImages.map((img, i) => {
                                        // Calculate positions relative to center
                                        let offset = i - currentIndex;
                                        if (offset < -1 && offset + heroImages.length <= 1) {
                                            offset += heroImages.length;
                                        } else if (offset > 1 && offset - heroImages.length >= -1) {
                                            offset -= heroImages.length;
                                        }

                                        // Only show center and direct neighbors
                                        if (offset < -1 || offset > 1) return null;

                                        // Specific positioning for 2 images
                                        if (heroImages.length === 2 && offset === 1) {
                                            // Make the second image always the right offset
                                            offset = 1;
                                        }

                                        const isActive = offset === 0;

                                        let xPos = 0;
                                        if (offset === -1) xPos = -45;
                                        if (offset === 1) xPos = 45;

                                        let zIndex = isActive ? 30 : 20;
                                        let scale = isActive ? 1.05 : 0.85;
                                        let opacity = isActive ? 1 : 0.6;

                                        // For single image
                                        if (heroImages.length === 1) {
                                            xPos = 0;
                                            scale = 1.05;
                                            opacity = 1;
                                            zIndex = 30;
                                        }

                                        return (
                                            <motion.div
                                                key={img.id}
                                                className="absolute rounded-[2rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10 bg-zinc-900 cursor-pointer"
                                                style={{
                                                    width: "100%",
                                                    maxWidth: "380px",
                                                    aspectRatio: "4/5",
                                                }}
                                                initial={false}
                                                animate={{
                                                    x: `${xPos}%`,
                                                    scale: scale,
                                                    opacity: opacity,
                                                    zIndex: zIndex,
                                                }}
                                                transition={{
                                                    type: "spring",
                                                    stiffness: 260,
                                                    damping: 20
                                                }}
                                                onClick={() => {
                                                    if (offset === -1) prevImage();
                                                    if (offset === 1) nextImage();
                                                }}
                                            >
                                                {failedImages[img.id] ? (
                                                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-black flex items-center justify-center">
                                                        <Camera className="w-8 h-8 text-white/20" />
                                                    </div>
                                                ) : (
                                                    <Image
                                                        src={img.imageUrl}
                                                        alt={`${settings.businessName} showroom`}
                                                        fill
                                                        className="object-cover"
                                                        sizes="(max-width: 768px) 100vw, 400px"
                                                        priority={isActive}
                                                        onError={() => setFailedImages(prev => ({ ...prev, [img.id]: true }))}
                                                    />
                                                )}
                                                <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors" />
                                            </motion.div>
                                        );
                                    })}
                                </AnimatePresence>
                            </div>
                        )}

                        {/* Controls */}
                        {heroImages.length > 1 && (
                            <div className="flex gap-4 mt-8 z-40">
                                <button
                                    onClick={prevImage}
                                    className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white backdrop-blur transition-colors"
                                    aria-label="Previous hero image"
                                >
                                    <ArrowLeft className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="p-3 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white backdrop-blur transition-colors"
                                    aria-label="Next hero image"
                                >
                                    <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
