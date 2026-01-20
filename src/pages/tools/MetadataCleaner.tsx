import { useState } from "react";
import { Upload, FileImage, Download, ShieldCheck, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { apiFetch } from "@/services/apiClient";
import { useAuth } from "@/context/AuthContext";

export default function MetadataCleaner() {
    const { session } = useAuth();
    const [files, setFiles] = useState<File[]>([]);
    const [uploading, setUploading] = useState(false);
    const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

    // SEO Implementation
    useState(() => {
        document.title = "Limpador de Metadados GRÁTIS | VariaGen Tools";

        // Add meta description
        let metaDesc = document.querySelector('meta[name="description"]');
        if (!metaDesc) {
            metaDesc = document.createElement('meta');
            metaDesc.setAttribute('name', 'description');
            document.head.appendChild(metaDesc);
        }
        metaDesc.setAttribute('content', 'Remova dados ocultos (EXIF) de suas fotos online e grátis. Proteja sua privacidade limpando GPS, data e modelo da câmera de suas imagens antes de postar.');
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFiles(Array.from(e.target.files));
            setDownloadUrl(null); // Reset previous result
        }
    };

    const handleProcess = async () => {
        if (files.length === 0) return;
        // Auth check removed to make tool public

        setUploading(true);
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });
        // Send userId if logged in, otherwise null
        if (session?.user?.id) {
            formData.append('userId', session.user.id);
        }

        try {
            const response = await apiFetch('/api/tools/metadata/clean', {
                method: 'POST',
                body: formData,
                headers: {}
            });

            if (response.success && response.downloadUrl) {
                setDownloadUrl(response.downloadUrl);
                toast.success(files.length > 1 ? "Arquivos processados e zipados!" : "Metadados removidos com sucesso!");
            }
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || "Erro ao processar imagem.");
        } finally {
            setUploading(false);
        }
    };

    const handleDownload = () => {
        if (!downloadUrl) return;
        window.open(`${import.meta.env.VITE_API_URL || ''}${downloadUrl}`, '_blank');

        // Reset after download
        setTimeout(() => {
            setFiles([]);
            setDownloadUrl(null);
        }, 3000);
    };

    return (
        <div className="container max-w-4xl py-12 space-y-8">
            <div className="text-center space-y-4">
                <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-purple-600">
                    Removedor de Metadados
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                    Remova dados ocultos (EXIF) de suas fotos em massa. Suporta múltiplos arquivos de uma vez.
                </p>
            </div>

            <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-12 flex flex-col items-center justify-center min-h-[400px]">
                    {!downloadUrl ? (
                        <div className="w-full max-w-md space-y-6 text-center">
                            <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 hover:border-purple-500/50 transition-colors cursor-pointer relative group">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/png, image/jpeg, image/jpg"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    onChange={handleFileChange}
                                />
                                <div className="flex flex-col items-center gap-4">
                                    <div className="p-4 rounded-full bg-white/5 group-hover:bg-purple-500/20 transition-colors">
                                        <Upload className="w-8 h-8 text-gray-400 group-hover:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="font-medium text-white">
                                            {files.length > 0
                                                ? `${files.length} arquivo(s) selecionado(s)`
                                                : "Clique ou arraste suas imagens aqui"}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Suporta processamento em lote (Bulk)
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {files.length > 0 && (
                                <div className="flex flex-wrap gap-2 justify-center">
                                    {files.slice(0, 3).map((f, i) => (
                                        <span key={i} className="text-xs bg-white/10 px-2 py-1 rounded text-gray-300">
                                            {f.name}
                                        </span>
                                    ))}
                                    {files.length > 3 && <span className="text-xs text-gray-400">+{files.length - 3} outros</span>}
                                    <button
                                        onClick={() => setFiles([])}
                                        className="text-xs text-red-400 hover:text-red-300 ml-2"
                                    >
                                        Limpar
                                    </button>
                                </div>
                            )}

                            <Button
                                size="lg"
                                className="w-full bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white font-bold"
                                disabled={files.length === 0 || uploading}
                                onClick={handleProcess}
                            >
                                {uploading ? (
                                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processando {files.length} arquivos...</>
                                ) : (
                                    <><ShieldCheck className="mr-2 h-5 w-5" /> Limpar {files.length > 0 ? files.length : ''} Imagens</>
                                )}
                            </Button>
                        </div>
                    ) : (
                        <div className="w-full max-w-md space-y-6 text-center animate-in fade-in zoom-in duration-300">
                            <div className="p-6 rounded-full bg-green-500/20 w-fit mx-auto text-green-400 border border-green-500/50">
                                <ShieldCheck className="w-12 h-12" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold text-white">Pronto!</h3>
                                <p className="text-gray-400 mt-2">
                                    {files.length > 1
                                        ? "Todas as imagens foram limpas e compactadas em um ZIP."
                                        : "Sua imagem foi limpa com sucesso."}
                                </p>
                            </div>

                            <Button
                                size="lg"
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold h-12"
                                onClick={handleDownload}
                            >
                                <Download className="mr-2 h-5 w-5" />
                                {files.length > 1 ? "Baixar Pack (ZIP)" : "Baixar Imagem"}
                            </Button>

                            <Button
                                variant="ghost"
                                className="text-gray-400 hover:text-white"
                                onClick={() => { setFiles([]); setDownloadUrl(null); }}
                            >
                                Limpar mais imagens
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                    <ShieldCheck className="w-8 h-8 text-cyan-400 mb-4" />
                    <h3 className="font-bold text-white mb-2">Privacidade Total</h3>
                    <p className="text-sm text-gray-400">Removemos GPS, autor e modelo da câmera para que ninguém rastreie a origem da foto.</p>
                </div>
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                    <FileImage className="w-8 h-8 text-purple-400 mb-4" />
                    <h3 className="font-bold text-white mb-2">Qualidade Intacta</h3>
                    <p className="text-sm text-gray-400">Apenas os metadados (texto oculto) são removidos. A qualidade visual da imagem é 100% preservada.</p>
                </div>
                <div className="p-6 rounded-xl bg-white/5 border border-white/10">
                    <AlertCircle className="w-8 h-8 text-red-400 mb-4" />
                    <h3 className="font-bold text-white mb-2">Sem Rastros</h3>
                    <p className="text-sm text-gray-400">Não guardamos suas fotos. Tudo é deletado logo após o download.</p>
                </div>
            </div>

            {/* SEO Content Section */}
            <div className="mt-16 space-y-8 text-gray-300 max-w-3xl mx-auto border-t border-white/10 pt-12">
                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">Por que limpar os metadados das fotos?</h2>
                    <p className="leading-relaxed">
                        Toda foto que você tira com seu celular ou câmera digital contém informações ocultas chamadas <strong>Dados EXIF</strong>.
                        Isso inclui a localização exata de onde a foto foi tirada (GPS), a data e hora, o modelo do aparelho e até as configurações da lente.
                        Ao postar essas fotos na internet, você pode estar expondo sua privacidade sem saber.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">Como funciona o Removedor de Metadados Online?</h2>
                    <p className="leading-relaxed mb-4">
                        Nossa ferramenta funciona como um "filtro de privacidade". Você faz o upload da imagem, nosso sistema identifica os cabeçalhos EXIF, IPTC e XMP
                        e os remove completamente, devolvendo uma cópia limpa do arquivo original.
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Remover Localização GPS:</strong> Evite que estranhos saibam onde você mora ou trabalha.</li>
                        <li><strong>Limpar Dados da Câmera:</strong> Remova informações sobre seu iPhone ou Android.</li>
                        <li><strong>Preservar Qualidade:</strong> O processo é "lossless", ou seja, não afeta a qualidade da imagem.</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-bold text-white mb-4">É seguro usar este limpador de EXIF?</h2>
                    <p className="leading-relaxed">
                        Sim. Diferente de outros sites, nós não armazenamos seus arquivos. Utilizamos um sistema de <strong>Armazenamento Efêmero</strong>,
                        onde cada arquivo enviado é automaticamente destruído após o processamento. É rápido, gratuito e 100% seguro.
                    </p>
                </section>
            </div>
        </div>
    );
}
