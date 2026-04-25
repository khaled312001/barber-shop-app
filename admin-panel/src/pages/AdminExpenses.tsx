import { useQuery } from '@tanstack/react-query';
import { Wallet } from 'lucide-react';
import api from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';

export default function AdminExpenses() {
    const { t } = useLanguage();
    const { data: expenses = [], isLoading } = useQuery({
        queryKey: ['all-expenses'],
        queryFn: async () => { const { data } = await api.get('/admin/expenses'); return Array.isArray(data) ? data : []; },
    });
    const { data: salonsRaw = [] } = useQuery({ queryKey: ['salons'], queryFn: async () => { const { data } = await api.get('/admin/salons'); return Array.isArray(data) ? data : data?.data || []; } });

    const total = expenses.reduce((s: number, e: any) => s + (e.amount || 0), 0);
    const getSalonName = (id: string) => salonsRaw.find((s: any) => s.id === id)?.name || id.slice(0, 8) + '...';

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
                <Wallet className="text-[#F4A460]" size={24} />
                <div><h1 className="text-2xl font-bold text-white">{t('admin_expenses')}</h1><p className="text-zinc-400 text-sm">{t('all_salon_expenses')}</p></div>
            </div>

            <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-5 mb-6 inline-block">
                <p className="text-zinc-400 text-sm mb-1">{t('total_platform_expenses')}</p>
                <p className="text-3xl font-bold text-[#F4A460]">${total.toFixed(2)}</p>
            </div>

            <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[#35383F] text-zinc-400">
                            <th className="text-left px-6 py-4 font-medium">{t('salon')}</th>
                            <th className="text-left px-6 py-4 font-medium">{t('description')}</th>
                            <th className="text-left px-6 py-4 font-medium">{t('category_label')}</th>
                            <th className="text-left px-6 py-4 font-medium">{t('amount_col')}</th>
                            <th className="text-left px-6 py-4 font-medium">{t('date')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center"><div className="animate-spin rounded-full h-6 w-6 border-t-2 border-[#F4A460] mx-auto" /></td></tr>
                        ) : expenses.map((e: any) => (
                            <tr key={e.id} className="border-b border-[#35383F]/50 hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 text-zinc-300">{getSalonName(e.salonId)}</td>
                                <td className="px-6 py-4 text-white">{e.description}</td>
                                <td className="px-6 py-4"><span className="px-2.5 py-1 rounded-full text-xs bg-white/10 text-zinc-300">{e.category}</span></td>
                                <td className="px-6 py-4 font-semibold text-red-400">${e.amount.toFixed(2)}</td>
                                <td className="px-6 py-4 text-zinc-500">{e.date}</td>
                            </tr>
                        ))}
                        {!isLoading && expenses.length === 0 && <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-500">{t('no_expenses')}</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
