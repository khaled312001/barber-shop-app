import { useQuery } from '@tanstack/react-query';
import { ClipboardList, RefreshCw } from 'lucide-react';
import api from '../lib/api';

const actionColors: Record<string, string> = {
    'user.login': 'text-blue-400',
    'user.logout': 'text-zinc-400',
    'user.created': 'text-emerald-400',
    'booking.created': 'text-[#F4A460]',
    'booking.cancelled': 'text-red-400',
    'salon.created': 'text-purple-400',
    'salon.active': 'text-emerald-400',
    'salon.suspended': 'text-yellow-400',
    'salon.deactivated': 'text-red-400',
    'subscription.created': 'text-blue-400',
    'subscription.updated': 'text-blue-300',
};

export default function ActivityLog() {
    const { data: logs = [], isLoading, refetch } = useQuery({
        queryKey: ['activity-logs'],
        queryFn: async () => { const { data } = await api.get('/admin/activity-logs?limit=200'); return data; },
        refetchInterval: 30000,
    });

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <ClipboardList className="text-[#F4A460]" size={24} />
                    <div><h1 className="text-2xl font-bold text-white">Activity Log</h1><p className="text-zinc-400 text-sm">All platform events</p></div>
                </div>
                <button onClick={() => refetch()} className="flex items-center gap-2 border border-[#35383F] text-zinc-400 hover:text-white hover:border-zinc-500 px-4 py-2 rounded-xl text-sm transition-colors">
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#F4A460]" /></div>
            ) : (
                <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl overflow-hidden">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-[#35383F] text-zinc-400">
                                <th className="text-left px-6 py-4 font-medium">Time</th>
                                <th className="text-left px-6 py-4 font-medium">Action</th>
                                <th className="text-left px-6 py-4 font-medium">Role</th>
                                <th className="text-left px-6 py-4 font-medium">Entity</th>
                                <th className="text-left px-6 py-4 font-medium">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {logs.map((log: any) => (
                                <tr key={log.id} className="border-b border-[#35383F]/50 hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-3 text-zinc-500 text-xs whitespace-nowrap">
                                        {new Date(log.createdAt).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className={`font-mono text-xs ${actionColors[log.action] || 'text-zinc-300'}`}>{log.action}</span>
                                    </td>
                                    <td className="px-6 py-3">
                                        <span className="px-2 py-0.5 rounded-full text-xs bg-white/10 text-zinc-300">{log.userRole || 'unknown'}</span>
                                    </td>
                                    <td className="px-6 py-3 text-zinc-400 text-xs">{log.entityType}</td>
                                    <td className="px-6 py-3 text-zinc-500 text-xs font-mono max-w-[200px] truncate">
                                        {log.metadata && Object.keys(log.metadata).length > 0 ? JSON.stringify(log.metadata) : '—'}
                                    </td>
                                </tr>
                            ))}
                            {logs.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-500">No activity logged yet</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
