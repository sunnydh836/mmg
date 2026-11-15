import type { Metadata } from 'next';
import { Section } from "@/components/ui/Section";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { getStoreSettings } from "@/lib/settings";
import { buildMetadata } from "@/lib/seo";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const brandName = settings.displayName || settings.businessName;

  return buildMetadata({
    title: `Terms of Service | ${brandName} Partapur, Meerut`,
    description: `Terms and conditions for product purchases, pre-owned testing, mobile repairs, and phone exchange at ${settings.businessName}.`,
    path: "/terms",
    noindex: true,
  });
}

export default async function TermsPage() {
  const settings = await getStoreSettings();

  return (
    <div className="flex flex-col w-full pb-16 pt-24">
      <Section contained={true}>
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs items={[{ name: "Terms of Service", path: "/terms" }]} />

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6 mt-6">
            Terms of Service
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            Last Updated: November 2026
          </p>

          <div className="space-y-6 text-gray-300 text-sm md:text-base leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. General Overview</h2>
              <p>
                Welcome to {settings.businessName}. By browsing our website, visiting our physical showroom in Partapur, Meerut, or purchasing devices and repair services from us, you agree to these standard terms.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. In-Store Product Testing & Purchases</h2>
              <p>
                We encourage all customers to physically test devices, camera quality, battery health, and accessories at our store counter before final purchase. Prices and stock availability displayed online are indicative and subject to in-store verification.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. Mobile Repair Services & Warranty</h2>
              <p>
                Repair estimates provided online or on WhatsApp are initial estimates. Final quotes are confirmed following in-person diagnostic evaluation. Testing and operational warranties apply specifically to replaced hardware parts (such as screens and batteries) against manufacturing defects.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">4. Old Phone Exchange & Purchase</h2>
              <p>
                Exchange values depend strictly on device age, functional condition, screen state, and valid proof of ownership (bill/box/government ID verification where applicable). We reserve the right to decline trade-in of unverified devices.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">5. Contact & Disputes</h2>
              <p>
                Any queries or disputes regarding purchases or service warranties are handled directly at our Partapur store location under local jurisdiction:
              </p>
              <p className="mt-2 text-gray-400">
                <strong>{settings.businessName}</strong><br />
                {settings.address}<br />
                Phone: +91 {settings.phone}
              </p>
            </section>
          </div>
        </div>
      </Section>
    </div>
  );
}

