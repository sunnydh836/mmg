import { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const settings = await import('@/lib/settings').then(m => m.getStoreSettings());
  return {
    title: `${settings.displayName || settings.businessName} | Phone Exchange in Meerut`,
    description: `Exchange your old phone for a new smartphone at ${settings.displayName || settings.businessName} in Partapur, Meerut.`
  };
}
import { Section, SectionHeader } from "@/components/ui/Section";
import { ClientExchangeForm } from "@/components/sections/ClientExchangeForm";
import { RefreshCw } from "lucide-react";
import { getStoreSettings, canExchangeOldPhones } from "@/lib/settings";

export default async function Page() {
  const settings = await getStoreSettings();
  if (!canExchangeOldPhones(settings)) {
    return (
      <div className="flex flex-col w-full min-h-[50vh] pb-12 pt-48 items-center text-center px-4">
        <h2 className="text-2xl font-bold text-white mb-4">Phone exchange is currently unavailable.</h2>
        <p className="text-gray-400">Please contact the store for the latest information.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col w-full pb-12 pt-24">
      <Section className="pb-0" contained={false}>
        <div className="container mx-auto px-4 md:px-6 max-w-7xl flex flex-col items-center">
          <div className="inline-flex items-center justify-center p-4 bg-accent/10 text-accent rounded-2xl mb-6">
            <RefreshCw size={32} />
          </div>
          <SectionHeader
            title="Exchange Your Old Phone"
            subtitle="Get the best valuation for your current device when upgrading to a new smartphone in our store."
            className="text-center w-full max-w-2xl"
          />
        </div>
      </Section>

      <Section id="exchange-form" className="pt-8 md:pt-12 pb-24">
        <ClientExchangeForm whatsappNumber={settings.whatsapp} businessName={settings.displayName || settings.businessName} />
      </Section>
    </div>
  );
}
