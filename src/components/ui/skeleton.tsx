/**
 * Skeleton — shimmer placeholder for loading states.
 *
 * Usage:
 *   <Skeleton width={120} height={16} />                   // rectangle
 *   <Skeleton width={40} height={40} borderRadius="50%" /> // circle (avatar)
 *   <Skeleton className="h-4 w-3/4" />                     // Tailwind sizing
 */

import { cn } from "@/lib/utils";

interface SkeletonProps {
  /** Fixed pixel width (or any CSS value). Falls back to 100%. */
  width?: number | string;
  /** Fixed pixel height (or any CSS value). Falls back to 1rem. */
  height?: number | string;
  /** CSS border-radius — e.g. "50%" for circles, 4 for rounded rects. Defaults to 4px. */
  borderRadius?: number | string;
  /** Extra Tailwind / CSS classes */
  className?: string;
}

export function Skeleton({
  width,
  height,
  borderRadius,
  className,
}: SkeletonProps) {
  return (
    <div
      className={cn("skeleton-shimmer", className)}
      style={{
        width: typeof width === "number" ? `${width}px` : (width ?? "100%"),
        height: typeof height === "number" ? `${height}px` : (height ?? "1rem"),
        borderRadius:
          typeof borderRadius === "number"
            ? `${borderRadius}px`
            : (borderRadius ?? "4px"),
      }}
    />
  );
}
