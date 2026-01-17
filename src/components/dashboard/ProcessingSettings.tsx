import { Cpu, Zap, HelpCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export interface ProcessingState {
  workers: number;
  variations: number;
  gpuAcceleration: boolean;
}

interface ProcessingSettingsProps {
  settings: ProcessingState;
  onChange: (settings: ProcessingState) => void;
}

const presets = [10, 21, 50, 100];

export function ProcessingSettings({ settings, onChange }: ProcessingSettingsProps) {
  return (
    <div className="glass rounded-xl p-6">
      <h3 className="font-semibold text-lg mb-6 flex items-center gap-2">
        <Cpu className="w-5 h-5 text-primary" />
        Processamento
      </h3>

      <div className="space-y-6">
        {/* Workers */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label>Núcleos (Workers)</Label>
            <Tooltip>
              <TooltipTrigger asChild>
                <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs text-sm">
                  Mais núcleos = processamento mais rápido, mas requer mais recursos do sistema.
                  Use 4-6 para melhor equilíbrio.
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <Select
            value={settings.workers.toString()}
            onValueChange={(val) => onChange({ ...settings, workers: parseInt(val) })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione os núcleos" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 4, 6, 8].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  {num} núcleo{num > 1 ? "s" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Variations */}
        <div className="space-y-2">
          <Label>Variações</Label>
          <Input
            type="number"
            min={1}
            max={100}
            value={settings.variations}
            onChange={(e) => onChange({ ...settings, variations: parseInt(e.target.value) || 1 })}
          />
          <div className="flex gap-2">
            {presets.map((preset) => (
              <Button
                key={preset}
                variant={settings.variations === preset ? "default" : "outline"}
                size="sm"
                className={settings.variations === preset ? "gradient-primary" : ""}
                onClick={() => onChange({ ...settings, variations: preset })}
              >
                {preset}
              </Button>
            ))}
          </div>
        </div>

        {/* GPU Acceleration */}
        <div className="flex items-center justify-between p-4 bg-secondary rounded-lg">
          <div className="flex items-center gap-3">
            <Zap className="w-5 h-5 text-warning" />
            <div>
              <Label className="cursor-pointer">Aceleração de GPU</Label>
              <p className="text-xs text-muted-foreground">
                Usar placa gráfica para processamento mais rápido
              </p>
            </div>
          </div>
          <Switch
            checked={settings.gpuAcceleration}
            onCheckedChange={(checked) => onChange({ ...settings, gpuAcceleration: checked })}
          />
        </div>
      </div>
    </div>
  );
}
