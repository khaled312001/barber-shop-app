import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Clock, Plus, Trash2, X } from 'lucide-react';
import api from '../../lib/api';
import { useLanguage } from '../../contexts/LanguageContext';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function SalonShifts() {
    const { t } = useLanguage();
    const qc = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ dayOfWeek: '1', startTime: '09:00', endTime: '17:00', staffId: '' });

    const { data: shifts = [], isLoading } = useQuery({
        queryKey: ['salon-shifts'],
        queryFn: async () => { const { data } = await api.get('/salon/shifts'); return Array.isArray(data) ? data : []; },
    });
    const { data: staff = [] } = useQuery({ queryKey: ['salon-staff'], queryFn: async () => { const { data } = await api.get('/salon/staff'); return Array.isArray(data) ? data : []; } });

    const create = useMutation({
        mutationFn: (d: any) => api.post('/salon/shifts', d),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['salon-shifts'] }); setShowForm(false); },
    });

    const remove = useMutation({
        mutationFn: (id: string) => api.delete(`/salon/shifts/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['salon-shifts'] }),
    });

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Clock className="text-[#F4A460]" size={24} />
                    <div><h1 className="text-2xl font-bold text-white">{t('salon_shifts')}</h1><p className="text-zinc-400 text-sm">{t('manage_schedules')}</p></div>
                </div>
                <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#F4A460] hover:bg-[#e8935a] text-[#181A20] font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
                    <Plus size={18} /> {t('add_shift')}
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">{t('add_shift')}</h2>
                            <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1.5">{t('staff_member')}</label>
                                <select value={form.staffId} onChange={e => setForm(p => ({ ...p, staffId: e.target.value }))} className="w-full bg-[#181A20] border border-[#35383F] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#F4A460]">
                                    <option value="">{t('all_staff')}</option>
                                    {staff.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1.5">{t('day')}</label>
                                <select value={form.dayOfWeek} onChange={e => setForm(p => ({ ...p, dayOfWeek: e.target.value }))} className="w-full bg-[#181A20] border border-[#35383F] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#F4A460]">
                                    {DAYS.map((d, i) => <option key={i} value={i}>{d}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1.5">{t('start')}</label>
                                    <input type="time" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} className="w-full bg-[#181A20] border border-[#35383F] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#F4A460]" />
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1.5">{t('end')}</label>
                                    <input type="time" value={form.endTime} onChange={e => setForm(p => ({ ...p, endTime: e.target.value }))} className="w-full bg-[#181A20] border border-[#35383F] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#F4A460]" />
                                </div>
                            </div>
                            <button onClick={() => create.mutate({ ...form, dayOfWeek: parseInt(form.dayOfWeek) })}
                                className="w-full bg-[#F4A460] hover:bg-[#e8935a] text-[#181A20] font-semibold rounded-xl py-3 transition-colors mt-2">
                                {t('add_shift')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[#35383F] text-zinc-400">
                            <th className="text-left px-6 py-4 font-medium">{t('day')}</th>
                            <th className="text-left px-6 py-4 font-medium">{t('start')} / {t('end')}</th>
                            <th className="text-left px-6 py-4 font-medium">{t('staff_member')}</th>
                            <th className="text-left px-6 py-4 font-medium">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={4} className="py-12 text-center"><div className="animate-spin rounded-full h-6 w-6 border-t-2 border-[#F4A460] mx-auto" /></td></tr>
                        ) : shifts.map((s: any) => (
                            <tr key={s.id} className="border-b border-[#35383F]/50 hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">{DAYS[s.dayOfWeek]}</td>
                                <td className="px-6 py-4 text-zinc-400">{s.startTime} — {s.endTime}</td>
                                <td className="px-6 py-4 text-zinc-400">{staff.find((m: any) => m.id === s.staffId)?.name || t('all_staff')}</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => { if (confirm(t('delete_shift_confirm'))) remove.mutate(s.id); }} className="p-1.5 text-red-400 hover:text-red-300"><Trash2 size={15} /></button>
                                </td>
                            </tr>
                        ))}
                        {!isLoading && shifts.length === 0 && <tr><td colSpan={4} className="py-12 text-center text-zinc-500">{t('no_shifts')}</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
