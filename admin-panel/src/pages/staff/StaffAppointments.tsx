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

export default function StaffAppointments() {
    const { t } = useLanguage();
    const qc = useQueryClient();
    const { data: bookings = [], isLoading } = useQuery({
        queryKey: ['staff-bookings'],
        queryFn: async () => { const { data } = await api.get('/staff/bookings'); return Array.isArray(data) ? data : []; },
    });

    const update = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => api.put(`/staff/bookings/${id}`, { status }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['staff-bookings'] }),
    });

    const today = new Date().toISOString().split('T')[0];
    const todayBookings = bookings.filter((b: any) => b.date === today);
    const upcoming = bookings.filter((b: any) => b.date > today);

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
                <CalendarCheck className="text-[#F4A460]" size={24} />
                <div><h1 className="text-2xl font-bold text-white">{t('staff_appointments_title')}</h1><p className="text-zinc-400 text-sm">{t('today_label')}: {todayBookings.length} | {t('upcoming_label_staff')}: {upcoming.length}</p></div>
            </div>

            {todayBookings.length > 0 && (
                <div className="mb-8">
                    <h2 className="font-bold text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#F4A460]" /> {t('todays_appointments')}
                    </h2>
                    <div className="space-y-3">
                        {todayBookings.map((b: any) => (
                            <AppointmentCard key={b.id} booking={b} onUpdate={status => update.mutate({ id: b.id, status })} />
                        ))}
                    </div>
                </div>
            )}

            <div>
                <h2 className="font-bold text-white mb-4">{t('all_appointments_staff')}</h2>
                <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[#35383F] text-zinc-400">
                                <th className="text-left px-6 py-4 font-medium">{t('client')}</th>
                                <th className="text-left px-6 py-4 font-medium">{t('date')}</th>
                                <th className="text-left px-6 py-4 font-medium">{t('time')}</th>
                                <th className="text-left px-6 py-4 font-medium">{t('services')}</th>
                                <th className="text-left px-6 py-4 font-medium">{t('status')}</th>
                                <th className="text-left px-6 py-4 font-medium">{t('actions')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                <tr><td colSpan={6} className="py-12 text-center"><div className="animate-spin rounded-full h-6 w-6 border-t-2 border-[#F4A460] mx-auto" /></td></tr>
                            ) : bookings.map((b: any) => (
                                <tr key={b.id} className="border-b border-[#35383F]/50 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-white">{b.userName || t('guest')}</td>
                                    <td className="px-6 py-4 text-zinc-400">{b.date}</td>
                                    <td className="px-6 py-4 text-zinc-400">{b.time}</td>
                                    <td className="px-6 py-4 text-zinc-400">{b.services?.length || 0} {t('services')}</td>
                                    <td className="px-6 py-4"><span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[b.status] || 'bg-zinc-700 text-zinc-400'}`}>{b.status}</span></td>
                                    <td className="px-6 py-4">
                                        {b.status === 'pending' && <button onClick={() => update.mutate({ id: b.id, status: 'completed' })} className="px-3 py-1 text-xs rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25">{t('status_completed')}</button>}
                                    </td>
                                </tr>
                            ))}
                            {!isLoading && bookings.length === 0 && <tr><td colSpan={6} className="py-12 text-center text-zinc-500">{t('no_appointments_assigned')}</td></tr>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function AppointmentCard({ booking, onUpdate }: { booking: any; onUpdate: (s: string) => void }) {
    const { t } = useLanguage();
    return (
        <div className="bg-[#1F222A] border border-[#F4A460]/30 rounded-xl p-5">
            <div className="flex items-center justify-between">
                <div>
                    <p className="font-semibold text-white">{booking.userName || t('guest')}</p>
                    <p className="text-zinc-400 text-sm">{booking.time} · {booking.services?.length || 0} {t('services')}</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[booking.status] || 'bg-zinc-700 text-zinc-400'}`}>{booking.status}</span>
                    {booking.status === 'pending' && (
                        <button onClick={() => onUpdate('completed')} className="px-3 py-1 text-xs rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25">{t('done')}</button>
                    )}
                </div>
            </div>
        </div>
    );
}
