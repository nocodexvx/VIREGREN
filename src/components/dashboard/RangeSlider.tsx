import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface RangeSliderProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  unit?: string;
  className?: string;
}

export function RangeSlider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  unit = "%",
  className
}: RangeSliderProps) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">{label}</Label>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className="bg-secondary px-2 py-0.5 rounded text-xs font-mono">
            {value[0] > 0 ? `+${value[0]}` : value[0]}{unit}
          </span>
          <span className="text-muted-foreground/50">to</span>
          <span className="bg-secondary px-2 py-0.5 rounded text-xs font-mono">
            {value[1] > 0 ? `+${value[1]}` : value[1]}{unit}
          </span>
        </div>
      </div>
      
      <Slider
        min={min}
        max={max}
        step={step}
        value={value}
        onValueChange={(val) => onChange(val as [number, number])}
        className="w-full"
      />
      
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}
