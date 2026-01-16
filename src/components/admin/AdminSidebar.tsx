import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
    LayoutDashboard,
    Users,
    CreditCard,
    Activity,
    Settings,
    BookOpen,
    Headphones,
    LogOut,
    ChevronLeft,
    ChevronRight,
    ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface AdminSidebarProps {
    collapsed: boolean;
    toggleCollapse: () => void;
}

export function AdminSidebar({ collapsed, toggleCollapse }: AdminSidebarProps) {
    const location = useLocation();

    const navItems = [
        { icon: LayoutDashboard, label: "Dashboard", href: "/admin", badge: null },
        { icon: Users, label: "Usuários", href: "/admin/users", badge: null },
        { icon: CreditCard, label: "Assinaturas", href: "/admin/subscriptions", badge: null },
        { icon: Activity, label: "Logs de Uso (IA)", href: "/admin/ai-usage", badge: null },
        { icon: Settings, label: "Configuração", href: "/admin/config", badge: null },
    ];

    const secondaryNavItems = [
        { icon: BookOpen, label: "Documentação", href: "#", external: true },
        { icon: Headphones, label: "Suporte", href: "#", external: false },
    ];

    return (
        <aside
            className={cn(
                "bg-[#0d0b14] border-r border-white/5 fixed left-0 top-0 h-full transition-all duration-300 z-50 flex flex-col",
                collapsed ? "w-[72px]" : "w-[260px]"
            )}
        >
            {/* Logo Section */}
            <div className="h-16 flex items-center px-4 border-b border-white/5">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="min-w-[40px] h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-cyan-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                        <span className="text-white font-bold text-xl">V</span>
                    </div>
                    <div className={cn("transition-opacity duration-300", collapsed ? "opacity-0 w-0 hidden" : "opacity-100")}>
                        <h1 className="text-white font-bold text-lg leading-none">VariaGen</h1>
                        <span className="text-xs text-muted-foreground font-medium">Admin Panel</span>
                    </div>
                </div>
            </div>

            {/* Toggle Button */}
            <button
                onClick={toggleCollapse}
                className="absolute -right-3 top-20 bg-purple-600 text-white rounded-full p-1 shadow-lg hover:bg-purple-700 transition-colors z-50"
            >
                {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Navigation */}
            <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const isActive = location.pathname === item.href || (item.href !== "/admin" && location.pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            to={item.href}
                            className={cn(
                                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative",
                                isActive
                                    ? "bg-purple-500/10 text-white border-l-2 border-purple-500"
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                            )}
                        >
                            <item.icon
                                size={20}
                                className={cn(
                                    "flex-shrink-0 transition-colors",
                                    isActive ? "text-purple-400" : "text-gray-500 group-hover:text-gray-300"
                                )}
                            />
                            {!collapsed && (
                                <>
                                    <span className="font-medium flex-1 truncate">{item.label}</span>
                                    {item.badge && (
                                        <span className="text-xs font-semibold bg-white/10 text-gray-300 px-2 py-0.5 rounded-full">
                                            {item.badge}
                                        </span>
                                    )}
                                </>
                            )}

                            {/* Tooltip for collapsed state */}
                            {collapsed && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-white/10">
                                    {item.label}
                                </div>
                            )}
                        </Link>
                    );
                })}

                <div className="my-4 border-t border-white/5 mx-2" />

                {secondaryNavItems.map((item) => (
                    <a
                        key={item.label}
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all group relative"
                    >
                        <item.icon size={20} className="flex-shrink-0 text-gray-500 group-hover:text-gray-300" />
                        {!collapsed && <span className="font-medium flex-1 truncate">{item.label}</span>}
                        {collapsed && (
                            <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl border border-white/10">
                                {item.label}
                            </div>
                        )}
                    </a>
                ))}
            </nav>

            {/* Bottom User Section */}
            <div className="p-3 border-t border-white/5">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className={cn(
                            "w-full flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors text-left",
                            collapsed ? "justify-center" : ""
                        )}>
                            <Avatar className="h-9 w-9 border border-white/10">
                                <AvatarImage src="https://github.com/shadcn.png" />
                                <AvatarFallback>AD</AvatarFallback>
                            </Avatar>

                            {!collapsed && (
                                <div className="flex-1 overflow-hidden">
                                    <p className="text-sm font-medium text-white truncate">Ortiz</p>
                                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                                        <ShieldCheck size={10} className="text-purple-400" /> Super Admin
                                    </p>
                                </div>
                            )}
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-[#1a1625] border-white/10 text-gray-200" align="end" side="right">
                        <DropdownMenuLabel>My Account</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem className="hover:bg-white/5 focus:bg-white/5 cursor-pointer">Profile Settings</DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-white/5 focus:bg-white/5 cursor-pointer text-red-400">
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Log out</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </aside>
    );
}
