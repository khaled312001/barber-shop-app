import { useQuery } from '@tanstack/react-query';
import { UserCircle } from 'lucide-react';
import api from '../../lib/api';
import { useLanguage } from '../../contexts/LanguageContext';

export default function Customers() {
    const { t } = useLanguage();
    const { data: customers = [], isLoading } = useQuery({
        queryKey: ['salon-customers'],
        queryFn: async () => { const { data } = await api.get('/salon/customers'); return Array.isArray(data) ? data : []; },
    });

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
                <UserCircle className="text-[#F4A460]" size={24} />
                <div><h1 className="text-2xl font-bold text-white">{t('salon_customers')}</h1><p className="text-zinc-400 text-sm">{t('clients_booked')}</p></div>
            </div>

            <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[#35383F] text-zinc-400">
                            <th className="text-left px-6 py-4 font-medium">{t('name')}</th>
                            <th className="text-left px-6 py-4 font-medium">{t('email')}</th>
                            <th className="text-left px-6 py-4 font-medium">{t('phone')}</th>
                            <th className="text-left px-6 py-4 font-medium">{t('bookings_label')}</th>
                            <th className="text-left px-6 py-4 font-medium">{t('last_visit')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={5} className="py-12 text-center"><div className="animate-spin rounded-full h-6 w-6 border-t-2 border-[#F4A460] mx-auto" /></td></tr>
                        ) : customers.map((c: any) => (
                            <tr key={c.id} className="border-b border-[#35383F]/50 hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-[#F4A460]/15 flex items-center justify-center text-[#F4A460] text-sm font-bold">{(c.fullName || c.email || '?')[0]}</div>
                                        <span className="font-medium text-white">{c.fullName || c.email || 'Unknown'}</span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-zinc-400">{c.email || '—'}</td>
                                <td className="px-6 py-4 text-zinc-400">{c.phone || '—'}</td>
                                <td className="px-6 py-4 text-white">{c.bookingCount ?? 0}</td>
                                <td className="px-6 py-4 text-zinc-400 text-sm">{c.lastVisit || '—'}</td>
                            </tr>
                        ))}
                        {!isLoading && customers.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-zinc-500">{t('no_customers_salon')}</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
