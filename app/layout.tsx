import './globals.css';
import type { Metadata } from 'next';
import { Work_Sans } from 'next/font/google';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Toaster } from "@/components/ui/toaster";
import { EnhancedThemeProvider } from "@/components/theme/enhanced-theme-provider";
import { ToolsProvider } from '@/lib/tools-context';
import { ActivityProvider } from '@/lib/activity-tracker';
import { PageTransition } from '@/components/ui/page-transition';
import { KeyboardNavDetector } from '@/components/accessibility/keyboard-nav-detector';
import { SkipToMain } from '@/components/accessibility/skip-to-main';

const workSans = Work_Sans({
  subsets: ['latin'],
  variable: '--font-work-sans',
});

export const metadata: Metadata = {
  title: 'astrah - Utility Tools Suite',
  description: 'A collection of helpful utility tools for developers and creators',
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
      <body className={workSans.className} suppressHydrationWarning>
        <EnhancedThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ToolsProvider>
            <ActivityProvider>
              <KeyboardNavDetector />
              <SkipToMain />
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
            </ActivityProvider>
          </ToolsProvider>
        </EnhancedThemeProvider>
      </body>
    </html>
  );
}