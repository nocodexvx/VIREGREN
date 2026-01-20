import { Bell, Search, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState, useEffect } from "react";
import { apiFetch } from "@/services/apiClient";
import { Link } from "react-router-dom";

interface AdminHeaderProps {
    collapsed: boolean;
}

export function AdminHeader({ collapsed }: AdminHeaderProps) {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isDark, setIsDark] = useState(true);

    useEffect(() => {
        // Simple "Fake" Notification System based on recent users
        const fetchNotifications = async () => {
            try {
                const data = await apiFetch('/api/admin/users');
                const recent = (data?.users || []).slice(0, 5).map((u: any) => ({
                    id: u.id,
                    title: `Novo Usuário: ${u.full_name || u.email}`,
                    time: new Date(u.created_at).toLocaleDateString('pt-BR'),
                    type: 'user'
                }));
                setNotifications(recent);
            } catch (e) {
                console.error("Erro ao buscar notificações", e);
            }
        };
        fetchNotifications();
    }, []);

    const toggleTheme = () => {
        setIsDark(!isDark);
        // In a real app, this would use a context or modify document.documentElement
        document.documentElement.classList.toggle('dark');
    };

    return (
        <header
            className={cn(
                "fixed top-0 right-0 h-16 z-40 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 transition-all duration-300",
                collapsed ? "left-[72px]" : "left-[260px]"
            )}
        >
            {/* Left: Search */}
            <div className="flex items-center gap-4 flex-1">
                <div className="relative w-full max-w-md hidden md:block">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        placeholder="Search anything (Cmd+K)..."
                        className="pl-10 bg-white/5 border-white/10 focus:border-purple-500/50 text-white placeholder:text-muted-foreground rounded-full h-9"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full relative">
                            <Bell className="h-5 w-5" />
                            {notifications.length > 0 && (
                                <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border border-[#0a0a0f] animate-pulse"></span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 bg-slate-900 border-white/10 text-white shadow-xl">
                        <DropdownMenuLabel>Notificações Recentes</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10" />
                        {notifications.length === 0 ? (
                            <div className="p-4 text-center text-sm text-gray-400">Nenhuma notificação nova</div>
                        ) : (
                            <div className="max-h-[300px] overflow-y-auto">
                                {notifications.map((notif) => (
                                    <DropdownMenuItem key={notif.id} className="cursor-pointer hover:bg-white/5 focus:bg-white/5 py-3">
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium text-sm">{notif.title}</span>
                                            <span className="text-xs text-gray-500">{notif.time}</span>
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                                <DropdownMenuSeparator className="bg-white/10" />
                                <DropdownMenuItem asChild className="p-2 text-center text-xs text-purple-400 cursor-pointer justify-center hover:text-purple-300 focus:text-purple-300">
                                    <Link to="/admin/users" className="w-full h-full block">
                                        Ver todos os usuários
                                    </Link>
                                </DropdownMenuItem>
                            </div>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                <div className="h-6 w-px bg-white/10 mx-2" />

                <Button variant="ghost" size="icon" onClick={toggleTheme} className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full transition-transform active:scale-95">
                    {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                </Button>
            </div>
        </header>
    );
}
