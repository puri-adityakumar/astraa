export type CatalogStatus = "available" | "coming-soon";

type ProcessingMode = "local" | "server" | "hybrid";

export type CatalogEntry = {
  id: string;
  name: string;
  description: string;
  path: string;
  status: CatalogStatus;
  processing: ProcessingMode;
  updatedAt?: string;
};

export function isAvailable<T extends CatalogEntry>(entry: T): boolean {
  return entry.status === "available";
}

export function isComingSoon<T extends CatalogEntry>(entry: T): boolean {
  return entry.status === "coming-soon";
}
