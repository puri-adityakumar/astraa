import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="site-dots flex min-h-[60vh] flex-col items-center justify-center rounded-xl border px-6 text-center shadow-geist">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        Error / 404
      </p>
      <h1 className="mt-4 font-mono text-8xl font-semibold tracking-[-0.08em] sm:text-9xl">
        404
      </h1>
      <p className="mt-4 text-base text-muted-foreground">
        This page could not be found.
      </p>
      <Button className="mt-7" asChild>
        <Link href="/">Go back home</Link>
      </Button>
    </div>
  );
}
