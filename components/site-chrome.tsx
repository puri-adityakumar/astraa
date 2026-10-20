import { ThemeProvider } from "@/components/theme-provider";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { PageTransition } from "@/components/ui/page-transition";
import { LandingBackground } from "@/components/landing-background";

/**
 * Legacy site chrome (theme context, background, nav, main container, footer).
 * Shared by app/(site)/layout.tsx and app/not-found.tsx so 404s keep the
 * standard look even though they render outside the (site) route group.
 */
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
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
    </ThemeProvider>
  );
}
