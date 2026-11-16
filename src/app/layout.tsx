import type { Metadata } from "next";
import { Suspense } from "react";
import Script from "next/script";
import "./globals.css";
import { getStoreSettings } from "@/lib/settings";
import PageNavigationLoader from "@/components/ui/PageNavigationLoader";
import {
  getSiteUrl,
  generateLocalBusinessSchema,
  generateWebSiteSchema,
  generateOrganizationSchema,
} from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getStoreSettings();
  const siteUrl = getSiteUrl();
  const brandName = settings.displayName || settings.businessName;
  const fullName = settings.businessName;

  const titleDefault = `${brandName} | Mobile Shop & Repairing in Partapur, Meerut`;
  const description = `Shop new smartphones, certified pre-owned phones, genuine mobile accessories, old phone exchange, and rapid mobile repairing at ${fullName} in Partapur, Meerut.`;

  const metadata: Metadata = {
    metadataBase: new URL(siteUrl),
    title: {
      default: titleDefault,
      template: `%s | ${brandName}`,
    },
    description,
    keywords: [
      brandName,
      fullName,
      "Mobile shop in Partapur Meerut",
      "Mobile repairing in Partapur",
      "Smartphones in Meerut",
      "Mobile accessories Meerut",
      "Second-hand mobile phones in Meerut",
      "Phone exchange Meerut",
      "iPhone repair Meerut",
      "Android repair Partapur",
    ],
    alternates: {
      canonical: "/",
    },
    icons: {
      icon: [
        { url: "/icon.png", type: "image/png" },
        { url: "/logo.jpg", type: "image/jpeg" },
      ],
      apple: [
        { url: "/apple-icon.png", type: "image/png" },
      ],
      shortcut: ["/icon.png"],
    },
    openGraph: {
      type: "website",
      locale: "en_IN",
      url: `${siteUrl}/`,
      title: titleDefault,
      description,
      siteName: fullName,
      images: [
        {
          url: settings.logoUrl || `${siteUrl}/icon.png`,
          width: 1200,
          height: 630,
          alt: fullName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titleDefault,
      description,
      images: [settings.logoUrl || `${siteUrl}/icon.png`],
    },
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };

  const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;
  if (googleVerification) {
    metadata.verification = {
      google: googleVerification,
    };
  }

  return metadata;
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const settings = await getStoreSettings();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  const graphSchema = {
    "@context": "https://schema.org",
    "@graph": [
      generateLocalBusinessSchema(settings),
      generateWebSiteSchema(settings),
      generateOrganizationSchema(settings),
    ],
  };

  return (
    <html lang="en">
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(graphSchema) }}
        />
      </head>
      <body className="min-h-screen bg-background text-foreground flex flex-col">
        <Suspense fallback={null}>
          <PageNavigationLoader />
        </Suspense>
        {gaId && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaId}', {
                  page_path: window.location.pathname,
                });
              `}
            </Script>
          </>
        )}
        {children}
      </body>
    </html>
  );
}
