"use client";

import React from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { staggerContainer, slideUp } from "@/lib/animations";

export interface SectionProps extends HTMLMotionProps<"section"> {
    children: React.ReactNode;
    id?: string;
    className?: string;
    contained?: boolean;
}

export const Section = ({
    children,
    id,
    className = "",
    contained = true,
    ...props
}: SectionProps) => {
    return (
        <motion.section
            id={id}
            className={`py-16 md:py-24 lg:py-[100px] ${className}`}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            {...props}
        >
            <div className={contained ? "container" : ""}>
                {children}
            </div>
        </motion.section>
    );
};

export const SectionHeader = ({
    title,
    subtitle,
    className = "",
}: {
    title: string;
    subtitle?: string;
    className?: string;
}) => (
    <motion.div className={`mb-12 md:mb-16 ${className}`} variants={slideUp}>
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">
            {title}
        </h2>
        {subtitle && (
            <p className="text-gray-400 text-lg md:text-xl max-w-2xl">
                {subtitle}
            </p>
        )}
    </motion.div>
);
