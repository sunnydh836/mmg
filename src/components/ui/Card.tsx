"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";

export interface CardProps extends HTMLMotionProps<"div"> {
    children: React.ReactNode;
    className?: string;
    hoverEffect?: boolean;
    padding?: "none" | "sm" | "md" | "lg";
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ children, className = "", hoverEffect = false, padding = "none", ...props }, ref) => {

        const baseStyles = "bg-secondary rounded-xl border border-border overflow-hidden flex flex-col h-full w-full relative";
        const hoverStyles = hoverEffect ? "transition-all duration-300 hover:border-gray-500 hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:-translate-y-1" : "";

        let paddingStyles = "";
        if (padding === "sm") paddingStyles = "p-4";
        if (padding === "md") paddingStyles = "p-6";
        if (padding === "lg") paddingStyles = "p-8";

        return (
            <motion.div
                ref={ref}
                className={`${baseStyles} ${hoverStyles} ${paddingStyles} ${className}`}
                {...props}
            >
                {children}
            </motion.div>
        );
    }
);

Card.displayName = "Card";
