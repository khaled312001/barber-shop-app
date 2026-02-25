import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Activity, Search, Edit2, Plus, X, Trash2, Scissors } from 'lucide-react';
import api from '../lib/api';

interface Service {
    id: string;
    salonId: string;
    name: string;
    price: number;
    duration: string;
    image: string;
    category: string;
}

interface Salon {
    id: string;
    name: string;
}

export default function Services() {
    const qc = useQueryClient();
    const [searchTerm, setSearchTerm] = React.useState('');
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingService, setEditingService] = React.useState<Service | null>(null);
    const [formData, setFormData] = React.useState({
        salonId: '',
        name: '',
        price: 0,
        duration: '',
        category: '',
        image: ''
    });

    const { data: services, isLoading: servicesLoading } = useQuery<Service[]>({
        queryKey: ['admin-services'],
        queryFn: async () => {
            const { data } = await api.get('/admin/services');
            return data;
        },
    });

    const { data: salons } = useQuery<Salon[]>({
        queryKey: ['admin-salons'],
        queryFn: async () => {
            const { data } = await api.get('/admin/salons');
            return data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/admin/services/${id}`);
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-services'] }),
    });

    const saveMutation = useMutation({
        mutationFn: async (data: any) => {
            if (editingService) {
                await api.put(`/admin/services/${editingService.id}`, data);
            } else {
                await api.post('/admin/services', data);
            }
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-services'] });
            closeModal();
        },
    });

    const handleDelete = (id: string) => {
        if (window.confirm('Delete this service?')) deleteMutation.mutate(id);
    };

    const openModal = (service: Service | null = null) => {
        setEditingService(service);
        if (service) {
            setFormData({
                salonId: service.salonId,
                name: service.name,
                price: service.price,
                duration: service.duration,
                category: service.category || '',
                image: service.image || ''
            });
        } else {
            setFormData({
                salonId: salons?.[0]?.id || '',
                name: '',
                price: 0,
                duration: '',
                category: '',
                image: ''
            });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingService(null);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        saveMutation.mutate(formData);
    };

    const filteredServices = services?.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (servicesLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Activity className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-white">Salon Services</h1>
                    <p className="text-text-muted mt-1">Manage individual haircuts, treatments and beard styles.</p>
                </div>

                <div className="flex gap-4 w-full sm:w-auto">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                        <input
                            type="text"
                            placeholder="Search services..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors text-white"
                        />
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-primary hover:bg-primary-dark text-bg-dark px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap"
                    >
                        <Plus size={18} /> Add Service
                    </button>
                </div>
            </div>

            <div className="bg-bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-border text-text-muted text-sm">
                                <th className="px-6 py-4 font-medium">Service Name</th>
                                <th className="px-6 py-4 font-medium">Salon</th>
                                <th className="px-6 py-4 font-medium">Category</th>
                                <th className="px-6 py-4 font-medium">Price</th>
                                <th className="px-6 py-4 font-medium">Duration</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-border text-white">
                            {filteredServices?.map((s) => (
                                <tr key={s.id} className="hover:bg-white/5 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            {s.image ? (
                                                <img src={s.image} className="w-10 h-10 rounded-lg object-cover bg-bg-dark border border-border" alt={s.name} />
                                            ) : (
                                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                                                    <Scissors size={20} />
                                                </div>
                                            )}
                                            <span className="font-bold">{s.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-text-muted">
                                        {salons?.find(salon => salon.id === s.salonId)?.name || 'Unknown Salon'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 rounded-md bg-white/5 border border-border text-xs uppercase tracking-wider text-text-muted">
                                            {s.category || 'N/A'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-primary">
                                        ${s.price.toFixed(2)}
                                    </td>
                                    <td className="px-6 py-4 text-text-muted">
                                        {s.duration}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button onClick={() => openModal(s)} className="p-2 text-text-muted hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                                                <Edit2 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(s.id)} className="p-2 text-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors">
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
                            <h2 className="text-xl font-bold tracking-tight text-white">{editingService ? 'Edit Service' : 'Add New Service'}</h2>
                            <button onClick={closeModal} className="text-text-muted hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">Salon</label>
                                <select
                                    required
                                    className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors text-white"
                                    value={formData.salonId}
                                    onChange={e => setFormData({ ...formData, salonId: e.target.value })}
                                >
                                    <option value="" disabled>Select a Salon</option>
                                    {salons?.map(salon => (
                                        <option key={salon.id} value={salon.id}>{salon.name}</option>
                                    )) || null}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">Service Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors text-white"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1.5">Price ($)</label>
                                    <input
                                        type="number"
                                        required
                                        step="0.01"
                                        className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors text-white"
                                        value={formData.price}
                                        onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1.5">Duration (e.g. 30 min)</label>
                                    <input
                                        type="text"
                                        required
                                        className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors text-white"
                                        value={formData.duration}
                                        onChange={e => setFormData({ ...formData, duration: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">Category</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Haircut, Beard"
                                    className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors text-white"
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">Image URL</label>
                                <input
                                    type="text"
                                    className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors text-white"
                                    value={formData.image}
                                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button type="button" onClick={closeModal} className="flex-1 bg-transparent border border-border hover:bg-white/5 text-white py-2.5 rounded-lg text-sm font-medium transition-colors">
                                    Cancel
                                </button>
                                <button type="submit" disabled={saveMutation.isPending} className="flex-1 bg-primary hover:bg-primary-dark text-bg-dark py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
                                    {saveMutation.isPending ? 'Saving...' : 'Save Service'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
