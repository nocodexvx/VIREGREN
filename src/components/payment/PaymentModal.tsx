import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Copy, Check, Loader2 } from "lucide-react";
import QRCode from "react-qr-code";
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { apiFetch } from '@/services/apiClient';
import { supabase } from '@/lib/supabase';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    plan: string;
    price: string;
}

export function PaymentModal({ isOpen, onClose, plan, price }: PaymentModalProps) {
    const { user, checkSubscription } = useAuth();
    const [step, setStep] = useState<'details' | 'pix'>('details');
    const [loading, setLoading] = useState(false);

    // Form states
    const [cpf, setCpf] = useState('');
    const [cpfError, setCpfError] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const [pixCode, setPixCode] = useState('');
    const [copied, setCopied] = useState(false);

    // CPF Validator
    const validateCPF = (cpf: string) => {
        cpf = cpf.replace(/[^\d]+/g, '');
        if (cpf.length !== 11 || !!cpf.match(/(\d)\1{10}/)) return false;

        let sum = 0;
        let remainder;
        for (let i = 1; i <= 9; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (11 - i);
        remainder = (sum * 10) % 11;
        if ((remainder === 10) || (remainder === 11)) remainder = 0;
        if (remainder !== parseInt(cpf.substring(9, 10))) return false;

        sum = 0;
        for (let i = 1; i <= 10; i++) sum = sum + parseInt(cpf.substring(i - 1, i)) * (12 - i);
        remainder = (sum * 10) % 11;
        if ((remainder === 10) || (remainder === 11)) remainder = 0;
        if (remainder !== parseInt(cpf.substring(10, 11))) return false;

        return true;
    };

    const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCpf(val);
        if (val.replace(/\D/g, '').length === 11) {
            if (!validateCPF(val)) setCpfError('CPF inválido');
            else setCpfError('');
        } else {
            setCpfError('');
        }
    };

    const handlePayment = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateCPF(cpf)) {
            toast.error('CPF inválido. Verifique os números.');
            return;
        }

        setLoading(true);

        try {
            let userId = user?.id;
            let userEmail = user?.email || email;
            let userName = user?.user_metadata?.full_name || name;

            // 1. If not logged in, create account first
            if (!user) {
                const { data: authData, error: authError } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: name } }
                });

                if (authError) {
                    // Fallback: If user exists, try to login
                    if (authError.status === 400 || authError.status === 422) {
                        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                            email,
                            password
                        });

                        if (loginError) {
                            // If password mismatch, throw original error
                            throw new Error('Este email já existe. Tente fazer login ou use outro email.');
                        }

                        if (loginData.user) {
                            userId = loginData.user.id;
                            // Update name if needed
                        }
                    } else {
                        throw authError;
                    }
                } else if (authData.user) {
                    userId = authData.user.id;
                }
            }

            if (!userId) throw new Error('Falha ao identificar usuário.');

            // 2. Create Subscription & PIX
            // We set requireAuth: false because if email confirmation is enabled, 
            // the user might not have a session yet, but we still want to let them pay.
            const data = await apiFetch('/api/payments/subscribe', {
                method: 'POST',
                requireAuth: false,
                body: JSON.stringify({
                    userId,
                    plan,
                    customer: {
                        name: userName,
                        email: userEmail,
                        cpf: cpf.replace(/\D/g, ''),
                        phone: '11999999999'
                    }
                })
            });

            setPixCode(data.pix_code);
            setStep('pix');
            toast.success('PIX gerado com sucesso!');

            // Start polling (will pick up the session change too)
            checkSubscription();

        } catch (error: any) {
            toast.error(error.message || 'Erro ao processar.');
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
            <DialogContent className="sm:max-w-md bg-popover border-border text-popover-foreground">
                <DialogHeader>
                    <DialogTitle>Assinar Plano {plan === 'pro_monthly' ? 'Pro' : 'Business'}</DialogTitle>
                    <DialogDescription className="text-gray-400">
                        Valor: R$ {price} / mês
                    </DialogDescription>
                </DialogHeader>

                {step === 'details' ? (
                    <form onSubmit={handlePayment} className="space-y-4">
                        {!user && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Nome Completo</label>
                                    <Input
                                        placeholder="Seu Nome"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="bg-secondary border-border"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Email</label>
                                    <Input
                                        type="email"
                                        placeholder="seu@email.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="bg-secondary border-border"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Senha</label>
                                    <Input
                                        type="password"
                                        placeholder="Crie uma senha"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="bg-secondary border-border"
                                        required
                                        minLength={6}
                                    />
                                </div>
                            </>
                        )}

                        <div className="space-y-2">
                            <label className="text-sm font-medium">CPF (para Nota Fiscal)</label>
                            <Input
                                placeholder="000.000.000-00"
                                value={cpf}
                                onChange={handleCpfChange}
                                className={`bg-secondary border-border ${cpfError ? 'border-red-500' : ''}`}
                                required
                                maxLength={14}
                            />
                            {cpfError && <span className="text-xs text-red-500">{cpfError}</span>}
                        </div>

                        <Button type="submit" className="w-full gradient-primary" disabled={loading}>
                            {loading ? <Loader2 className="animate-spin mr-2" /> : (user ? 'Gerar PIX' : 'Criar Conta e Gerar PIX')}
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
                                    className="bg-secondary border-border font-mono text-xs"
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
