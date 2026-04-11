import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Scissors } from 'lucide-react';
import api from '../lib/api';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await api.post('/auth/signin', { email, password });
            const user = res.data?.user;

            if (!user || (user.role !== 'super_admin' && user.role !== 'admin')) {
                setError('Access denied. This portal is for Super Admins only.');
                setLoading(false);
                return;
            }

            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || err.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#09090b] p-4">
            <div className="w-full max-w-md bg-[#18181b] rounded-2xl border border-[#27272a] p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-[#F4A460] rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-lg shadow-[#F4A460]/20">
                        <Scissors className="text-[#181A20]" size={28} />
                    </div>
                    <h1 className="text-2xl font-bold text-zinc-100">Barmagly</h1>
                    <p className="text-zinc-400 mt-2 text-sm">Super Admin Portal</p>
                    <div className="mt-3 inline-flex items-center gap-2 bg-[#F4A460]/10 border border-[#F4A460]/20 rounded-full px-4 py-1.5">
                        <div className="w-2 h-2 rounded-full bg-[#F4A460] animate-pulse"></div>
                        <span className="text-[#F4A460] text-xs font-medium">Super Admin Access Only</span>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-5">
                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-[#09090b] border border-[#27272a] text-zinc-100 rounded-xl px-12 py-3.5 focus:outline-none focus:border-[#F4A460] focus:ring-1 focus:ring-[#F4A460] transition-all placeholder:text-zinc-600"
                                placeholder="admin@barmagly.com"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-zinc-400 mb-2">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={20} />
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[#09090b] border border-[#27272a] text-zinc-100 rounded-xl px-12 py-3.5 focus:outline-none focus:border-[#F4A460] focus:ring-1 focus:ring-[#F4A460] transition-all placeholder:text-zinc-600"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#F4A460] hover:bg-[#e8935a] text-[#181A20] font-bold rounded-xl py-3.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg shadow-[#F4A460]/20"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center text-xs text-zinc-600 mt-6">
                    Barmagly Super Admin · All rights reserved
                </p>
            </div>
        </div>
    );
}
