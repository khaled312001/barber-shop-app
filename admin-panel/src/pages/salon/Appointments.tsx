import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CalendarCheck } from 'lucide-react';
import api from '../../lib/api';
import { useLanguage } from '../../contexts/LanguageContext';

const STATUS_STYLES: Record<string, string> = {
    pending: 'bg-[#F4A460]/15 text-[#F4A460]',
    confirmed: 'bg-blue-500/15 text-blue-400',
    completed: 'bg-emerald-500/15 text-emerald-400',
    cancelled: 'bg-red-500/15 text-red-400',
};

export default function SalonAppointments() {
    const { t } = useLanguage();
    const qc = useQueryClient();
    const { data: bookings = [], isLoading } = useQuery({
        queryKey: ['salon-bookings'],
        queryFn: async () => { const { data } = await api.get('/salon/bookings'); return Array.isArray(data) ? data : []; },
    });

    const update = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => api.put(`/salon/bookings/${id}`, { status }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['salon-bookings'] }),
    });

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
                <CalendarCheck className="text-[#F4A460]" size={24} />
                <div><h1 className="text-2xl font-bold text-white">{t('salon_appointments')}</h1><p className="text-zinc-400 text-sm">{t('manage_bookings')}</p></div>
            </div>

            <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[#35383F] text-zinc-400">
                            <th className="text-left px-6 py-4 font-medium">{t('total_clients')}</th>
                            <th className="text-left px-6 py-4 font-medium">{t('date')}</th>
                            <th className="text-left px-6 py-4 font-medium">{t('start')}</th>
                            <th className="text-left px-6 py-4 font-medium">{t('amount')}</th>
                            <th className="text-left px-6 py-4 font-medium">{t('status')}</th>
                            <th className="text-left px-6 py-4 font-medium">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={6} className="py-12 text-center"><div className="animate-spin rounded-full h-6 w-6 border-t-2 border-[#F4A460] mx-auto" /></td></tr>
                        ) : bookings.map((b: any) => (
                            <tr key={b.id} className="border-b border-[#35383F]/50 hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 text-white font-medium">{b.userName || 'Guest'}</td>
                                <td className="px-6 py-4 text-zinc-400">{b.date}</td>
                                <td className="px-6 py-4 text-zinc-400">{b.time}</td>
                                <td className="px-6 py-4 font-semibold text-[#F4A460]">${b.totalPrice.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[b.status] || 'bg-zinc-700 text-zinc-400'}`}>{b.status}</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-1.5 flex-wrap">
                                        {b.status === 'pending' && (
                                            <button onClick={() => update.mutate({ id: b.id, status: 'confirmed' })} className="px-3 py-1 text-xs rounded-lg bg-blue-500/15 text-blue-400 hover:bg-blue-500/25">{t('status_confirmed')}</button>
                                        )}
                                        {(b.status === 'pending' || b.status === 'confirmed') && (
                                            <button onClick={() => update.mutate({ id: b.id, status: 'completed' })} className="px-3 py-1 text-xs rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25">{t('status_completed')}</button>
                                        )}
                                        {b.status !== 'cancelled' && b.status !== 'completed' && (
                                            <button onClick={() => update.mutate({ id: b.id, status: 'cancelled' })} className="px-3 py-1 text-xs rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25">{t('status_cancelled')}</button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {!isLoading && bookings.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-zinc-500">{t('no_appointments')}</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
