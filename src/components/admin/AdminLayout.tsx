import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { AdminHeader } from "./AdminHeader";
import { cn } from "@/lib/utils";

export default function AdminLayout() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white font-sans selection:bg-purple-500/30">
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
