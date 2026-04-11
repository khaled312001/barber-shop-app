import { useQuery } from '@tanstack/react-query';
import { CreditCard } from 'lucide-react';
import api from '../../lib/api';

export default function SalonPayments() {
    const { data: bookings = [], isLoading } = useQuery({
        queryKey: ['salon-bookings'],
        queryFn: async () => { const { data } = await api.get('/salon/bookings'); return data; },
    });

    const paid = bookings.filter((b: any) => b.status === 'completed');
    const total = paid.reduce((s: number, b: any) => s + b.totalPrice, 0);
    const pending = bookings.filter((b: any) => b.status === 'pending').reduce((s: number, b: any) => s + b.totalPrice, 0);

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
                <CreditCard className="text-[#F4A460]" size={24} />
                <div><h1 className="text-2xl font-bold text-white">Payments</h1><p className="text-zinc-400 text-sm">Revenue from completed bookings</p></div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                    { label: 'Total Collected', value: `$${total.toFixed(2)}`, color: 'text-emerald-400' },
                    { label: 'Pending Revenue', value: `$${pending.toFixed(2)}`, color: 'text-yellow-400' },
                    { label: 'Paid Bookings', value: paid.length, color: 'text-[#F4A460]' },
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
                            <th className="text-left px-6 py-4 font-medium">Client</th>
                            <th className="text-left px-6 py-4 font-medium">Date</th>
                            <th className="text-left px-6 py-4 font-medium">Method</th>
                            <th className="text-left px-6 py-4 font-medium">Amount</th>
                            <th className="text-left px-6 py-4 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={5} className="py-12 text-center"><div className="animate-spin rounded-full h-6 w-6 border-t-2 border-[#F4A460] mx-auto" /></td></tr>
                        ) : bookings.map((b: any) => (
                            <tr key={b.id} className="border-b border-[#35383F]/50 hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 text-white">{b.userName || 'Guest'}</td>
                                <td className="px-6 py-4 text-zinc-400">{b.date}</td>
                                <td className="px-6 py-4 text-zinc-400">{b.paymentMethod || 'cash'}</td>
                                <td className="px-6 py-4 font-semibold text-[#F4A460]">${b.totalPrice.toFixed(2)}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${b.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' : b.status === 'cancelled' ? 'bg-red-500/15 text-red-400' : 'bg-yellow-500/15 text-yellow-400'}`}>{b.status}</span>
                                </td>
                            </tr>
                        ))}
                        {!isLoading && bookings.length === 0 && <tr><td colSpan={5} className="py-12 text-center text-zinc-500">No payment records</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
