"use client";
import { getWhatsAppUrl, isWhatsAppEnabled } from "@/lib/settings";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, MessageCircle, ChevronDown } from "lucide-react";
import { Section, SectionHeader } from "@/components/ui/Section";
import { Button } from "@/components/ui/Button";
import { staggerContainer, slideUp } from "@/lib/animations";
import { formatOpeningHours } from "@/lib/settings";

export const LocationAndFAQ = ({ faqs = [], settings }: { faqs?: { question: string; answer: string }[], settings: any }) => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    return (
        <Section id="location" className="bg-background">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-12">

                {/* FAQ Section */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    <SectionHeader
                        title="Have Questions?"
                        subtitle="Everything you need to know about our products and services."
                        className="mb-8"
                    />

                    <div className="space-y-4">
                        {faqs.map((faq, index) => (
                            <motion.div
                                key={index}
                                variants={slideUp}
                                className="border border-border rounded-xl overflow-hidden bg-secondary/20"
                            >
                                <button
                                    className="w-full px-6 py-4 flex justify-between items-center text-left focus:outline-none"
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                >
                                    <span className="font-semibold text-white tracking-wide">{faq.question}</span>
                                    <ChevronDown
                                        className={`text-accent transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                                        size={20}
                                    />
                                </button>
                                <AnimatePresence>
                                    {openIndex === index && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="overflow-hidden"
                                        >
                                            <div className="px-6 pb-5 pt-1 text-gray-400 text-sm leading-relaxed border-t border-border/50">
                                                {faq.answer}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* Location Section */}
                <motion.div
                    variants={staggerContainer}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                    className="relative"
                >
                    <div className="bg-secondary rounded-3xl p-8 md:p-10 border border-border sticky top-24">
                        <h3 className="text-2xl md:text-3xl font-bold text-white mb-6">
                            Visit Our Store
                        </h3>

                        <div className="flex items-start mb-6">
                            <div className="bg-background p-3 rounded-xl mr-5">
                                <MapPin className="text-accent" size={24} />
                            </div>
                            <div>
                                <h4 className="text-white font-semibold mb-1 tracking-wide">Location</h4>
                                <p className="text-gray-400 text-sm leading-relaxed max-w-sm">
                                    {settings.address}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start mb-10">
                            <div className="bg-background p-3 rounded-xl mr-5">
                                <Phone className="text-accent" size={24} />
                            </div>
                            <div>
                                <h4 className="text-white font-semibold mb-1 tracking-wide">Contact</h4>
                                <p className="text-gray-400 text-sm">{settings.phone}</p>
                                <p className="text-gray-500 text-xs mt-1 mb-1">Available {formatOpeningHours(settings.openingTime, settings.closingTime)}</p>
                                {settings.openingHoursNote && (
                                    <p className="text-gray-500 text-xs italic">{settings.openingHoursNote}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <a
                                href="#location"
                                onClick={(e) => {
                                    e.preventDefault();
                                    document.getElementById('map-embed')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                                }}
                                className="w-full"
                            >
                                <Button variant="primary" className="w-full flex items-center justify-center space-x-2">
                                    <MapPin size={18} />
                                    <span>Get Directions</span>
                                </Button>
                            </a>
                            <a href={settings.mapsUrl} target="_blank" rel="noopener noreferrer" className="w-full">
                                <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
                                    <MapPin size={18} />
                                    <span>Open in Maps</span>
                                </Button>
                            </a>
                            {isWhatsAppEnabled(settings) && (
                                <a href={getWhatsAppUrl(settings)} target="_blank" rel="noopener noreferrer" className="w-full">
                                    <Button variant="whatsapp" className="w-full flex items-center justify-center space-x-2">
                                        <MessageCircle size={18} />
                                        <span>WhatsApp Us</span>
                                    </Button>
                                </a>
                            )}
                            <a href={`tel:+91${settings.phone}`} className="w-full">
                                <Button variant="outline" className="w-full flex items-center justify-center space-x-2">
                                    <Phone size={18} />
                                    <span>Call Now</span>
                                </Button>
                            </a>
                        </div>

                        <div id="map-embed" className="mt-8 rounded-2xl overflow-hidden border border-border w-full aspect-video bg-secondary/50">
                            <iframe
                                src={settings.mapsEmbedUrl || "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3160.457420305377!2d77.6438418793457!3d28.91560440000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390c6100574a5789%3A0xe73bcfca3eda0e8f!2sMmg%20partapur%20mahadev%20mobile%20gallery%20gogol%20road!5e1!3m2!1sen!2sin!4v1790780736528!5m2!1sen!2sin"}
                                className="w-full h-full"
                                style={{ border: 0 }}
                                allowFullScreen={false}
                                loading="lazy"
                                referrerPolicy="strict-origin-when-cross-origin"
                                title={`${settings.businessName} location on Google Maps`}
                            ></iframe>
                        </div>
                    </div>
                </motion.div>
            </div>
        </Section>
    );
};
