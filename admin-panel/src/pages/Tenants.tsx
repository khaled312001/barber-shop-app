import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Building2, CheckCircle, XCircle } from 'lucide-react';
import api from '../lib/api';

export default function Tenants() {
    const qc = useQueryClient();
    const { data: tenants = [], isLoading } = useQuery({
        queryKey: ['tenants'],
        queryFn: async () => { const { data } = await api.get('/admin/tenants'); return data; },
    });

    const updateStatus = useMutation({
        mutationFn: ({ id, status }: { id: string; status: string }) => api.put(`/admin/salons/${id}`, { status }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['tenants'] }),
    });

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            active: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
            suspended: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30',
            deactivated: 'bg-red-500/15 text-red-400 border-red-500/30',
        };
        return <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${map[status] || 'bg-zinc-700 text-zinc-300 border-zinc-600'}`}>{status}</span>;
    };

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
                <Building2 className="text-[#F4A460]" size={24} />
                <div>
                    <h1 className="text-2xl font-bold text-white">Tenants</h1>
                    <p className="text-zinc-400 text-sm">All salon tenants on the platform</p>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#F4A460]" /></div>
            ) : (
                <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[#35383F] text-zinc-400">
                                <th className="text-left px-6 py-4 font-medium">Salon</th>
                                <th className="text-left px-6 py-4 font-medium">Address</th>
                                <th className="text-left px-6 py-4 font-medium">Status</th>
                                <th className="text-left px-6 py-4 font-medium">Subscription</th>
                                <th className="text-left px-6 py-4 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tenants.map((t: any) => (
                                <tr key={t.id} className="border-b border-[#35383F]/50 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-[#F4A460]/15 flex items-center justify-center text-[#F4A460] font-bold text-sm">{t.name[0]}</div>
                                            <div>
                                                <p className="font-medium text-white">{t.name}</p>
                                                <p className="text-zinc-500 text-xs">{t.phone}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-zinc-400 max-w-[200px] truncate">{t.address}</td>
                                    <td className="px-6 py-4">{statusBadge(t.status || 'active')}</td>
                                    <td className="px-6 py-4">
                                        {t.hasActiveSubscription
                                            ? <span className="flex items-center gap-1.5 text-emerald-400 text-xs"><CheckCircle size={14} /> Active</span>
                                            : <span className="flex items-center gap-1.5 text-zinc-500 text-xs"><XCircle size={14} /> None</span>
                                        }
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {t.status !== 'active' && (
                                                <button onClick={() => updateStatus.mutate({ id: t.id, status: 'active' })} className="px-3 py-1 rounded-lg bg-emerald-500/15 text-emerald-400 text-xs hover:bg-emerald-500/25 transition-colors">Activate</button>
                                            )}
                                            {t.status !== 'suspended' && (
                                                <button onClick={() => updateStatus.mutate({ id: t.id, status: 'suspended' })} className="px-3 py-1 rounded-lg bg-yellow-500/15 text-yellow-400 text-xs hover:bg-yellow-500/25 transition-colors">Suspend</button>
                                            )}
                                            {t.status !== 'deactivated' && (
                                                <button onClick={() => updateStatus.mutate({ id: t.id, status: 'deactivated' })} className="px-3 py-1 rounded-lg bg-red-500/15 text-red-400 text-xs hover:bg-red-500/25 transition-colors">Deactivate</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {tenants.length === 0 && (
                                <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-500">No tenants found</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
