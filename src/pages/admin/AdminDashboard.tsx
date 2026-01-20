
import {
    Users,
    DollarSign,
    Calendar,
    TrendingDown,
    TrendingUp,
    ArrowDownRight,
    MoreHorizontal,
    Loader2
} from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

// Mock Data for Charts (Historical data not yet implemented in backend)
const revenueData = [
    { name: "Jul", value: 8500 },
    { name: "Aug", value: 9200 },
    { name: "Sep", value: 10500 },
    { name: "Oct", value: 11200 },
    { name: "Nov", value: 11800 },
    { name: "Dec", value: 12450 },
];

const planDataMock = [
    { name: "Free", value: 60, color: "#4b5563" },
    { name: "Pro", value: 30, color: "#8b5cf6" },
    { name: "Business", value: 10, color: "#06b6d4" },
];

import { apiFetch } from "@/services/apiClient";

export default function AdminDashboard() {
    const { session } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        mrr: 0,
        activeSubscribers: 0,
        totalUsers: 0,
        churnRate: 0
    });
    const [recentUsers, setRecentUsers] = useState<any[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch Stats
                const statsData = await apiFetch('/api/admin/stats');

                // Check if we gained a new subscriber since last fetch (only if not initial load)
                setStats(prev => {
                    if (statsData) {
                        if (prev.activeSubscribers > 0 && statsData.activeSubscribers > prev.activeSubscribers) {
                            toast.success(`🎉 Nova Venda! Total: ${statsData.activeSubscribers}`, {
                                duration: 5000,
                                position: 'top-right',
                                style: { background: '#10B981', color: '#fff', border: 'none' }
                            });
                            // Play notification sound
                            const audio = new Audio('/notification.mp3');
                            audio.play().catch(e => console.log('Audio play failed', e)); // Silent fail if no interaction
                        }
                        return statsData;
                    }
                    return prev;
                });

                // Fetch Users for Recent Activity
                const usersData = await apiFetch('/api/admin/users');
                if (usersData?.users) {
                    setRecentUsers(usersData.users.slice(0, 5));
                }

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
                // Don't show toast error on poll failure to avoid spam
            } finally {
                setLoading(false);
            }
        };

        fetchData(); // Initial User Load

        // Poll every 30 seconds
        const interval = setInterval(fetchData, 30000);
        return () => clearInterval(interval);
    }, [session]);

    if (loading) {
        return <div className="flex h-96 items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
    }

    const mrr = stats?.mrr || 0;
    const arr = mrr * 12;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        Dashboard
                    </h1>
                    <p className="text-gray-400">Visão geral da performance do SaaS</p>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-400 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Sistema Operacional
                </div>
            </div>

            {/* Financial Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* MRR Card */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:translate-y-[-2px] transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                            <DollarSign size={20} />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                            <TrendingUp size={12} /> +{stats.activeSubscribers > 0 ? '100' : '0'}%
                        </span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-gray-400">Receita Mensal (MRR)</p>
                        <h3 className="text-2xl font-bold text-white">R$ {(stats?.mrr || 0).toLocaleString('pt-BR')}</h3>
                    </div>
                    <div className="h-10 mt-4 -mx-2">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorMrr" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={2} fill="url(#colorMrr)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* ARR Card */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:translate-y-[-2px] transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 group-hover:bg-cyan-500 group-hover:text-white transition-colors">
                            <Calendar size={20} />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-gray-400">Receita Anual (ARR)</p>
                        <h3 className="text-2xl font-bold text-white">R$ {arr.toLocaleString('pt-BR')}</h3>
                        <p className="text-xs text-gray-500">Projeção baseada no MRR atual</p>
                    </div>
                </div>

                {/* Active Subscribers */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:translate-y-[-2px] transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                            <Users size={20} />
                        </div>
                    </div>
                    <div className="flex justify-between items-end">
                        <div className="space-y-1">
                            <p className="text-sm text-gray-400">Assinantes Ativos</p>
                            <h3 className="text-2xl font-bold text-white">{stats?.activeSubscribers || 0}</h3>
                        </div>
                        <div className="h-12 w-12">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={planDataMock} innerRadius={15} outerRadius={24} paddingAngle={2} dataKey="value">
                                        {planDataMock.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Churn Rate */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:translate-y-[-2px] transition-all duration-300 group">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 rounded-lg bg-red-500/20 text-red-400 group-hover:bg-red-500 group-hover:text-white transition-colors">
                            <TrendingDown size={20} />
                        </div>
                        <span className="flex items-center gap-1 text-xs font-medium text-green-400 bg-green-500/10 px-2 py-1 rounded-full">
                            <ArrowDownRight size={12} /> -0%
                        </span>
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm text-gray-400">Taxa de Cancelamento</p>
                        <h3 className="text-2xl font-bold text-white">{stats?.churnRate || 0}%</h3>
                        <p className="text-xs text-gray-500">0 cancelamentos este mês</p>
                    </div>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                    <h3 className="text-lg font-bold text-white mb-6">Tendência de Receita</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" stroke="#6b7280" tickLine={false} axisLine={false} />
                                <YAxis stroke="#6b7280" tickLine={false} axisLine={false} tickFormatter={(value) => `R$${value}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1625', borderColor: 'rgba(255,255,255,0.1)', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Area type="monotone" dataKey="value" stroke="#8b5cf6" strokeWidth={3} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Plan Distribution */}
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm flex flex-col">
                    <h3 className="text-lg font-bold text-white mb-6">Distribuição de Planos</h3>
                    <div className="flex-1 flex items-center justify-center relative">
                        <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                                <Pie
                                    data={planDataMock}
                                    innerRadius={80}
                                    outerRadius={110}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {planDataMock.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1a1625', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                            <span className="text-3xl font-bold text-white">{stats.totalUsers}</span>
                            <span className="text-xs text-gray-500 uppercase tracking-wider">Total Usuários</span>
                        </div>
                    </div>
                    <div className="flex justify-center gap-6 mt-6">
                        {planDataMock.map((item) => (
                            <div key={item.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="text-sm text-gray-400">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-white">Atividade Recente (Novos Usuários)</h3>
                    <button className="text-sm text-purple-400 hover:text-purple-300 transition-colors">Ver Todos</button>
                </div>
                <div className="space-y-4">
                    {recentUsers.map((user, i) => (
                        <div key={user.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-colors group">
                            <img src={user.avatar_url || "https://github.com/shadcn.png"} alt={user.full_name} className="w-10 h-10 rounded-full border border-white/10" />
                            <div className="flex-1">
                                <p className="text-sm text-white">
                                    <span className="font-semibold hover:text-purple-400 cursor-pointer transition-colors">{user.full_name || user.email}</span>
                                </p>
                                <p className="text-xs text-gray-400">{user.email}</p>
                                <p className="text-xs text-gray-500">{new Date(user.created_at).toLocaleDateString()}</p>
                            </div>
                            <button className="opacity-0 group-hover:opacity-100 p-2 text-gray-500 hover:text-white transition-all">
                                <MoreHorizontal size={18} />
                            </button>
                        </div>
                    ))}
                    {recentUsers.length === 0 && (
                        <p className="text-gray-500 text-sm">Nenhum usuário recente encontrado.</p>
                    )}
                </div>
            </div>
        </div>
    );
}
