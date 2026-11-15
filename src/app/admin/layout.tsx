import type { Metadata } from "next";
import { getStoreSettings } from "@/lib/settings";
import AdminLayoutClient from "./AdminLayoutClient";

export const metadata: Metadata = {
    title: "Admin Portal",
    robots: {
        index: false,
        follow: false,
        nocache: true,
    },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
    const settings = await getStoreSettings();
    return (
        <AdminLayoutClient
            logoUrl={settings.logoUrl || null}
            brandName={settings.displayName || settings.businessName || "MMG"}
        >
            {children}
        </AdminLayoutClient>
    );
}
