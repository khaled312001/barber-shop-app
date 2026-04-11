import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Key, Plus, Copy, Trash2, X, Smartphone } from 'lucide-react';
import api from '../lib/api';

export default function LicenseKeys() {
    const qc = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ salonId: '', planId: '', expiresAt: '', maxActivations: '1' });
    const [copied, setCopied] = useState('');

    const { data: keys = [] } = useQuery({
        queryKey: ['license-keys'],
        queryFn: async () => { const { data } = await api.get('/admin/license-keys'); return data; },
    });
    const { data: salons = [] } = useQuery({ queryKey: ['salons'], queryFn: async () => { const { data } = await api.get('/admin/salons'); return data; } });
    const { data: plans = [] } = useQuery({ queryKey: ['plans'], queryFn: async () => { const { data } = await api.get('/admin/plans'); return data; } });

    const create = useMutation({
        mutationFn: (data: any) => api.post('/admin/license-keys', { ...data, maxActivations: parseInt(data.maxActivations) || 1 }),
        onSuccess: () => { qc.invalidateQueries({ queryKey: ['license-keys'] }); setShowForm(false); setForm({ salonId: '', planId: '', expiresAt: '', maxActivations: '1' }); },
    });

    const update = useMutation({
        mutationFn: ({ id, data }: any) => api.put(`/admin/license-keys/${id}`, data),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['license-keys'] }),
    });

    const remove = useMutation({
        mutationFn: (id: string) => api.delete(`/admin/license-keys/${id}`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['license-keys'] }),
    });

    const copyKey = (key: string) => {
        navigator.clipboard.writeText(key);
        setCopied(key);
        setTimeout(() => setCopied(''), 2000);
    };

    const statusBadge = (s: string) => {
        const map: Record<string, string> = { unused: 'bg-blue-500/15 text-blue-400', active: 'bg-emerald-500/15 text-emerald-400', revoked: 'bg-red-500/15 text-red-400' };
        return <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${map[s] || 'bg-zinc-700 text-zinc-400'}`}>{s}</span>;
    };

    const activationBar = (used: number, max: number) => {
        if (!max || max === 0) return (
            <div className="flex items-center gap-2">
                <Smartphone size={13} className="text-zinc-500" />
                <span className="text-zinc-400 text-xs">{used} / ∞</span>
            </div>
        );
        const pct = Math.min((used / max) * 100, 100);
        const barColor = pct >= 100 ? 'bg-red-500' : pct >= 75 ? 'bg-amber-500' : 'bg-emerald-500';
        return (
            <div className="flex items-center gap-2">
                <Smartphone size={13} className="text-zinc-500" />
                <div className="flex flex-col gap-1">
                    <span className="text-xs text-zinc-300 font-medium">{used} / {max}</span>
                    <div className="w-20 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                        <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Key className="text-[#F4A460]" size={24} />
                    <div><h1 className="text-2xl font-bold text-white">License Keys</h1><p className="text-zinc-400 text-sm">Generate and manage access keys</p></div>
                </div>
                <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-[#F4A460] hover:bg-[#e8935a] text-[#181A20] font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
                    <Plus size={18} /> Generate Key
                </button>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
                    <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-6 w-full max-w-md">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-lg font-bold text-white">Generate License Key</h2>
                            <button onClick={() => setShowForm(false)} className="text-zinc-400 hover:text-white"><X size={20} /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1.5">Assign to Salon (optional)</label>
                                <select value={form.salonId} onChange={e => setForm(p => ({ ...p, salonId: e.target.value }))} className="w-full bg-[#181A20] border border-[#35383F] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#F4A460]">
                                    <option value="">Unassigned</option>
                                    {salons.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1.5">Plan</label>
                                <select value={form.planId} onChange={e => setForm(p => ({ ...p, planId: e.target.value }))} className="w-full bg-[#181A20] border border-[#35383F] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#F4A460]">
                                    <option value="">Select plan</option>
                                    {plans.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1.5">
                                    Max Activations (devices)
                                    <span className="ml-2 text-xs text-zinc-500">— 0 = unlimited</span>
                                </label>
                                <div className="flex items-center gap-3">
                                    <input
                                        type="number"
                                        min="0"
                                        value={form.maxActivations}
                                        onChange={e => setForm(p => ({ ...p, maxActivations: e.target.value }))}
                                        className="w-full bg-[#181A20] border border-[#35383F] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#F4A460]"
                                        placeholder="e.g. 3"
                                    />
                                    <div className="flex items-center gap-1.5 shrink-0 bg-[#181A20] border border-[#35383F] rounded-xl px-3 py-3">
                                        <Smartphone size={16} className="text-[#F4A460]" />
                                        <span className="text-zinc-300 text-sm font-medium">
                                            {form.maxActivations === '0' || form.maxActivations === '' ? '∞' : form.maxActivations}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2 mt-2">
                                    {[1, 2, 3, 5, 10].map(n => (
                                        <button key={n} onClick={() => setForm(p => ({ ...p, maxActivations: String(n) }))}
                                            className={`px-3 py-1 text-xs rounded-lg border transition-colors ${form.maxActivations === String(n) ? 'bg-[#F4A460] border-[#F4A460] text-[#181A20] font-bold' : 'border-[#35383F] text-zinc-400 hover:border-[#F4A460]'}`}>
                                            {n}
                                        </button>
                                    ))}
                                    <button onClick={() => setForm(p => ({ ...p, maxActivations: '0' }))}
                                        className={`px-3 py-1 text-xs rounded-lg border transition-colors ${form.maxActivations === '0' ? 'bg-[#F4A460] border-[#F4A460] text-[#181A20] font-bold' : 'border-[#35383F] text-zinc-400 hover:border-[#F4A460]'}`}>
                                        ∞
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1.5">Expires At</label>
                                <input type="date" value={form.expiresAt} onChange={e => setForm(p => ({ ...p, expiresAt: e.target.value }))} className="w-full bg-[#181A20] border border-[#35383F] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#F4A460]" />
                            </div>
                            <button onClick={() => create.mutate(form)} disabled={create.isPending} className="w-full bg-[#F4A460] hover:bg-[#e8935a] disabled:opacity-50 text-[#181A20] font-semibold rounded-xl py-3 transition-colors mt-2">
                                {create.isPending ? 'Generating...' : 'Generate Key'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[#35383F] text-zinc-400">
                            <th className="text-left px-6 py-4 font-medium">Key</th>
                            <th className="text-left px-6 py-4 font-medium">Status</th>
                            <th className="text-left px-6 py-4 font-medium">Activations</th>
                            <th className="text-left px-6 py-4 font-medium">Salon</th>
                            <th className="text-left px-6 py-4 font-medium">Expires</th>
                            <th className="text-left px-6 py-4 font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {keys.map((k: any) => (
                            <tr key={k.id} className="border-b border-[#35383F]/50 hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        <code className="text-[#F4A460] font-mono text-xs">{k.key}</code>
                                        <button onClick={() => copyKey(k.key)} className="text-zinc-500 hover:text-zinc-300 transition-colors">
                                            <Copy size={14} />
                                        </button>
                                        {copied === k.key && <span className="text-emerald-400 text-xs">Copied!</span>}
                                    </div>
                                </td>
                                <td className="px-6 py-4">{statusBadge(k.status)}</td>
                                <td className="px-6 py-4">
                                    {activationBar(k.activationCount ?? 0, k.maxActivations ?? 0)}
                                </td>
                                <td className="px-6 py-4 text-zinc-400">{salons.find((s: any) => s.id === k.salonId)?.name || 'Unassigned'}</td>
                                <td className="px-6 py-4 text-zinc-400">{k.expiresAt || 'No expiry'}</td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2">
                                        {k.status !== 'revoked' && <button onClick={() => update.mutate({ id: k.id, data: { status: 'revoked' } })} className="px-3 py-1 text-xs rounded-lg bg-red-500/15 text-red-400 hover:bg-red-500/25">Revoke</button>}
                                        <button onClick={() => { if (confirm('Delete this key?')) remove.mutate(k.id); }} className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/15"><Trash2 size={14} /></button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {keys.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500">No license keys found</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
