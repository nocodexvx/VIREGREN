import { useState, useCallback } from "react";
import { Header } from "@/components/layout/Header";
import { VideoUpload } from "@/components/dashboard/VideoUpload";
import { VisualEffects, VisualEffectsState } from "@/components/dashboard/VisualEffects";
import { TimingAudio, TimingAudioState } from "@/components/dashboard/TimingAudio";
import { ProcessingSettings, ProcessingState } from "@/components/dashboard/ProcessingSettings";
import { ProcessingProgress } from "@/components/dashboard/ProcessingProgress";
import { OutputResults } from "@/components/dashboard/OutputResults";
import { api } from "@/services/api";
import { toast } from "sonner";

export default function Dashboard() {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentVariation, setCurrentVariation] = useState(0);
  const [jobId, setJobId] = useState<string | null>(null);
  const [zipUrl, setZipUrl] = useState<string | null>(null);

  const [visualEffects, setVisualEffects] = useState<VisualEffectsState>({
    brightness: [-5, 5],
    contrast: [-5, 5],
    saturation: [-8, 8],
    hue: [-3, 3],
  });

  const [timingAudio, setTimingAudio] = useState<TimingAudioState>({
    zoom: [1, 5],
    cutStart: [0, 3],
    cutEnd: [0, 3],
    volume: [-1, 1],
  });

  const [processing, setProcessing] = useState<ProcessingState>({
    workers: 4,
    variations: 5, // Default lower for safer local testing
    gpuAcceleration: true,
  });

  const pollStatus = useCallback(async (id: string, totalVariations: number) => {
    try {
      const statusData = await api.checkStatus(id);

      // Calculate finished variations based on progress percentage
      // approximate: progress (0-100) -> completed variations
      const completed = Math.floor((statusData.progress / 100) * totalVariations);
      setCurrentVariation(completed);

      if (statusData.status === 'done') {
        setIsProcessing(false);
        setZipUrl(api.getDownloadUrl(id));
        toast.success("Video processing complete!");
      } else if (statusData.status === 'error') {
        setIsProcessing(false);
        toast.error("An error occurred during processing.");
      } else {
        // Continue polling
        setTimeout(() => pollStatus(id, totalVariations), 1000);
      }
    } catch (error) {
      console.error("Polling error", error);
      setIsProcessing(false);
      toast.error("Lost connection to server.");
    }
  }, []);

  const handleStart = async () => {
    if (!selectedVideo) return;

    try {
      setIsProcessing(true);
      setCurrentVariation(0);
      setZipUrl(null);
      setJobId(null);

      // Token is now handled automatically by apiClient inside api.processVideo
      const response = await api.processVideo(selectedVideo, processing.variations);
      setJobId(response.jobId);

      // Start polling
      pollStatus(response.jobId, processing.variations);

    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      toast.error("Failed to start processing.");
    }
  };

  const handleStop = useCallback(() => {
    // Basic stop for now just stops polling in frontend
    setIsProcessing(false);
  }, []);

  const isComplete = !isProcessing && zipUrl !== null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <h1 className="text-3xl font-bold mb-2">Processador de Vídeo (Local)</h1>
          <p className="text-muted-foreground mb-8">Gere variações únicas dos seus vídeos usando FFmpeg Local</p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <VideoUpload selectedVideo={selectedVideo} onVideoSelect={setSelectedVideo} />
              <VisualEffects effects={visualEffects} onChange={setVisualEffects} />
            </div>

            <div className="space-y-6">
              <TimingAudio settings={timingAudio} onChange={setTimingAudio} />
              <ProcessingSettings settings={processing} onChange={setProcessing} />
            </div>
          </div>

          <div className="mt-6 space-y-6">
            <ProcessingProgress
              current={currentVariation}
              total={processing.variations}
              isProcessing={isProcessing}
              onStart={handleStart}
              onStop={handleStop}
              canStart={!!selectedVideo && !isProcessing}
            />
            {isComplete && (
              <div className="bg-card p-6 rounded-lg border shadow-sm">
                <h3 className="font-semibold mb-2">Processing Complete</h3>
                <a href={zipUrl as string} className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2">
                  Download ZIP Results
                </a>
              </div>
            )}
            <OutputResults variations={processing.variations} isComplete={isComplete} />
          </div>
        </div>
      </main>
    </div>
  );
}
