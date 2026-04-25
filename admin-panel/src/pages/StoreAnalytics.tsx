import { useQuery } from '@tanstack/react-query';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { TrendingUp, Building2, Star } from 'lucide-react';
import api from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';

export default function StoreAnalytics() {
    const { t } = useLanguage();
    const { data: analytics, isLoading } = useQuery({
        queryKey: ['store-analytics'],
        queryFn: async () => { const { data } = await api.get('/admin/store-analytics'); return data; },
    });

    const { data: tenants = [] } = useQuery({
        queryKey: ['tenants-analytics'],
        queryFn: async () => { const { data } = await api.get('/admin/salons'); return data; },
    });

    const topSalons = analytics?.topSalons || [];
    const revenueByMonth = analytics?.revenueByMonth || [];
    const bookingsByMonth = analytics?.bookingsByMonth || [];

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-white">{t('store_analytics')}</h1>
                <p className="text-gray-400 text-sm mt-1">{t('store_analytics_desc')}</p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: t('total_salons'), value: analytics?.totalSalons ?? tenants.length, icon: Building2, color: '#6C63FF' },
                    { label: t('total_bookings'), value: analytics?.totalBookings ?? 0, icon: TrendingUp, color: '#F4A460' },
                    { label: t('monthly_revenue'), value: `$${(analytics?.totalRevenue ?? 0).toFixed(0)}`, icon: TrendingUp, color: '#10B981' },
                    { label: t('avg_rating'), value: `${(analytics?.avgRating ?? 4.5).toFixed(1)}★`, icon: Star, color: '#F59E0B' },
                ].map((c, i) => (
                    <div key={i} className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-5">
                        <div className="w-10 h-10 rounded-xl mb-3 flex items-center justify-center" style={{ background: `${c.color}22` }}>
                            <c.icon size={20} color={c.color} />
                        </div>
                        <div className="text-2xl font-bold text-white">{isLoading ? '...' : c.value}</div>
                        <div className="text-gray-400 text-xs mt-1">{c.label}</div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenue by Month */}
                <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-6">
                    <h3 className="text-white font-bold mb-4">{t('monthly_revenue')}</h3>
                    {revenueByMonth.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <LineChart data={revenueByMonth}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#35383F" />
                                <XAxis dataKey="month" stroke="#666" tick={{ fontSize: 11 }} />
                                <YAxis stroke="#666" tick={{ fontSize: 11 }} />
                                <Tooltip contentStyle={{ background: '#1F222A', border: '1px solid #35383F', borderRadius: 8 }} />
                                <Line type="monotone" dataKey="revenue" stroke="#F4A460" strokeWidth={2} dot={{ fill: '#F4A460', r: 4 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center text-gray-500 py-16">{t('no_revenue_data')}</div>
                    )}
                </div>

                {/* Bookings by Month */}
                <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-6">
                    <h3 className="text-white font-bold mb-4">{t('monthly_bookings')}</h3>
                    {bookingsByMonth.length > 0 ? (
                        <ResponsiveContainer width="100%" height={220}>
                            <BarChart data={bookingsByMonth}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#35383F" />
                                <XAxis dataKey="month" stroke="#666" tick={{ fontSize: 11 }} />
                                <YAxis stroke="#666" tick={{ fontSize: 11 }} />
                                <Tooltip contentStyle={{ background: '#1F222A', border: '1px solid #35383F', borderRadius: 8 }} />
                                <Bar dataKey="bookings" fill="#6C63FF" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="text-center text-gray-500 py-16">{t('no_bookings_data')}</div>
                    )}
                </div>
            </div>

            {/* Top Salons Table */}
            <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-6">
                <h3 className="text-white font-bold mb-4">{t('top_salons')}</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-gray-400 text-xs border-b border-[#35383F]">
                                <th className="text-left pb-3">{t('rank')}</th>
                                <th className="text-left pb-3">{t('salon')}</th>
                                <th className="text-left pb-3">{t('bookings_label')}</th>
                                <th className="text-left pb-3">{t('revenue')}</th>
                                <th className="text-left pb-3">{t('avg_rating')}</th>
                                <th className="text-left pb-3">{t('status')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {topSalons.length > 0 ? topSalons.map((s: any, i: number) => (
                                <tr key={s.id} className="border-b border-[#35383F]/50 hover:bg-[#35383F]/20">
                                    <td className="py-3 text-gray-500">{i + 1}</td>
                                    <td className="py-3">
                                        <div className="flex items-center gap-2">
                                            <img src={s.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                                            <span className="text-white font-medium">{s.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 text-white">{s.bookingCount ?? 0}</td>
                                    <td className="py-3 text-white">${(s.revenue ?? 0).toFixed(0)}</td>
                                    <td className="py-3 text-yellow-400">{'★'.repeat(Math.round(s.rating ?? 0))}{' '}{(s.rating ?? 0).toFixed(1)}</td>
                                    <td className="py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                            {s.status}
                                        </span>
                                    </td>
                                </tr>
                            )) : (
                                tenants.slice(0, 8).map((s: any, i: number) => (
                                    <tr key={s.id} className="border-b border-[#35383F]/50">
                                        <td className="py-3 text-gray-500">{i + 1}</td>
                                        <td className="py-3">
                                            <div className="flex items-center gap-2">
                                                <img src={s.image} alt="" className="w-8 h-8 rounded-lg object-cover" />
                                                <span className="text-white font-medium">{s.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-3 text-white">—</td>
                                        <td className="py-3 text-white">—</td>
                                        <td className="py-3 text-yellow-400">{(s.rating ?? 0).toFixed(1)}★</td>
                                        <td className="py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.status === 'active' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                                {s.status ?? 'active'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
