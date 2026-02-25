import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Activity, Search, Edit2, Plus, X, Trash2, Ticket } from 'lucide-react';
import api from '../lib/api';

interface Coupon {
    id: string;
    code: string;
    discount: number;
    type: string;
    expiryDate: string;
    usageLimit: number;
    usedCount: number;
    active: boolean;
}

export default function Coupons() {
    const qc = useQueryClient();
    const [searchTerm, setSearchTerm] = React.useState('');
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingCoupon, setEditingCoupon] = React.useState<Coupon | null>(null);
    const [formData, setFormData] = React.useState({
        code: '',
        discount: 0,
        type: 'percentage',
        expiryDate: '',
        usageLimit: 0,
        active: true
    });

    const { data: coupons, isLoading } = useQuery<Coupon[]>({
        queryKey: ['admin-coupons'],
        queryFn: async () => {
            const { data } = await api.get('/admin/coupons');
            return data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/admin/coupons/${id}`);
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-coupons'] }),
    });

    const saveMutation = useMutation({
        mutationFn: async (data: any) => {
            if (editingCoupon) {
                await api.put(`/admin/coupons/${editingCoupon.id}`, data);
            } else {
                await api.post('/admin/coupons', data);
            }
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-coupons'] });
            closeModal();
        },
    });

    const handleDelete = (id: string) => {
        if (window.confirm('Delete this coupon?')) deleteMutation.mutate(id);
    };

    const openModal = (coupon: Coupon | null = null) => {
        setEditingCoupon(coupon);
        if (coupon) {
            setFormData({
                code: coupon.code,
                discount: coupon.discount,
                type: coupon.type,
                expiryDate: coupon.expiryDate,
                usageLimit: coupon.usageLimit,
                active: coupon.active
            });
        } else {
            setFormData({
                code: '',
                discount: 0,
                type: 'percentage',
                expiryDate: '',
                usageLimit: 0,
                active: true
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCoupon(null);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        saveMutation.mutate(formData);
    };

    const filteredCoupons = coupons?.filter(c =>
        c.code.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Coupons & Discounts</h1>

                <div className="flex gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search coupons..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-primary hover:bg-primary-dark text-bg-dark px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap"
                    >
                        <Plus size={18} /> Add Coupon
                    </button>
                </div>
            </div>

            <div className="bg-bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-border text-text-muted text-sm">
                                <th className="px-6 py-4 font-medium">Code</th>
                                <th className="px-6 py-4 font-medium">Discount</th>
                                <th className="px-6 py-4 font-medium">Expiry</th>
                                <th className="px-6 py-4 font-medium">Usage</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-border">
                            {filteredCoupons?.map((c) => (
                                <tr key={c.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                <Ticket size={20} />
                                            </div>
                                            <span className="font-bold text-white uppercase tracking-wider">{c.code}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-white font-medium">
                                            {c.type === 'percentage' ? `${c.discount}%` : `$${c.discount}`}
                                        </span>
                                        <p className="text-text-muted text-xs mt-0.5">{c.type === 'percentage' ? 'Percentage' : 'Fixed Amount'}</p>
                                    </td>
                                    <td className="px-6 py-4 text-text-muted">
                                        {c.expiryDate}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-white">{c.usedCount} / {c.usageLimit === 0 ? '∞' : c.usageLimit}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${c.active ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {c.active ? 'ACTIVE' : 'INACTIVE'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openModal(c)} className="p-2 text-text-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(c.id)} className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-border">
                            <h2 className="text-xl font-bold tracking-tight text-white">{editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}</h2>
                            <button onClick={closeModal} className="text-text-muted hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">Coupon Code</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors text-white"
                                    value={formData.code}
                                    onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1.5">Discount</label>
                                    <input
                                        type="number"
                                        required
                                        className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors text-white"
                                        value={formData.discount}
                                        onChange={e => setFormData({ ...formData, discount: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1.5">Type</label>
                                    <select
                                        className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors text-white"
                                        value={formData.type}
                                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    >
                                        <option value="percentage">Percentage (%)</option>
                                        <option value="fixed">Fixed ($)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">Expiry Date</label>
                                <input
                                    type="date"
                                    required
                                    className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors text-white [color-scheme:dark]"
                                    value={formData.expiryDate}
                                    onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">Usage Limit (0 = Unlimited)</label>
                                <input
                                    type="number"
                                    className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors text-white"
                                    value={formData.usageLimit}
                                    onChange={e => setFormData({ ...formData, usageLimit: parseInt(e.target.value) || 0 })}
                                />
                            </div>

                            <div className="flex items-center gap-3 py-2">
                                <input
                                    type="checkbox"
                                    id="active"
                                    className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-bg-dark"
                                    checked={formData.active}
                                    onChange={e => setFormData({ ...formData, active: e.target.checked })}
                                />
                                <label htmlFor="active" className="text-sm font-medium text-white">Active Coupon</label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={closeModal} className="flex-1 bg-transparent border border-border hover:bg-white/5 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saveMutation.isPending} className="flex-1 bg-primary hover:bg-primary-dark text-bg-dark py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
                                    {saveMutation.isPending ? 'Saving...' : 'Save Coupon'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
