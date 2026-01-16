import { useState, ChangeEvent } from 'react';
import { Upload, Download, Loader2, ImagePlus, Copy, MessageSquare, Sparkles, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const ImageCloningPlatform = () => {
  const [modelImage, setModelImage] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [cloningType, setCloningType] = useState('reels');
  const [aspectRatio, setAspectRatio] = useState('1:1');
  const [isProcessing, setIsProcessing] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  
  // NOVO: Campo de chat/prompt customizado
  const [customPrompt, setCustomPrompt] = useState('');
  const [useCustomPrompt, setUseCustomPrompt] = useState(false);
  const [analysisText, setAnalysisText] = useState<string | null>(null);
  const [errorInfo, setErrorInfo] = useState<{ message: string; solution?: string } | null>(null);

  const cloningTypes = [
    { value: 'reels', label: 'Clonagem de Reels (Captura de Tela)', prompt: 'Capture the exact scene, pose and atmosphere from the reference screenshot' },
    { value: 'pose', label: 'Clonagem de Pose Completa', prompt: 'Replicate the exact body position, gesture and stance' },
    { value: 'fashion', label: 'Clonagem de Look/Roupa', prompt: 'Transfer the exact clothing, accessories and fashion style' },
    { value: 'scene', label: 'Clonagem de Cena e Ambiente', prompt: 'Recreate the environment, lighting and background setting' },
    { value: 'expression', label: 'Clonagem de Expressão Facial', prompt: 'Match the facial expression, emotion and mood' }
  ];

  const aspectRatios = [
    { value: '1:1', label: '1:1 (Quadrado)' },
    { value: '9:16', label: '9:16 (Vertical/Reels)' },
    { value: '16:9', label: '16:9 (Horizontal)' },
    { value: '4:5', label: '4:5 (Instagram Feed)' }
  ];

  // Prompt base otimizado
  const getBasePrompt = () => {
    const typePrompt = cloningTypes.find(t => t.value === cloningType)?.prompt || '';
    
    return `Use image 1 as the ONLY face and identity reference. Transfer the exact same person from image 1 into the scene, pose and clothing of image 2.

${typePrompt}

FACIAL CONSISTENCY (CRITICAL):
- Do NOT change the face, identity, facial structure, nose, lips, eyes, skin tone or proportions
- Maintain PERFECT facial consistency with image 1
- Keep exact eye color, face shape, and all facial features identical

ULTRA-REALISTIC DETAILS:
- Hyper-realistic skin texture with visible pores, fine lines, and natural imperfections
- Individual hair strands with natural flyaways and texture
- Sharp focus throughout entire image - NO background blur or bokeh
- Micro-details on clothing fabric, accessories
- Natural skin shine and oil on face
- Realistic lighting with no artificial color grading

IPHONE 60FPS HD PHOTOGRAPHY STYLE:
- Shot on iPhone in 60fps HD - natural smartphone camera look
- Slightly cooler color temperature typical of iPhone
- High clarity and sharpness across entire frame
- Natural daylight with realistic shadows
- Candid, documentary-style photography
- Everything in focus from foreground to background

TATTOO REMOVAL (CRITICAL):
- REMOVE ANY AND ALL TATTOOS completely from the model
- Keep skin completely clean and tattoo-free

ENVIRONMENT:
- Adapt lighting, angle and environment to match image 2
- Keep background sharp and detailed with visible textures
- Clone EVERYTHING from reference (pose, expression, gestures, location, lighting, outfit, camera angle, crop)
- Replace ONLY the person's identity with MODEL (face, body, skin, hair)

CLEANUP:
- REMOVE all text, watermarks, usernames, UI elements, reels typography
- Clean image only

Aspect Ratio: ${aspectRatio}

Ultra-realistic, hyper-detailed, photorealistic, natural smartphone photography, maximum realism.`;
  };

  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>, type: 'model' | 'reference') => {
    const file = e.target.files?.[0];
    if (file) {
      // Validar tamanho (max 50MB)
      if (file.size > 50 * 1024 * 1024) {
        toast.error('Imagem muito grande. Máximo 50MB.');
        return;
      }
      
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'model') {
          setModelImage(result);
        } else {
          setReferenceImage(result);
        }
        // Limpar erro anterior
        setErrorInfo(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!modelImage || !referenceImage) {
      toast.error('Por favor, carregue ambas as imagens (Modelo e Referência)');
      return;
    }

    setIsProcessing(true);
    setErrorInfo(null);
    setAnalysisText(null);
    setGeneratedImage(null);

    // Construir prompt final
    const finalPrompt = useCustomPrompt && customPrompt.trim() 
      ? `${getBasePrompt()}\n\nADDITIONAL INSTRUCTIONS FROM USER:\n${customPrompt}`
      : getBasePrompt();

    try {
      const response = await fetch('http://localhost:3000/api/generate-clone', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'user-id': 'mock-user-id-123'
        },
        body: JSON.stringify({
          modelImage,
          referenceImage,
          prompt: finalPrompt
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        // Mostrar erro detalhado
        setErrorInfo({
          message: data.error || 'Erro desconhecido',
          solution: data.solution
        });
        toast.error(data.error || 'Falha na geração');
        return;
      }

      // Verificar se gerou imagem ou apenas análise
      if (data.imageUrl) {
        setGeneratedImage(data.imageUrl);
        toast.success('Clonagem concluída com sucesso!');
      } else if (data.analysis) {
        setAnalysisText(data.analysis);
        toast.info(data.message || 'Análise gerada (sem imagem)');
      }

    } catch (error) {
      console.error('Erro ao gerar imagem:', error);
      setErrorInfo({
        message: 'Erro de conexão com o servidor',
        solution: 'Verifique se o servidor está rodando em localhost:3000'
      });
      toast.error('Erro ao processar imagem');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadImage = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = generatedImage;
    link.download = `cloned-image-${Date.now()}.png`;
    link.click();
    toast.success('Download iniciado!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 text-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-orange-400 via-pink-400 to-purple-400 bg-clip-text text-transparent">
            Plataforma de Clonagem
          </h1>
          <p className="text-gray-400">Clone poses, expressões e cenas mantendo a identidade da modelo</p>
        </div>

        {/* Grid de Upload */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6">
          {/* Imagem Modelo */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <ImagePlus className="w-5 h-5 text-purple-400" />
              Imagem da Modelo
              <span className="text-xs text-gray-500 font-normal">(Identidade a preservar)</span>
            </h2>
            <div className="border-2 border-dashed border-purple-500/30 rounded-xl p-6 text-center hover:border-purple-500/60 transition-all cursor-pointer bg-black/20">
              {!modelImage ? (
                <label className="cursor-pointer block">
                  <Upload className="w-10 h-10 mx-auto mb-3 text-purple-400" />
                  <p className="text-gray-300 mb-1">Clique para upload</p>
                  <p className="text-xs text-gray-500">PNG, JPG, WEBP (max 50MB)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'model')}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative">
                  <img src={modelImage} alt="Modelo" className="max-h-72 mx-auto rounded-lg" />
                  <button
                    onClick={() => setModelImage(null)}
                    className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 rounded-full p-1.5 text-white text-sm"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Imagem Referência */}
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Copy className="w-5 h-5 text-pink-400" />
              Imagem de Referência
              <span className="text-xs text-gray-500 font-normal">(Pose/cena alvo)</span>
            </h2>
            <div className="border-2 border-dashed border-pink-500/30 rounded-xl p-6 text-center hover:border-pink-500/60 transition-all cursor-pointer bg-black/20">
              {!referenceImage ? (
                <label className="cursor-pointer block">
                  <Upload className="w-10 h-10 mx-auto mb-3 text-pink-400" />
                  <p className="text-gray-300 mb-1">Clique para upload</p>
                  <p className="text-xs text-gray-500">Reels, fotos, screenshots</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'reference')}
                    className="hidden"
                  />
                </label>
              ) : (
                <div className="relative">
                  <img src={referenceImage} alt="Referência" className="max-h-72 mx-auto rounded-lg" />
                  <button
                    onClick={() => setReferenceImage(null)}
                    className="absolute top-2 right-2 bg-red-500/80 hover:bg-red-500 rounded-full p-1.5 text-white text-sm"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Configurações */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 mb-6">
          <h2 className="text-xl font-semibold mb-4">Configurações</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Tipo de Clonagem</label>
              <select
                value={cloningType}
                onChange={(e) => setCloningType(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                {cloningTypes.map(type => (
                  <option key={type.value} value={type.value} className="bg-gray-900">
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-300">Proporção da Imagem</label>
              <select
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500 transition-colors"
              >
                {aspectRatios.map(ratio => (
                  <option key={ratio.value} value={ratio.value} className="bg-gray-900">
                    {ratio.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* NOVO: Campo de Prompt Customizado */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              Instruções Adicionais
            </h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={useCustomPrompt}
                onChange={(e) => setUseCustomPrompt(e.target.checked)}
                className="w-4 h-4 rounded border-white/20 bg-black/40 text-purple-500 focus:ring-purple-500"
              />
              <span className="text-sm text-gray-400">Usar prompt customizado</span>
            </label>
          </div>
          
          <textarea
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            disabled={!useCustomPrompt}
            placeholder={useCustomPrompt 
              ? "Digite instruções específicas...\n\nExemplos:\n- Adicione um fundo de praia tropical\n- Mantenha o cabelo loiro mas mude para cacheado\n- Use iluminação golden hour\n- Adicione um sorriso sutil"
              : "Ative o checkbox acima para adicionar instruções personalizadas"
            }
            className={`w-full bg-black/40 border rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none transition-all min-h-[120px] resize-y ${
              useCustomPrompt 
                ? 'border-cyan-500/50 focus:border-cyan-500' 
                : 'border-white/10 opacity-50 cursor-not-allowed'
            }`}
          />
          
          {useCustomPrompt && (
            <p className="mt-2 text-xs text-gray-500">
              💡 Dica: Seja específico! Exemplo: "Mude o fundo para uma cafeteria aconchegante com iluminação quente"
            </p>
          )}
        </div>

        {/* Mostrar Erro */}
        {errorInfo && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-5 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-6 h-6 text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-400 mb-1">Erro na Geração</h3>
                <p className="text-gray-300">{errorInfo.message}</p>
                {errorInfo.solution && (
                  <p className="text-sm text-gray-400 mt-2">
                    💡 <strong>Solução:</strong> {errorInfo.solution}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Botão de Geração */}
        <div className="text-center mb-6">
          <button
            onClick={handleGenerate}
            disabled={isProcessing || !modelImage || !referenceImage}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white font-bold py-4 px-12 rounded-full text-lg shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 disabled:shadow-none"
          >
            {isProcessing ? (
              <>
                <Loader2 className="inline w-5 h-5 mr-2 animate-spin" />
                Processando com IA...
              </>
            ) : (
              <>
                <Sparkles className="inline w-5 h-5 mr-2" />
                Gerar Clonagem
              </>
            )}
          </button>
        </div>

        {/* Resultado - Imagem */}
        {generatedImage && (
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-green-400" />
                Resultado
              </h2>
              <button
                onClick={downloadImage}
                className="bg-green-600 hover:bg-green-500 text-white font-semibold py-2.5 px-6 rounded-xl flex items-center gap-2 transition-colors"
              >
                <Download className="w-5 h-5" />
                Download
              </button>
            </div>
            <div className="text-center bg-black/20 rounded-xl p-4">
              <img src={generatedImage} alt="Resultado" className="max-h-[600px] mx-auto rounded-lg shadow-2xl" />
            </div>
          </div>
        )}

        {/* Resultado - Análise de Texto (fallback) */}
        {analysisText && !generatedImage && (
          <div className="bg-white/5 backdrop-blur-md rounded-2xl p-5 border border-white/10 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-cyan-400" />
              Análise da IA
            </h2>
            <div className="bg-black/20 rounded-xl p-4">
              <p className="text-gray-300 whitespace-pre-wrap">{analysisText}</p>
            </div>
            <p className="mt-3 text-sm text-yellow-400">
              ⚠️ O modelo atual não suportou geração de imagem. Apenas análise foi retornada.
            </p>
          </div>
        )}

        {/* Informações */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 text-sm text-gray-400 border border-white/5">
          <h3 className="font-semibold text-base mb-3 text-white">ℹ️ Como usar:</h3>
          <ol className="list-decimal list-inside space-y-1.5">
            <li>Faça upload da foto da modelo (rosto/identidade a preservar)</li>
            <li>Faça upload da imagem de referência (pose/cena/roupa desejada)</li>
            <li>Escolha o tipo de clonagem e proporção</li>
            <li>(Opcional) Ative instruções customizadas para ajustes específicos</li>
            <li>Clique em "Gerar Clonagem" e aguarde</li>
            <li>Faça download do resultado!</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default ImageCloningPlatform;
