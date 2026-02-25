import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Scissors, CalendarCheck, DollarSign, Activity, Ticket, MessageSquare } from 'lucide-react';
import api from '../lib/api';

export default function Overview() {
    const { data: stats, isLoading, error } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const { data } = await api.get('/admin/stats');
            return data;
        },
    });

    // Dummy chart data for visualization
    const data = [
        { name: 'Mon', bookings: 4 },
        { name: 'Tue', bookings: 3 },
        { name: 'Wed', bookings: 7 },
        { name: 'Thu', bookings: 5 },
        { name: 'Fri', bookings: 9 },
        { name: 'Sat', bookings: 12 },
        { name: 'Sun', bookings: 8 },
    ];

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Activity className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="flex h-full items-center justify-center text-red-400">
                Failed to load dashboard data.
            </div>
        );
    }

    const statCards = [
        { title: 'Total Users', value: stats.totalUsers, icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { title: 'Registered Salons', value: stats.totalSalons, icon: Scissors, color: 'text-pink-500', bg: 'bg-pink-500/10' },
        { title: 'Total Bookings', value: stats.totalBookings, icon: CalendarCheck, color: 'text-primary', bg: 'bg-primary/10' },
        { title: 'Gross Revenue', value: `$${stats.totalRevenue.toFixed(2)}`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { title: 'Active Coupons', value: stats.totalCoupons, icon: Ticket, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        { title: 'Salon Services', value: stats.totalServices, icon: Scissors, color: 'text-indigo-500', bg: 'bg-indigo-500/10' },
        { title: 'User Messages', value: stats.totalMessages, icon: MessageSquare, color: 'text-orange-500', bg: 'bg-orange-500/10' },
        { title: 'Pending Bookings', value: stats.pendingBookings, icon: Activity, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        { title: 'Completed Bookings', value: stats.completedBookings, icon: CalendarCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 tracking-tight text-white">Dashboard Overview</h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
                {statCards.map((card, idx) => {
                    const Icon = card.icon;
                    return (
                        <div key={idx} className="bg-bg-card border border-border rounded-2xl p-6 shadow-xl transition-all hover:border-zinc-700">
                            <div className="flex items-center gap-4">
                                <div className={`p-4 rounded-xl ${card.bg}`}>
                                    <Icon className={card.color} size={24} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-zinc-400 text-sm font-medium truncate">{card.title}</p>
                                    <p className="text-2xl font-bold text-white mt-1 tracking-tight">{card.value}</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="bg-bg-card border border-border rounded-2xl p-4 sm:p-6 shadow-xl w-full h-[280px] sm:h-[350px] lg:h-[400px]">
                <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6 tracking-tight">Weekly Bookings Activity</h2>
                <ResponsiveContainer width="100%" height="80%">
                    <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                        <defs>
                            <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#F4A460" stopOpacity={0.8} />
                                <stop offset="95%" stopColor="#F4A460" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#35383F" vertical={false} />
                        <XAxis dataKey="name" stroke="#B0B0B0" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis stroke="#B0B0B0" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip
                            contentStyle={{ backgroundColor: '#1F222A', borderColor: '#35383F', borderRadius: '12px', color: '#fff' }}
                            itemStyle={{ color: '#F4A460' }}
                        />
                        <Area type="monotone" dataKey="bookings" stroke="#F4A460" strokeWidth={3} fillOpacity={1} fill="url(#colorBookings)" />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
