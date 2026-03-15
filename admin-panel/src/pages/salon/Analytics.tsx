import { useQuery } from '@tanstack/react-query';
import { BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import api from '../../lib/api';

export default function SalonAnalytics() {
    const { data: bookings = [] } = useQuery({
        queryKey: ['salon-bookings'],
        queryFn: async () => { const { data } = await api.get('/salon/bookings'); return data; },
    });

    const byMonth: Record<string, { bookings: number; revenue: number }> = {};
    bookings.forEach((b: any) => {
        const month = b.date?.slice(0, 7) || 'unknown';
        if (!byMonth[month]) byMonth[month] = { bookings: 0, revenue: 0 };
        byMonth[month].bookings++;
        if (b.status === 'completed') byMonth[month].revenue += b.totalPrice;
    });

    const chartData = Object.entries(byMonth).sort().map(([month, data]) => ({ month, ...data }));

    const byStatus = { completed: 0, pending: 0, cancelled: 0 };
    bookings.forEach((b: any) => { if (b.status in byStatus) (byStatus as any)[b.status]++; });

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
                <BarChart3 className="text-[#F4A460]" size={24} />
                <div><h1 className="text-2xl font-bold text-white">Analytics</h1><p className="text-zinc-400 text-sm">Salon performance overview</p></div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                    { label: 'Completed', value: byStatus.completed, color: 'text-emerald-400' },
                    { label: 'Pending', value: byStatus.pending, color: 'text-yellow-400' },
                    { label: 'Cancelled', value: byStatus.cancelled, color: 'text-red-400' },
                ].map((s, i) => (
                    <div key={i} className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-5">
                        <p className="text-zinc-400 text-sm mb-1">{s.label}</p>
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-6">
                    <h2 className="font-bold text-white mb-4">Bookings by Month</h2>
                    <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#35383F" vertical={false} />
                                <XAxis dataKey="month" stroke="#B0B0B0" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#B0B0B0" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#1F222A', borderColor: '#35383F', borderRadius: '12px', color: '#fff' }} />
                                <Bar dataKey="bookings" fill="#F4A460" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-6">
                    <h2 className="font-bold text-white mb-4">Revenue Trend</h2>
                    <div className="h-[220px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#35383F" vertical={false} />
                                <XAxis dataKey="month" stroke="#B0B0B0" fontSize={11} tickLine={false} axisLine={false} />
                                <YAxis stroke="#B0B0B0" fontSize={11} tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ backgroundColor: '#1F222A', borderColor: '#35383F', borderRadius: '12px', color: '#fff' }} />
                                <Line type="monotone" dataKey="revenue" stroke="#F4A460" strokeWidth={2} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
}
