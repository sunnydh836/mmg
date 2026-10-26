import { getStoreSettings } from "@/lib/settings";
import AdminLayoutClient from "./AdminLayoutClient";

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
