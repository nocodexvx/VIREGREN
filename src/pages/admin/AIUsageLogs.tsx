import { useState, useEffect } from "react";
import { Activity, Search, RefreshCw, Smartphone, Video } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function AIUsageLogs() {
    const { session } = useAuth();
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLogs();
    }, [session]);

    const fetchLogs = async () => {
        if (!session?.access_token) return;
        setLoading(true);
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/admin/logs`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setLogs(data.logs);
            } else {
                toast.error("Erro ao carregar logs");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Activity className="text-blue-400" /> Logs de Uso (IA)
                    </h1>
                    <p className="text-gray-400">Rastreie todas as gerações de vídeo e consumo da API</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" onClick={fetchLogs} className="border-white/10 text-gray-300 hover:bg-white/5">
                        <RefreshCw className="mr-2 h-4 w-4" /> Atualizar
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-white/10 overflow-hidden bg-[#0d0b14]/50 backdrop-blur-sm">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="text-gray-300">Usuário</TableHead>
                            <TableHead className="text-gray-300">Recurso</TableHead>
                            <TableHead className="text-gray-300">Provedor</TableHead>
                            <TableHead className="text-gray-300">Tokens/Custo</TableHead>
                            <TableHead className="text-gray-300">Status</TableHead>
                            <TableHead className="text-right text-gray-300">Data/Hora</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-400">Carregando...</TableCell>
                            </TableRow>
                        ) : logs.map((log) => (
                            <TableRow key={log.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                <TableCell>
                                    <div className="font-medium text-white">{log.users?.email || "Desconhecido"}</div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <Video size={14} className="text-purple-400" />
                                        <span className="text-gray-300 capitalize">{log.feature?.replace('_', ' ')}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-gray-400 uppercase text-xs font-mono">
                                    {log.provider}
                                </TableCell>
                                <TableCell className="text-gray-300 font-mono">
                                    {log.cost_tokens > 0 ? log.cost_tokens : "-"}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                                        {log.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right text-gray-400 text-sm">
                                    {new Date(log.created_at).toLocaleString('pt-BR')}
                                </TableCell>
                            </TableRow>
                        ))}
                        {logs.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">Nenhum log encontrado.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
