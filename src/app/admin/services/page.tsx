import { Metadata } from "next";
import { getServices } from "./actions";
import { ServiceClient } from "./ServiceClient";

export const metadata: Metadata = {
    title: "Admin | Service Management",
    description: "Manage services displayed on the website.",
};

export default async function AdminServicePage() {
    const services = await getServices();

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-border pb-6 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Service Management</h1>
                    <p className="text-gray-400 mt-2 text-sm leading-relaxed max-w-2xl">
                        Manage services displayed on the website.
                    </p>
                </div>
            </div>

            <ServiceClient initialServices={services} />
        </div>
    );
}
