"use client";

import Link from "next/link";
import { Compass, Github, Monitor, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { switchToLegacyFlavour } from "./flavour-switch";
import { SponsorSlot } from "./sponsor-slot";

const SITE_LINKS = [
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/contribute", label: "Contribute", icon: Github },
  { href: "/privacy", label: "Privacy", icon: Shield },
] as const;

const ICON_CLASS =
  "flex min-h-touch min-w-touch items-center justify-center rounded-md " +
  "text-term-muted hover:bg-term-surface2 hover:text-term-fg " +
  "focus-visible:bg-term-surface2 focus-visible:text-term-fg";

export function SiteIcons({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav aria-label="Site" className="flex items-center justify-between gap-1">
      {SITE_LINKS.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          aria-label={label}
          title={label}
          onClick={() => onNavigate?.()}
          className={ICON_CLASS}
        >
          <Icon aria-hidden="true" className="h-4 w-4" />
        </Link>
      ))}
      <button
        type="button"
        aria-label="Legacy UI"
        title="Legacy UI"
        onClick={switchToLegacyFlavour}
        className={ICON_CLASS}
      >
        <Monitor aria-hidden="true" className="h-4 w-4" />
      </button>
    </nav>
  );
}

export function LeftRail({ inert = false }: { inert?: boolean }) {
  return (
    <aside
      aria-label="Astraa"
      inert={inert}
      className={cn(
        "hidden w-56 shrink-0 flex-col bg-term-surface",
        "border-r border-term-surface2 md:flex",
      )}
    >
      <div className="px-5 py-6">
        <h1
          aria-label="Astraa"
          className="select-none whitespace-nowrap font-pixel text-xl text-term-fg"
        >
          astraa
        </h1>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-4 pb-6">
        <SponsorSlot />
      </div>
      <div className="border-t border-term-surface2 px-4 py-3">
        <SiteIcons />
      </div>
    </aside>
  );
}
