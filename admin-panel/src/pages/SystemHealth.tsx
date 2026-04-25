import { useQuery } from '@tanstack/react-query';
import { Activity, Server, Database, Cpu, RefreshCw, CheckCircle, XCircle } from 'lucide-react';

import api from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';

export default function SystemHealth() {
    const { t } = useLanguage();
    const { data: health, isLoading, refetch, dataUpdatedAt } = useQuery({
        queryKey: ['system-health'],
        queryFn: async () => { const { data } = await api.get('/admin/system-health'); return data; },
        refetchInterval: 15000,
    });

    const formatUptime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}h ${m}m ${s}s`;
    };

    const metrics = health ? [
        { label: t('server_status'), value: health.status === 'ok' ? t('operational') : t('error'), icon: Server, ok: health.status === 'ok', extra: '' },
        { label: t('database'), value: health.dbStatus === 'ok' ? `${health.dbLatencyMs}ms latency` : t('error'), icon: Database, ok: health.dbStatus === 'ok', extra: '' },
        { label: t('uptime'), value: formatUptime(health.uptime), icon: Activity, ok: true, extra: '' },
        { label: t('memory_usage'), value: `${health.memoryMB} MB / ${health.totalMemoryMB} MB`, icon: Cpu, ok: health.memoryMB < health.totalMemoryMB * 0.8, extra: `${Math.round(health.memoryMB / health.totalMemoryMB * 100)}% ${t('used')}` },
    ] : [];

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <Activity className="text-[#F4A460]" size={24} />
                    <div>
                        <h1 className="text-2xl font-bold text-white">{t('system_health')}</h1>
                        <p className="text-zinc-400 text-sm">{t('realtime_monitoring')}</p>
                    </div>
                </div>
                <button onClick={() => refetch()} className="flex items-center gap-2 border border-[#35383F] text-zinc-400 hover:text-white hover:border-zinc-500 px-4 py-2 rounded-xl text-sm transition-colors">
                    <RefreshCw size={16} /> {t('refresh')}
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#F4A460]" /></div>
            ) : health ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                        {metrics.map((m, i) => {
                            const Icon = m.icon;
                            return (
                                <div key={i} className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-6">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-3 rounded-xl ${m.ok ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
                                                <Icon size={20} className={m.ok ? 'text-emerald-400' : 'text-red-400'} />
                                            </div>
                                            <span className="font-medium text-zinc-300">{m.label}</span>
                                        </div>
                                        {m.ok ? <CheckCircle size={20} className="text-emerald-400" /> : <XCircle size={20} className="text-red-400" />}
                                    </div>
                                    <p className="text-xl font-bold text-white">{m.value}</p>
                                    {m.extra && <p className="text-zinc-500 text-sm mt-1">{m.extra}</p>}
                                </div>
                            );
                        })}
                    </div>

                    <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-6">
                        <h2 className="font-bold text-white mb-4">{t('environment_info')}</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                            {[
                                { label: 'Node.js', value: health.nodeVersion },
                                { label: t('environment'), value: health.environment },
                                { label: t('last_checked'), value: new Date(dataUpdatedAt).toLocaleTimeString() },
                            ].map((item, i) => (
                                <div key={i}>
                                    <p className="text-zinc-500 mb-1">{item.label}</p>
                                    <p className="text-zinc-200 font-mono">{item.value}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-12 text-red-400">{t('failed_health')}</div>
            )}
        </div>
    );
}
