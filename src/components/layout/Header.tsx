import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Zap, LogOut, User as UserIcon } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header() {
  // Force update v2.1
  const location = useLocation();
  const { user, signOut, isAdmin } = useAuth();
  const isLanding = location.pathname === "/";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden">
            <img src="/favicon.png" alt="VariaGen Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-xl">VariaGen</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {isLanding && (
            <>
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
                Recursos
              </a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
                Preços
              </a>
              <a href="#faq" className="text-muted-foreground hover:text-foreground transition-colors">
                FAQ
              </a>
            </>
          )}
          <Link to="/tools/metadata" className="text-muted-foreground hover:text-purple-400 transition-colors flex items-center gap-1 font-medium">
            <Zap className="w-4 h-4" />
            Limpador Grátis
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              {isAdmin && (
                <Button variant="ghost" className="text-purple-400" asChild>
                  <Link to="/admin">Admin</Link>
                </Button>
              )}

              <Button variant="ghost" asChild>
                <Link to="/tools/metadata">Limpador de Metadados</Link>
              </Button>

              <Button variant="ghost" asChild>
                <Link to="/dashboard">Dashboard</Link>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="rounded-full">
                    <UserIcon className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover border-border text-popover-foreground">
                  <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem className="hover:bg-white/5 cursor-pointer" onClick={() => signOut()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Entrar</Link>
              </Button>
              <Button className="gradient-primary" asChild>
                <Link to="/register">Começar Agora</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
