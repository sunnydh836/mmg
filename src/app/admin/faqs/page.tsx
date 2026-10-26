import { Metadata } from "next";
import { getFaqs } from "./actions";
import { FaqClient } from "./FaqClient";

export const metadata: Metadata = {
    title: "Admin | FAQ Management",
    description: "Manage frequently asked questions displayed on the website.",
};

export default async function AdminFaqPage() {
    const faqs = await getFaqs();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">FAQ Management</h1>
                    <p className="text-gray-400 mt-2 text-sm leading-relaxed max-w-2xl">
                        Manage frequently asked questions displayed on the website.
                    </p>
                </div>
            </div>

            <FaqClient initialFaqs={faqs} />
        </div>
    );
}
