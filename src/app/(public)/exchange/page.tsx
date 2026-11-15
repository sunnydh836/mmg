import type { Metadata } from 'next';
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { ClientExchangeForm } from "@/components/sections/ClientExchangeForm";
import { RefreshCw, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { getStoreSettings, canExchangeOldPhones } from "@/lib/settings";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const brandName = settings.displayName || settings.businessName;

  return buildMetadata({
    title: `Old Phone Exchange & Trade-In | ${brandName} Partapur, Meerut`,
    description: `Upgrade your smartphone with the best old phone exchange valuation in Partapur, Meerut at ${settings.businessName}. Instant trade-in assessment, spot cash, and seamless upgrade to new or certified pre-owned devices.`,
    path: "/exchange",
    keywords: [
      "Phone exchange Meerut",
      "Sell old phone in Partapur Meerut",
      "Mobile exchange offer Meerut",
      "Old mobile valuation Partapur",
      "Trade in mobile phone Meerut",
    ],
  });
}

export default async function ExchangePage() {
  const settings = await getStoreSettings();

  if (!canExchangeOldPhones(settings)) {
    return (
      <div className="flex flex-col w-full min-h-[50vh] pb-12 pt-48 items-center text-center px-4">
        <h2 className="text-2xl font-bold text-white mb-4">Phone exchange is currently unavailable.</h2>
        <p className="text-gray-400">Please contact our store for the latest trade-in updates.</p>
      </div>
    );
  }

  const breadcrumbs = [
    { name: "Phone Exchange", path: "/exchange" },
  ];

  return (
    <div className="flex flex-col w-full pb-16 pt-24">
      <Section className="pb-0" contained={true}>
        <div className="max-w-7xl mx-auto">
          <Breadcrumbs items={breadcrumbs} />

          <div className="flex flex-col items-center text-center max-w-3xl mx-auto mt-6">
            <div className="inline-flex items-center justify-center p-4 bg-accent/10 text-accent rounded-2xl mb-6">
              <RefreshCw size={32} />
            </div>
            <span className="text-accent text-xs font-bold uppercase tracking-widest block mb-2">
              Best Trade-In Value
            </span>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-4">
              Exchange Your Old Phone in Partapur, Meerut
            </h1>
            <p className="text-gray-400 text-base md:text-lg leading-relaxed mb-10">
              Get an instant valuation for your existing smartphone. Upgrade to the latest iPhone, Samsung, OnePlus, or certified pre-owned device with seamless spot valuation at {settings.displayName || settings.businessName}.
            </p>

            {/* Benefits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full mb-10 text-left">
              <div className="p-4 rounded-xl bg-secondary/30 border border-white/5 flex items-start gap-3">
                <CheckCircle2 className="text-accent w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm font-bold text-white mb-1">Instant Valuation</h2>
                  <p className="text-xs text-gray-400">Accurate quotes based on physical and functional condition.</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-secondary/30 border border-white/5 flex items-start gap-3">
                <ShieldCheck className="text-accent w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm font-bold text-white mb-1">Data Safety</h2>
                  <p className="text-xs text-gray-400">Complete data wipe assistance to keep your private data safe.</p>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-secondary/30 border border-white/5 flex items-start gap-3">
                <Zap className="text-accent w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <h2 className="text-sm font-bold text-white mb-1">Any Brand Accepted</h2>
                  <p className="text-xs text-gray-400">Apple, Samsung, Xiaomi, Realme, Vivo, OnePlus and more.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>

      <Section id="exchange-form" className="pt-4 pb-20">
        <ClientExchangeForm whatsappNumber={settings.whatsapp} businessName={settings.displayName || settings.businessName} />
      </Section>
    </div>
  );
}
