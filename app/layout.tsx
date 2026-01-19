import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import { Footer } from "@/components/footer";
import { LandingBackground } from "@/components/landing-background";
import { Navigation } from "@/components/navigation";
import { ThemeProvider } from "@/components/theme-provider";
import { PageTransition } from "@/components/ui/page-transition";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ActivityProvider } from "@/lib/activity-tracker";
import { ToolsProvider } from "@/lib/tools-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "astraa - Utility Tools Suite",
  description:
    "A collection of helpful utility tools for developers and creators",
  icons: {
    icon: "/assets/astraa_pfp.png",
  },
  openGraph: {
    images: ["/assets/astraa_banner.png"],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/assets/astraa_banner.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes"
        />
      </head>
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans`}
        suppressHydrationWarning
      >
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
                <div className="flex min-h-screen flex-col">
                  <Navigation />
                  <main
                    id="main-content"
                    className="w-full flex-1"
                    tabIndex={-1}
                  >
                    <PageTransition type="fade">
                      <div className="container mx-auto px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-12">
                        {children}
                      </div>
                    </PageTransition>
                  </main>
                  <Footer />
                </div>
                <Toaster />
                <Analytics />
                <SpeedInsights />
              </ActivityProvider>
            </ToolsProvider>
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
