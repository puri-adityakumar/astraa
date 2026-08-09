import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { HOME_FEATURED_TOOLS } from "./home-content";

const WORKFLOW_STEPS = [
  {
    label: "Input",
    title: "Bring the small task",
    description: "Paste JSON, choose a local image, or enter a value to convert.",
  },
  {
    label: "Boundary",
    title: "See where processing happens",
    description:
      "Local tools process input in this browser. Provider-backed steps identify the network boundary.",
  },
  {
    label: "Output",
    title: "Use the result",
    description:
      "Copy formatted data, download a resized image, or continue with the converted value.",
  },
] as const;

export function ToolWorkflow() {
  return (
    <section
      className="-mx-4 border-b px-5 py-12 sm:-mx-6 sm:px-8 sm:py-16 lg:-mx-8 lg:px-12 lg:py-20"
      aria-labelledby="workflow-title"
      data-home-product-proof
    >
      <div className="grid items-center gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:gap-14">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            One focused workflow
          </p>
          <h2 id="workflow-title" className="mt-3 max-w-xl">
            From raw input to a useful result.
          </h2>
          <p className="mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Astraa keeps routine work close to the browser and makes the provider boundary visible
            when a live rate or generated text needs the network.
          </p>

          <ol
            className="mt-7 grid gap-4"
            aria-label="Astraa tool workflow"
            data-workflow-html-equivalent
          >
            {WORKFLOW_STEPS.map((step, index) => (
              <li key={step.label} className="grid grid-cols-[2rem_1fr] gap-3">
                <span
                  className="flex h-8 w-8 items-center justify-center rounded-full border bg-muted/40 font-mono text-[11px] text-muted-foreground"
                  aria-hidden="true"
                >
                  {index + 1}
                </span>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                    {step.label}
                  </p>
                  <h3 className="mt-1 text-base tracking-normal">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-7 flex flex-wrap gap-2">
            {HOME_FEATURED_TOOLS.slice(0, 2).map((tool) => (
              <Link
                key={tool.id}
                href={tool.path}
                prefetch={false}
                className="inline-flex min-h-touch items-center gap-1.5 rounded-md border bg-background px-3 text-sm shadow-geist transition-colors hover:border-foreground/20 hover:bg-muted/60"
              >
                Try {tool.name}
                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
              </Link>
            ))}
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border bg-background shadow-geist">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="640"
            height="260"
            viewBox="0 0 640 260"
            className="block h-auto w-full"
            aria-hidden="true"
            focusable="false"
            data-home-workflow-svg
          >
            <defs>
              <pattern id="home-workflow-grid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path
                  d="M 24 0 L 0 0 0 24"
                  fill="none"
                  stroke="hsl(var(--border))"
                  strokeOpacity="0.45"
                  strokeWidth="1"
                />
              </pattern>
              <marker
                id="home-workflow-arrow"
                viewBox="0 0 10 10"
                refX="8"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="hsl(var(--muted-foreground))" />
              </marker>
            </defs>

            <rect width="640" height="260" fill="hsl(var(--background))" />
            <rect width="640" height="260" fill="url(#home-workflow-grid)" />

            <g className="home-workflow-step home-workflow-step-one">
              <rect
                x="28"
                y="68"
                width="154"
                height="108"
                rx="12"
                fill="hsl(var(--card))"
                stroke="hsl(var(--border))"
              />
              <text
                x="48"
                y="96"
                fill="hsl(var(--muted-foreground))"
                fontFamily="var(--font-geist-mono)"
                fontSize="11"
                letterSpacing="1.2"
              >
                INPUT
              </text>
              <text
                x="48"
                y="126"
                fill="hsl(var(--foreground))"
                fontFamily="var(--font-geist-sans)"
                fontSize="16"
                fontWeight="600"
              >
                JSON · image · value
              </text>
              <rect x="48" y="145" width="88" height="8" rx="4" fill="hsl(var(--muted))" />
            </g>

            <g className="home-workflow-step home-workflow-step-two">
              <rect
                x="238"
                y="38"
                width="174"
                height="112"
                rx="12"
                fill="hsl(var(--card))"
                stroke="hsl(var(--foreground))"
                strokeOpacity="0.4"
              />
              <circle cx="264" cy="66" r="5" fill="hsl(var(--success))" />
              <text
                x="278"
                y="71"
                fill="hsl(var(--muted-foreground))"
                fontFamily="var(--font-geist-mono)"
                fontSize="11"
                letterSpacing="1.2"
              >
                IN THIS BROWSER
              </text>
              <text
                x="258"
                y="106"
                fill="hsl(var(--foreground))"
                fontFamily="var(--font-geist-sans)"
                fontSize="17"
                fontWeight="600"
              >
                Local tool boundary
              </text>

              <rect
                x="258"
                y="184"
                width="142"
                height="40"
                rx="20"
                fill="hsl(var(--muted))"
                stroke="hsl(var(--border))"
              />
              <circle cx="278" cy="204" r="4" fill="hsl(var(--info))" />
              <text
                x="291"
                y="208"
                fill="hsl(var(--foreground))"
                fontFamily="var(--font-geist-mono)"
                fontSize="10"
                letterSpacing="0.6"
              >
                PROVIDER-BACKED
              </text>
            </g>

            <g className="home-workflow-step home-workflow-step-three">
              <path
                d="M 188 120 H 226"
                fill="none"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="2"
                markerEnd="url(#home-workflow-arrow)"
              />
              <path
                d="M 418 120 H 448"
                fill="none"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="2"
                markerEnd="url(#home-workflow-arrow)"
              />
              <path
                d="M 325 155 V 176"
                fill="none"
                stroke="hsl(var(--muted-foreground))"
                strokeWidth="2"
                strokeDasharray="4 4"
                markerEnd="url(#home-workflow-arrow)"
              />
              <rect
                x="458"
                y="68"
                width="154"
                height="108"
                rx="12"
                fill="hsl(var(--card))"
                stroke="hsl(var(--border))"
              />
              <text
                x="478"
                y="96"
                fill="hsl(var(--muted-foreground))"
                fontFamily="var(--font-geist-mono)"
                fontSize="11"
                letterSpacing="1.2"
              >
                OUTPUT
              </text>
              <text
                x="478"
                y="126"
                fill="hsl(var(--foreground))"
                fontFamily="var(--font-geist-sans)"
                fontSize="16"
                fontWeight="600"
              >
                Copy · export · use
              </text>
              <rect x="478" y="145" width="96" height="8" rx="4" fill="hsl(var(--muted))" />
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
