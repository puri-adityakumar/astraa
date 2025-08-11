import './globals.css';
import type { Metadata } from 'next';
import { Work_Sans } from 'next/font/google';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ToolsProvider } from '@/lib/tools-context';

// Optimize font loading for mobile
const workSans = Work_Sans({ 
  subsets: ['latin'],
  variable: '--font-work-sans',
  display: 'swap', // Improve font loading performance
  preload: true,
  fallback: ['system-ui', 'arial'] // Better fallback fonts
});

export const metadata: Metadata = {
  title: 'astraa - Utility Tools Suite',
  description: 'A collection of helpful utility tools for developers and creators',
  // Mobile-specific meta tags
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5, // Allow some zoom for accessibility
    userScalable: true,
    viewportFit: 'cover' // Support for iPhone X+ safe areas
  },
  // Performance and mobile optimization meta tags
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=no', // Prevent auto-linking phone numbers
    'msapplication-tap-highlight': 'no', // Remove tap highlight on Windows Phone
  },
  // Open Graph for better social sharing
  openGraph: {
    title: 'astraa - Utility Tools Suite',
    description: 'A collection of helpful utility tools for developers and creators',
    type: 'website',
    locale: 'en_US',
  },
  // Twitter Card for better social sharing
  twitter: {
    card: 'summary_large_image',
    title: 'astraa - Utility Tools Suite',
    description: 'A collection of helpful utility tools for developers and creators',
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains for better performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* DNS prefetch for potential external resources */}
        <link rel="dns-prefetch" href="https://api.coingecko.com" />
        <link rel="dns-prefetch" href="https://api.exchangerate-api.com" />
        
        {/* Optimize resource loading */}
        <meta name="format-detection" content="telephone=no" />
        <meta name="msapplication-tap-highlight" content="no" />
        
        {/* PWA-like experience on mobile */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="astraa" />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#22c55e" />
        <meta name="msapplication-navbutton-color" content="#22c55e" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={workSans.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          suppressHydrationWarning
        >
          <ToolsProvider>
            <div className="min-h-screen flex flex-col scroll-smooth">
              <Navigation />
              <main className="container mx-auto px-4 py-6 md:py-8 animate-in flex-1 focus-visible">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster />
          </ToolsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}