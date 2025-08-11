import './globals.css';
import type { Metadata } from 'next';
import { Work_Sans } from 'next/font/google';
import { Navigation } from '@/components/navigation';
import { Footer } from '@/components/footer';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { ToolsProvider } from '@/lib/tools-context';

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
      <head />
      <body className={workSans.className} suppressHydrationWarning>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
          suppressHydrationWarning
        >
          <ToolsProvider>
            <div className="min-h-screen flex flex-col">
              <Navigation />
              <main className="container mx-auto px-4 py-8 animate-in flex-1">
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