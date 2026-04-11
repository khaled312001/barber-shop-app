import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, Plus, Trash2, X } from 'lucide-react';
import api from '../lib/api';

export default function Subscriptions() {
    const qc = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ salonId: '', planId: '', status: 'active', startDate: '', endDate: '' });

    const { data: subs = [] } = useQuery({
        queryKey: ['subscriptions'],
        queryFn: async () => { const { data } = await api.get('/admin/subscriptions'); return data; },
    });
    const { data: plans = [] } = useQuery({
        queryKey: ['plans'],
        queryFn: async () => { const { data } = await api.get('/admin/plans'); return data; },
    });
    const { data: salons = [] } = useQuery({
        queryKey: ['salons'],
        queryFn: async () => { const { data } = await api.get('/admin/salons'); return data; },
    });

    const create = useMutation({
        mutationFn: (data: any) => api.post('/admin/subscriptions', data),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['subscriptions'] }); setShowForm(false); setForm({ salonId: '', planId: '', status: 'active', startDate: '', endDate: '' }); },
    });

    const update = useMutation({
        mutationFn: ({ id, data }: any) => api.put(`/admin/subscriptions/${id}`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['subscriptions'] }),
    });

    const remove = useMutation({
        mutationFn: (id: string) => api.delete(`/admin/subscriptions/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['subscriptions'] }),
    });

    const getSalonName = (id: string) => salons.find((s: any) => s.id === id)?.name || id;
    const getPlanName = (id: string) => plans.find((p: any) => p.id === id)?.name || id;

    const statusBadge = (s: string) => {
        const map: Record<string, string> = { active: 'bg-emerald-500/15 text-emerald-400', expired: 'bg-red-500/15 text-red-400', suspended: 'bg-yellow-500/15 text-yellow-400', cancelled: 'bg-zinc-700 text-zinc-400' };
        return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[s] || 'bg-zinc-700 text-zinc-400'}`}>{s}</span>;
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <CreditCard className="text-[#F4A460]" size={24} />
                    <div>
                        <h1 className="text-2xl font-bold text-white">Subscriptions</h1>
                        <p className="text-zinc-400 text-sm">Manage salon subscriptions</p>
                    </div>
                </div>
                <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#F4A460] hover:bg-[#e8935a] text-[#181A20] font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
                    <Plus size={18} /> Add Subscription
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">New Subscription</h2>
                            <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1.5">Salon</label>
                                <select value={form.salonId} onChange={e => setForm(p => ({ ...p, salonId: e.target.value }))} className="w-full bg-[#181A20] border border-[#35383F] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#F4A460]">
                                    <option value="">Select salon</option>
                                    {salons.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1.5">Plan</label>
                                <select value={form.planId} onChange={e => setForm(p => ({ ...p, planId: e.target.value }))} className="w-full bg-[#181A20] border border-[#35383F] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#F4A460]">
                                    <option value="">Select plan</option>
                                    {plans.map((p: any) => <option key={p.id} value={p.id}>{p.name} - ${p.price}/{p.billingCycle}</option>)}
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1.5">Start Date</label>
                                    <input type="date" value={form.startDate} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} className="w-full bg-[#181A20] border border-[#35383F] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#F4A460]" />
                                </div>
                                <div>
                                    <label className="block text-sm text-zinc-400 mb-1.5">End Date</label>
                                    <input type="date" value={form.endDate} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} className="w-full bg-[#181A20] border border-[#35383F] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#F4A460]" />
                                </div>
                            </div>
                            <button onClick={() => create.mutate(form)} disabled={!form.salonId || !form.planId || !form.startDate || !form.endDate} className="w-full bg-[#F4A460] hover:bg-[#e8935a] text-[#181A20] font-semibold rounded-xl py-3 transition-colors disabled:opacity-50 mt-2">
                                Create Subscription
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[#35383F] text-zinc-400">
                            <th className="text-left px-6 py-4 font-medium">Salon</th>
                            <th className="text-left px-6 py-4 font-medium">Plan</th>
                            <th className="text-left px-6 py-4 font-medium">Status</th>
                            <th className="text-left px-6 py-4 font-medium">Start</th>
                            <th className="text-left px-6 py-4 font-medium">End</th>
                            <th className="text-left px-6 py-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {subs.map((s: any) => (
                            <tr key={s.id} className="border-b border-[#35383F]/50 hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 font-medium text-white">{getSalonName(s.salonId)}</td>
                                <td className="px-6 py-4 text-zinc-300">{getPlanName(s.planId)}</td>
                                <td className="px-6 py-4">{statusBadge(s.status)}</td>
                                <td className="px-6 py-4 text-zinc-400">{s.startDate}</td>
                                <td className="px-6 py-4 text-zinc-400">{s.endDate}</td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        {s.status !== 'active' && <button onClick={() => update.mutate({ id: s.id, data: { status: 'active' } })} className="px-3 py-1 text-xs rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25">Activate</button>}
                                        {s.status !== 'suspended' && <button onClick={() => update.mutate({ id: s.id, data: { status: 'suspended' } })} className="px-3 py-1 text-xs rounded-lg bg-yellow-500/15 text-yellow-400 hover:bg-yellow-500/25">Suspend</button>}
                                        <button onClick={() => { if (confirm('Delete this subscription?')) remove.mutate(s.id); }} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/15"><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {subs.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500">No subscriptions found</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
