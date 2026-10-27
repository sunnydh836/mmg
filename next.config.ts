import type { NextConfig } from "next";

const supabaseImageHost = process.env.SUPABASE_URL
  ? new URL(process.env.SUPABASE_URL).hostname
  : undefined;

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
    },
  },
  images: {
    remotePatterns: [
      ...(supabaseImageHost
        ? [{ protocol: "https" as const, hostname: supabaseImageHost, pathname: "/storage/v1/object/public/**" }]
        : []),
      { protocol: 'https', hostname: 'image01.realme.net' },
      { protocol: 'https', hostname: 'image.oppo.com' },
      { protocol: 'https', hostname: 'i02.appmifile.com' },
      { protocol: 'https', hostname: 'in-exstatic-vivofs.vivo.com' },
      { protocol: 'https', hostname: 'image.oneplus.com' },
      { protocol: 'https', hostname: 'store.storeimages.cdn-apple.com' },
      { protocol: 'https', hostname: 'images.samsung.com' },
      { protocol: 'https', hostname: 'd3fa68hw0m2vcc.cloudfront.net' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          }
        ],
      },
    ];
  },
};

export default nextConfig;
