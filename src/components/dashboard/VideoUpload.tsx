import { useCallback, useState } from "react";
import { motion } from "framer-motion";
import { Upload, Film, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VideoUploadProps {
  onVideoSelect: (file: File | null) => void;
  selectedVideo: File | null;
}

export function VideoUpload({ onVideoSelect, selectedVideo }: VideoUploadProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("video/")) {
      onVideoSelect(file);
    }
  }, [onVideoSelect]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onVideoSelect(file);
    }
  }, [onVideoSelect]);

  const handleRemove = useCallback(() => {
    onVideoSelect(null);
  }, [onVideoSelect]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="glass rounded-xl p-6">
      <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5 text-primary" />
        Upload de Vídeo
      </h3>

      {!selectedVideo ? (
        <motion.div
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary/50"
            }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById("video-input")?.click()}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <input
            id="video-input"
            type="file"
            accept="video/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <Film className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-lg font-medium mb-2">Solte seu vídeo aqui</p>
          <p className="text-sm text-muted-foreground mb-4">
            ou clique para escolher
          </p>
          <p className="text-xs text-muted-foreground">
            Suporta MP4, MOV, AVI, MKV, WebM • Max 100MB (Grátis)
          </p>
        </motion.div>
      ) : (
        <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg">
          <div className="w-16 h-16 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Film className="w-8 h-8 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{selectedVideo.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(selectedVideo.size)}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={handleRemove}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      )}
    </div>
  );
}
