import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Activity, Search, Edit2, Plus, X, Trash2 } from 'lucide-react';
import api from '../lib/api';

interface Booking {
    id: string;
    userId: string;
    salonId: string;
    salonName: string;
    date: string;
    time: string;
    totalPrice: number;
    status: string;
}

export default function Bookings() {
    const qc = useQueryClient();
    const [searchTerm, setSearchTerm] = React.useState('');
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingBooking, setEditingBooking] = React.useState<Booking | null>(null);
    const [formData, setFormData] = React.useState({
        userId: '',
        salonId: '',
        salonName: '',
        date: '',
        time: '',
        totalPrice: 0,
        status: 'upcoming'
    });

    const { data: bookings, isLoading } = useQuery<Booking[]>({
        queryKey: ['admin-bookings'],
        queryFn: async () => {
            const { data } = await api.get('/admin/bookings');
            return data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/admin/bookings/${id}`);
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-bookings'] }),
        onError: (err: any) => alert(err.message),
    });

    const saveMutation = useMutation({
        mutationFn: async (data: any) => {
            if (editingBooking) {
                await api.put(`/admin/bookings/${editingBooking.id}`, data);
            } else {
                await api.post('/admin/bookings', data);
            }
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-bookings'] });
            closeModal();
        },
        onError: (err: any) => alert(err.message),
    });

    const handleDelete = (id: string) => {
        if (window.confirm('Delete this booking?')) deleteMutation.mutate(id);
    };

    const openModal = (booking: Booking | null = null) => {
        setEditingBooking(booking);
        if (booking) {
            setFormData({
                userId: booking.userId,
                salonId: booking.salonId,
                salonName: booking.salonName,
                date: booking.date,
                time: booking.time,
                totalPrice: booking.totalPrice,
                status: booking.status
            });
        } else {
            setFormData({
                userId: '',
                salonId: '',
                salonName: '',
                date: '',
                time: '',
                totalPrice: 0,
                status: 'upcoming'
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingBooking(null);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        saveMutation.mutate(formData);
    };

    const getStatusStyle = (status: string) => {
        switch (status.toLowerCase()) {
            case 'completed': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20';
            default: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
        }
    };

    const filteredBookings = bookings?.filter(b =>
        b.salonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.status.toLowerCase().includes(searchTerm.toLowerCase())
    ).reverse(); // Show newest first

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Activity className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <h1 className="text-3xl font-bold tracking-tight">Booking History</h1>

                <div className="flex gap-4 w-full sm:w-auto mt-4 sm:mt-0">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search by salon or status..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-primary hover:bg-primary-dark text-bg-dark px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap"
                    >
                        <Plus size={18} /> Add Booking
                    </button>
                </div>
            </div>

            <div className="bg-bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-border text-text-muted text-sm">
                                <th className="px-6 py-4 font-medium">Salon</th>
                                <th className="px-6 py-4 font-medium">Date & Time</th>
                                <th className="px-6 py-4 font-medium">Total Price</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-[#27272a]">
                            {filteredBookings?.map((b) => (
                                <tr key={b.id} className="hover:bg-zinc-800/20 transition-colors group">
                                    <td className="px-6 py-4 text-zinc-100 font-bold text-base">{b.salonName}</td>
                                    <td className="px-6 py-4">
                                        <p className="text-zinc-100 font-medium mb-1">{b.date}</p>
                                        <p className="text-zinc-400 text-xs">{b.time}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-primary font-bold">${b.totalPrice.toFixed(2)}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${getStatusStyle(b.status)}`}>
                                            {b.status.toUpperCase()}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openModal(b)}
                                                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-colors focus:opacity-100"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(b.id)}
                                                className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors focus:opacity-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredBookings?.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                                        No bookings found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-bg-card border border-border rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                        <div className="flex justify-between items-center p-6 border-b border-border shrink-0">
                            <h2 className="text-xl font-bold tracking-tight text-white">{editingBooking ? 'Edit Booking' : 'Add New Booking'}</h2>
                            <button onClick={closeModal} className="text-text-muted hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="overflow-y-auto p-6">
                            <form id="bookingForm" onSubmit={handleSave} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-muted mb-1.5">User ID</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.userId}
                                            onChange={e => setFormData({ ...formData, userId: e.target.value })}
                                            className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-muted mb-1.5">Salon ID</label>
                                        <input
                                            type="text"
                                            required
                                            value={formData.salonId}
                                            onChange={e => setFormData({ ...formData, salonId: e.target.value })}
                                            className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors text-white"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1.5">Salon Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.salonName}
                                        onChange={e => setFormData({ ...formData, salonName: e.target.value })}
                                        className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors text-white"
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-muted mb-1.5">Date</label>
                                        <input
                                            type="date"
                                            required
                                            value={formData.date}
                                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors [color-scheme:dark] text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-muted mb-1.5">Time</label>
                                        <input
                                            type="time"
                                            required
                                            value={formData.time}
                                            onChange={e => setFormData({ ...formData, time: e.target.value })}
                                            className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors [color-scheme:dark] text-white"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-muted mb-1.5">Total Price ($)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            required
                                            value={formData.totalPrice}
                                            onChange={e => setFormData({ ...formData, totalPrice: parseFloat(e.target.value) || 0 })}
                                            className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors text-white"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-muted mb-1.5">Status</label>
                                        <select
                                            value={formData.status}
                                            onChange={e => setFormData({ ...formData, status: e.target.value })}
                                            className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors text-white"
                                        >
                                            <option value="upcoming">Upcoming</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                            <option value="pending">Pending</option>
                                        </select>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="p-6 border-t border-border shrink-0">
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 bg-transparent border border-border hover:bg-white/5 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    form="bookingForm"
                                    disabled={saveMutation.isPending}
                                    className="flex-1 bg-primary hover:bg-primary-dark text-bg-dark py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                                >
                                    {saveMutation.isPending ? 'Saving...' : 'Save Booking'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
