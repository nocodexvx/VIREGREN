import { motion } from "framer-motion";
import { Download, Film, Archive, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface OutputResultsProps {
  variations: number;
  isComplete: boolean;
}

export function OutputResults({ variations, isComplete }: OutputResultsProps) {
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
        Output Ready
      </h3>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-secondary rounded-lg text-center">
            <Film className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold">{variations}</div>
            <div className="text-sm text-muted-foreground">Variations Created</div>
          </div>
          <div className="p-4 bg-secondary rounded-lg text-center">
            <Archive className="w-8 h-8 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold">{(variations * 15).toFixed(0)}MB</div>
            <div className="text-sm text-muted-foreground">Total Size</div>
          </div>
        </div>

        <div className="flex gap-3">
          <Button className="flex-1 gradient-primary">
            <Archive className="w-4 h-4 mr-2" />
            Download All (ZIP)
          </Button>
          <Button variant="outline">
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Folder
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Files saved as: video_name_v1.mp4, video_name_v2.mp4, etc.
        </p>
      </div>
    </motion.div>
  );
}
