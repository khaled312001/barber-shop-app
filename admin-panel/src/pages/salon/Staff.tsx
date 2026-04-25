import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Users, Plus, Trash2, X } from 'lucide-react';
import api from '../../lib/api';
import { useLanguage } from '../../contexts/LanguageContext';

export default function SalonStaff() {
    const { t } = useLanguage();
    const qc = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ fullName: '', staffRole: 'barber', email: '', phone: '', password: 'password123' });

    const { data: staff = [], isLoading } = useQuery({
        queryKey: ['salon-staff'],
        queryFn: async () => { const { data } = await api.get('/salon/staff'); return Array.isArray(data) ? data : []; },
    });

    const create = useMutation({
        mutationFn: (d: any) => api.post('/salon/staff', d),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['salon-staff'] }); setShowForm(false); setForm({ fullName: '', staffRole: 'barber', email: '', phone: '', password: 'password123' }); },
    });

    const remove = useMutation({
        mutationFn: (id: string) => api.delete(`/salon/staff/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['salon-staff'] }),
    });

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Users className="text-[#F4A460]" size={24} />
                    <div><h1 className="text-2xl font-bold text-white">{t('salon_staff_title')}</h1><p className="text-zinc-400 text-sm">{t('manage_team')}</p></div>
                </div>
                <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#F4A460] hover:bg-[#e8935a] text-[#181A20] font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
                    <Plus size={18} /> {t('add_staff_member')}
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">{t('add_staff_member')}</h2>
                            <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: t('full_name'), key: 'fullName', type: 'text', placeholder: 'John Doe' },
                                { label: t('email'), key: 'email', type: 'email', placeholder: 'john@example.com' },
                                { label: t('phone'), key: 'phone', type: 'text', placeholder: '+1 234 567 8900' },
                                { label: t('password'), key: 'password', type: 'text', placeholder: 'password123' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label className="block text-sm text-zinc-400 mb-1.5">{f.label}</label>
                                    <input type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                        className="w-full bg-[#181A20] border border-[#35383F] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#F4A460] placeholder:text-zinc-600" />
                                </div>
                            ))}
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1.5">{t('role')}</label>
                                <select value={form.staffRole} onChange={e => setForm(p => ({ ...p, staffRole: e.target.value }))} className="w-full bg-[#181A20] border border-[#35383F] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#F4A460]">
                                    <option value="barber">{t('role_barber')}</option>
                                    <option value="stylist">{t('stylist')}</option>
                                    <option value="receptionist">Receptionist</option>
                                    <option value="staff">{t('salon_staff_title')}</option>
                                    <option value="salon_admin">{t('salon_admin_role')}</option>
                                </select>
                            </div>
                            <button onClick={() => create.mutate(form)} disabled={!form.fullName || create.isPending}
                                className="w-full bg-[#F4A460] hover:bg-[#e8935a] text-[#181A20] font-semibold rounded-xl py-3 transition-colors disabled:opacity-50 mt-2">
                                {t('add_staff_member')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    <div className="col-span-3 py-12 flex justify-center"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#F4A460]" /></div>
                ) : staff.map((s: any) => (
                    <div key={s.id} className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-5 hover:border-zinc-600 transition-colors">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[#F4A460]/15 flex items-center justify-center text-[#F4A460] font-bold">{(s.fullName || s.email || '?')[0]}</div>
                                <div>
                                    <p className="font-semibold text-white">{s.fullName || s.email}</p>
                                    <p className="text-zinc-500 text-xs capitalize">{s.staffRole || s.role}</p>
                                </div>
                            </div>
                            <button onClick={() => { if (confirm(t('remove_staff_confirm'))) remove.mutate(s.linkId || s.id); }} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={16} /></button>
                        </div>
                        {s.email && <p className="text-zinc-500 text-sm mt-3">{s.email}</p>}
                        {s.phone && <p className="text-zinc-500 text-sm">{s.phone}</p>}
                    </div>
                ))}
                {!isLoading && staff.length === 0 && (
                    <div className="col-span-3 py-12 text-center text-zinc-500">{t('no_staff_members')}</div>
                )}
            </div>
        </div>
    );
}
