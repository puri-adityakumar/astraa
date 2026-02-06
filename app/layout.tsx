import './globals.css';
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
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

export const metadata: Metadata = {
  title: 'astraa - Utility Tools Suite',
  description: 'A collection of helpful utility tools for developers and creators',
  icons: {
    icon: '/assets/astraa_pfp.png',
  },
  openGraph: {
    images: ['/assets/astraa_banner.png'],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/assets/astraa_banner.png'],
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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes" />
      </head>
      <body className={`${GeistSans.variable} ${GeistMono.variable} font-sans`} suppressHydrationWarning>
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