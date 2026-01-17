import { useState, useEffect } from "react";
import {
    Search,
    MoreHorizontal,
    Eye,
    Download,
    Plus,
    Users,
    Trash2,
    Shield
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
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { api, apiFetch } from "@/services/apiClient";

export default function UsersManagement() {
    const { session } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
    const [filter, setFilter] = useState("Todos");
    const [searchTerm, setSearchTerm] = useState("");

    // Add User Form State
    const [isAddUserOpen, setIsAddUserOpen] = useState(false);
    const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "user" });

    useEffect(() => {
        fetchUsers();
    }, [session]);

    const fetchUsers = async () => {
        try {
            const data = await apiFetch('/api/admin/users');
            setUsers(data.users);
        } catch (error) {
            console.error(error);
            toast.error("Erro ao carregar usuários");
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async () => {
        try {
            await apiFetch('/api/admin/users', {
                method: 'POST',
                body: JSON.stringify({
                    email: newUser.email,
                    password: newUser.password,
                    fullName: newUser.name,
                    role: newUser.role
                })
            });
            toast.success("Usuário criado com sucesso!");
            setIsAddUserOpen(false);
            setNewUser({ name: "", email: "", password: "", role: "user" });
            fetchUsers();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao criar usuário.");
        }
    };

    const handleBanUser = async (id: string, currentRole: string) => {
        const isBanned = currentRole === 'banned';
        try {
            await apiFetch(`/api/admin/users/${id}/ban`, {
                method: 'POST',
                body: JSON.stringify({ banned: !isBanned })
            });
            toast.success(isBanned ? "Usuário desbanido" : "Usuário banido");
            fetchUsers();
        } catch (error) {
            console.error(error);
            toast.error("Erro ao alterar status do usuário.");
        }
    };

    const handleExportCSV = () => {
        const headers = ["ID", "Nome", "Email", "Role", "Criado Em"];
        const csvContent = [
            headers.join(","),
            ...filteredUsers.map(u =>
                `"${u.id}","${u.full_name}","${u.email}","${u.role}","${u.created_at}"`
            )
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "usuarios_variagen.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const toggleSelectAll = () => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredUsers.map(u => u.id));
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
            case "banned": return "bg-red-500/20 text-red-300 border-red-500/50";
            default: return "bg-gray-500/20 text-gray-400 border-gray-500/50";
        }
    };

    // Filter Logic
    const filteredUsers = users.filter(user => {
        const matchesFilter =
            filter === "Todos" ? true :
                filter === "Admins" ? user.role === "admin" :
                    filter === "Usuários" ? user.role === "user" : true;

        const matchesSearch =
            (user.full_name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
            (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());

        return matchesFilter && matchesSearch;
    });

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
                    <Button variant="outline" onClick={handleExportCSV} className="border-white/10 text-white hover:bg-white/10 hover:text-white">
                        <Download className="mr-2 h-4 w-4" /> Exportar CSV
                    </Button>

                    <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
                                <Plus className="mr-2 h-4 w-4" /> Add Usuário
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-slate-900 text-white border-white/10">
                            <DialogHeader>
                                <DialogTitle>Adicionar Novo Usuário</DialogTitle>
                                <DialogDescription>
                                    Crie uma conta manualmente. O usuário receberá acesso imediato.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Nome</Label>
                                    <Input id="name" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} className="col-span-3 bg-slate-800 border-white/10 text-white" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="email" className="text-right">Email</Label>
                                    <Input id="email" type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} className="col-span-3 bg-slate-800 border-white/10 text-white" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="password" className="text-right">Senha</Label>
                                    <Input id="password" type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} className="col-span-3 bg-slate-800 border-white/10 text-white" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="role" className="text-right">Função</Label>
                                    <Select value={newUser.role} onValueChange={v => setNewUser({ ...newUser, role: v })}>
                                        <SelectTrigger className="w-[180px] bg-slate-800 border-white/10 text-white">
                                            <SelectValue placeholder="Selecione" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-800 border-white/10 text-white">
                                            <SelectItem value="user">Usuário</SelectItem>
                                            <SelectItem value="admin">Admin</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <DialogFooter>
                                <Button onClick={handleAddUser} className="bg-purple-600 hover:bg-purple-700">Criar Conta</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between bg-white/5 p-4 rounded-xl border border-white/10">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 h-4 w-4" />
                    <Input
                        placeholder="Buscar por email ou nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-background border-input text-foreground placeholder:text-muted-foreground"
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
            <div className="rounded-xl border border-border overflow-hidden bg-card/50 backdrop-blur-sm">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="w-12">
                                <Checkbox
                                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
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
                        ) : filteredUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-gray-400">Nenhum usuário encontrado</TableCell>
                            </TableRow>
                        ) : filteredUsers.map((user) => (
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
                                        <DropdownMenuContent align="end" className="bg-slate-900 border-white/10 text-white">
                                            <DropdownMenuLabel>Ações</DropdownMenuLabel>
                                            <DropdownMenuItem className="hover:bg-white/10 cursor-pointer">
                                                <Eye className="mr-2 h-4 w-4 text-gray-400" /> Ver Perfil
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleBanUser(user.id, user.role)}
                                                className="hover:bg-red-900/20 text-red-400 cursor-pointer"
                                            >
                                                {user.role === 'banned' ? (
                                                    <><Shield className="mr-2 h-4 w-4" /> Reativar Conta</>
                                                ) : (
                                                    <><Trash2 className="mr-2 h-4 w-4" /> Banir Usuário</>
                                                )}
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
