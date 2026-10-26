"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { hoverScale } from "@/lib/animations";

export interface ButtonProps extends HTMLMotionProps<"button"> {
    variant?: "primary" | "secondary" | "ghost" | "whatsapp" | "outline";
    size?: "sm" | "md" | "lg";
    children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {

        let variantStyles = "";
        if (variant === "primary") {
            variantStyles = "bg-accent text-white border border-transparent hover:bg-accent-dark hover:shadow-md active:bg-accent focus-visible:ring-accent";
        } else if (variant === "secondary") {
            variantStyles = "bg-secondary text-white border border-border hover:bg-[#252525] hover:border-gray-500 active:bg-border focus-visible:ring-gray-300";
        } else if (variant === "outline") {
            variantStyles = "bg-transparent text-white border border-gray-600 hover:bg-white/10 active:bg-white/20 focus-visible:ring-gray-400";
        } else if (variant === "ghost") {
            variantStyles = "bg-transparent text-gray-300 border border-transparent hover:text-white hover:bg-white/5 active:bg-white/10 focus-visible:ring-gray-400";
        } else if (variant === "whatsapp") {
            variantStyles = "bg-[#25D366] text-white border border-transparent hover:bg-[#20bd5a] hover:shadow-md active:bg-[#1da851] focus-visible:ring-[#25D366]";
        }

        let sizeStyles = "";
        if (size === "sm") {
            sizeStyles = "h-9 px-4 text-sm";
        } else if (size === "md") {
            sizeStyles = "h-11 px-6 text-base";
        } else if (size === "lg") {
            sizeStyles = "h-14 px-8 text-lg font-medium";
        }

        const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:opacity-50 disabled:pointer-events-none";

        return (
            <motion.button
                ref={ref}
                className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
                variants={hoverScale}
                whileHover="whileHover"
                whileTap="whileTap"
                {...props}
            >
                {children}
            </motion.button>
        );
    }
);

Button.displayName = "Button";
