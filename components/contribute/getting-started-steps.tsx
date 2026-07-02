import Link from "next/link";

interface Step {
  title: string;
  description: React.ReactNode;
}

const STEPS: Step[] = [
  {
    title: "Star the repository",
    description: "Show your support and help us reach more developers.",
  },
  {
    title: "Read CONTRIBUTING.md & Code of Conduct",
    description: (
      <>
        Understand our{" "}
        <Link
          href="https://github.com/puri-adityakumar/astraa/blob/main/CONTRIBUTING.md"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:underline"
        >
          contribution guidelines
        </Link>{" "}
        and{" "}
        <Link
          href="https://github.com/puri-adityakumar/astraa/blob/main/CODE_OF_CONDUCT.md"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:underline"
        >
          code of conduct
        </Link>{" "}
        before contributing.
      </>
    ),
  },
  {
    title: "Check the Issues tab or raise a new issue",
    description: "Find tasks to work on or report bugs and feature requests.",
  },
  {
    title: "Reach out to us",
    description: (
      <>
        Connect with us on{" "}
        <Link
          href="https://x.com/astraadottech"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:underline"
        >
          X (formerly Twitter)
        </Link>{" "}
        or{" "}
        <Link
          href="https://t.me/astraadottech"
          target="_blank"
          rel="noopener noreferrer"
          className="text-foreground hover:underline"
        >
          Telegram
        </Link>
        .
      </>
    ),
  },
];

export function GettingStartedSteps() {
  return (
    <div className="space-y-8">
      <h2 className="text-2xl sm:text-3xl font-bold text-center">Getting Started</h2>

      <div className="max-w-2xl mx-auto space-y-6">
        {STEPS.map((step, index) => (
          <div key={step.title} className="flex items-start gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
              {index + 1}
            </div>
            <div>
              <p className="font-medium">{step.title}</p>
              <p className="text-sm text-muted-foreground">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
