import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function Register() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                    },
                },
            });

            if (error) throw error;

            if (data.user) {
                toast.success('Conta criada! Verifique seu email para confirmar.');
                // Optionally redirect to login or show verify instructions
                navigate('/login');
            }
        } catch (error: any) {
            toast.error(error.message || 'Erro ao criar conta');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] text-white p-4">
            <div className="w-full max-w-md space-y-8 bg-white/5 p-8 rounded-2xl border border-white/10 backdrop-blur-sm">
                <div className="text-center">
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-blue-600">
                        VariaGen
                    </h1>
                    <h2 className="mt-6 text-2xl font-bold">Crie sua conta</h2>
                    <p className="mt-2 text-gray-400">Comece a gerar vídeos e imagens com IA</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleRegister}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-gray-300">
                                Nome Completo
                            </label>
                            <Input
                                id="fullName"
                                type="text"
                                required
                                className="mt-1 bg-black/40 border-white/10 text-white"
                                placeholder="Seu Nome"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                Email
                            </label>
                            <Input
                                id="email"
                                type="email"
                                required
                                className="mt-1 bg-black/40 border-white/10 text-white"
                                placeholder="seu@email.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-300">
                                Senha
                            </label>
                            <Input
                                id="password"
                                type="password"
                                required
                                className="mt-1 bg-black/40 border-white/10 text-white"
                                placeholder="Sua senha segura"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                minLength={6}
                            />
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Criar Conta'}
                    </Button>
                </form>

                <p className="mt-4 text-center text-sm text-gray-400">
                    Já tem uma conta?{' '}
                    <Link to="/login" className="font-medium text-cyan-400 hover:text-cyan-300">
                        Faça login
                    </Link>
                </p>
            </div>
        </div>
    );
}
