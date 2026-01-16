import { Bell, Search, Sun, Moon, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface AdminHeaderProps {
    collapsed: boolean;
}

export function AdminHeader({ collapsed }: AdminHeaderProps) {
    return (
        <header
            className={cn(
                "fixed top-0 right-0 h-16 z-40 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 transition-all duration-300",
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
                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2 right-2.5 h-2 w-2 bg-red-500 rounded-full border border-[#0a0a0f]"></span>
                </Button>

                <div className="h-6 w-px bg-white/10 mx-2" />

                <Button variant="ghost" size="icon" className="text-gray-400 hover:text-white hover:bg-white/10 rounded-full">
                    <Moon className="h-5 w-5" />
                </Button>
            </div>
        </header>
    );
}
