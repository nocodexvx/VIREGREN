import { Palette, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RangeSlider } from "./RangeSlider";

export interface VisualEffectsState {
  brightness: [number, number];
  contrast: [number, number];
  saturation: [number, number];
  hue: [number, number];
}

interface VisualEffectsProps {
  effects: VisualEffectsState;
  onChange: (effects: VisualEffectsState) => void;
}

export function VisualEffects({ effects, onChange }: VisualEffectsProps) {
  const handleRandomize = () => {
    const randomRange = (min: number, max: number): [number, number] => {
      const a = Math.floor(Math.random() * (max - min + 1)) + min;
      const b = Math.floor(Math.random() * (max - min + 1)) + min;
      return a < b ? [a, b] : [b, a];
    };

    onChange({
      brightness: randomRange(-10, 10),
      contrast: randomRange(-10, 10),
      saturation: randomRange(-15, 15),
      hue: randomRange(-5, 5),
    });
  };

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <Palette className="w-5 h-5 text-primary" />
          Visual Effects
        </h3>
        <Button variant="outline" size="sm" onClick={handleRandomize}>
          <Shuffle className="w-4 h-4 mr-2" />
          Randomize
        </Button>
      </div>

      <div className="space-y-6">
        <RangeSlider
          label="Brightness"
          min={-10}
          max={10}
          value={effects.brightness}
          onChange={(val) => onChange({ ...effects, brightness: val })}
        />
        
        <RangeSlider
          label="Contrast"
          min={-10}
          max={10}
          value={effects.contrast}
          onChange={(val) => onChange({ ...effects, contrast: val })}
        />
        
        <RangeSlider
          label="Saturation"
          min={-15}
          max={15}
          value={effects.saturation}
          onChange={(val) => onChange({ ...effects, saturation: val })}
        />
        
        <RangeSlider
          label="Hue"
          min={-5}
          max={5}
          value={effects.hue}
          onChange={(val) => onChange({ ...effects, hue: val })}
          unit="°"
        />
      </div>
    </div>
  );
}
