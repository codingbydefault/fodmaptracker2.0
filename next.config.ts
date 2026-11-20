import type { NextConfig } from "next";

// Report-only first: this gives us production evidence before enforcing the
// policy, avoiding accidental outages in Supabase, Analytics or remote images.
const contentSecurityPolicyReportOnly = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://region1.google-analytics.com https://*.google-analytics.com",
  "worker-src 'self' blob:",
  "manifest-src 'self'",
].join("; ");

// Enforced slice only. frame-ancestors, base-uri and object-src do not change
// which scripts or images load. The full policy stays report-only until
// production reports show it is safe to enforce.
const contentSecurityPolicy = [
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(self), microphone=(), geolocation=(), payment=(), accelerometer=(), bluetooth=(), display-capture=(), gyroscope=(), magnetometer=(), usb=(), browsing-topics=()" },
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Permitted-Cross-Domain-Policies", value: "none" },
  { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
  { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicyReportOnly },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    serverActions: {
      // Accommodate the 5 MB meal-photo limit plus multipart form overhead.
      // Profile photos remain restricted to 3 MB in the server action itself.
      bodySizeLimit: "6mb",
    },
  },
  turbopack: { root: process.cwd() },
  async redirects() {
    return [{ source: "/nieuws", destination: "/nl/artikels", permanent: false }];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
