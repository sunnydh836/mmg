"use client";
import { getWhatsAppUrl } from "@/lib/settings-shared";

import React, { useState } from "react";
import { Button } from "@/components/ui/Button";

interface ClientExchangeFormProps {
    whatsappNumber: string;
    businessName: string;
}

export function ClientExchangeForm({ whatsappNumber, businessName }: ClientExchangeFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        phone: "",
        currentPhone: "",
        condition: "Good",
        expectedDevice: "",
        message: ""
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        let message = `Hi ${businessName}, I want to enquire about exchanging my old phone.\n\n`;
        message += `*Name:* ${formData.name}\n`;
        message += `*Phone:* ${formData.phone}\n`;
        message += `*Current Phone:* ${formData.currentPhone}\n`;
        message += `*Condition:* ${formData.condition}\n`;
        if (formData.expectedDevice) {
            message += `*Expected Device:* ${formData.expectedDevice}\n`;
        }
        if (formData.message) {
            message += `*Message:* ${formData.message}\n`;
        }

        const encodedMessage = encodeURIComponent(message);
        window.open(getWhatsAppUrl({ whatsapp: whatsappNumber }, message), "_blank");
    };

    return (
        <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-2xl mx-auto w-full bg-white/5 border border-white/10 p-5 sm:p-8 rounded-3xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Your Name *</label>
                    <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent transition-colors"
                        placeholder="John Doe"
                    />
                </div>
                <div className="flex flex-col gap-2">
                    <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Phone Number *</label>
                    <input
                        required
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent transition-colors"
                        placeholder="10-digit number"
                    />
                </div>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Current Phone Details *</label>
                <input
                    required
                    type="text"
                    value={formData.currentPhone}
                    onChange={e => setFormData({ ...formData, currentPhone: e.target.value })}
                    className="bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent transition-colors"
                    placeholder="e.g. iPhone 12, 128GB"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Current Phone Condition *</label>
                <select
                    required
                    value={formData.condition}
                    onChange={e => setFormData({ ...formData, condition: e.target.value })}
                    className="bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent transition-colors"
                >
                    <option value="Like New (Flawless)">Like New (Flawless)</option>
                    <option value="Good (Minor Scratches)">Good (Minor Scratches)</option>
                    <option value="Fair (Visible Wear/Dents)">Fair (Visible Wear/Dents)</option>
                    <option value="Needs Repair (Cracked Screen/Battery)">Needs Repair (Cracked Screen/Battery)</option>
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Expected New Device (Optional)</label>
                <input
                    type="text"
                    value={formData.expectedDevice}
                    onChange={e => setFormData({ ...formData, expectedDevice: e.target.value })}
                    className="bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent transition-colors"
                    placeholder="e.g. I want to buy iPhone 15"
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="text-xs text-gray-400 uppercase tracking-widest font-bold">Additional Message (Optional)</label>
                <textarea
                    value={formData.message}
                    onChange={e => setFormData({ ...formData, message: e.target.value })}
                    className="bg-black border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-accent transition-colors"
                    placeholder="Any other details..."
                    rows={3}
                />
            </div>

            <Button type="submit" variant="whatsapp" className="w-full text-sm uppercase font-bold tracking-widest py-4 mt-2">
                Send Details via WhatsApp
            </Button>
            <p className="text-center text-xs text-gray-500 mt-2">
                * We do not calculate fake exchange values online. Our team will review and provide the best exact shop valuation.
            </p>
        </form>
    );
}
