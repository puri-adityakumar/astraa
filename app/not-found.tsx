import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center gap-6">
      <h1 className="text-9xl font-bold font-mono">404</h1>
      <p className="text-xl text-muted-foreground">
        This page could not be found.
      </p>
      <Link
        href="/"
        className="text-primary underline underline-offset-4 hover:text-primary/80"
      >
        Go back home
      </Link>
    </div>
  );
}
