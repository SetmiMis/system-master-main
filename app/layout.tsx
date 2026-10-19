import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, Inter } from "next/font/google";
import { MotionConfig } from "motion/react";
import { site } from "@/content/site";
import "./globals.css";

// Same faces as the company reference site.
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800"], variable: "--font-inter" });
const plexMono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-plex-mono" });

const description =
  "SETMI INDIA has supplied audio-video cables, connectors and multimedia products from Delhi since 1983. Watch the short film, explore the range and send an enquiry.";

export const metadata: Metadata = {
  metadataBase: new URL(site.siteUrl),
  title: { default: site.title, template: "%s | SETMI INDIA" },
  description,
  alternates: { canonical: "/" },
  openGraph: { title: site.title, description, siteName: "SETMI INDIA", type: "website", locale: "en_IN", images: ["/brand/setmi-logo.png"] },
  icons: { icon: "/brand/setmi-logo.png" },
};

export const viewport: Viewport = { themeColor: "#013556", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${plexMono.variable}`}>
      <body>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </body>
    </html>
  );
}
