import { motion } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Loader2, Square, Clock, CheckCircle2 } from "lucide-react";

interface ProcessingProgressProps {
  current: number;
  total: number;
  isProcessing: boolean;
  onStop: () => void;
  onStart: () => void;
  canStart: boolean;
}

export function ProcessingProgress({
  current,
  total,
  isProcessing,
  onStop,
  onStart,
  canStart,
}: ProcessingProgressProps) {
  const progress = total > 0 ? (current / total) * 100 : 0;
  const isComplete = current === total && total > 0;

  const estimatedTimeRemaining = () => {
    if (current === 0 || !isProcessing) return null;
    const avgTimePerVariation = 2; // seconds estimate
    const remaining = (total - current) * avgTimePerVariation;
    if (remaining < 60) return `${remaining}s remaining`;
    return `${Math.ceil(remaining / 60)}m remaining`;
  };

  return (
    <div className="glass rounded-xl p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-lg">Progress</h3>
        {isProcessing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{estimatedTimeRemaining()}</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        <Progress value={progress} className="h-3" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {isProcessing ? (
              <Loader2 className="w-5 h-5 text-primary animate-spin" />
            ) : isComplete ? (
              <CheckCircle2 className="w-5 h-5 text-success" />
            ) : null}
            <span className="text-sm">
              {isComplete
                ? "Complete!"
                : isProcessing
                ? `Processing ${current}/${total} (${Math.round(progress)}%)`
                : `Ready to generate ${total} variations`}
            </span>
          </div>

          {isProcessing ? (
            <Button variant="destructive" size="sm" onClick={onStop}>
              <Square className="w-4 h-4 mr-2" />
              Stop
            </Button>
          ) : (
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="gradient-primary glow-primary"
                size="lg"
                onClick={onStart}
                disabled={!canStart}
              >
                Generate {total} Variations
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
