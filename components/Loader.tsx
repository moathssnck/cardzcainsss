import { cn } from "@/lib/utils";

interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "dots" | "pulse";
}

export function Loader({
  size = "md",
  variant = "spinner",
  className,
  ...props
}: LoaderProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  if (variant === "spinner") {
    return (
      <div
        className={cn(
          "animate-spin rounded-full border-2 border-primary border-t-transparent",
          sizeClasses[size],
          className
        )}
        {...props}
        role="status"
        aria-label="Loading"
      />
    );
  }

  if (variant === "dots") {
    return (
      <div
        className={cn("flex items-center justify-center gap-1", className)}
        role="status"
        aria-label="Loading"
        {...props}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={cn(
              "animate-pulse rounded-full bg-primary",
              size === "sm" ? "h-1 w-1" : size === "md" ? "h-2 w-2" : "h-3 w-3"
            )}
            style={{
              animationDelay: `${i * 0.15}s`,
            }}
          />
        ))}
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <div
        className={cn(
          "animate-pulse rounded-full bg-primary/80",
          sizeClasses[size],
          className
        )}
        role="status"
        aria-label="Loading"
        {...props}
      />
    );
  }

  return null;
}
