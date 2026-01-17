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
import { PRESETS, Preset } from "@/data/presets";
import { Sparkles, Info } from "lucide-react";

export default function Dashboard() {
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentVariation, setCurrentVariation] = useState(0);
  const [jobId, setJobId] = useState<string | null>(null);
  const [zipUrl, setZipUrl] = useState<string | null>(null);

  // State for Presets
  const [currentPreset, setCurrentPreset] = useState<Preset>(PRESETS[0]);

  const [visualEffects, setVisualEffects] = useState<VisualEffectsState>(PRESETS[0].values.visual);
  const [timingAudio, setTimingAudio] = useState<TimingAudioState>(PRESETS[0].values.timing);

  const [processing, setProcessing] = useState<ProcessingState>({
    workers: 6,
    variations: PRESETS[0].values.processing.variations || 21,
    gpuAcceleration: false,
  });

  // Handler to apply preset
  const applyPreset = (preset: Preset) => {
    setCurrentPreset(preset);
    setVisualEffects(preset.values.visual);
    setTimingAudio(preset.values.timing);
    setProcessing(prev => ({
      ...prev,
      variations: preset.values.processing.variations || prev.variations
    }));
    toast.success(`Estratégia "${preset.title}" carregada!`);
  };

  const pollStatus = useCallback(async (id: string, totalVariations: number) => {
    try {
      const statusData = await api.checkStatus(id);

      // Calculate finished variations based on progress percentage
      const completed = Math.floor((statusData.progress / 100) * totalVariations);
      setCurrentVariation(completed);

      if (statusData.status === 'done') {
        setIsProcessing(false);
        setZipUrl(api.getDownloadUrl(id));
        toast.success("Vídeo processado com sucesso!");
      } else if (statusData.status === 'error') {
        setIsProcessing(false);
        toast.error("Ocorreu um erro durante o processamento.");
      } else {
        // Continue polling
        setTimeout(() => pollStatus(id, totalVariations), 1000);
      }
    } catch (error) {
      console.error("Polling error", error);
      setIsProcessing(false);
      toast.error("Perda de conexão com o servidor.");
    }
  }, []);

  const handleStart = async () => {
    if (!selectedVideo) return;

    try {
      setIsProcessing(true);
      setCurrentVariation(0);
      setZipUrl(null);
      setJobId(null);

      const response = await api.processVideo(
        selectedVideo,
        processing.variations,
        visualEffects,
        timingAudio
      );
      setJobId(response.jobId);

      pollStatus(response.jobId, processing.variations);

    } catch (error) {
      console.error(error);
      setIsProcessing(false);
      toast.error("Falha ao iniciar processamento.");
    }
  };

  const handleStop = useCallback(() => {
    setIsProcessing(false);
  }, []);

  const isComplete = !isProcessing && zipUrl !== null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12 px-4">
        <div className="container mx-auto max-w-6xl">

          {/* PRESET SELECTOR */}
          <div className="flex flex-col md:flex-row gap-4 mb-6 items-center justify-between">
            <div className="flex gap-2 overflow-x-auto pb-2 w-full md:w-auto">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => applyPreset(preset)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-all whitespace-nowrap ${currentPreset.id === preset.id
                      ? "bg-primary/20 border-primary text-primary hover:bg-primary/30"
                      : "bg-background border-border text-muted-foreground hover:bg-secondary"
                    }`}
                >
                  {currentPreset.id === preset.id && <Sparkles className="w-3 h-3" />}
                  <span className="text-sm font-medium">{preset.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* DYNAMIC STRATEGY HEADER */}
          <div className="mb-8 p-6 bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl border border-purple-500/30 transition-all">
            <h1 className="text-3xl font-bold mb-2 text-white">{currentPreset.copy.header}</h1>
            <p className="text-gray-300 mb-4">
              {currentPreset.copy.subHeader}
            </p>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-400">
              {currentPreset.copy.items.map((item, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <span className="text-green-400 font-bold">{item.icon}</span>
                  <span dangerouslySetInnerHTML={{
                    __html: item.highlight
                      ? item.text.replace(item.highlight, `<strong class="text-white">${item.highlight}</strong>`)
                      : item.text
                  }} />
                </li>
              ))}
            </ul>

            {/* INFO BOX */}
            <div className="mt-4 pt-4 border-t border-white/10 flex items-start gap-3 text-xs text-blue-200 bg-blue-900/20 p-3 rounded-lg">
              <Info className="w-5 h-5 flex-shrink-0" />
              <div>
                <p className="font-semibold mb-1">Recomendação de Arquivos:</p>
                <p>• <strong>Duração Ideal:</strong> Vídeos de 5s a 60s processam muito rápido.</p>
                <p>• <strong>Armazenamento:</strong> 100 vídeos de 1 min (Full HD) ocupam ~2GB. 100 Reels curtos (40MB) ocupam ~4GB. O servidor aguenta tranquilamente!</p>
              </div>
            </div>
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
