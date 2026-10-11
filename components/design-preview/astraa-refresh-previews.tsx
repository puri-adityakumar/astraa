import {
  ArrowRight,
  Braces,
  Check,
  FileCode2,
  ImageIcon,
  LockKeyhole,
  Search,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import { Logo } from "@/components/logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

const TOOLS = [
  {
    name: "JSON Editor",
    description: "Format, validate, convert, and generate types.",
    icon: Braces,
    category: "Developer",
  },
  {
    name: "Regex Tester",
    description: "Test patterns with live matches and capture groups.",
    icon: WandSparkles,
    category: "Developer",
  },
  {
    name: "Image Resizer",
    description: "Resize and export images without uploading them.",
    icon: ImageIcon,
    category: "Files",
  },
  {
    name: "Markdown Editor",
    description: "Write, preview, and export clean Markdown.",
    icon: FileCode2,
    category: "Writing",
  },
] as const;

function PreviewShell({ children, pageLabel }: { children: React.ReactNode; pageLabel: string }) {
  return (
    <div className="min-h-full bg-background text-foreground">
      <header className="border-b bg-background/95">
        <div className="mx-auto flex max-w-[1200px] items-center gap-5 px-5 py-3 sm:px-8">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex" aria-label="Preview navigation">
            <span className="rounded-md bg-info/10 px-3 py-2 text-sm font-medium text-info">
              Tools
            </span>
            <span className="px-3 py-2 text-sm text-muted-foreground">Games</span>
            <span className="px-3 py-2 text-sm text-muted-foreground">Docs</span>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <span className="hidden text-xs text-muted-foreground sm:inline">⌘ K</span>
            <Button variant="outline" size="icon" aria-label="Search tools">
              <Search className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[1200px] px-5 py-4 sm:px-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          Astraa / {pageLabel}
        </p>
      </div>
      {children}
    </div>
  );
}

export function AstraaHomeRefreshPreview() {
  return (
    <PreviewShell pageLabel="Home">
      <main className="relative overflow-hidden border-y">
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-info/10 via-transparent to-warning/10" />
        <div className="relative mx-auto grid max-w-[1200px] gap-10 px-5 py-12 sm:px-8 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-16 lg:py-24">
          <div>
            <Badge className="border-info/30 bg-info/10 text-info" variant="outline">
              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-info" aria-hidden="true" />
              {TOOLS.length * 5} browser-first tools
            </Badge>
            <h1 className="mt-6 max-w-2xl text-[clamp(2.7rem,7vw,5.4rem)] leading-[0.94] tracking-[-0.065em]">
              Clear the next blocker.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              Focused tools for developer and creator work. Start quickly, understand where your
              data goes, and get back to the task.
            </p>
            <div className="mt-8 flex max-w-xl flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <Input className="h-12 pl-10" placeholder="What do you need to do?" readOnly />
              </div>
              <Button className="h-12 gap-2 bg-info text-info-foreground hover:bg-info/90">
                Browse tools
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <LockKeyhole className="h-3.5 w-3.5 text-success" aria-hidden="true" />
                Local processing is labelled
              </span>
              <span>Free to use</span>
              <span>No account required</span>
            </div>
          </div>

          <Card className="relative overflow-hidden border-info/20 bg-card/90 p-4 shadow-lg sm:p-5">
            <div className="flex items-center justify-between border-b pb-4">
              <div>
                <p className="text-sm font-semibold">Popular starting points</p>
                <p className="mt-1 text-xs text-muted-foreground">Open a tool and start working.</p>
              </div>
              <Sparkles className="h-5 w-5 text-info" aria-hidden="true" />
            </div>
            <div className="mt-3 grid gap-2">
              {TOOLS.slice(0, 3).map((tool) => {
                const Icon = tool.icon;
                return (
                  <div
                    key={tool.name}
                    className="flex items-center gap-3 rounded-lg border bg-background p-3 transition-colors hover:border-info/40 hover:bg-info/5"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-md bg-info/10 text-info">
                      <Icon className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{tool.name}</span>
                      <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                        {tool.description}
                      </span>
                    </span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      </main>
      <section className="mx-auto grid max-w-[1200px] gap-3 px-5 py-8 sm:grid-cols-3 sm:px-8 sm:py-10">
        {[
          ["01", "Pick a tool", "Search by the job, not the category."],
          ["02", "See the boundary", "Know what stays in your browser."],
          ["03", "Keep moving", "Fast workflows with no account wall."],
        ].map(([number, title, description]) => (
          <div key={number} className="rounded-lg border bg-card p-4">
            <span className="font-mono text-[11px] text-info">{number}</span>
            <p className="mt-3 text-sm font-medium">{title}</p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        ))}
      </section>
    </PreviewShell>
  );
}

export function AstraaToolsRefreshPreview() {
  return (
    <PreviewShell pageLabel="Tools">
      <main className="mx-auto max-w-[1200px] px-5 pb-12 sm:px-8 sm:pb-16">
        <div className="flex flex-col gap-6 border-b py-8 sm:flex-row sm:items-end sm:justify-between sm:py-12">
          <div>
            <h1 className="text-4xl tracking-[-0.055em] sm:text-5xl">Find the right tool.</h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
              Search by outcome, then choose the processing boundary that fits the job.
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input className="pl-10" placeholder="Search tools" readOnly />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 py-5">
          <Badge className="border-info/30 bg-info/10 text-info" variant="outline">
            All tools · 20
          </Badge>
          <Badge variant="outline">Developer</Badge>
          <Badge variant="outline">Files</Badge>
          <Badge variant="outline">Writing</Badge>
          <span className="ml-auto hidden text-xs text-muted-foreground sm:inline">
            20 available · 6 planned
          </span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {TOOLS.map((tool, index) => {
            const Icon = tool.icon;
            return (
              <Card
                key={tool.name}
                className="group flex min-h-[220px] flex-col p-5 transition-colors hover:border-info/40 hover:bg-info/[0.03] sm:p-6"
              >
                <div className="flex items-start justify-between">
                  <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-info/10 text-info">
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </div>
                <div className="mt-auto pt-10">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-lg tracking-[-0.03em]">{tool.name}</h2>
                    <ArrowRight className="h-4 w-4 text-info" aria-hidden="true" />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{tool.description}</p>
                  <div className="mt-4 flex items-center gap-2">
                    <Badge
                      className="border-success/30 bg-success/10 text-success"
                      variant="outline"
                    >
                      In browser
                    </Badge>
                    <span className="text-xs text-muted-foreground">{tool.category}</span>
                  </div>
                </div>
              </Card>
            );
          })}
          <Card className="flex min-h-[220px] flex-col justify-between border-dashed bg-muted/20 p-5 sm:p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-dashed text-muted-foreground">
              <Sparkles className="h-5 w-5" aria-hidden="true" />
            </div>
            <div>
              <Badge variant="outline">Coming soon</Badge>
              <h2 className="mt-3 text-lg tracking-[-0.03em]">More focused tools</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                See what is planned without confusing it for something you can open today.
              </p>
            </div>
          </Card>
        </div>
      </main>
    </PreviewShell>
  );
}

export function AstraaToolWorkspaceRefreshPreview() {
  return (
    <PreviewShell pageLabel="JSON Editor">
      <main className="mx-auto max-w-[1200px] px-5 pb-12 sm:px-8 sm:pb-16">
        <div className="flex flex-col gap-5 border-b py-8 sm:flex-row sm:items-end sm:justify-between sm:py-10">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-3xl tracking-[-0.055em]">JSON Editor</h1>
              <Badge className="border-success/30 bg-success/10 text-success" variant="outline">
                <LockKeyhole className="mr-1.5 h-3 w-3" aria-hidden="true" />
                In browser
              </Badge>
            </div>
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">
              Edit, format, validate, convert, and generate types from JSON up to 50 MB.
            </p>
          </div>
          <Button variant="outline" className="gap-2">
            <FileCode2 className="h-4 w-4" aria-hidden="true" />
            Open example
          </Button>
        </div>

        <Card className="mt-8 overflow-hidden p-0 shadow-md">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b bg-muted/30 p-3 sm:p-4">
            <div className="flex items-center gap-1 rounded-lg border bg-background p-1">
              <span className="rounded-md bg-info/10 px-3 py-2 text-sm font-medium text-info">
                Text
              </span>
              <span className="px-3 py-2 text-sm text-muted-foreground">Tree</span>
              <span className="px-3 py-2 text-sm text-muted-foreground">Convert</span>
              <span className="px-3 py-2 text-sm text-muted-foreground">Generate</span>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                Format
              </Button>
              <Button size="sm" className="bg-info text-info-foreground hover:bg-info/90">
                Copy
              </Button>
            </div>
          </div>
          <div className="grid min-h-[360px] lg:grid-cols-[1fr_0.78fr]">
            <div className="border-b p-5 font-mono text-sm leading-7 lg:border-b-0 lg:border-r sm:p-7">
              <p className="text-muted-foreground">{"{"}</p>
              <p className="pl-5">
                <span className="text-info">"name"</span>:{" "}
                <span className="text-success">"astraa"</span>,
              </p>
              <p className="pl-5">
                <span className="text-info">"private"</span>:{" "}
                <span className="text-warning">false</span>,
              </p>
              <p className="pl-5">
                <span className="text-info">"tools"</span>:{" "}
                <span className="text-muted-foreground">[</span>
              </p>
              <p className="pl-10">
                <span className="text-success">"json"</span>,{" "}
                <span className="text-success">"regex"</span>,{" "}
                <span className="text-success">"markdown"</span>
              </p>
              <p className="pl-5 text-muted-foreground">]</p>
              <p className="text-muted-foreground">{"}"}</p>
            </div>
            <div className="flex flex-col justify-center bg-muted/20 p-6 sm:p-8">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-info/10 text-info">
                <Check className="h-5 w-5" aria-hidden="true" />
              </div>
              <p className="mt-4 text-sm font-semibold">Valid JSON</p>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Parsed locally in 4 ms. Your content never leaves this browser.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Badge className="border-success/30 bg-success/10 text-success" variant="outline">
                  Valid
                </Badge>
                <Badge variant="outline">6 lines</Badge>
                <Badge variant="outline">82 bytes</Badge>
              </div>
            </div>
          </div>
        </Card>
      </main>
    </PreviewShell>
  );
}
