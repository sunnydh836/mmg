import { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const settings = await import('@/lib/settings').then(m => m.getStoreSettings());
  return {
    title: `${settings.displayName || settings.businessName} | Contact Us`,
    description: `Contact ${settings.displayName || settings.businessName} in Partapur, Meerut. Call us, get directions, and find our store timings.`
  };
}
import { Section, SectionHeader } from "@/components/ui/Section";
import { LocationAndFAQ } from "@/components/sections/LocationAndFAQ";
import { getStoreSettings } from "@/lib/settings";

export default async function Page() {
  const settings = await getStoreSettings();
  return (
    <div className="flex flex-col w-full pb-12">
      <Section className="pb-0" contained={false}>
        <div className="container mx-auto px-4 md:px-6 max-w-7xl flex flex-col items-center pt-8">
          <SectionHeader
            title="Contact Us"
            className="text-center w-full"
          />
        </div>
      </Section>
      <LocationAndFAQ settings={settings} />
    </div>
  );
}
