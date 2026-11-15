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
    title: `Privacy Policy | ${brandName} Partapur, Meerut`,
    description: `Read the privacy policy of ${settings.businessName}. We respect your data privacy when browsing our website, enquiring on WhatsApp, or visiting our shop.`,
    path: "/privacy",
    noindex: true,
  });
}

export default async function PrivacyPage() {
  const settings = await getStoreSettings();

  return (
    <div className="flex flex-col w-full pb-16 pt-24">
      <Section contained={true}>
        <div className="max-w-4xl mx-auto">
          <Breadcrumbs items={[{ name: "Privacy Policy", path: "/privacy" }]} />

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white mb-6 mt-6">
            Privacy Policy
          </h1>
          <p className="text-gray-400 text-sm mb-8">
            Last Updated: November 2026
          </p>

          <div className="space-y-6 text-gray-300 text-sm md:text-base leading-relaxed">
            <section>
              <h2 className="text-xl font-bold text-white mb-3">1. Information We Collect</h2>
              <p>
                At {settings.businessName}, we value your privacy. We only collect information that you voluntarily provide to us when submitting an exchange enquiry, contacting us via WhatsApp, calling our store, or visiting our physical showroom in Partapur, Meerut.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">2. How We Use Your Information</h2>
              <p>
                Information provided (such as your phone model, condition details, and contact number) is used solely to respond to your product enquiries, provide mobile repair updates, calculate device trade-in valuations, and deliver customer service. We do not sell or share your personal data with third-party advertisers.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">3. Customer Device Data Protection</h2>
              <p>
                During mobile repairing or trade-in assessment, our technicians prioritize your data privacy. We recommend backing up your data before hardware service. When taking in old devices for exchange or purchase, we perform a complete factory data wipe with the owner&apos;s consent.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-bold text-white mb-3">4. Contact Information</h2>
              <p>
                If you have any questions about our privacy practices, please contact us directly at our store:
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

