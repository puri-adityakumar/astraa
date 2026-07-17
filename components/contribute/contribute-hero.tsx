import { Button } from "@/components/ui/button";
import { Github, Bug } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface ContributeHeroProps {
  contributorCount: number;
}

export function ContributeHero({ contributorCount }: ContributeHeroProps) {
  return (
    <div className="text-center space-y-4">
      <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
        Contribute to <span style={{ fontFamily: "'Funnel Display', sans-serif" }}>astraa</span>
      </h1>
      <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
        Built by developers, for developers. Help us shape the future of this open-source collection
        of tools.
      </p>
      <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
        Open-source, privacy-first utility toolkit. All tools run locally in your browser with no
        data collection.
      </p>
      <div className="flex items-center justify-center gap-4 pt-4">
        <Button asChild size="lg" className="rounded-full px-8">
          <Link href="https://github.com/puri-adityakumar/astraa" target="_blank" rel="noopener noreferrer">
            <Github className="mr-2 h-5 w-5" />
            Star on GitHub
          </Link>
        </Button>
        <Button asChild variant="outline" size="lg" className="rounded-full px-8">
          <Link href="https://github.com/puri-adityakumar/astraa/issues" target="_blank" rel="noopener noreferrer">
            <Bug className="mr-2 h-5 w-5" />
            Report Issue
          </Link>
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        {contributorCount > 0
          ? `${contributorCount} contributors and growing`
          : "Join our growing community of contributors"}
      </p>

      <div className="pt-8 max-w-xl mx-auto space-y-6">
        <blockquote className="font-mono text-sm sm:text-base text-muted-foreground leading-relaxed italic">
          &quot;This was my first idea when I started coding. I wanted to build this, but back then I
          didn&apos;t have the skills. Now I do, so I made it happen.&quot;
        </blockquote>
        <div className="flex items-center justify-center gap-3">
          <div className="text-right leading-tight">
            <span className="text-sm font-semibold block">~ Aditya</span>
            <span className="text-xs text-muted-foreground block">Founder</span>
          </div>
          <Link
            href="https://github.com/puri-adityakumar"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 hover:opacity-80 transition-opacity"
          >
            <Image
              src="https://github.com/puri-adityakumar.png"
              alt="Aditya"
              width={40}
              height={40}
              className="w-10 h-10 rounded-full border border-border bg-muted"
            />
          </Link>
        </div>
      </div>
    </div>
  );
}
