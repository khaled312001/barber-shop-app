import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Activity, Trash2, Search, Star, Edit2, Plus, X } from 'lucide-react';
import api from '../lib/api';

interface Salon {
    id: string;
    name: string;
    image: string;
    address: string;
    rating: number;
}

export default function Salons() {
    const qc = useQueryClient();
    const [searchTerm, setSearchTerm] = React.useState('');
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingSalon, setEditingSalon] = React.useState<Salon | null>(null);
    const [formData, setFormData] = React.useState({ name: '', address: '', image: '', rating: 0 });
    const [isUploading, setIsUploading] = React.useState(false);
    const [uploadError, setUploadError] = React.useState('');

    const { data: salons, isLoading } = useQuery<Salon[]>({
        queryKey: ['admin-salons'],
        queryFn: async () => {
            const { data } = await api.get('/admin/salons');
            return data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/admin/salons/${id}`);
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-salons'] }),
        onError: (err: any) => alert(err.message),
    });

    const saveMutation = useMutation({
        mutationFn: async (data: any) => {
            if (editingSalon) {
                await api.put(`/admin/salons/${editingSalon.id}`, data);
            } else {
                await api.post('/admin/salons', data);
            }
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-salons'] });
            closeModal();
        },
        onError: (err: any) => alert(err.message),
    });

    const handleDelete = (id: string, name: string) => {
        if (window.confirm(`Delete salon "${name}"?`)) deleteMutation.mutate(id);
    };

    const openModal = (salon: Salon | null = null) => {
        setEditingSalon(salon);
        if (salon) {
            setFormData({ name: salon.name, address: salon.address, image: salon.image || '', rating: salon.rating || 0 });
        } else {
            setFormData({ name: '', address: '', image: '', rating: 5 });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingSalon(null);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        saveMutation.mutate(formData);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Basic validation
        if (!file.type.startsWith('image/')) {
            setUploadError('Please select a valid image file');
            return;
        }

        setIsUploading(true);
        setUploadError('');

        try {
            const formDataPayload = new FormData();
            formDataPayload.append('image', file);

            // Post directly to our new endpoint using the preset api client
            // because api.ts has headers { 'Content-Type': 'application/json' }
            // we override it for the form data
            const res = await api.post('/admin/upload', formDataPayload, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Set the returned public URL into our formData
            setFormData(prev => ({ ...prev, image: res.data.url }));
        } catch (err: any) {
            console.error('Upload Error:', err);
            setUploadError(err.response?.data?.message || 'Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const filteredSalons = salons?.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.address.toLowerCase().includes(searchTerm.toLowerCase())
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
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Manage Salons</h1>

                <div className="flex gap-4 w-full sm:w-auto mt-4 sm:mt-0">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search salons..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-primary hover:bg-primary-dark text-bg-dark px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap"
                    >
                        <Plus size={18} /> Add Salon
                    </button>
                </div>
            </div>

            <div className="bg-bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-border text-text-muted text-sm">
                                <th className="px-6 py-4 font-medium w-16">Image</th>
                                <th className="px-6 py-4 font-medium">Salon Details</th>
                                <th className="px-6 py-4 font-medium">Rating</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-[#27272a]">
                            {filteredSalons?.map((s) => (
                                <tr key={s.id} className="hover:bg-zinc-800/20 transition-colors group">
                                    <td className="px-6 py-4">
                                        <img src={s.image} alt={s.name} className="w-12 h-12 rounded-lg object-cover bg-zinc-800" />
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-zinc-100 font-bold text-base mb-1">{s.name}</p>
                                        <p className="text-zinc-400 text-xs">{s.address}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-1.5 text-zinc-100 font-bold">
                                            <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                            {s.rating}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openModal(s)}
                                                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-colors focus:opacity-100"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(s.id, s.name)}
                                                className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors focus:opacity-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredSalons?.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                                        No salons found matching your search.
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
                    <div className="bg-bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-border">
                            <h2 className="text-xl font-bold tracking-tight text-white">{editingSalon ? 'Edit Salon' : 'Add New Salon'}</h2>
                            <button onClick={closeModal} className="text-text-muted hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">Salon Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">Address</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.address}
                                    onChange={e => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">Salon Image</label>
                                <div className="flex flex-col gap-2">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={isUploading}
                                        className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2 text-sm focus:border-primary focus:outline-none transition-colors text-white file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-primary file:text-bg-dark hover:file:bg-primary-dark"
                                    />
                                    {isUploading && <p className="text-xs text-primary">Uploading image...</p>}
                                    {uploadError && <p className="text-xs text-red-400">{uploadError}</p>}
                                    {formData.image && !isUploading && (
                                        <div className="mt-2 h-24 w-24 rounded-xl overflow-hidden border border-[#27272a] relative group">
                                            <img src={formData.image} alt="Preview" className="w-full h-full object-cover" />
                                            {/* Optional remove button can be added here if desired */}
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">Rating (0-5)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="5"
                                    step="0.1"
                                    required
                                    value={formData.rating}
                                    onChange={e => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                                    className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors text-white"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="flex-1 bg-transparent border border-border hover:bg-white/5 text-white py-2.5 rounded-lg text-sm font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={saveMutation.isPending}
                                    className="flex-1 bg-primary hover:bg-primary-dark text-bg-dark py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50"
                                >
                                    {saveMutation.isPending ? 'Saving...' : 'Save Salon'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
