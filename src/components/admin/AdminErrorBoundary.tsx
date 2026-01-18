import { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class AdminErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error in Admin Panel:", error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 space-y-6 bg-slate-900 text-white rounded-xl border border-red-500/30 m-4">
                    <div className="p-4 rounded-full bg-red-500/10 text-red-500">
                        <AlertTriangle className="h-12 w-12" />
                    </div>

                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-red-400">O Painel Admin encontrou um problema</h2>
                        <p className="text-gray-400 max-w-md mx-auto">
                            Um erro inesperado ocorreu. O restante do aplicativo continua funcionando normalmente.
                        </p>
                    </div>

                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <pre className="p-4 bg-black/50 rounded-lg text-xs text-left overflow-auto max-w-2xl w-full text-red-300 font-mono border border-white/5">
                            {this.state.error.toString()}
                        </pre>
                    )}

                    <div className="flex gap-4">
                        <Button
                            variant="outline"
                            onClick={() => window.location.reload()}
                            className="border-white/10 hover:bg-white/10 text-white"
                        >
                            <RefreshCw className="mr-2 h-4 w-4" /> Recarregar Página
                        </Button>

                        <Button
                            onClick={() => window.location.href = '/dashboard'}
                            className="bg-purple-600 hover:bg-purple-700 text-white"
                        >
                            <Home className="mr-2 h-4 w-4" /> Voltar ao App
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
