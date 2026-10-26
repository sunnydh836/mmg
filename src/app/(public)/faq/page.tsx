export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const settings = await import('@/lib/settings').then(m => m.getStoreSettings());
  return {
    title: `${settings.displayName || settings.businessName} | FAQs`,
    description: `Find answers to frequently asked questions about mobile sales, repairing, and exchange at ${settings.businessName} in Meerut.`
  };
}

import prisma from "@/lib/prisma";
import { Section, SectionHeader } from "@/components/ui/Section";
import { LocationAndFAQ } from "@/components/sections/LocationAndFAQ";
import { getStoreSettings } from "@/lib/settings";
import { withDatabaseFallback } from "@/lib/database-fallback";

export default async function Page() {
  const faqs = await withDatabaseFallback(prisma.fAQ.findMany({
    orderBy: { sortOrder: 'asc' }
  }), [], "FAQ page");

  const settings = await getStoreSettings();

  return (
    <div className="flex flex-col w-full pb-12">
      <Section className="pb-0" contained={false}>
        <div className="container mx-auto px-4 md:px-6 max-w-7xl flex flex-col items-center pt-8">
          <SectionHeader
            title="Frequently Asked Questions"
            className="text-center w-full"
          />
        </div>
      </Section>
      <LocationAndFAQ faqs={faqs} settings={settings} />
    </div>
  );
}
