import type { Metadata, Viewport } from "next";

export const siteMetadata: Metadata = {
  title: { default: "Fodmap-Tracker", template: "%s · Fodmap-Tracker" },
  description: "Houd voeding en symptomen overzichtelijk bij.",
  applicationName: "Fodmap-Tracker",
  manifest: "/manifest.webmanifest?v=4",
  icons: {
    icon: [{ url: "/icon-192.png?v=3", sizes: "192x192", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png?v=3", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    title: "Fodmap-Tracker",
    statusBarStyle: "default",
    startupImage: [
      { url: "/splash/640x1136.png", media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" },
      { url: "/splash/750x1334.png", media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" },
      { url: "/splash/1242x2208.png", media: "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/splash/1125x2436.png", media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/splash/1170x2532.png", media: "(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/splash/1179x2556.png", media: "(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/splash/828x1792.png", media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" },
      { url: "/splash/1242x2688.png", media: "(device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/splash/1284x2778.png", media: "(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/splash/1290x2796.png", media: "(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/splash/1206x2622.png", media: "(device-width: 402px) and (device-height: 874px) and (-webkit-device-pixel-ratio: 3)" },
      { url: "/splash/1320x2868.png", media: "(device-width: 440px) and (device-height: 956px) and (-webkit-device-pixel-ratio: 3)" },
    ],
  },
  openGraph: {
    title: "Fodmap-Tracker",
    description: "Houd voeding en symptomen overzichtelijk bij.",
    siteName: "Fodmap-Tracker",
    type: "website",
  },
  twitter: { card: "summary", title: "Fodmap-Tracker", description: "Houd voeding en symptomen overzichtelijk bij." },
};

export const siteViewport: Viewport = {
  themeColor: "#f7f8f5", colorScheme: "light", width: "device-width", initialScale: 1,
};
