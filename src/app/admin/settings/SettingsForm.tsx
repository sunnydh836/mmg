"use client";

import { useState } from "react";
import { updateSettings } from "./actions";
import { Store, MapPin, Clock, Share2, Save, Loader2 } from "lucide-react";
import LogoUpload from "./LogoUpload";

export default function SettingsForm({ initialData }: { initialData: any }) {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setMessage("");

        const formData = new FormData(e.currentTarget);
        const result = await updateSettings(formData);

        if (result.error) {
            setMessage(`Error: ${result.error}`);
        } else {
            setMessage("Settings updated successfully!");
        }
        setLoading(false);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 pb-12">
            {message && (
                <div className={`p-4 rounded-xl font-medium ${message.startsWith("Error") ? "bg-red-500/10 text-red-500 border border-red-500/20" : "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"}`}>
                    {message}
                </div>
            )}

            {/* Main Info */}
            <section className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Store className="w-5 h-5 text-blue-400" />
                    General Information
                </h2>

                <div className="mb-6">
                    <LogoUpload initialLogoUrl={initialData.logoUrl || null} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Business Name" name="businessName" defaultValue={initialData.businessName} />
                    <InputField label="Display Name" name="displayName" defaultValue={initialData.displayName} />
                    <InputField label="Tagline" name="tagline" defaultValue={initialData.tagline} />
                    <InputField label="Email Address" name="email" defaultValue={initialData.email} type="email" />
                    <InputField label="Phone Number" name="phone" defaultValue={initialData.phone} />
                    <InputField label="WhatsApp Number" name="whatsapp" defaultValue={initialData.whatsapp} />
                </div>
            </section>

            {/* Location & Hours */}
            <section className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-orange-400" />
                    Location & Hours
                </h2>
                <div className="space-y-6">
                    <InputField label="Complete Address" name="address" defaultValue={initialData.address} isTextArea />
                    <InputField label="Google Maps Action URL" name="mapsUrl" defaultValue={initialData.mapsUrl} type="url" />
                    <InputField label="Google Maps Embed URL (iframe src)" name="mapsEmbedUrl" defaultValue={initialData.mapsEmbedUrl} type="url" isTextArea />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                        <TimePickerField label="Opening Time" name="openingTime" defaultValue={initialData.openingTime} />
                        <TimePickerField label="Closing Time" name="closingTime" defaultValue={initialData.closingTime} />
                    </div>
                    <div className="mt-6">
                        <InputField label="Opening Hours Note" name="openingHoursNote" defaultValue={initialData.openingHoursNote} isTextArea />
                        <p className="text-xs text-neutral-500 mt-2 flex items-center">This note will appear below the opening hours on the website.</p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/5">
                        <InputField label="Weekly Off" name="weeklyOff" defaultValue={initialData.weeklyOff} />
                    </div>
                </div>
            </section>

            {/* Social Links */}
            <section className="bg-neutral-900/50 border border-white/5 rounded-2xl p-6">
                <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-purple-400" />
                    Social Proof & Links
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField label="Instagram URL" name="instagram" defaultValue={initialData.instagram} type="url" />
                    <InputField label="Instagram Followers Text" name="instagramFollowers" defaultValue={initialData.instagramFollowers} />
                    <InputField label="YouTube URL" name="youtube" defaultValue={initialData.youtube} type="url" />
                    <InputField label="Facebook URL" name="facebook" defaultValue={initialData.facebook} type="url" />
                </div>
            </section>



            {/* Submit */}
            <div className="flex items-center justify-end sticky bottom-6 z-10">
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-medium py-3 px-6 rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <Save className="w-5 h-5" />
                    )}
                    <span>{loading ? "Saving..." : "Save Changes"}</span>
                </button>
            </div>
        </form>
    );
}

function InputField({ label, name, defaultValue, type = "text", isTextArea = false }: any) {
    return (
        <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">{label}</label>
            {isTextArea ? (
                <textarea
                    name={name}
                    defaultValue={defaultValue}
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all min-h-[100px]"
                />
            ) : (
                <input
                    type={type}
                    name={name}
                    defaultValue={defaultValue}
                    className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
            )}
        </div>
    );
}


function TimePickerField({ label, name, defaultValue }: { label: string, name: string, defaultValue: string }) {
    let initialTime = "09:00";
    let initialAmpm = "AM";
    if (defaultValue) {
        try {
            const [hStr, mStr] = defaultValue.split(":");
            let h = parseInt(hStr, 10);
            if (!isNaN(h)) {
                if (h >= 12) initialAmpm = "PM";
                else initialAmpm = "AM";
                const h12 = h % 12 || 12;
                initialTime = `${h12.toString().padStart(2, '0')}:${(mStr || '00').substring(0, 2)}`;
            }
        } catch { }
    }

    const [timePart, setTimePart] = useState(initialTime);
    const [ampm, setAmpm] = useState(initialAmpm);

    let finalVal = "00:00";
    try {
        const [hStr, mStr] = timePart.split(":");
        let dH = parseInt(hStr, 10) || 0;
        if (ampm === "PM" && dH !== 12) dH += 12;
        if (ampm === "AM" && dH === 12) dH = 0;
        finalVal = `${dH.toString().padStart(2, '0')}:${(mStr || '00')}`;
    } catch { }

    const timeOptions = [];
    for (let i = 1; i <= 12; i++) {
        const h = i.toString().padStart(2, '0');
        timeOptions.push(`${h}:00`);
        timeOptions.push(`${h}:30`);
    }
    if (!timeOptions.includes(initialTime)) {
        timeOptions.push(initialTime);
        timeOptions.sort(); // Very basic sort, works cleanly enough for standard strings like 09:00 vs 09:15
    }

    return (
        <div>
            <label className="block text-sm font-medium text-neutral-400 mb-2">{label}</label>
            <input type="hidden" name={name} value={finalVal} />
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <select
                        value={timePart}
                        onChange={(e) => setTimePart(e.target.value)}
                        className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                        {timeOptions.map(v => (
                            <option key={v} value={v}>{v}</option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-white/50">▼</div>
                </div>
                <div className="relative w-1/3">
                    <select
                        value={ampm}
                        onChange={(e) => setAmpm(e.target.value)}
                        className="w-full bg-neutral-950 border border-white/10 rounded-xl py-2 px-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                        <option value="AM">AM</option>
                        <option value="PM">PM</option>
                    </select>
                    <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-white/50">▼</div>
                </div>
            </div>
        </div>
    );
}
