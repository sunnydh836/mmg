import React from "react";
import Link from "next/link";
import { getStoreSettings, formatOpeningHours, formatPhoneNumber, getWhatsAppUrl, getPhoneHref, isWhatsAppEnabled } from "@/lib/settings";
import { MapPin, Phone, MessageCircle, Clock } from "lucide-react";

export const Footer = async () => {
    const settings = await getStoreSettings();
    return (
        <footer className="bg-secondary border-t border-border pt-16 pb-24 md:pb-8">
            <div className="container mx-auto px-4 md:px-6 max-w-7xl">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
                    {/* Brand Info */}
                    <div>
                        <Link href="/" className="flex flex-col mb-6 block">
                            <span className="font-bold text-2xl tracking-wider text-white">
                                {settings.displayName || settings.businessName}
                            </span>
                            <span className="text-sm text-gray-400 tracking-widest pl-1">
                                {settings.tagline}
                            </span>
                        </Link>
                        <p className="text-gray-400 text-sm mb-6 leading-relaxed">
                            Your trusted local destination for premium smartphones in Partapur, Meerut.
                        </p>
                        <div className="flex space-x-4">
                            {settings.instagram && (
                                <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-accent transition-colors" aria-label="Instagram">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                                </a>
                            )}
                            {settings.youtube && (
                                <a href={settings.youtube} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-accent transition-colors" aria-label="YouTube">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33 2.78 2.78 0 0 0 1.94 2c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.33 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                                </a>
                            )}
                            {settings.facebook && (
                                <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-accent transition-colors" aria-label="Facebook">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Quick Links</h3>
                        <ul className="space-y-4">
                            <li><Link href="/" className="text-gray-400 hover:text-accent text-sm transition-colors">Home</Link></li>
                            <li><Link href="/products" className="text-gray-400 hover:text-accent text-sm transition-colors">All Products</Link></li>
                            <li><Link href="/services" className="text-gray-400 hover:text-accent text-sm transition-colors">Our Services</Link></li>
                            <li><Link href="/exchange" className="text-gray-400 hover:text-accent text-sm transition-colors">Phone Exchange</Link></li>
                            <li><Link href="/gallery" className="text-gray-400 hover:text-accent text-sm transition-colors">Gallery</Link></li>
                            <li><Link href="/about" className="text-gray-400 hover:text-accent text-sm transition-colors">About Us</Link></li>
                            <li><Link href="/faq" className="text-gray-400 hover:text-accent text-sm transition-colors">FAQ</Link></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Contact Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start">
                                <MapPin size={18} className="text-accent mt-1 mr-3 flex-shrink-0" />
                                {settings.mapsUrl ? (
                                    <a href={settings.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm transition-colors leading-relaxed block max-w-[250px]">
                                        {settings.address}
                                    </a>
                                ) : (
                                    <span className="text-gray-400 text-sm leading-relaxed block max-w-[250px]">{settings.address}</span>
                                )}
                            </li>
                            <li className="flex items-center">
                                <Phone size={18} className="text-accent mr-3 flex-shrink-0" />
                                <a href={getPhoneHref(settings)} className="text-gray-400 hover:text-white text-sm transition-colors">
                                    {formatPhoneNumber(settings.phone)}
                                </a>
                            </li>
                            {isWhatsAppEnabled(settings) && (
                                <li className="flex items-center">
                                    <MessageCircle size={18} className="text-[#25D366] mr-3 flex-shrink-0" />
                                    <a href={getWhatsAppUrl(settings)} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white text-sm transition-colors">
                                        WhatsApp Us
                                    </a>
                                </li>
                            )}
                        </ul>
                    </div>

                    {/* Hours */}
                    <div>
                        <h3 className="text-white font-semibold mb-6">Opening Hours</h3>
                        <ul className="space-y-4">
                            <li className="flex items-center">
                                <Clock size={18} className="text-accent mr-3 flex-shrink-0" />
                                <span className="text-gray-400 text-sm">
                                    Available: {formatOpeningHours(settings.openingTime, settings.closingTime)}
                                </span>
                            </li>
                            {(settings as any).openingHoursNote ? (
                                <li className="text-gray-500 text-xs italic mt-4 leading-relaxed max-w-[250px]">
                                    {(settings as any).openingHoursNote}
                                </li>
                            ) : (
                                settings.weeklyOff && settings.weeklyOff !== "unknown" && (
                                    <li className="text-gray-500 text-xs italic mt-4">
                                        {settings.weeklyOff}
                                    </li>
                                )
                            )}
                        </ul>
                    </div>
                </div>

                <div className="border-t border-border pt-8 mt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
                    <p>&copy; {new Date().getFullYear()} {settings.businessName}. All rights reserved.</p>
                    <div className="flex space-x-4 mt-4 md:mt-0">
                        <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};
