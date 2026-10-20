export const TERMINAL_SHORTCUTS = [
  { key: "/", description: "Commands" },
  { key: "↑ ↓", description: "History" },
  { key: "Tab", description: "Complete" },
  { key: "Enter", description: "Run" },
  { key: "Esc", description: "Dismiss / close panel" },
  { key: "Ctrl+L", description: "Clear" },
  { key: "/config", description: "Settings" },
  { key: "/help", description: "All commands" },
] as const;
