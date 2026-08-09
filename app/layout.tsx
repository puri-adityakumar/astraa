import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";

import { Footer } from "@/components/footer";
import { Navigation } from "@/components/navigation";
import { SkipToContent } from "@/components/skip-to-content";
import { ThemeProvider } from "@/components/theme-provider";
import { PageTransition } from "@/components/ui/page-transition";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { globalStructuredData, serializeJsonLd } from "@/lib/seo/structured-data";
import { SITE_NAME, SITE_URL } from "@/lib/seo/site";
import { availableTools } from "@/lib/tools";

import "./globals.css";

const analyticsEnabled =
  process.env.NODE_ENV === "production" && process.env.ASTRAA_ENABLE_ANALYTICS !== "false";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME}: Browser-first Utility Tools`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    `Use ${availableTools.length} browser-first utilities for development, writing, files, ` +
    "calculations, and conversions, with clear processing boundaries.",
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
  openGraph: {
    type: "website",
    locale: "en_US",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME}: Browser-first Utility Tools`,
    description:
      `${availableTools.length} browser-first utilities for developers and creators, with ` +
      "clear processing boundaries.",
    images: [
      {
        url: "/assets/astraa_banner.jpg",
        width: 1200,
        height: 630,
        alt: "Astraa utility tools for developers and creators",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME}: Browser-first Utility Tools`,
    description: `${availableTools.length} focused utilities for developers and creators.`,
    images: ["/assets/astraa_banner.jpg"],
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    google: "K3dnShfyPnbR7ZmBYsPTffM4BNv8F3IFSfQ2Mp1_UGs",
    other: { "msvalidate.01": "FD086326818E5E4305514B1A1379C444" },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}>
        <SkipToContent />
        <script
          id="astraa-global-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(globalStructuredData),
          }}
        />
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TooltipProvider>
            <div className="relative flex min-h-screen flex-col bg-background">
              <Navigation />
              <main id="main-content" className="flex w-full flex-1" tabIndex={-1}>
                <PageTransition type="fade">
                  <div className="mx-auto w-full max-w-[1200px] border-x border-border/70 px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
                    {children}
                  </div>
                </PageTransition>
              </main>
              <Footer />
            </div>
            <Toaster />
            {analyticsEnabled && (
              <>
                <Analytics />
                <SpeedInsights />
              </>
            )}
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
