"use client";
import React, { useState } from "react";
import Image from "next/image";

export function OptimizedProductImage({
    src,
    alt,
    placeholderId,
    className = ""
}: {
    src?: string,
    alt: string,
    placeholderId: number,
    className?: string
}) {
    const [imgError, setImgError] = useState(false);

    const hasRealImage = src && !imgError;

    if (!hasRealImage) {
        const gradients = [
            "from-slate-700 to-slate-900",
            "from-blue-900 to-slate-900",
            "from-zinc-700 to-zinc-900",
            "from-slate-800 to-zinc-800",
            "from-gray-700 to-gray-900",
            "from-slate-700 to-black"
        ];
        const bgClass = gradients[placeholderId % gradients.length];

        return (
            <div className={`w-full h-full bg-gradient-to-br ${bgClass} flex items-center justify-center relative overflow-hidden ${className}`}>
                <div className="absolute inset-x-0 bottom-0 top-10 mx-auto w-2/3 bg-black rounded-t-3xl border-t-4 border-l-[3px] border-r-[3px] border-gray-700 block shadow-2xl relative" />
                <span className="absolute text-sm font-medium text-gray-400 opacity-50 tracking-widest uppercase z-10">
                    No Image
                </span>
            </div>
        );
    }

    return (
        <div className={`relative w-full h-full overflow-hidden ${className}`}>
            <Image
                src={src}
                alt={alt}
                fill
                sizes="(max-width: 768px) 50vw, (max-width: 1280px) 25vw, 20vw"
                className="object-contain"
                onError={() => setImgError(true)}
            />
        </div>
    );
}
