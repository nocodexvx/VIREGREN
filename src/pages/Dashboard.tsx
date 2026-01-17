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

  /* VIRAL STRATEGY DEFAULT PRESETS */
  const [visualEffects, setVisualEffects] = useState<VisualEffectsState>({
    brightness: [-6, 5],
    contrast: [-7, 6],
    saturation: [0, 10], // Adjusted to avoid B&W
    hue: [-5, 5],
  });

  const [timingAudio, setTimingAudio] = useState<TimingAudioState>({
    zoom: [1, 8],
    cutStart: [0, 0.3], // approx 9 frames at 30fps
    cutEnd: [0, 0.3],
    volume: [-2, 2],
  });

  const [processing, setProcessing] = useState<ProcessingState>({
    workers: 6,
    variations: 21, // Viral Strategy: 3 posts/day * 7 days
    gpuAcceleration: false, // User requested OFF
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

          {/* VIRAL STRATEGY HEADER */}
          <div className="mb-8 p-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl border border-purple-500/30">
            <h1 className="text-3xl font-bold mb-2 text-white">🔥 Estratégia de Escala Viral</h1>
            <p className="text-gray-300 mb-4">
              Configuração Automática para Máxima Performance no Instagram.
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-400">
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> <strong>21 Variações</strong> (Postar 3x por dia durante uma semana)</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Postar como <strong>"Reels de Teste"</strong> (Trial Reels)</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> <strong>Metadados Únicos</strong> (Engana o algoritmo para evitar shadowban)</li>
              <li className="flex items-center gap-2"><span className="text-green-400">✓</span> Use sempre o vídeo original com <strong>alta qualidade</strong></li>
            </ul>
          </div>

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
            <OutputResults variations={processing.variations} isComplete={isComplete} zipUrl={zipUrl} />
          </div>
        </div>
      </main>
    </div>
  );
}
