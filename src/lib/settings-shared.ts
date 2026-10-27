// Browser-safe store defaults and pure helpers. Keep database access in settings.ts.
export const defaultSettings = {
    businessName: "Mahadev Mobile Gallery & Repairing",
    displayName: "Mahadev Mobile Gallery",
    tagline: "Mobiles â€¢ Accessories â€¢ Repairing",
    phone: "7942699103",
    whatsapp: "7942699103",
    address: "WJ8W+6G8, Gagol Rd, Sector 2, MDA, Aminagar Urf Bhurbaral, Meerut, Uttar Pradesh 250103",
    mapsUrl: "https://maps.app.goo.gl/LDTKxDF47u14HLuW6",
    mapsEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3160.457420305377!2d77.6438418793457!3d28.91560440000002!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390c6100574a5789%3A0xe73bcfca3eda0e8f!2sMmg%20partapur%20mahadev%20mobile%20gallery%20gogol%20road!5e1!3m2!1sen!2sin!4v1790780736528!5m2!1sen!2sin",
    openingTime: "09:00",
    closingTime: "22:00",
    weeklyOff: "unknown",
    email: "placeholder",
    instagram: "https://www.instagram.com/mmgpartapur",
    youtube: "https://www.youtube.com/@mmgpartapur001",
    facebook: "",
    instagramFollowers: "117000",
    hasEmi: false,
    hasPreOrder: false,
    hasOnlineOrdering: false,
    hasOnlineCheckout: false,
    hasWhatsappEnquiry: true,
    hasOldPhonePurchase: true,
    hasOldPhoneExchange: true,
    hasUsedPhones: true,
    hasGifts: true,
    logoUrl: null as string | null,
    openingHoursNote: "Closed on the last Saturday of every month." as string | null,
};

export type StoreSettingsType = typeof defaultSettings & { id: number; updatedAt: Date };

export function getWhatsAppUrl(settings: Partial<StoreSettingsType>, message?: string) {
    const whatsapp = settings.whatsapp || defaultSettings.whatsapp;
    const cleanNumber = whatsapp.replace(/\D/g, "");
    const baseUrl = `https://wa.me/91${cleanNumber}`;
    return message ? `${baseUrl}?text=${encodeURIComponent(message)}` : baseUrl;
}

export function getPhoneHref(settings: Partial<StoreSettingsType>) {
    const phone = settings.phone || defaultSettings.phone;
    return `tel:+91${phone.replace(/\D/g, "")}`;
}

export function getMapsUrl(settings: Partial<StoreSettingsType>) {
    return settings.mapsUrl || defaultSettings.mapsUrl;
}

export function formatPhoneNumber(phone: string) {
    if (!phone) return "";
    return `+91 ${phone.substring(0, 5)} ${phone.substring(5)}`;
}

export function formatStoreTime(time: string) {
    if (!time) return "";
    try {
        const [hours, minutes] = time.split(":");
        const hour = parseInt(hours, 10);
        const ampm = hour >= 12 ? "PM" : "AM";
        const hour12 = hour % 12 || 12;
        return `${hour12}:${minutes} ${ampm}`;
    } catch {
        return time;
    }
}

export function formatOpeningHours(openingTime: string, closingTime: string) {
    try {
        return `${formatStoreTime(openingTime)} - ${formatStoreTime(closingTime)}`;
    } catch {
        return `${openingTime} - ${closingTime}`;
    }
}

export function isWhatsAppEnabled(_settings: Partial<StoreSettingsType>) { return true; }
export function canBuyOldPhones(_settings: Partial<StoreSettingsType>) { return true; }
export function canExchangeOldPhones(_settings: Partial<StoreSettingsType>) { return true; }
export function canSellUsedRefurbished(_settings: Partial<StoreSettingsType>) { return true; }
export function areGiftsAvailable(_settings: Partial<StoreSettingsType>) { return true; }
