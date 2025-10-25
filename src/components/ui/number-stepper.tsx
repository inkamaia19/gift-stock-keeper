import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface NumberStepperProps {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  className?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export function NumberStepper({ value, onChange, min = 0, max = Number.MAX_SAFE_INTEGER, className, disabled, size = 'md' }: NumberStepperProps) {
  const decDisabled = disabled || value <= min;
  const incDisabled = disabled || value >= max;

  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  // Press-and-hold repeat logic
  const repeatRef = React.useRef<number | null>(null);
  const clearRepeat = () => { if (repeatRef.current) { window.clearInterval(repeatRef.current); repeatRef.current = null; } };
  React.useEffect(() => () => clearRepeat(), []);

  const startRepeat = (delta: number, disabledBtn: boolean) => {
    if (disabledBtn) return;
    onChange(clamp(value + delta));
    // Start after small delay, then faster interval
    const timeout = window.setTimeout(() => {
      repeatRef.current = window.setInterval(() => {
        onChange(prev => clamp((typeof prev === 'number' ? prev : value) + delta));
      }, 60);
    }, 300) as unknown as number;
    // store initial timeout id in ref as well to clear on release
    repeatRef.current = timeout;
  };

  const stopRepeat = () => clearRepeat();

  const dims = size === 'sm' ? { h: 'h-7', w: 'w-7', pad: 'px-2', divider: 'h-7' } : { h: 'h-8', w: 'w-8', pad: 'px-3', divider: 'h-8' };

  return (
    <div className={cn("inline-flex items-center rounded-xl border border-border bg-background overflow-hidden", className)}>
      <div className={cn("text-sm tabular-nums select-none text-center", dims.pad, size === 'sm' ? 'min-w-[2.25rem]' : 'min-w-[2.5rem]')}>
        {value}
      </div>
      <div className={cn(dims.divider, "w-px bg-border")} />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn("rounded-none", dims.h, dims.w)}
        disabled={decDisabled}
        onMouseDown={(e) => { e.preventDefault(); startRepeat(-1, decDisabled); }}
        onTouchStart={() => startRepeat(-1, decDisabled)}
        onMouseUp={stopRepeat}
        onMouseLeave={stopRepeat}
        onTouchEnd={stopRepeat}
      >
        −
      </Button>
      <div className={cn(dims.divider, "w-px bg-border")} />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn("rounded-none", dims.h, dims.w)}
        disabled={incDisabled}
        onMouseDown={(e) => { e.preventDefault(); startRepeat(1, incDisabled); }}
        onTouchStart={() => startRepeat(1, incDisabled)}
        onMouseUp={stopRepeat}
        onMouseLeave={stopRepeat}
        onTouchEnd={stopRepeat}
      >
        +
      </Button>
    </div>
  );
}
