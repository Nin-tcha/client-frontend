import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max: number;
  label?: string;
  showText?: boolean;
  className?: string;
  barClassName?: string;
}

export function ProgressBar({
  value,
  max,
  label,
  showText = true,
  className,
  barClassName,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <span className="text-xs text-muted-foreground mb-1 block">{label}</span>
      )}
      <div className="relative h-4 w-full border-2 border-black bg-secondary overflow-hidden">
        <div
          className={cn(
            "h-full bg-primary transition-all duration-300",
            barClassName
          )}
          style={{ width: `${percentage}%` }}
        />
        {showText && (
          <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-foreground mix-blend-difference">
            {value}/{max} ⚡
          </span>
        )}
      </div>
    </div>
  );
}
