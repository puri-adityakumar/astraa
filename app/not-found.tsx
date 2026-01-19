"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/");
    }, 15000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center">
      <h1 className="font-mono text-9xl font-bold">404</h1>
      <h3 className="mt-4 text-xl text-muted-foreground">
        Something went wrong
      </h3>
    </div>
  );
}
