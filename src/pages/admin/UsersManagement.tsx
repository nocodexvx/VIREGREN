
import { useState, useEffect } from "react";
import {
    Search,
    MoreHorizontal,
    Eye,
    Activity,
    ArrowUp,
    Mail,
    Ban,
    Download,
    Plus,
    Users
} from "lucide-react";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

export default function UsersManagement() {
    const { session } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
    const [filter, setFilter] = useState("Todos");

    useEffect(() => {
        fetchUsers();
    }, [session]);

    const fetchUsers = async () => {
        if (!session?.access_token) return;
        try {
            const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/admin/users`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` }
            });
            const data = await res.json();
            if (res.ok) {
                setUsers(data.users);
            } else {
                toast.error("Erro ao carregar usuários");
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelectAll = () => {
        if (selectedUsers.length === users.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(users.map(u => u.id));
        }
    };

    const toggleSelectUser = (id: any) => {
        if (selectedUsers.includes(id)) {
            setSelectedUsers(selectedUsers.filter(userId => userId !== id));
        } else {
            setSelectedUsers([...selectedUsers, id]);
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "admin": return "bg-purple-500/20 text-purple-300 border-purple-500/50";
            default: return "bg-gray-500/20 text-gray-400 border-gray-500/50";
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                        <Users className="text-purple-400" /> Gestão de Usuários
                    </h1>
                    <p className="text-gray-400">Gerencie todos os usuários registrados</p>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline" className="border-white/10 text-gray-300 hover:bg-white/5">
                        <Download className="mr-2 h-4 w-4" /> Exportar CSV
                    </Button>
                    <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                        <Plus className="mr-2 h-4 w-4" /> Add Usuário
                    </Button>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                    <Input
                        placeholder="Buscar por email ou nome..."
                        className="pl-10 bg-[#0a0a0f] border-white/10 text-white placeholder:text-gray-500"
                    />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0">
                    {["Todos", "Admins", "Usuários"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={cn(
                                "px-4 py-1.5 rounded-full text-sm font-medium transition-colors whitespace-nowrap",
                                filter === tab
                                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="rounded-xl border border-white/10 overflow-hidden bg-[#0d0b14]/50 backdrop-blur-sm">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={selectedUsers.length === users.length && users.length > 0}
                                    onCheckedChange={toggleSelectAll}
                                    className="border-gray-500 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                                />
                            </TableHead>
                            <TableHead className="text-gray-300">Usuário</TableHead>
                            <TableHead className="text-gray-300">Função</TableHead>
                            <TableHead className="text-gray-300">Criado em</TableHead>
                            <TableHead className="text-right text-gray-300">Ações</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-gray-400">Carregando...</TableCell>
                            </TableRow>
                        ) : users.map((user) => (
                            <TableRow key={user.id} className="border-white/5 hover:bg-white/5 transition-colors group">
                                <TableCell>
                                    <Checkbox
                                        checked={selectedUsers.includes(user.id)}
                                        onCheckedChange={() => toggleSelectUser(user.id)}
                                        className="border-gray-600 data-[state=checked]:bg-purple-500 data-[state=checked]:border-purple-500"
                                    />
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9 border border-white/10">
                                            <AvatarImage src={user.avatar_url} />
                                            <AvatarFallback>{user.full_name?.substring(0, 2) || "??"}</AvatarFallback>
                                        </Avatar >
                                        <div>
                                            <div className="font-medium text-white">{user.full_name || "Sem Nome"}</div>
                                            <div className="text-xs text-gray-500">{user.email}</div>
                                        </div>
                                    </div >
                                </TableCell >
                                <TableCell>
                                    <Badge variant="outline" className={cn("font-normal", getRoleBadge(user.role))}>
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-gray-400 text-sm">
                                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-white hover:bg-white/10">
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="bg-[#1a1625] border-white/10 text-gray-200">
                                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                            <DropdownMenuItem className="hover:bg-white/5 cursor-pointer">
                                                <Eye className="mr-2 h-4 w-4 text-gray-400" /> Ver Perfil
                                            </DropdownMenuItem>
                                            <DropdownMenuItem className="hover:bg-red-500/10 text-red-400 cursor-pointer">
                                                <Ban className="mr-2 h-4 w-4" /> Banir Usuário
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow >
                        ))}
                    </TableBody >
                </Table >
            </div >
        </div >
    );
}
