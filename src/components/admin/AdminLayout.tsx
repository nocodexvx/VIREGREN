import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { cn } from "@/lib/utils";

export default function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false);
    // Auth check is now handled consistently by AdminRoute wrapper
    // internal redirects removed to prevent race conditions

    return (
        <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary/30">
            <AdminSidebar collapsed={collapsed} toggleCollapse={() => setCollapsed(!collapsed)} />
            <AdminHeader collapsed={collapsed} />

            <main
                className={cn(
                    "pt-24 pb-12 px-6 min-h-screen transition-all duration-300",
                    collapsed ? "ml-[72px]" : "ml-[260px]"
                )}
            >
                <div className="max-w-7xl mx-auto animate-in fade-in duration-500">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
