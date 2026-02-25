import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import api from '../lib/api';

export default function Login() {
    const [email, setEmail] = useState('admin@barber.com');
    const [password, setPassword] = useState('admin123');
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

            // Check if user is admin
            if (!user || user.role !== 'admin') {
                setError('Access denied. Admin privileges required.');
                setLoading(false);
                return;
            }

            // Verify session is established before navigating
            const meRes = await api.get('/auth/me');
            if (meRes.data?.user?.role === 'admin') {
                navigate('/');
            } else {
                setError('Session could not be established. Please try again.');
            }
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
                    <div className="w-16 h-16 bg-violet-500 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg shadow-violet-500/20">
                        <Lock className="text-white" size={28} />
                    </div>
                    <h1 className="text-2xl font-bold text-zinc-100">Welcome Back</h1>
                    <p className="text-zinc-400 mt-2">Sign in to your admin dashboard</p>
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
                                className="w-full bg-[#09090b] border border-[#27272a] text-zinc-100 rounded-xl px-12 py-3.5 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-zinc-600"
                                placeholder="admin@barber.com"
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
                                className="w-full bg-[#09090b] border border-[#27272a] text-zinc-100 rounded-xl px-12 py-3.5 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-zinc-600"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-xl py-3.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4 shadow-lg shadow-violet-600/20"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </div>
    );
}
