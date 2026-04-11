import { useQuery } from '@tanstack/react-query';
import { CalendarCheck, DollarSign, Users, Scissors, Activity, TrendingUp } from 'lucide-react';
import api from '../../lib/api';

export default function SalonDashboard() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['salon-stats'],
        queryFn: async () => { const { data } = await api.get('/salon/stats'); return data; },
    });

    if (isLoading) return <div className="flex h-full items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#F4A460]" /></div>;

    const cards = [
        { label: "Today's Bookings", value: stats?.todayBookings ?? 0, icon: CalendarCheck, color: 'text-[#F4A460]', bg: 'bg-[#F4A460]/10' },
        { label: 'Total Revenue', value: `$${(stats?.totalRevenue ?? 0).toFixed(2)}`, icon: DollarSign, color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
        { label: 'Total Staff', value: stats?.totalStaff ?? 0, icon: Users, color: 'text-blue-400', bg: 'bg-blue-400/10' },
        { label: 'Active Services', value: stats?.totalServices ?? 0, icon: Scissors, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        { label: 'Pending Bookings', value: stats?.pendingBookings ?? 0, icon: Activity, color: 'text-rose-400', bg: 'bg-rose-400/10' },
        { label: 'Completed Bookings', value: stats?.completedBookings ?? 0, icon: TrendingUp, color: 'text-cyan-400', bg: 'bg-cyan-400/10' },
    ];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold text-white mb-2">Salon Dashboard</h1>
            <p className="text-zinc-400 text-sm mb-8">Welcome back! Here's your salon overview.</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {cards.map((card, i) => {
                    const Icon = card.icon;
                    return (
                        <div key={i} className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-5 hover:border-zinc-600 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${card.bg}`}><Icon size={22} className={card.color} /></div>
                                <div>
                                    <p className="text-zinc-400 text-sm">{card.label}</p>
                                    <p className="text-2xl font-bold text-white mt-0.5">{card.value}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-6">
                <h2 className="font-bold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                        { label: 'View Appointments', path: '/salon/appointments', color: 'bg-[#F4A460]/15 text-[#F4A460] hover:bg-[#F4A460]/25' },
                        { label: 'Manage Staff', path: '/salon/staff', color: 'bg-blue-500/15 text-blue-400 hover:bg-blue-500/25' },
                        { label: 'Add Service', path: '/salon/services', color: 'bg-purple-500/15 text-purple-400 hover:bg-purple-500/25' },
                        { label: 'View Payments', path: '/salon/payments', color: 'bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25' },
                    ].map((a, i) => (
                        <a key={i} href={a.path} className={`${a.color} rounded-xl p-4 text-sm font-medium transition-colors text-center`}>{a.label}</a>
                    ))}
                </div>
            </div>
        </div>
    );
}
