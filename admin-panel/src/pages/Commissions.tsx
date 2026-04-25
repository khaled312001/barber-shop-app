import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, CheckCircle, Settings, Save, Percent } from 'lucide-react';
import api from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';

export default function Commissions() {
    const { t } = useLanguage();
    const qc = useQueryClient();
    const [globalRate, setGlobalRate] = useState('');
    const [rateInput, setRateInput] = useState('');
    const [rateSuccess, setRateSuccess] = useState(false);

    const { data: commissions = [], isLoading } = useQuery({
        queryKey: ['commissions'],
        queryFn: async () => { const { data } = await api.get('/admin/commissions'); return Array.isArray(data) ? data : []; },
    });
    const { data: salons = [] } = useQuery({ queryKey: ['salons'], queryFn: async () => { const { data } = await api.get('/admin/salons'); return Array.isArray(data) ? data : []; } });

    const { data: settings = [] } = useQuery({
        queryKey: ['settings'],
        queryFn: async () => { const { data } = await api.get('/admin/settings'); return Array.isArray(data) ? data : []; },
    });

    useEffect(() => {
        const commissionSetting = settings.find((s: any) => s.key === 'default_commission_rate');
        if (commissionSetting) {
            setGlobalRate(commissionSetting.value);
            setRateInput(commissionSetting.value);
        }
    }, [settings]);

    const updateRate = useMutation({
        mutationFn: (newRate: string) => api.post('/admin/settings', {
            key: 'default_commission_rate',
            value: newRate,
            description: 'Default platform commission percentage',
        }),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['settings'] });
            setRateSuccess(true);
            setTimeout(() => setRateSuccess(false), 3000);
        },
    });

    const markPaid = useMutation({
        mutationFn: (id: string) => api.put(`/admin/commissions/${id}`, { status: 'paid' }),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['commissions'] }),
    });

    const getSalonName = (id: string) => salons.find((s: any) => s.id === id)?.name || id.slice(0, 8) + '...';
    const total = commissions.reduce((s: number, c: any) => s + (c.amount || 0), 0);
    const paid = commissions.filter((c: any) => c.status === 'paid').reduce((s: number, c: any) => s + (c.amount || 0), 0);
    const pending = total - paid;

    const handleSaveRate = () => {
        const num = parseFloat(rateInput);
        if (isNaN(num) || num < 0 || num > 100) return;
        updateRate.mutate(rateInput);
    };

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
                <DollarSign className="text-[#F4A460]" size={24} />
                <div><h1 className="text-2xl font-bold text-white">{t('commissions_title')}</h1><p className="text-zinc-400 text-sm">{t('commission_tracking')}</p></div>
            </div>

            {/* Global Commission Rate Setting */}
            <div className="bg-gradient-to-r from-[#1F222A] to-[#2A2D35] border border-[#F4A460]/30 rounded-2xl p-6 mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F4A460]/15 flex items-center justify-center">
                        <Settings className="text-[#F4A460]" size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-white">نسبة العمولة العامة</h2>
                        <p className="text-zinc-400 text-xs">تُطبق تلقائياً على جميع الفواتير والخدمات • الأسعار تُقرّب لأعلى عدد صحيح</p>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 flex-1 max-w-xs">
                        <div className="relative flex-1">
                            <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={rateInput}
                                onChange={(e) => setRateInput(e.target.value)}
                                className="w-full bg-[#181A20] border border-[#35383F] rounded-xl px-4 py-3 text-white text-lg font-semibold focus:outline-none focus:border-[#F4A460] transition-colors pr-10"
                                placeholder="0"
                            />
                            <Percent className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        </div>
                        <button
                            onClick={handleSaveRate}
                            disabled={updateRate.isPending || rateInput === globalRate}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-all ${
                                rateSuccess
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                    : rateInput === globalRate
                                    ? 'bg-zinc-700/50 text-zinc-500 cursor-not-allowed'
                                    : 'bg-[#F4A460] text-black hover:bg-[#E8934F]'
                            }`}
                        >
                            {rateSuccess ? (
                                <><CheckCircle size={16} /> تم الحفظ</>
                            ) : updateRate.isPending ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-black" />
                            ) : (
                                <><Save size={16} /> حفظ</>
                            )}
                        </button>
                    </div>
                    {globalRate && (
                        <div className="flex items-center gap-2 bg-[#181A20] border border-[#35383F] rounded-xl px-4 py-3">
                            <span className="text-zinc-400 text-sm">النسبة الحالية:</span>
                            <span className="text-[#F4A460] font-bold text-lg">{globalRate}%</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                    { label: t('total_earned'), value: `$${Math.ceil(total)}`, color: 'text-[#F4A460]' },
                    { label: t('paid_out'), value: `$${Math.ceil(paid)}`, color: 'text-emerald-400' },
                    { label: t('pending'), value: `$${Math.ceil(pending)}`, color: 'text-yellow-400' },
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
                            <th className="text-left px-6 py-4 font-medium">{t('salon')}</th>
                            <th className="text-left px-6 py-4 font-medium">{t('amount')}</th>
                            <th className="text-left px-6 py-4 font-medium">{t('rate')}</th>
                            <th className="text-left px-6 py-4 font-medium">{t('status')}</th>
                            <th className="text-left px-6 py-4 font-medium">{t('date')}</th>
                            <th className="text-left px-6 py-4 font-medium">{t('action')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={6} className="px-6 py-12 text-center"><div className="animate-spin rounded-full h-6 w-6 border-t-2 border-[#F4A460] mx-auto" /></td></tr>
                        ) : commissions.map((c: any) => (
                            <tr key={c.id} className="border-b border-[#35383F]/50 hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 text-zinc-300">{getSalonName(c.salonId)}</td>
                                <td className="px-6 py-4 font-semibold text-[#F4A460]">${Math.ceil(c.amount)}</td>
                                <td className="px-6 py-4 text-zinc-400">{c.rate}%</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${c.status === 'paid' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-yellow-500/15 text-yellow-400'}`}>{c.status}</span>
                                </td>
                                <td className="px-6 py-4 text-zinc-500 text-xs">{new Date(c.createdAt).toLocaleDateString()}</td>
                                <td className="px-6 py-4">
                                    {c.status === 'pending' && (
                                        <button onClick={() => markPaid.mutate(c.id)} className="flex items-center gap-1.5 px-3 py-1 text-xs rounded-lg bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 transition-colors">
                                            <CheckCircle size={12} /> {t('mark_paid')}
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                        {!isLoading && commissions.length === 0 && <tr><td colSpan={6} className="px-6 py-12 text-center text-zinc-500">{t('no_commissions')}</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
