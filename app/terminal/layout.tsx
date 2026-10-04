import type { ReactNode } from "react";

export default function TerminalLayout({ children }: { children: ReactNode }) {
  return <div data-flavour="terminal">{children}</div>;
}
