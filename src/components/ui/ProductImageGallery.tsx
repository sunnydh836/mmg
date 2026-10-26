"use client";
import React, { useState } from "react";
import { OptimizedProductImage } from "./OptimizedProductImage";

export function ProductImageGallery({
    images,
    name,
    placeholderId,
    type,
    isDemo
}: {
    images: string[],
    name: string,
    placeholderId: number,
    type: string,
    isDemo: boolean
}) {
    const [activeIndex, setActiveIndex] = useState(0);
    const hasMultiple = images && images.length > 1;

    return (
        <div className="flex flex-col gap-4 w-full">
            <div className="relative aspect-[4/5] md:aspect-square rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/5">
                <OptimizedProductImage
                    src={images?.[activeIndex]}
                    alt={`${name} - Image ${activeIndex + 1}`}
                    placeholderId={placeholderId}
                />

                <div className="absolute top-6 right-6 flex flex-col gap-2 z-10">
                    {type !== 'NEW' && (
                        <div className="bg-black/80 backdrop-blur-md px-4 py-1.5 rounded-full text-[11px] font-bold text-white border border-white/20 tracking-wider shadow-lg">
                            {type}
                        </div>
                    )}
                    {isDemo && (
                        <div className="bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full text-[11px] font-bold text-white border border-white/10 tracking-widest shadow-lg uppercase self-end">
                            DEMO
                        </div>
                    )}
                </div>
            </div>

            {hasMultiple && (
                <div className="flex overflow-x-auto snap-x pb-2 gap-3 mt-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                    {images.map((img, index) => (
                        <button
                            key={index}
                            onClick={() => setActiveIndex(index)}
                            className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 snap-start rounded-xl overflow-hidden border-2 transition-all ${activeIndex === index ? 'border-accent shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'border-white/10 hover:border-white/30 opacity-60 hover:opacity-100'
                                }`}
                        >
                            <OptimizedProductImage
                                src={img}
                                alt={`Thumbnail ${index + 1}`}
                                placeholderId={placeholderId}
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
