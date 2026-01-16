import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Loader2 } from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: string;
    price: string;
}

export function PaymentModal({ isOpen, onClose, plan, price }: PaymentModalProps) {
    const { user, checkSubscription } = useAuth();
    const [step, setStep] = useState<'cpf' | 'pix'>('cpf');
    const [loading, setLoading] = useState(false);
    const [cpf, setCpf] = useState('');
    const [pixCode, setPixCode] = useState('');
    const [copied, setCopied] = useState(false);

    const handleCreatePix = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) {
            toast.error('Você precisa estar logado para assinar.');
            return;
        }
        setLoading(true);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/api/payments/subscribe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    plan,
                    customer: {
                        name: user.email?.split('@')[0] || 'Cliente', // Fallback name
                        email: user.email,
                        cpf: cpf.replace(/\D/g, ''), // Clean CPF
                        phone: '11999999999' // Fixed valid placeholder (11 digits)
                    }
                })
            });

            const data = await response.json();

            if (!response.ok) throw new Error(data.error || 'Erro ao gerar PIX');

            setPixCode(data.pix_code);
            setStep('pix');
            toast.success('PIX gerado com sucesso!');

            // Start polling for subscription status
            // In a real app we'd use websockets or polling. 
            // Here we trust the user pays or the webhook eventually hits. 
            // But immediate refresh helps if backend updated fast.
            checkSubscription();

        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(pixCode);
        setCopied(true);
        toast.success('Código PIX copiado!');
        setTimeout(() => setCopied(false), 2000);
    };

    // Close handler that also checks sub status just in case
    const handleClose = () => {
        checkSubscription();
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md bg-[#1a1625] border-white/10 text-white">
                <DialogHeader>
                    <DialogTitle>Assinar Plano {plan === 'pro_monthly' ? 'Pro' : 'Business'}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Valor: R$ {price} / mês
                    </DialogDescription>
                </DialogHeader>

                {step === 'cpf' ? (
                    <form onSubmit={handleCreatePix} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Digite seu CPF para a Nota Fiscal</label>
                            <Input
                                placeholder="000.000.000-00"
                                value={cpf}
                                onChange={(e) => setCpf(e.target.value)}
                                className="bg-black/20 border-white/10"
                                required
                            />
                        </div>
                        <Button type="submit" className="w-full gradient-primary" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin mr-2" /> : 'Gerar PIX para Pagamento'}
                        </Button>
                    </form>
                ) : (
                    <div className="space-y-6 flex flex-col items-center">
                        <div className="p-4 bg-white rounded-lg">
                            <div className="bg-white p-2 rounded">
                                <QRCode value={pixCode} size={128} />
                            </div>
                        </div>

                        <div className="w-full space-y-2">
                            <p className="text-xs text-center text-gray-400">Copie e cole o código abaixo no seu banco:</p>
                            <div className="flex items-center space-x-2">
                                <Input
                                    readOnly
                                    value={pixCode}
                                    className="bg-black/20 border-white/10 font-mono text-xs"
                                />
                                <Button size="icon" variant="outline" onClick={copyToClipboard}>
                                    {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                        </div>

                        <p className="text-sm text-center text-yellow-500 bg-yellow-500/10 p-2 rounded">
                            Após o pagamento, seu plano será ativado automaticamente em até 1 minuto.
                        </p>

                        <Button variant="ghost" onClick={handleClose} className="w-full">
                            Fechar
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
