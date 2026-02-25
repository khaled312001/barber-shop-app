import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Activity, Trash2, Search, Edit2, Plus, X } from 'lucide-react';
import api from '../lib/api';

interface UserData {
    id: string;
    fullName: string;
    email: string;
    role: string | null;
    createdAt: string;
}

export default function Users() {
    const qc = useQueryClient();
    const [searchTerm, setSearchTerm] = React.useState('');
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [editingUser, setEditingUser] = React.useState<UserData | null>(null);
    const [formData, setFormData] = React.useState({ fullName: '', email: '', role: 'user', password: '' });

    const { data: users, isLoading } = useQuery<UserData[]>({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const { data } = await api.get('/admin/users');
            return data;
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            await api.delete(`/admin/users/${id}`);
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
        onError: (err: any) => alert(err.message),
    });

    const saveMutation = useMutation({
        mutationFn: async (data: any) => {
            if (editingUser) {
                await api.put(`/admin/users/${editingUser.id}`, {
                    fullName: data.fullName,
                    email: data.email,
                    role: data.role
                });
            } else {
                await api.post('/admin/users', data);
            }
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-users'] });
            closeModal();
        },
        onError: (err: any) => alert(err.message),
    });

    const handleDelete = (id: string) => {
        if (window.confirm('Delete this user?')) deleteMutation.mutate(id);
    };

    const openModal = (user: UserData | null = null) => {
        setEditingUser(user);
        if (user) {
            setFormData({ fullName: user.fullName, email: user.email, role: user.role || 'user', password: '' });
        } else {
            setFormData({ fullName: '', email: '', role: 'user', password: '' });
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        saveMutation.mutate(formData);
    };

    const filteredUsers = users?.filter(u =>
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                <h1 className="text-3xl font-bold tracking-tight">Manage Users</h1>

                <div className="flex gap-4 w-full sm:w-auto mt-4 sm:mt-0">
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-bg-card border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-colors"
                        />
                    </div>
                    <button
                        onClick={() => openModal()}
                        className="bg-primary hover:bg-primary-dark text-bg-dark px-4 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors whitespace-nowrap"
                    >
                        <Plus size={18} /> Add User
                    </button>
                </div>
            </div>

            <div className="bg-bg-card border border-border rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white/5 border-b border-border text-text-muted text-sm">
                                <th className="px-6 py-4 font-medium">Full Name</th>
                                <th className="px-6 py-4 font-medium">Email Address</th>
                                <th className="px-6 py-4 font-medium">Role</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm divide-y divide-[#27272a]">
                            {filteredUsers?.map((u) => (
                                <tr key={u.id} className="hover:bg-zinc-800/20 transition-colors group">
                                    <td className="px-6 py-4 text-zinc-100 font-medium">{u.fullName}</td>
                                    <td className="px-6 py-4 text-zinc-400">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full ${u.role === 'admin'
                                            ? 'bg-primary/10 text-primary border border-primary/20'
                                            : 'bg-white/5 text-text-muted border border-border'
                                            }`}>
                                            {u.role?.toUpperCase() || 'USER'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openModal(u)}
                                                className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-lg transition-colors focus:opacity-100"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(u.id)}
                                                className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors focus:opacity-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers?.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                                        No users found matching your search.
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
                            <h2 className="text-xl font-bold tracking-tight text-white">{editingUser ? 'Edit User' : 'Add New User'}</h2>
                            <button onClick={closeModal} className="text-text-muted hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSave} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors text-white"
                                />
                            </div>

                            {!editingUser && (
                                <div>
                                    <label className="block text-sm font-medium text-text-muted mb-1.5">Temporary Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                        className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors text-white"
                                    />
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">Role</label>
                                <select
                                    value={formData.role}
                                    onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full bg-bg-dark border border-border rounded-lg px-4 py-2.5 text-sm focus:border-primary focus:outline-none transition-colors text-white"
                                >
                                    <option value="user">User</option>
                                    <option value="admin">Admin</option>
                                </select>
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
                                    {saveMutation.isPending ? 'Saving...' : 'Save User'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
