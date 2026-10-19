import type { Metadata, Viewport } from "next";
import { Instrument_Serif, Inter_Tight, JetBrains_Mono } from "next/font/google";
import { MotionConfig } from "motion/react";
import { site } from "@/content/site";
import "./globals.css";

const display = Instrument_Serif({ subsets: ["latin"], weight: "400", variable: "--f-display" });
const sans = Inter_Tight({ subsets: ["latin"], variable: "--f-sans" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--f-mono" });

const description =
  "SETMI INDIA has supplied audio-video cables, connectors and multimedia products from Delhi since 1983. Explore the range and send an enquiry.";

export const metadata: Metadata = {
  metadataBase: new URL(site.siteUrl),
  title: { default: site.title, template: "%s | SETMI INDIA" },
  description,
  alternates: { canonical: "/" },
  openGraph: { title: site.title, description, siteName: "SETMI INDIA", type: "website", locale: "en_IN", images: ["/brand/setmi-logo.png"] },
  icons: { icon: "/brand/setmi-logo.png" },
};

export const viewport: Viewport = { themeColor: "#0a0c0e", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body>
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </body>
    </html>
  );
}
