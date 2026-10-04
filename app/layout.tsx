import './globals.css';
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import { IBM_Plex_Mono } from 'next/font/google';

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-ibm-plex-mono',
  display: 'swap',
});
import { Toaster } from "@/components/ui/toaster";
import { ToolsProvider } from '@/lib/tools-context';
import { ActivityProvider } from '@/lib/activity-tracker';
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { TooltipProvider } from "@/components/ui/tooltip"

export const metadata: Metadata = {
  metadataBase: new URL("https://www.astraa.tech"),
  title: {
    default: "Astraa - Free Online Utility Tools for Developers & Creators",
    template: "%s | Astraa",
  },
  description:
    "Discover 15+ free online utility tools including calculator, currency converter, password generator, hash tools, and markdown viewer. No signup required.",
  creator: "Aditya Kumar",
  keywords: [
    "utility tools",
    "developer tools",
    "online tools",
    "free tools",
    "calculator",
    "converter",
    "generator",
    "markdown viewer",
    "markdown editor",
    "browser tools",
  ],
  manifest: "/manifest.json",
  icons: {
    icon: "/assets/astraa_pfp.png",
    apple: "/assets/astraa_pfp.png",
  },
  robots: {
    index: true,
    follow: true,
    "max-image-preview": "large" as const,
    "max-snippet": -1,
    "max-video-preview": -1,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://www.astraa.tech",
    siteName: "Astraa",
    title: "Astraa - Free Online Utility Tools",
    description:
      "15+ free online utility tools for developers and creators. No signup required.",
    images: [
      {
        url: "/assets/astraa_banner.jpg",
        width: 1200,
        height: 630,
        alt: "Astraa - Free utility tools suite for developers and creators",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Astraa - Free Online Utility Tools",
    description: "15+ free online utility tools for developers and creators.",
    images: ["/assets/astraa_banner.jpg"],
  },
  alternates: {
    canonical: "https://www.astraa.tech",
  },
  verification: {
    google: "K3dnShfyPnbR7ZmBYsPTffM4BNv8F3IFSfQ2Mp1_UGs",
    other: { "msvalidate.01": "FD086326818E5E4305514B1A1379C444" },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} ${ibmPlexMono.variable} font-sans`} suppressHydrationWarning>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                "name": "Astraa",
                "url": "https://www.astraa.tech",
                "logo": "https://www.astraa.tech/assets/astraa_pfp.png",
                "sameAs": [
                  "https://github.com/puri-adityakumar/astraa",
                  "https://x.com/astraadottech",
                  "https://t.me/astraadottech",
                ],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebApplication",
                "name": "Astraa",
                "description":
                  "Browser-based utility toolkit for developers and creators",
                "url": "https://www.astraa.tech",
                "applicationCategory": "UtilityApplication",
                "operatingSystem": "Web",
                "datePublished": "2025-01-01",
                "dateModified": new Date().toISOString().split("T")[0],
                "offers": {
                  "@type": "Offer",
                  "price": "0",
                  "priceCurrency": "USD",
                },
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Astraa",
                "url": "https://www.astraa.tech",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target":
                    "https://www.astraa.tech/explore?q={search_term_string}",
                  "query-input": "required name=search_term_string",
                },
              },
            ]),
          }}
        />
        <TooltipProvider>
          <ToolsProvider>
            <ActivityProvider>
              {children}
              <Toaster />
              {process.env.NODE_ENV === "production" && (
                <>
                  <Analytics />
                  <SpeedInsights />
                </>
              )}
            </ActivityProvider>
          </ToolsProvider>
        </TooltipProvider>
      </body>
    </html>
  );
}