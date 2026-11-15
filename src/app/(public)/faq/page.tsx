export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import prisma from "@/lib/prisma";
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { LocationAndFAQ } from "@/components/sections/LocationAndFAQ";
import { getStoreSettings } from "@/lib/settings";
import { withDatabaseFallback } from "@/lib/database-fallback";
import { buildMetadata, generateFAQSchema } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const brandName = settings.displayName || settings.businessName;

  return buildMetadata({
    title: `Frequently Asked Questions | ${brandName} Partapur, Meerut`,
    description: `Find answers about buying smartphones, mobile screen & battery repairs, trade-in valuations, and store hours at ${settings.businessName} in Partapur, Meerut.`,
    path: "/faq",
    keywords: [
      "Mahadev Mobile Gallery FAQ",
      "Mobile repairing questions Meerut",
      "Phone exchange process Meerut",
      "Mobile shop timings Partapur",
    ],
  });
}

export default async function FAQPage() {
  const faqs = await withDatabaseFallback(
    prisma.fAQ.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' }
    }),
    [],
    "FAQ page"
  );

  const settings = await getStoreSettings();
  const faqSchema = faqs.length > 0 ? generateFAQSchema(faqs) : null;

  return (
    <div className="flex flex-col w-full pb-16">
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      <Section className="pt-24 pb-4" contained={true}>
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs items={[{ name: "FAQ", path: "/faq" }]} />

          <div className="text-center max-w-3xl mx-auto mt-6 mb-8">
            <span className="text-accent text-xs font-bold uppercase tracking-widest block mb-2">
              Help & Answers
            </span>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
              Frequently Asked Questions
            </h1>
            <p className="text-gray-400 text-base leading-relaxed">
              Find transparent answers to everything from smartphone warranty and used phone inspection to same-day repairing and trade-in valuations at {settings.displayName || settings.businessName}.
            </p>
          </div>
        </div>
      </Section>

      <LocationAndFAQ faqs={faqs} settings={settings} />
    </div>
  );
}
