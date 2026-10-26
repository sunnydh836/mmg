import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { MobileActionBar } from "@/components/layout/MobileActionBar";
import { getStoreSettings, getWhatsAppUrl, isWhatsAppEnabled, canExchangeOldPhones, canSellUsedRefurbished } from "@/lib/settings";

export default async function PublicLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const settings = await getStoreSettings();
    const whatsappUrl = getWhatsAppUrl(settings);
    return (
        <>
            <Navbar
                brandName={settings.displayName || settings.businessName}
                whatsappUrl={whatsappUrl}
                logoUrl={settings.logoUrl}
                isWhatsAppEnabled={isWhatsAppEnabled(settings)}
                canExchangeOldPhones={canExchangeOldPhones(settings)}
                canSellUsedRefurbished={canSellUsedRefurbished(settings)}
            />
            <main className="flex-grow flex flex-col pt-20 pb-20 md:pb-0">
                {children}
            </main>
            <Footer />
            <MobileActionBar whatsappUrl={whatsappUrl} googleMapsLink={settings.mapsUrl} isWhatsAppEnabled={isWhatsAppEnabled(settings)} />
        </>
    );
}
