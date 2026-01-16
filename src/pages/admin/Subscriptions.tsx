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

export default function Subscriptions() {
    const { session } = useAuth();
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubscriptions();
    }, [session]);

    const fetchSubscriptions = async () => {
        if (!session?.access_token) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/admin/subscriptions`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setSubscriptions(data.subscriptions);
            } else {
                toast.error("Erro ao carregar assinaturas");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
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
            <div className="bg-[#0d0b14]/50 border border-white/10 rounded-xl overflow-hidden backdrop-blur-sm">
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
                                    <Badge variant="outline" className="border-white/20 text-gray-300 font-normal">
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
                                        <DropdownMenuContent align="end" className="bg-[#1a1625] border-white/10 text-gray-200">
                                            <DropdownMenuItem className="hover:bg-white/5 cursor-pointer">Ver Detalhes</DropdownMenuItem>
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
        </div>
    );
}
