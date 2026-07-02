export function LastUpdated() {
  const lastUpdated = new Date().toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });
  return (
    <p className="text-xs text-muted-foreground text-center mt-4">Last updated: {lastUpdated}</p>
  );
}
