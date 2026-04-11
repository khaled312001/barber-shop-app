import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FileText, Download } from 'lucide-react';
import api from '../lib/api';

export default function AdminReports() {
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const { data: bookings = [] } = useQuery({
        queryKey: ['all-bookings'],
        queryFn: async () => { const { data } = await api.get('/admin/bookings'); return data; },
    });

    const filtered = bookings.filter((b: any) => {
        if (dateFrom && b.date < dateFrom) return false;
        if (dateTo && b.date > dateTo) return false;
        return true;
    });

    const revenue = filtered.filter((b: any) => b.status === 'completed').reduce((s: number, b: any) => s + b.totalPrice, 0);
    const completed = filtered.filter((b: any) => b.status === 'completed').length;
    const cancelled = filtered.filter((b: any) => b.status === 'cancelled').length;

    const downloadCsv = () => {
        const rows = [['ID', 'Salon', 'Date', 'Total', 'Status'], ...filtered.map((b: any) => [b.id, b.salonName, b.date, b.totalPrice, b.status])];
        const csv = rows.map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `barmagly-report-${dateFrom || 'all'}.csv`;
        a.click();
    };

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
                <FileText className="text-[#F4A460]" size={24} />
                <div><h1 className="text-2xl font-bold text-white">Reports</h1><p className="text-zinc-400 text-sm">Booking and revenue reports</p></div>
            </div>

            <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-6 mb-6">
                <h2 className="font-bold text-white mb-4">Filter by Date Range</h2>
                <div className="flex flex-wrap gap-4 items-end">
                    <div>
                        <label className="block text-sm text-zinc-400 mb-1.5">From</label>
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-[#181A20] border border-[#35383F] text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#F4A460]" />
                    </div>
                    <div>
                        <label className="block text-sm text-zinc-400 mb-1.5">To</label>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="bg-[#181A20] border border-[#35383F] text-white rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#F4A460]" />
                    </div>
                    <button onClick={downloadCsv} className="flex items-center gap-2 bg-[#F4A460] hover:bg-[#e8935a] text-[#181A20] font-semibold px-4 py-2.5 rounded-xl text-sm transition-colors">
                        <Download size={16} /> Export CSV
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
                {[
                    { label: 'Revenue', value: `$${revenue.toFixed(2)}`, color: 'text-emerald-400' },
                    { label: 'Completed', value: completed, color: 'text-blue-400' },
                    { label: 'Cancelled', value: cancelled, color: 'text-red-400' },
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
                            <th className="text-left px-6 py-4 font-medium">Date</th>
                            <th className="text-left px-6 py-4 font-medium">Total</th>
                            <th className="text-left px-6 py-4 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.slice(0, 50).map((b: any) => (
                            <tr key={b.id} className="border-b border-[#35383F]/50 hover:bg-white/5">
                                <td className="px-6 py-3 text-zinc-300">{b.salonName}</td>
                                <td className="px-6 py-3 text-zinc-400">{b.date}</td>
                                <td className="px-6 py-3 font-semibold text-white">${b.totalPrice.toFixed(2)}</td>
                                <td className="px-6 py-3">
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${b.status === 'completed' ? 'bg-emerald-500/15 text-emerald-400' : b.status === 'cancelled' ? 'bg-red-500/15 text-red-400' : 'bg-[#F4A460]/15 text-[#F4A460]'}`}>{b.status}</span>
                                </td>
                            </tr>
                        ))}
                        {filtered.length === 0 && <tr><td colSpan={4} className="px-6 py-12 text-center text-zinc-500">No bookings in range</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
