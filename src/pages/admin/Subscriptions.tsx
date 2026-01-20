import { CreditCard, MoreHorizontal, ArrowUpRight, ArrowDownRight, Check, AlertTriangle, XCircle, Search } from "lucide-react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { apiFetch } from "@/services/apiClient";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export default function Subscriptions() {
    const { session } = useAuth();
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [selectedSub, setSelectedSub] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubscriptions();
    }, [session]);

    const fetchSubscriptions = async () => {
        try {
            const data = await apiFetch('/api/admin/subscriptions');
            setSubscriptions(data?.subscriptions || []);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar assinaturas");
        } finally {
            setLoading(false);
        }
    };

    const handleCancelSubscription = async (id: string) => {
        try {
            if (!confirm("Tem certeza que deseja cancelar esta assinatura?")) return;

            await apiFetch(`/api/admin/subscriptions/${id}/cancel`, { method: 'POST' });
            toast.success("Assinatura cancelada.");
            fetchSubscriptions();
        } catch (e: any) {
            toast.error(e.message || "Erro ao cancelar.");
        }
    };

    const handleDeleteSubscription = async (id: string) => {
        try {
            if (!confirm("Isso removerá o registro do banco de dados. Confirmar?")) return;

            await apiFetch(`/api/admin/subscriptions/${id}`, { method: 'DELETE' });
            toast.success("Registro removido.");
            fetchSubscriptions();
        } catch (e: any) {
            toast.error(e.message || "Erro ao excluir.");
        }
    };

    const handleRefundSubscription = async (id: string) => {
        try {
            if (!confirm("Confirmar reembolso? Isso removerá o acesso do usuário imediatamente.")) return;

            await apiFetch(`/api/admin/subscriptions/${id}/refund`, { method: 'POST' });
            toast.success("Assinatura reembolsada e acesso revogado.");
            fetchSubscriptions();
        } catch (e: any) {
            toast.error(e.message || "Erro ao reembolsar.");
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "active":
                return <Badge className="bg-green-500/20 text-green-400 hover:bg-green-500/30 border-green-500/50"><Check size={12} className="mr-1" /> Ativo</Badge>;
            case "past_due":
                return <Badge className="bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30 border-yellow-500/50"><AlertTriangle size={12} className="mr-1" /> Pendente</Badge>;
            case "canceled":
                return <Badge className="bg-red-500/20 text-red-400 hover:bg-red-500/30 border-red-500/50"><XCircle size={12} className="mr-1" /> Cancelado</Badge>;
            case "refunded":
                return <Badge className="bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 border-blue-500/50"><Check size={12} className="mr-1" /> Reembolsado</Badge>;
            default: return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                    <CreditCard className="text-cyan-400" /> Assinaturas
                </h1>
                <p className="text-gray-400">Monitore e gerencie todas as assinaturas</p>
            </div>

            {/* Subscriptions Table */}
            <div className="bg-card/50 border border-border rounded-xl overflow-hidden backdrop-blur-sm">
                <div className="p-4 border-b border-white/10 flex items-center justify-between">
                    <h3 className="font-semibold text-white">Transações Recentes</h3>
                </div>
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="text-gray-300">Cliente</TableHead>
                            <TableHead className="text-gray-300">Plano</TableHead>
                            <TableHead className="text-gray-300">Status</TableHead>
                            <TableHead className="text-gray-300">Iniciado</TableHead>
                            <TableHead className="text-gray-300">SyncPay ID</TableHead>
                            <TableHead className="text-right text-gray-300"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-400">Carregando...</TableCell>
                            </TableRow>
                        ) : subscriptions.map((sub) => (
                            <TableRow key={sub.id} className="border-white/5 hover:bg-white/5 transition-colors">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-8 w-8 border border-white/10">
                                            <AvatarImage src={sub.users?.avatar_url} />
                                            <AvatarFallback>{sub.users?.full_name?.substring(0, 2) || "??"}</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <div className="font-medium text-white text-sm">{sub.users?.full_name || sub.users?.email}</div>
                                            <div className="text-xs text-gray-500">{sub.users?.email}</div>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="border-white/20 text-white font-normal text-xs">
                                        {sub.plan_id}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {getStatusBadge(sub.status)}
                                </TableCell>
                                <TableCell className="text-gray-400 text-sm">
                                    {new Date(sub.created_at).toLocaleDateString('pt-BR')}
                                </TableCell>
                                <TableCell className="text-gray-500 font-mono text-xs">{sub.stripe_customer_id}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground">
                                            <DropdownMenuItem onClick={() => setSelectedSub(sub)} className="hover:bg-white/5 cursor-pointer">Ver Detalhes</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleCancelSubscription(sub.id)} className="hover:bg-yellow-500/10 text-yellow-500 cursor-pointer">
                                                Cancelar Assinatura
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleRefundSubscription(sub.id)} className="hover:bg-blue-500/10 text-blue-400 cursor-pointer">
                                                Reembolsar (Estornar)
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleDeleteSubscription(sub.id)} className="hover:bg-red-500/10 text-red-500 cursor-pointer">
                                                Excluir Registro
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                        {subscriptions.length === 0 && !loading && (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-gray-500">Nenhuma assinatura encontrada.</TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            {/* Details Modal */}
            <Dialog open={!!selectedSub} onOpenChange={() => setSelectedSub(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Detalhes da Assinatura</DialogTitle>
                    </DialogHeader>
                    {selectedSub && (
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Cliente</label>
                                    <p className="font-medium">{selectedSub.users?.full_name}</p>
                                    <p className="text-sm text-gray-400">{selectedSub.users?.email}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Status</label>
                                    <div className="mt-1">{getStatusBadge(selectedSub.status)}</div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Plano</label>
                                    <p className="capitalize">{selectedSub.plan_id.replace('_', ' ')}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Valor Estimado</label>
                                    <p>
                                        {selectedSub.plan_id === 'tester' ? 'R$ 5,00' :
                                            selectedSub.plan_id.includes('pro') ? 'R$ 29,00' : 'R$ 99,00'}
                                    </p>
                                </div>
                                <div className="col-span-2">
                                    <label className="text-sm font-medium text-gray-500">SyncPay ID</label>
                                    <p className="text-xs font-mono bg-secondary p-2 rounded">{selectedSub.stripe_customer_id}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Criado em</label>
                                    <p>{new Date(selectedSub.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Expira em</label>
                                    <p>{selectedSub.current_period_end ? new Date(selectedSub.current_period_end).toLocaleDateString() : 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
