export const dynamic = 'force-dynamic';

import type { Metadata } from 'next';
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { PreOwnedSection } from "@/components/sections/PreOwned";
import prisma from "@/lib/prisma";
import { getStoreSettings, canSellUsedRefurbished, isWhatsAppEnabled } from "@/lib/settings";
import { withDatabaseFallback } from "@/lib/database-fallback";
import { PaginationLinks } from "@/components/ui/PaginationLinks";
import { productCardSelect, toProductCardProduct } from "@/lib/product-card-data";
import { buildMetadata } from "@/lib/seo";

const PAGE_SIZE = 12;

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const brandName = settings.displayName || settings.businessName;

  return buildMetadata({
    title: `Certified Pre-Owned & Refurbished Smartphones in Meerut | ${brandName}`,
    description: `Shop tested and certified second-hand smartphones at ${settings.businessName} in Partapur, Meerut. Quality-checked pre-owned iPhones, Samsung, and OnePlus at pocket-friendly prices.`,
    path: "/pre-owned",
    keywords: [
      "Second-hand mobile phones in Meerut",
      "Refurbished smartphones Meerut",
      "Used phones in Partapur Meerut",
      "Buy old iPhone in Meerut",
      "Pre-owned mobile shop Partapur",
    ],
  });
}

export default async function PreOwnedPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const settings = await getStoreSettings();
  if (!canSellUsedRefurbished(settings)) {
    return (
      <div className="flex flex-col w-full min-h-[50vh] pb-12 pt-48 items-center text-center px-4">
        <h2 className="text-2xl font-bold text-white mb-4">Pre-owned phones are currently unavailable.</h2>
        <p className="text-gray-400">Please check back later or visit our store for fresh inventory.</p>
      </div>
    );
  }

  const params = await searchParams;
  const parsedPage = Number.parseInt(params.page || "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;

  const records = await withDatabaseFallback(
    prisma.product.findMany({
      where: { type: { in: ['USED', 'REFURBISHED'] } },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE + 1,
      select: productCardSelect,
    }),
    [],
    "pre-owned products"
  );

  const hasNext = records.length > PAGE_SIZE;
  const products = records.slice(0, PAGE_SIZE).map(toProductCardProduct);

  const breadcrumbs = [
    { name: "Pre-Owned Phones", path: "/pre-owned" },
  ];

  return (
    <div className="flex flex-col w-full pb-16">
      <Section className="pb-4 pt-24" contained={true}>
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs items={breadcrumbs} />

          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mt-6">
            <span className="text-accent text-xs font-bold uppercase tracking-widest block mb-2">
              Tested & Verified
            </span>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
              Certified Pre-Owned & Refurbished Phones in Meerut
            </h1>
            <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-6">
              Every pre-owned device at {settings.displayName || settings.businessName} undergoes a rigorous 32-point hardware and battery health inspection. Test in person before purchase.
            </p>

            <div className="bg-white/5 border border-amber-500/30 rounded-xl p-4 md:p-5 text-center max-w-2xl">
              <span className="text-amber-500 font-bold block mb-1 uppercase tracking-widest text-xs">Quality Assurance</span>
              <p className="text-gray-300 text-xs md:text-sm leading-relaxed">
                Condition ratings are accurate estimates. All devices come with clean IMEI verification, genuine internal components, and in-store testing support.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <PreOwnedSection products={products} whatsappNumber={settings.whatsapp} isWhatsAppEnabled={isWhatsAppEnabled(settings)} />
      <PaginationLinks page={page} hasNext={hasNext} basePath="/pre-owned" />
    </div>
  );
}
