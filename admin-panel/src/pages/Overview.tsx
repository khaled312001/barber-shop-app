import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Scissors, CalendarCheck, DollarSign, Activity, MessageSquare, CreditCard, TrendingUp } from 'lucide-react';
import api from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';

export default function Overview() {
    const { t } = useLanguage();
    const { data: stats, isLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => { const { data } = await api.get('/admin/stats'); return data; },
    });

    const { data: weekData = [] } = useQuery({
        queryKey: ['admin-weekly-activity'],
        queryFn: async () => { const { data } = await api.get('/admin/weekly-activity'); return data; },
    });

    if (isLoading) return <div className="flex h-full items-center justify-center"><Activity className="animate-spin text-[#F4A460]" size={32} /></div>;

    const statCards = [
        { title: t('registered_salons'), value: stats?.totalSalons ?? 0, icon: Scissors, color: 'text-pink-500', bg: 'bg-pink-500/10' },
        { title: t('total_users'), value: stats?.totalUsers ?? 0, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: t('total_bookings'), value: stats?.totalBookings ?? 0, icon: CalendarCheck, color: 'text-[#F4A460]', bg: 'bg-[#F4A460]/10' },
        { title: t('gross_revenue'), value: `$${(stats?.totalRevenue ?? 0).toFixed(2)}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { title: t('active_subscriptions'), value: stats?.activeSubscriptions ?? 0, icon: CreditCard, color: 'text-purple-500', bg: 'bg-purple-500/10' },
        { title: t('total_commissions'), value: `$${(stats?.totalCommissions ?? 0).toFixed(2)}`, icon: TrendingUp, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        { title: t('pending_bookings'), value: stats?.pendingBookings ?? 0, icon: Activity, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        { title: t('completed_bookings'), value: stats?.completedBookings ?? 0, icon: CalendarCheck, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { title: t('messages'), value: stats?.totalMessages ?? 0, icon: MessageSquare, color: 'text-orange-500', bg: 'bg-orange-500/10' },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2 text-white">{t('admin_overview')}</h1>
            <p className="text-zinc-400 mb-8">{t('welcome_platform_overview')}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {statCards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div key={idx} className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-5 hover:border-zinc-600 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${card.bg}`}><Icon className={card.color} size={22} /></div>
                                <div>
                                    <p className="text-zinc-400 text-sm">{card.title}</p>
                                    <p className="text-2xl font-bold text-white mt-0.5">{card.value}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-6">
                <h2 className="text-lg font-bold mb-6 text-white">{t('weekly_activity')}</h2>
                <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%" minWidth={100} minHeight={100}>
                        <AreaChart data={weekData}>
                            <defs>
                                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#F4A460" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#F4A460" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#35383F" vertical={false} />
                            <XAxis dataKey="name" stroke="#B0B0B0" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#B0B0B0" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip contentStyle={{ backgroundColor: '#1F222A', borderColor: '#35383F', borderRadius: '12px', color: '#fff' }} itemStyle={{ color: '#F4A460' }} />
                            <Area type="monotone" dataKey="bookings" stroke="#F4A460" strokeWidth={2} fillOpacity={1} fill="url(#colorBookings)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
