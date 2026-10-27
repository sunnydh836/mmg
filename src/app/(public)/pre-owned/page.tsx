export const dynamic = 'force-dynamic';
import { Metadata } from 'next';
export async function generateMetadata(): Promise<Metadata> {
  const settings = await import('@/lib/settings').then(m => m.getStoreSettings());
  return {
    title: `${settings.displayName || settings.businessName} | Pre-Owned Phones in Meerut`,
    description: `Browse certified pre-owned and refurbished smartphones at ${settings.displayName || settings.businessName} in Partapur, Meerut.`
  };
}

import { Section, SectionHeader } from "@/components/ui/Section";
import { PreOwnedSection } from "@/components/sections/PreOwned";
import prisma from "@/lib/prisma";
import { getStoreSettings, canSellUsedRefurbished, isWhatsAppEnabled } from "@/lib/settings";
import { withDatabaseFallback } from "@/lib/database-fallback";
import { PaginationLinks } from "@/components/ui/PaginationLinks";
import { productCardSelect, toProductCardProduct } from "@/lib/product-card-data";

const PAGE_SIZE = 12;

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const settings = await getStoreSettings();
  if (!canSellUsedRefurbished(settings)) {
    return (
      <div className="flex flex-col w-full min-h-[50vh] pb-12 pt-48 items-center text-center px-4">
        <h2 className="text-2xl font-bold text-white mb-4">Pre-owned phones are currently unavailable.</h2>
        <p className="text-gray-400">Please check back later.</p>
      </div>
    );
  }
  const params = await searchParams;
  const parsedPage = Number.parseInt(params.page || "1", 10);
  const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const records = await withDatabaseFallback(prisma.product.findMany({
    where: { type: { in: ['USED', 'REFURBISHED'] } },
    orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    skip: (page - 1) * PAGE_SIZE,
    take: PAGE_SIZE + 1,
    select: productCardSelect,
  }), [], "pre-owned products");
  const hasNext = records.length > PAGE_SIZE;
  const products = records.slice(0, PAGE_SIZE).map(toProductCardProduct);

  return (
    <div className="flex flex-col w-full pb-12">
      <Section className="pb-0 pt-24" contained={false}>
        <div className="container mx-auto px-4 md:px-6 max-w-7xl flex flex-col items-center">
          <SectionHeader
            title="Pre-Owned Phones"
            subtitle="Quality-tested, certified used and refurbished devices"
            className="text-center w-full max-w-2xl"
          />
          <div className="bg-white/5 border border-amber-500/30 rounded-xl p-4 md:p-6 text-center max-w-3xl mt-4">
            <span className="text-amber-500 font-bold block mb-2 uppercase tracking-widest text-sm">Important Notice</span>
            <p className="text-gray-300 text-sm leading-relaxed">
              Condition details listed are representative estimates. Exact physical condition and accessories must be confirmed upon visiting our store. All pre-owned devices are thoroughly tested.
            </p>
          </div>
        </div>
      </Section>
      <PreOwnedSection products={products} whatsappNumber={settings.whatsapp} isWhatsAppEnabled={isWhatsAppEnabled(settings)} />
      <PaginationLinks page={page} hasNext={hasNext} basePath="/pre-owned" />
    </div>
  );
}
