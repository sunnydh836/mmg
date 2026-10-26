import { defaultSettings, formatOpeningHours } from "@/lib/settings";

export interface FAQItem {
    question: string;
    answer: string;
}

export const faqs: FAQItem[] = [
    {
        question: "Do you sell new mobile phones?",
        answer: "Yes, we sell a wide range of new smartphones from all major brands."
    },
    {
        question: "Do you buy old phones?",
        answer: "Yes, we purchase old mobile phones. Bring your device to our store for evaluation."
    },
    {
        question: "Do you provide phone exchange?",
        answer: "Yes, you can exchange your existing smartphone when purchasing a new one to get the best value."
    },
    {
        question: "Do you sell pre-owned/refurbished phones?",
        answer: "Yes, we offer quality pre-owned smartphones. Availability varies, so please visit the store or contact us."
    },
    {
        question: "Do you provide mobile repairing?",
        answer: "Yes, we provide mobile repairing services in-store."
    },
    {
        question: "Can I enquire through WhatsApp?",
        answer: "Absolutely! You can reach us directly on WhatsApp for any product enquiries or service questions."
    },
    {
        question: "Do you offer EMI?",
        answer: "Currently, we do not offer EMI services."
    },
    {
        question: "Can I pre-order a phone?",
        answer: "Pre-orders are currently not supported directly through the website, but you can contact us via WhatsApp to check availability."
    },
    {
        question: "Do you provide online ordering?",
        answer: "We currently do not offer online checkout or delivery. All purchases must be made in-store."
    },
    {
        question: "What are your opening hours?",
        answer: `We are available ${formatOpeningHours(defaultSettings.openingTime, defaultSettings.closingTime)}. ${defaultSettings.openingHoursNote || defaultSettings.weeklyOff}`
    }
];
