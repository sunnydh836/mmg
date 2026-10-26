"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Smartphone, MessageCircle, MapPin } from "lucide-react";

interface MobileActionBarProps {
    whatsappUrl: string;
    googleMapsLink: string;
    isWhatsAppEnabled: boolean;
}

export const MobileActionBar = ({ whatsappUrl, googleMapsLink, isWhatsAppEnabled }: MobileActionBarProps) => {
    const pathname = usePathname();

    const actions = [
        { name: "Home", href: "/", icon: Home },
        { name: "Products", href: "/products", icon: Smartphone },
        ...(isWhatsAppEnabled ? [{
            name: "WhatsApp",
            href: whatsappUrl,
            icon: MessageCircle,
            external: true
        }] : []),
        {
            name: "Directions",
            href: googleMapsLink,
            icon: MapPin,
            external: true
        },
    ];

    return (
        <div className="md:hidden fixed bottom-0 left-0 w-full z-50 bg-background/90 backdrop-blur-lg border-t border-border pb-safe">
            <div className="flex justify-around items-center h-16">
                {actions.map((action) => {
                    const Icon = action.icon;
                    const isActive = pathname === action.href;
                    if (action.external) {
                        return (
                            <a
                                key={action.name}
                                href={action.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={action.name}
                                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? "text-accent" : "text-gray-400 hover:text-white"}`}
                            >
                                <Icon size={20} className={action.name === "WhatsApp" && !isActive ? "text-[#25D366]" : ""} />
                                <span className="text-[10px] font-medium">{action.name}</span>
                            </a>
                        );
                    }

                    return (
                        <Link
                            key={action.name}
                            href={action.href}
                            aria-label={action.name}
                            className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? "text-accent" : "text-gray-400 hover:text-white"}`}
                        >
                            <Icon size={20} />
                            <span className="text-[10px] font-medium">{action.name}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
};
