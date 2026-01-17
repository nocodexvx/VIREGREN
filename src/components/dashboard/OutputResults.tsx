import { motion } from "framer-motion";
import { Download, Film, Archive, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OutputResultsProps {
  variations: number;
  isComplete: boolean;
  zipUrl: string | null;
}

export function OutputResults({ variations, isComplete, zipUrl }: OutputResultsProps) {
  if (!isComplete || variations === 0) return null;

  return (
    <motion.div
      className="glass rounded-xl p-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <Download className="w-5 h-5 text-success" />
        Arquivos Prontos
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-secondary rounded-lg text-center">
            <Film className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{variations}</div>
            <div className="text-sm text-muted-foreground">Variações Criadas</div>
          </div>
          <div className="p-4 bg-secondary rounded-lg text-center">
            <Archive className="w-8 h-8 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold">{(variations * 15).toFixed(0)}MB</div>
            <div className="text-sm text-muted-foreground">Tamanho Total</div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            className="flex-1 gradient-primary w-full"
            onClick={() => zipUrl && window.open(zipUrl, '_blank')}
            disabled={!zipUrl}
          >
            <Archive className="w-4 h-4 mr-2" />
            Baixar Tudo (ZIP)
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Arquivos salvos como: video_nome_v1.mp4, video_nome_v2.mp4, etc.
        </p>
      </div>
    </motion.div>
  );
}
