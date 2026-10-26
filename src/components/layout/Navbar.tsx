"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface NavbarProps {
    brandName: string;
    whatsappUrl: string;
    logoUrl?: string | null;
    isWhatsAppEnabled: boolean;
    canExchangeOldPhones: boolean;
    canSellUsedRefurbished: boolean;
}

const navLinks = [
    { name: "Home", href: "/" },
    { name: "Products", href: "/products" },
    { name: "Services", href: "/services" },
    { name: "Exchange", href: "/exchange" },
    { name: "Gallery", href: "/gallery" },
    { name: "About", href: "/about" },
];

export const Navbar = ({ brandName, whatsappUrl, logoUrl, isWhatsAppEnabled, canExchangeOldPhones, canSellUsedRefurbished }: NavbarProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);
    const [logoFailed, setLogoFailed] = useState(false);
    const pathname = usePathname();

    // Split the brand name to create the premium visual hierarchy (MAHADEV vs MOBILE GALLERY)
    const nameParts = brandName.split(' ');
    const firstWord = nameParts[0];
    const restWords = nameParts.slice(1).join(' ');

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 15);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu on route change
    useEffect(() => {
        setTimeout(() => setIsOpen(false), 0);
    }, [pathname]);

    return (
        <header
            className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ease-in-out ${scrolled
                ? "bg-[#09090b]/90 backdrop-blur-xl border-b border-white/5 py-4 shadow-sm"
                : "bg-gradient-to-b from-black/80 to-transparent py-5"
                }`}
        >
            <nav className="container">
                <div className="flex items-center justify-between gap-6">

                    {/* LEFT: Logo / Brand */}
                    <div className="flex-shrink-0 z-50">
                        <Link href="/" className="flex items-center gap-3 group focus:outline-none">
                            {logoUrl && !logoFailed && (
                                <div className="relative w-[34px] h-[34px] md:w-[44px] md:h-[44px] shrink-0 flex items-center justify-center">
                                    <Image
                                        src={logoUrl}
                                        alt={`${brandName} logo`}
                                        fill
                                        sizes="(max-width: 768px) 34px, 44px"
                                        className="object-contain transition-transform duration-300 group-hover:scale-105"
                                        onError={() => setLogoFailed(true)}
                                    />
                                </div>
                            )}
                            <div className="flex flex-col justify-center">
                                <span className="font-extrabold text-[16px] md:text-[20px] tracking-[0.18em] uppercase text-white leading-[1.1] md:leading-[1.1]">
                                    {firstWord}
                                </span>
                                {restWords && (
                                    <span className="font-semibold text-[10px] md:text-[11px] tracking-[0.3em] uppercase text-cyan-400 leading-[1.1] md:leading-[1.1]">
                                        {restWords}
                                    </span>
                                )}
                            </div>
                        </Link>
                    </div>

                    {/* CENTER: Navigation Links */}
                    <div className="hidden lg:flex items-center justify-center gap-10">
                        {navLinks.map((link) => {
                            if (link.name === "Exchange" && !canExchangeOldPhones) return null;
                            if (link.name === "Pre-Owned" && !canSellUsedRefurbished) return null;
                            const isActive = pathname === link.href;
                            return (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className={`text-[13px] uppercase tracking-widest font-medium transition-all duration-300 relative group focus:outline-none focus:text-white ${isActive ? "text-white" : "text-gray-400 hover:text-white"
                                        }`}
                                    aria-current={isActive ? "page" : undefined}
                                >
                                    {link.name}
                                    <span className={`absolute -bottom-2 left-0 w-full h-[1px] bg-accent transition-transform duration-300 transform origin-left ${isActive ? "scale-x-100 opacity-100" : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100"
                                        }`} />
                                </Link>
                            );
                        })}
                    </div>

                    {/* RIGHT: Actions */}
                    <div className="hidden lg:flex items-center flex-shrink-0">
                        {isWhatsAppEnabled && (
                            <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                                <Button variant="whatsapp" size="sm" className="rounded-full shadow-lg hover:shadow-xl transition-all font-semibold tracking-wide px-5 border border-[#25D366]/30">
                                    WhatsApp
                                </Button>
                            </Link>
                        )}
                    </div>

                    {/* Mobile Menu Toggle */}
                    <div className="lg:hidden z-50 flex-shrink-0">
                        <button
                            className="p-2 -mr-2 text-white hover:text-gray-300 focus:outline-none"
                            onClick={() => setIsOpen(!isOpen)}
                            aria-label={isOpen ? "Close Menu" : "Open Menu"}
                            aria-expanded={isOpen}
                        >
                            {isOpen ? <X size={26} strokeWidth={1.5} /> : <Menu size={26} strokeWidth={1.5} />}
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        animate={{ opacity: 1, backdropFilter: "blur(20px)" }}
                        exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                        className="fixed inset-0 z-40 bg-[#09090b]/95 flex flex-col justify-center items-center h-[100dvh]"
                    >
                        <div className="flex flex-col items-center gap-8 w-full px-6">
                            {navLinks.map((link, i) => {
                                if (link.name === "Exchange" && !canExchangeOldPhones) return null;
                                if (link.name === "Pre-Owned" && !canSellUsedRefurbished) return null;
                                return (
                                    <motion.div
                                        key={link.name}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                    >
                                        <Link
                                            href={link.href}
                                            className={`text-2xl font-light tracking-widest uppercase ${pathname === link.href ? "text-white" : "text-gray-400"
                                                }`}
                                        >
                                            {link.name}
                                        </Link>
                                    </motion.div>
                                );
                            })}
                            {isWhatsAppEnabled && (
                                <motion.div
                                    className="pt-10 w-full max-w-sm"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: navLinks.length * 0.05 + 0.1 }}
                                >
                                    <Link href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block w-full">
                                        <Button variant="whatsapp" size="lg" className="w-full justify-center">
                                            WhatsApp Us
                                        </Button>
                                    </Link>
                                </motion.div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};
