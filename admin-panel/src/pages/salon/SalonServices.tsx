import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Scissors, Plus, Trash2, X } from 'lucide-react';
import api from '../../lib/api';
import { useLanguage } from '../../contexts/LanguageContext';

export default function SalonServices() {
    const { t } = useLanguage();
    const qc = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', price: '', duration: '', category: '' });

    const { data: services = [], isLoading } = useQuery({
        queryKey: ['salon-services'],
        queryFn: async () => { const { data } = await api.get('/salon/services'); return Array.isArray(data) ? data : []; },
    });

    const create = useMutation({
        mutationFn: (d: any) => api.post('/salon/services', d),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['salon-services'] }); setShowForm(false); setForm({ name: '', price: '', duration: '', category: '' }); },
    });

    const remove = useMutation({
        mutationFn: (id: string) => api.delete(`/salon/services/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['salon-services'] }),
    });

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Scissors className="text-[#F4A460]" size={24} />
                    <div><h1 className="text-2xl font-bold text-white">{t('salon_services_title')}</h1><p className="text-zinc-400 text-sm">{t('manage_catalog')}</p></div>
                </div>
                <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#F4A460] hover:bg-[#e8935a] text-[#181A20] font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
                    <Plus size={18} /> {t('add_service')}
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">{t('add_service')}</h2>
                            <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            {[
                                { label: t('service_name_label'), key: 'name', type: 'text', placeholder: 'Haircut' },
                                { label: t('price_label'), key: 'price', type: 'number', placeholder: '25' },
                                { label: t('duration_minutes'), key: 'duration', type: 'number', placeholder: '30' },
                                { label: t('category'), key: 'category', type: 'text', placeholder: 'Hair' },
                            ].map(f => (
                                <div key={f.key}>
                                    <label className="block text-sm text-zinc-400 mb-1.5">{f.label}</label>
                                    <input type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                        className="w-full bg-[#181A20] border border-[#35383F] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#F4A460] placeholder:text-zinc-600" />
                                </div>
                            ))}
                            <button onClick={() => create.mutate({ ...form, price: parseFloat(form.price), duration: parseInt(form.duration) })} disabled={!form.name || !form.price || create.isPending}
                                className="w-full bg-[#F4A460] hover:bg-[#e8935a] text-[#181A20] font-semibold rounded-xl py-3 transition-colors disabled:opacity-50 mt-2">
                                {t('add_service')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[#35383F] text-zinc-400">
                            <th className="text-left px-6 py-4 font-medium">{t('service_name_label')}</th>
                            <th className="text-left px-6 py-4 font-medium">{t('category')}</th>
                            <th className="text-left px-6 py-4 font-medium">{t('duration_minutes')}</th>
                            <th className="text-left px-6 py-4 font-medium">{t('price_label')}</th>
                            <th className="text-left px-6 py-4 font-medium">{t('actions')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={5} className="py-12 text-center"><div className="animate-spin rounded-full h-6 w-6 border-t-2 border-[#F4A460] mx-auto" /></td></tr>
                        ) : services.map((s: any) => (
                            <tr key={s.id} className="border-b border-[#35383F]/50 hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">{s.name}</td>
                                <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-full text-xs bg-white/10 text-zinc-300">{s.category || 'General'}</span></td>
                                <td className="px-6 py-4 text-zinc-400">{s.duration}min</td>
                                <td className="px-6 py-4 font-semibold text-[#F4A460]">${s.price.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <button onClick={() => { if (confirm(t('delete_service_salon'))) remove.mutate(s.id); }} className="p-1.5 text-red-400 hover:text-red-300"><Trash2 size={15} /></button>
                                </td>
                            </tr>
                        ))}
                        {!isLoading && services.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-zinc-500">{t('no_services_salon')}</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
