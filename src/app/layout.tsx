import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Using a modern clean font
import "./globals.css";
import { getStoreSettings } from "@/lib/settings";

const inter = Inter({ subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : new URL('http://localhost:3000');

  return {
    metadataBase: baseUrl,
    title: {
      default: `${settings.displayName || settings.businessName} | Mobiles, Accessories & Repairing`,
      template: `%s | ${settings.displayName || settings.businessName}`,
    },
    description: `Explore new and pre-owned smartphones, mobile accessories, mobile repairing and phone exchange at ${settings.displayName || settings.businessName} in Partapur, Meerut.`,
    openGraph: {
      type: 'website',
      locale: 'en_IN',
      url: '/',
      title: settings.businessName,
      description: `Explore new and pre-owned smartphones, mobile accessories, mobile repairing and phone exchange at ${settings.displayName || settings.businessName} in Partapur, Meerut.`,
      siteName: settings.businessName,
    },
    twitter: {
      card: 'summary_large_image',
      title: settings.businessName,
      description: `Explore new and pre-owned smartphones, mobile accessories, mobile repairing and phone exchange at ${settings.displayName || settings.businessName} in Partapur, Meerut.`,
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getStoreSettings();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : new URL('http://localhost:3000');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'MobilePhoneStore',
    name: settings.businessName,
    description: "Closed on the last Saturday of every month.",
    telephone: settings.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: settings.address,
      addressLocality: "Meerut",
      addressRegion: "Uttar Pradesh",
      postalCode: "250103",
      addressCountry: "IN"
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
        ],
        opens: settings.openingTime,
        closes: settings.closingTime
      }
    ],
    url: baseUrl.toString(),
    sameAs: [
      settings.instagram,
      settings.youtube,
      settings.facebook
    ].filter(Boolean)
  };

  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-background text-foreground flex flex-col`}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
