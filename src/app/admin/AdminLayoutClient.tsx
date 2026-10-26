"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Tag, Layers, Image as ImageIcon, HelpCircle, Wrench, Percent, Settings, Menu, X, ExternalLink } from "lucide-react";
import LogoutButton from "./LogoutButton";

interface AdminLayoutClientProps {
    children: React.ReactNode;
    logoUrl: string | null;
    brandName: string;
}

export default function AdminLayoutClient({ children, logoUrl, brandName }: AdminLayoutClientProps) {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();

    const nameParts = brandName.split(' ');
    const firstWord = nameParts[0] || "MMG";
    const restWords = nameParts.slice(1).join(' ');

    const sidebarLinks = [
        { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
        { name: "Products", href: "/admin/products", icon: Package },
        { name: "Brands", href: "/admin/brands", icon: Tag },
        { name: "Categories", href: "/admin/categories", icon: Layers },
        { name: "Gallery", href: "/admin/gallery", icon: ImageIcon },
        { name: "Hero Images", href: "/admin/gallery/hero", icon: ImageIcon },
        { name: "Instagram Reels", href: "/admin/gallery/reels", icon: ImageIcon },
        { name: "FAQs", href: "/admin/faqs", icon: HelpCircle },
        { name: "Services", href: "/admin/services", icon: Wrench },
        { name: "Offers", href: "/admin/offers", icon: Percent },
        { name: "Settings", href: "/admin/settings", icon: Settings },
    ];

    const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

    const SidebarContent = () => (
        <>
            <div className="p-6 border-b border-white/5 flex items-center justify-between lg:block">
                <Link href="/admin" className="flex items-center gap-3 focus:outline-none" onClick={() => setIsMobileMenuOpen(false)}>
                    {logoUrl && (
                        <div className="relative w-10 h-10 md:w-11 md:h-11 shrink-0 flex items-center justify-center">
                            <Image src={logoUrl} alt={`${brandName} logo`} fill className="object-contain" />
                        </div>
                    )}
                    <div className="flex flex-col">
                        <span className="text-[14px] font-extrabold tracking-wider uppercase text-white leading-tight">
                            {firstWord}
                        </span>
                        <span className="text-[9px] font-semibold tracking-[0.2em] text-neutral-400 uppercase leading-tight mt-0.5">
                            {restWords ? `${restWords} ADMIN` : "ADMIN PANEL"}
                        </span>
                    </div>
                </Link>
                <button className="lg:hidden text-neutral-400 hover:text-white" onClick={toggleMobileMenu}>
                    <X className="w-6 h-6" />
                </button>
            </div>

            <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {sidebarLinks.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`);
                    return (
                        <Link
                            key={link.name}
                            href={link.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group ${isActive
                                ? "bg-blue-500/10 text-blue-400 font-semibold"
                                : "text-neutral-400 hover:text-white hover:bg-white/5 font-medium"
                                }`}
                        >
                            <Icon className={`w-5 h-5 transition-colors ${isActive ? "text-blue-400" : "text-neutral-500 group-hover:text-current"}`} />
                            <span className="text-sm">{link.name}</span>
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-white/5">
                <LogoutButton />
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-neutral-950 lg:grid lg:grid-cols-[260px_minmax(0,1fr)]">
            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex flex-col border-r border-white/5 bg-neutral-900/50 h-screen sticky top-0 z-40">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Mobile Sidebar */}
            <aside className={`fixed inset-y-0 left-0 w-[260px] bg-neutral-900 border-r border-white/5 flex flex-col z-50 transform transition-transform duration-200 lg:hidden ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}`}>
                <SidebarContent />
            </aside>

            {/* Main content wrapper */}
            <div className="flex flex-col min-w-0 min-h-screen">
                {/* Topbar */}
                <header className="h-16 flex items-center justify-between px-6 border-b border-white/5 bg-neutral-950/80 backdrop-blur sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden text-neutral-400 hover:text-white"
                            onClick={toggleMobileMenu}
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h1 className="text-lg font-semibold text-white truncate hidden sm:block">
                            {sidebarLinks.find(link => pathname === link.href || (link.href !== "/admin" && pathname.startsWith(link.href)))?.name || "Dashboard"}
                        </h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link
                            href="/"
                            target="_blank"
                            className="flex items-center gap-2 text-sm text-neutral-400 hover:text-white transition-colors"
                        >
                            <span className="hidden sm:inline">View Website</span>
                            <ExternalLink className="w-4 h-4" />
                        </Link>
                    </div>
                </header>

                {/* Main Content Area */}
                <main className="flex-1 overflow-x-hidden p-6 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
