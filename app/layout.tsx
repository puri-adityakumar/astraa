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
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { ToolsProvider } from '@/lib/tools-context';
import { ActivityProvider } from '@/lib/activity-tracker';
import { PageTransition } from '@/components/ui/page-transition';
import { LandingBackground } from '@/components/landing-background';
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { TooltipProvider } from "@/components/ui/tooltip"
import { toolCategories } from "@/lib/tools";
import { SITE_LAST_MODIFIED } from "@/lib/site-meta";

const LIVE_TOOL_COUNT = toolCategories
  .flatMap((c) => c.items)
  .filter((t) => !t.comingSoon).length;

export const metadata: Metadata = {
  metadataBase: new URL("https://www.astraa.tech"),
  title: {
    default: `Astraa - ${LIVE_TOOL_COUNT}+ Free Browser Tools for Developers & Creators`,
    template: "%s | Astraa",
  },
  description: `Astraa is a free toolkit of ${LIVE_TOOL_COUNT} browser-based utilities including scientific calculator, currency converter, password generator, hash generator, unit converter, image resizer, and markdown editor. No signup, no upload, no tracking.`,
  creator: "Aditya Kumar",
  keywords: [
    "utility tools",
    "developer tools",
    "online tools",
    "free tools",
    "calculator",
    "converter",
    "generator",
    "markdown editor",
    "browser tools",
    "no signup tools",
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
    title: `Astraa - ${LIVE_TOOL_COUNT}+ Free Browser Tools`,
    description: `${LIVE_TOOL_COUNT} free browser-based utility tools for developers and creators. No signup required.`,
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
    title: `Astraa - ${LIVE_TOOL_COUNT}+ Free Browser Tools`,
    description: `${LIVE_TOOL_COUNT} free browser-based utility tools for developers and creators.`,
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
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://www.astraa.tech/#organization",
                  "name": "Astraa",
                  "url": "https://www.astraa.tech",
                  "foundingDate": "2025-01-01",
                  "founder": {
                    "@type": "Person",
                    "@id": "https://www.astraa.tech/about#person",
                    "name": "Aditya Kumar",
                    "url": "https://github.com/puri-adityakumar",
                  },
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://www.astraa.tech/assets/astraa_pfp.png",
                    "width": 512,
                    "height": 512,
                  },
                  "sameAs": [
                    "https://github.com/puri-adityakumar/astraa",
                    "https://x.com/astraadottech",
                    "https://t.me/astraadottech",
                  ],
                },
                {
                  "@type": "WebSite",
                  "@id": "https://www.astraa.tech/#website",
                  "name": "Astraa",
                  "url": "https://www.astraa.tech",
                  "publisher": { "@id": "https://www.astraa.tech/#organization" },
                  "inLanguage": "en-US",
                },
                {
                  "@type": "WebApplication",
                  "@id": "https://www.astraa.tech/#webapp",
                  "name": "Astraa",
                  "description":
                    `Browser-based utility toolkit with ${LIVE_TOOL_COUNT} free tools for developers and creators.`,
                  "url": "https://www.astraa.tech",
                  "applicationCategory": "UtilityApplication",
                  "operatingSystem": "Web",
                  "browserRequirements":
                    "Requires JavaScript. Supports modern Chrome, Firefox, Safari, Edge.",
                  "softwareVersion": "1.1.0",
                  "datePublished": "2025-01-01",
                  "dateModified": SITE_LAST_MODIFIED,
                  "isPartOf": { "@id": "https://www.astraa.tech/#website" },
                  "publisher": { "@id": "https://www.astraa.tech/#organization" },
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "USD",
                    "availability": "https://schema.org/OnlineOnly",
                  },
                  "featureList": [
                    "Password generator",
                    "Hash generator (MD5, SHA-1, SHA-256, SHA-512)",
                    "Scientific calculator",
                    "Currency converter (fiat + crypto)",
                    "Unit converter",
                    "Image resizer",
                    "AI text generator",
                    "Markdown editor with live preview",
                  ],
                },
              ],
            }),
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <ToolsProvider>
              <ActivityProvider>
                <LandingBackground />
                <div className="min-h-screen flex flex-col">
                  <Navigation />
                  <main id="main-content" className="flex-1 w-full" tabIndex={-1}>
                    <PageTransition type="fade">
                      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
                        {children}
                      </div>
                    </PageTransition>
                  </main>
                  <Footer />
                </div>
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
        </ThemeProvider>
      </body>
    </html>
  );
}