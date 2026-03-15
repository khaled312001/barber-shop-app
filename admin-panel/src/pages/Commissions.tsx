import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, CheckCircle } from 'lucide-react';
import api from '../lib/api';

export default function Commissions() {
    const qc = useQueryClient();
    const { data: commissions = [], isLoading } = useQuery({
        queryKey: ['commissions'],
        queryFn: async () => { const { data } = await api.get('/admin/commissions'); return data; },
    });
    const { data: salons = [] } = useQuery({ queryKey: ['salons'], queryFn: async () => { const { data } = await api.get('/admin/salons'); return data; } });

    const markPaid = useMutation({
        mutationFn: (id: string) => api.put(`/admin/commissions/${id}`, { status: 'paid' }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['commissions'] }),
    });

    const getSalonName = (id: string) => salons.find((s: any) => s.id === id)?.name || id.slice(0, 8) + '...';
    const total = commissions.reduce((s: number, c: any) => s + (c.amount || 0), 0);
    const paid = commissions.filter((c: any) => c.status === 'paid').reduce((s: number, c: any) => s + (c.amount || 0), 0);
    const pending = total - paid;

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
                <DollarSign className="text-[#F4A460]" size={24} />
                <div><h1 className="text-2xl font-bold text-white">Commissions</h1><p className="text-zinc-400 text-sm">Platform commission tracking</p></div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                    { label: 'Total Earned', value: `$${total.toFixed(2)}`, color: 'text-[#F4A460]' },
                    { label: 'Paid Out', value: `$${paid.toFixed(2)}`, color: 'text-emerald-400' },
                    { label: 'Pending', value: `$${pending.toFixed(2)}`, color: 'text-yellow-400' },
                ].map((s, i) => (
                    <div key={i} className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-5">
                        <p className="text-zinc-400 text-sm mb-1">{s.label}</p>
                        <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[#35383F] text-zinc-400">
                            <th className="text-left px-6 py-4 font-medium">Salon</th>
                            <th className="text-left px-6 py-4 font-medium">Amount</th>
                            <th className="text-left px-6 py-4 font-medium">Rate</th>
                            <th className="text-left px-6 py-4 font-medium">Status</th>
                            <th className="text-left px-6 py-4 font-medium">Date</th>
                            <th className="text-left px-6 py-4 font-medium">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={6} className="px-6 py-12 text-center"><div className="animate-spin rounded-full h-6 w-6 border-t-2 border-[#F4A460] mx-auto" /></td></tr>
                        ) : commissions.map((c: any) => (
                            <tr key={c.id} className="border-b border-[#35383F]/50 hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 text-zinc-300">{getSalonName(c.salonId)}</td>
                                <td className="px-6 py-4 font-semibold text-[#F4A460]">${c.amount.toFixed(2)}</td>
                                <td className="px-6 py-4 text-zinc-400">{c.rate}%</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.status === 'paid' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-yellow-500/15 text-yellow-400'}`}>{c.status}</span>
                                </td>
                                <td className="px-6 py-4 text-zinc-500 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    {c.status === 'pending' && (
                                        <button onClick={() => markPaid.mutate(c.id)} className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors">
                                            <CheckCircle size={12} /> Mark Paid
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {!isLoading && commissions.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500">No commissions yet</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
