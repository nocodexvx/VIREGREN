import { Clock, Volume2 } from "lucide-react";
import { RangeSlider } from "./RangeSlider";

export interface TimingAudioState {
  zoom: [number, number];
  cutStart: [number, number];
  cutEnd: [number, number];
  volume: [number, number];
}

interface TimingAudioProps {
  settings: TimingAudioState;
  onChange: (settings: TimingAudioState) => void;
}

export function TimingAudio({ settings, onChange }: TimingAudioProps) {
  return (
    <div className="glass rounded-xl p-6">
      <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
        <Clock className="w-5 h-5 text-primary" />
        Timing e Áudio
      </h3>

      <div className="space-y-6">
        <RangeSlider
          label="Zoom"
          min={1}
          max={10}
          value={settings.zoom}
          onChange={(val) => onChange({ ...settings, zoom: val })}
        />

        <RangeSlider
          label="Cortar Início"
          min={0}
          max={10}
          value={settings.cutStart}
          onChange={(val) => onChange({ ...settings, cutStart: val })}
          unit=" frames"
        />

        <RangeSlider
          label="Cortar Fim"
          min={0}
          max={10}
          value={settings.cutEnd}
          onChange={(val) => onChange({ ...settings, cutEnd: val })}
          unit=" frames"
        />

        <div className="pt-2 border-t border-border">
          <div className="flex items-center gap-2 mb-4">
            <Volume2 className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Configurações de Áudio</span>
          </div>
          <RangeSlider
            label="Volume"
            min={-3}
            max={3}
            step={0.5}
            value={settings.volume}
            onChange={(val) => onChange({ ...settings, volume: val })}
            unit=" dB"
          />
        </div>
      </div>
    </div>
  );
}
