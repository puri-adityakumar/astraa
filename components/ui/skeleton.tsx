/**
 * Skeleton Loading Components
 * Animated placeholder components for loading states
 */
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to animate the skeleton
   * @default true
   */
  animate?: boolean;
}

/**
 * Base skeleton component with shimmer animation
 */
function Skeleton({ className, animate = true, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  );
}

/**
 * Skeleton for text content
 */
function SkeletonText({
  lines = 3,
  className,
  ...props
}: SkeletonProps & { lines?: number }) {
  return (
    <div className={cn("space-y-2", className)} {...props}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 && "w-4/5", // Last line is shorter
          )}
        />
      ))}
    </div>
  );
}

/**
 * Skeleton for card components
 */
function SkeletonCard({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("space-y-4 rounded-lg border bg-card p-6", className)}
      {...props}
    >
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="h-20 w-full" />
    </div>
  );
}

/**
 * Skeleton for avatar
 */
function SkeletonAvatar({
  className,
  size = "md",
  ...props
}: SkeletonProps & { size?: "sm" | "md" | "lg" }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-16 w-16",
  };

  return (
    <Skeleton
      className={cn("rounded-full", sizeClasses[size], className)}
      {...props}
    />
  );
}

/**
 * Skeleton for button
 */
function SkeletonButton({
  className,
  size = "default",
  ...props
}: SkeletonProps & { size?: "sm" | "default" | "lg" }) {
  const sizeClasses = {
    sm: "h-9 w-20",
    default: "h-10 w-24",
    lg: "h-11 w-28",
  };

  return (
    <Skeleton
      className={cn("rounded-md", sizeClasses[size], className)}
      {...props}
    />
  );
}

/**
 * Skeleton for input field
 */
function SkeletonInput({ className, ...props }: SkeletonProps) {
  return (
    <Skeleton className={cn("h-10 w-full rounded-md", className)} {...props} />
  );
}

/**
 * Skeleton for table
 */
function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
  ...props
}: SkeletonProps & { rows?: number; columns?: number }) {
  return (
    <div className={cn("space-y-3", className)} {...props}>
      {/* Header */}
      <div className="flex gap-4">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={`header-${i}`} className="h-8 flex-1" />
        ))}
      </div>
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={`cell-${rowIndex}-${colIndex}`}
              className="h-12 flex-1"
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * Skeleton for grid layout
 */
function SkeletonGrid({
  items = 6,
  columns = 3,
  className,
  ...props
}: SkeletonProps & { items?: number; columns?: number }) {
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  return (
    <div
      className={cn(
        "grid gap-4",
        gridClasses[columns as keyof typeof gridClasses] || "grid-cols-3",
        className,
      )}
      {...props}
    >
      {Array.from({ length: items }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export {
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonAvatar,
  SkeletonButton,
  SkeletonInput,
  SkeletonTable,
  SkeletonGrid,
};
