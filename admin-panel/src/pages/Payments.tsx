import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Activity, Search, CreditCard, Download } from 'lucide-react';
import api from '../lib/api';

interface Payment {
    id: string;
    salonName: string;
    date: string;
    time: string;
    totalPrice: number;
    paymentMethod: string;
    status: string;
}

export default function Payments() {
    const [searchTerm, setSearchTerm] = React.useState('');

    const { data: payments, isLoading } = useQuery<Payment[]>({
        queryKey: ['admin-payments'],
        queryFn: async () => {
            const { data } = await api.get('/admin/payments');
            return data;
        },
    });

    const filteredPayments = payments?.filter(p =>
        p.salonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase())
    ).reverse();

    const totalRevenue = payments?.reduce((sum, p) => sum + p.totalPrice, 0) || 0;

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Activity className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Financial Overview</h1>
                    <p className="text-text-muted mt-1">Monitor all bookings and transaction logs.</p>
                </div>

                <div className="flex gap-4 w-full sm:w-auto">
                    <button className="bg-white/5 hover:bg-white/10 text-white px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors border border-border">
                        <Download size={18} /> Export CSV
                    </button>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-bg-card border border-border rounded-2xl p-6 shadow-xl">
                    <p className="text-text-muted text-sm font-medium">Total Revenue</p>
                    <p className="text-3xl font-bold text-emerald-500 mt-2 tracking-tight">${totalRevenue.toFixed(2)}</p>
                </div>
                <div className="bg-bg-card border border-border rounded-2xl p-6 shadow-xl">
                    <p className="text-text-muted text-sm font-medium">Platform Fees (10%)</p>
                    <p className="text-3xl font-bold text-primary mt-2 tracking-tight">${(totalRevenue * 0.1).toFixed(2)}</p>
                </div>
                <div className="bg-bg-card border border-border rounded-2xl p-6 shadow-xl">
                    <p className="text-text-muted text-sm font-medium">Successful Transactions</p>
                    <p className="text-3xl font-bold text-white mt-2 tracking-tight">{payments?.length || 0}</p>
                </div>
            </div>

            <div className="bg-bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-border text-text-muted text-sm">
                                <th className="px-6 py-4 font-medium">Transaction ID</th>
                                <th className="px-6 py-4 font-medium">Salon</th>
                                <th className="px-6 py-4 font-medium">Amount</th>
                                <th className="px-6 py-4 font-medium">Method</th>
                                <th className="px-6 py-4 font-medium">Date</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-border">
                            {filteredPayments?.map((p) => (
                                <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4 font-mono text-xs text-text-muted">
                                        TX-{p.id.split('-')[0].toUpperCase()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="font-bold text-white">{p.salonName}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-white font-bold">${p.totalPrice.toFixed(2)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-text-muted uppercase text-xs font-bold">
                                            <CreditCard size={14} className="text-primary" />
                                            {p.paymentMethod}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-text-muted">
                                        {p.date}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${p.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                                            {p.status.toUpperCase()}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filteredPayments?.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-text-muted">
                                        No financial records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
