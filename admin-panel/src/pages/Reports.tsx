import { useQuery } from '@tanstack/react-query';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Activity, TrendingUp, Users, Calendar, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import api from '../lib/api';

export default function Reports() {
    const { isLoading } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const { data } = await api.get('/admin/stats');
            return data;
        },
    });

    // Mock data for advanced reports
    const revenueData = [
        { name: 'Jan', revenue: 4000, bookings: 120 },
        { name: 'Feb', revenue: 3000, bookings: 98 },
        { name: 'Mar', revenue: 5000, bookings: 145 },
        { name: 'Apr', revenue: 4500, bookings: 132 },
        { name: 'May', revenue: 6000, bookings: 178 },
        { name: 'Jun', revenue: 5500, bookings: 160 },
    ];

    const topSalons = [
        { name: 'Gentle Cuts', revenue: 8500, color: '#F4A460' },
        { name: 'Elite Barber', revenue: 7200, color: '#F4A460' },
        { name: 'The Grooming Co', revenue: 6800, color: '#F4A460' },
        { name: 'Vintage Edge', revenue: 5400, color: '#F4A460' },
        { name: 'Urban Style', revenue: 4900, color: '#F4A460' },
    ];

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Activity className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Advanced Reports</h1>
                    <p className="text-text-muted mt-1">Deep dive into your business performance and growth.</p>
                </div>
                <div className="flex gap-3">
                    <select className="bg-bg-card border border-border text-white text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-primary">
                        <option>Last 6 Months</option>
                        <option>Year to Date</option>
                        <option>Lifetime</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Avg. Revenue/Day', value: '$245.80', trend: '+12%', up: true, icon: DollarSign },
                    { label: 'Booking Conv. Rate', value: '64.2%', trend: '+5%', up: true, icon: TrendingUp },
                    { label: 'New Customers', value: '84', trend: '-2%', up: false, icon: Users },
                    { label: 'Repeat Customers', value: '42%', trend: '+8%', up: true, icon: Activity },
                ].map((item, idx) => (
                    <div key={idx} className="bg-bg-card border border-border rounded-2xl p-6 shadow-xl relative overflow-hidden group">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 rounded-xl bg-white/5 text-primary">
                                <item.icon size={20} />
                            </div>
                            <div className={`flex items-center gap-1 text-xs font-bold ${item.up ? 'text-emerald-500' : 'text-red-500'}`}>
                                {item.trend} {item.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                            </div>
                        </div>
                        <p className="text-text-muted text-sm font-medium">{item.label}</p>
                        <p className="text-3xl font-bold text-white mt-1 tracking-tight">{item.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
                <div className="lg:col-span-2 bg-bg-card border border-border rounded-2xl p-6 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-6">Revenue & Booking Trends</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#F4A460" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#F4A460" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#35383F" vertical={false} />
                                <XAxis dataKey="name" stroke="#A1A1AA" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#A1A1AA" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#1F222A', border: '1px solid #35383F', borderRadius: '12px' }}
                                    itemStyle={{ color: '#F4A460' }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#F4A460" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-bg-card border border-border rounded-2xl p-6 shadow-xl">
                    <h3 className="text-xl font-bold text-white mb-6">Top Performing Salons</h3>
                    <div className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={topSalons} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" stroke="#A1A1AA" fontSize={12} width={100} tickLine={false} axisLine={false} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ backgroundColor: '#1F222A', border: '1px solid #35383F', borderRadius: '12px' }}
                                />
                                <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={20}>
                                    {topSalons.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="bg-bg-card border border-border rounded-2xl p-8 shadow-xl text-center">
                <div className="max-w-md mx-auto">
                    <Calendar className="mx-auto text-primary mb-4" size={48} />
                    <h3 className="text-2xl font-bold text-white mb-3">Custom Data Exports</h3>
                    <p className="text-text-muted mb-6">Need a custom range or specific metrics? Generate a detailed report and download it in your preferred format.</p>
                    <div className="flex justify-center gap-4">
                        <button className="bg-primary hover:bg-primary-dark text-bg-dark font-bold px-6 py-3 rounded-xl transition-all">Download PDF</button>
                        <button className="bg-white/5 hover:bg-white/10 text-white border border-border px-6 py-3 rounded-xl transition-all">Download Excel</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
