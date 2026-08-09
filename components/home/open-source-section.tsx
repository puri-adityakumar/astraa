import Link from "next/link";
import { ArrowRight, BookOpen, Github, GitPullRequest } from "lucide-react";

import { Button } from "@/components/ui/button";

const REPOSITORY_URL = "https://github.com/puri-adityakumar/astraa";
const CONTRIBUTING_URL = `${REPOSITORY_URL}/blob/development/CONTRIBUTING.md`;

export function OpenSourceSection() {
  return (
    <section
      className="-mx-4 border-b px-5 py-12 sm:-mx-6 sm:px-8 sm:py-16 lg:-mx-8 lg:px-12 lg:py-20"
      aria-labelledby="open-source-title"
    >
      <div className="grid gap-8 rounded-xl border bg-card p-6 shadow-geist sm:p-8 md:grid-cols-[1fr_auto] md:items-center lg:p-10">
        <div>
          <div className="flex h-10 w-10 items-center justify-center rounded-md border bg-muted/40">
            <Github className="h-4 w-4" aria-hidden="true" />
          </div>
          <h2 id="open-source-title" className="mt-5">
            Open source, with a contribution path.
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
            Inspect the implementation, browse the project’s contribution surface, and read the
            repository guide before proposing a focused change.
          </p>
        </div>

        <div className="grid gap-2 sm:grid-cols-3 md:grid-cols-1">
          <Button variant="outline" asChild>
            <Link href={REPOSITORY_URL} target="_blank" rel="noopener noreferrer" className="gap-2">
              <Github className="h-4 w-4" aria-hidden="true" />
              Repository
              <span className="sr-only"> (opens in a new tab)</span>
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/contribute" className="gap-2">
              <GitPullRequest className="h-4 w-4" aria-hidden="true" />
              Contribute
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link
              href={CONTRIBUTING_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="gap-2"
            >
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              Read the guide
              <span className="sr-only"> (opens in a new tab)</span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export function FinalToolsAction() {
  return (
    <section
      className="-mx-4 px-5 py-14 text-center sm:-mx-6 sm:px-8 sm:py-20 lg:-mx-8 lg:px-12 lg:py-24"
      aria-labelledby="final-tools-title"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        Ready when the task is
      </p>
      <h2 id="final-tools-title" className="mx-auto mt-3 max-w-2xl">
        Find the utility that clears your next blocker.
      </h2>
      <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground">
        Open the available catalog and choose the processing boundary that fits the job.
      </p>
      <Button size="lg" asChild>
        <Link href="/tools" prefetch={false} className="group mt-7 gap-2" data-home-primary="final">
          See all available tools
          <ArrowRight
            className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      </Button>
    </section>
  );
}
