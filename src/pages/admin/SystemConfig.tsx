import { useState, useEffect } from "react";
import {
    Settings,
    CreditCard,
    Bot,
    ShieldAlert,
    Save,
    RefreshCw,
    Eye,
    EyeOff,
    Copy,
    AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function SystemConfig() {
    const { session } = useAuth();
    const [stripeKeyVisible, setStripeKeyVisible] = useState(false);
    const [googleKeyVisible, setGoogleKeyVisible] = useState(false);
    const [temperature, setTemperature] = useState([0.7]);
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
    const [apiStatus, setApiStatus] = useState<any>(null);

    useEffect(() => {
        checkStatus();
    }, [session]);

    const checkStatus = async () => {
        if (!session?.access_token) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/admin/config/status`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            const data = await res.json();
            setApiStatus(data);
        } catch (e) {
            console.error("Failed to check status", e);
        }
    };

    const handleSave = () => {
        toast.success("Configurações salvas com sucesso!");
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="border-b border-white/10 pb-6">
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <Settings className="text-gray-400" /> Configuração do Sistema
                </h1>
                <div className="flex items-center justify-between mt-2">
                    <p className="text-gray-400">Gerencie chaves de API, provedores e configurações.</p>
                    <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                        <AlertTriangle size={14} className="text-yellow-500" />
                        <span className="text-xs text-yellow-500 font-medium">Alterações aqui afetam toda a plataforma</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Left Column */}
                <div className="space-y-6">

                    {/* Payment Gateway */}
                    <div className="bg-[#0d0b14]/50 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <CreditCard className="text-purple-400" />
                                <h3 className="font-semibold text-white">Configuração SyncPay (PIX)</h3>
                            </div>
                            <Badge variant="outline" className="border-green-500/30 bg-green-500/10 text-green-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-2"></span> Conectado
                            </Badge>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-gray-300">Client Secret</Label>
                                <div className="relative">
                                    <Input
                                        type={stripeKeyVisible ? "text" : "password"}
                                        defaultValue="***************************"
                                        className="bg-black/20 border-white/10 text-white font-mono pr-20"
                                    />
                                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                        <button onClick={() => setStripeKeyVisible(!stripeKeyVisible)} className="p-1 hover:text-white text-gray-500">
                                            {stripeKeyVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* AI Providers */}
                    <div className="bg-[#0d0b14]/50 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-2">
                                <Bot className="text-cyan-400" />
                                <h3 className="font-semibold text-white">Google AI (Gemini)</h3>
                            </div>
                            <Badge variant="outline" className={apiStatus?.googleAi ? "border-green-500/30 bg-green-500/10 text-green-400" : "border-red-500/30 bg-red-500/10 text-red-400"}>
                                <span className={`w-1.5 h-1.5 rounded-full ${apiStatus?.googleAi ? 'bg-green-500' : 'bg-red-500'} mr-2`}></span>
                                {apiStatus?.googleAi ? "Ativo" : "Erro"}
                            </Badge>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-gray-300">API Key</Label>
                                <div className="relative">
                                    <Input
                                        type={googleKeyVisible ? "text" : "password"}
                                        defaultValue={apiStatus?.googleAi ? "Configurada no .env" : "Não encontrada"}
                                        className="bg-black/20 border-white/10 text-white font-mono pr-10"
                                        disabled
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label className="text-gray-300">Modelo Padrão</Label>
                                    <Select defaultValue="gemini-1.5-pro">
                                        <SelectTrigger className="bg-black/20 border-white/10 text-white">
                                            <SelectValue placeholder="Select model" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-[#1a1625] border-white/10 text-white">
                                            <SelectItem value="gemini-1.5-pro">gemini-1.5-pro</SelectItem>
                                            <SelectItem value="gemini-1.5-flash">gemini-1.5-flash</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="pt-2 flex gap-3">
                                <Button onClick={checkStatus} variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5">
                                    <RefreshCw className="mr-2 h-4 w-4" /> Testar Conexão
                                </Button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Right Column */}
                <div className="space-y-6">

                    {/* Usage Limits */}
                    <div className="bg-[#0d0b14]/50 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                        <h3 className="font-semibold text-white mb-6">Limites do Plano</h3>

                        <div className="space-y-6">
                            {["Free", "Pro", "Enterprise"].map((plan) => (
                                <div key={plan} className="space-y-3 pb-4 border-b border-white/5 last:border-0 last:pb-0">
                                    <div className="flex items-center justify-between">
                                        <span className="font-medium text-gray-200">Plano {plan}</span>
                                    </div>
                                    <div className="grid grid-cols-3 gap-3">
                                        <div>
                                            <Label className="text-xs text-gray-500 mb-1 block">Req Diárias</Label>
                                            <Input
                                                defaultValue={plan === "Free" ? 10 : plan === "Pro" ? 100 : 1000}
                                                className="h-8 bg-black/20 border-white/10 text-white text-xs"
                                            />
                                        </div>
                                        <div>
                                            <Label className="text-xs text-gray-500 mb-1 block">Tokens/mês</Label>
                                            <Input
                                                defaultValue={plan === "Free" ? "50k" : plan === "Pro" ? "500k" : "Unlimited"}
                                                className="h-8 bg-black/20 border-white/10 text-white text-xs"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Danger Zone */}
                    <div className="border border-red-500/20 bg-red-500/5 rounded-xl p-6">
                        <h3 className="font-semibold text-red-400 mb-4 flex items-center gap-2">
                            <ShieldAlert size={18} /> Zona de Perigo
                        </h3>
                        <p className="text-xs text-red-300/70 mb-5">
                            Ações irreversíveis. Cuidado.
                        </p>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-300">Limpar logs do sistema</span>
                                <Button variant="outline" size="sm" className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300">
                                    Limpar Logs
                                </Button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
