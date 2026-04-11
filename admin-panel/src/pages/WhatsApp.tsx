import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Send, Settings, Users, Bell, CheckCircle, Clock } from 'lucide-react';
import api from '../lib/api';

export default function WhatsApp() {
    const qc = useQueryClient();
    const [message, setMessage] = React.useState('');
    const [selectedTemplate, setSelectedTemplate] = React.useState('');

    const { data: stats } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => { const { data } = await api.get('/admin/stats'); return data; },
    });

    const broadcastMutation = useMutation({
        mutationFn: async (data: { message: string; type: string }) => {
            await api.post('/admin/messages/broadcast', data);
        },
        onSuccess: () => {
            setMessage('');
            alert('Broadcast message sent to all users!');
            qc.invalidateQueries({ queryKey: ['admin-stats'] });
        },
        onError: (err: any) => alert(err.response?.data?.message || 'Failed to send'),
    });

    const templates = [
        { id: 'booking_confirm', label: 'Booking Confirmation', text: 'Your booking at {salon} on {date} at {time} has been confirmed. See you soon!' },
        { id: 'booking_reminder', label: 'Appointment Reminder', text: 'Reminder: Your appointment at {salon} is tomorrow at {time}. Reply CANCEL to cancel.' },
        { id: 'promo', label: 'Promotional Offer', text: 'Special offer! Get {discount}% off your next booking. Use code {code} at checkout. Limited time!' },
        { id: 'welcome', label: 'Welcome Message', text: 'Welcome to Barmagly! Book your next haircut in seconds. Explore salons near you today.' },
    ];

    const handleTemplateSelect = (templateId: string) => {
        const tpl = templates.find(t => t.id === templateId);
        if (tpl) {
            setMessage(tpl.text);
            setSelectedTemplate(templateId);
        }
    };

    const handleSend = () => {
        if (!message.trim()) return;
        broadcastMutation.mutate({ message, type: 'whatsapp_broadcast' });
    };

    const features = [
        { icon: CheckCircle, title: 'Booking Confirmations', desc: 'Auto-send when bookings are confirmed', status: 'Active' },
        { icon: Clock, title: 'Appointment Reminders', desc: '24-hour advance reminders', status: 'Active' },
        { icon: Bell, title: 'Platform Notifications', desc: 'System alerts and updates', status: 'Active' },
        { icon: Send, title: 'Broadcast Messages', desc: 'Send mass notifications to users', status: 'Ready' },
    ];

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
                <div className="p-3 bg-[#25D366]/10 rounded-xl">
                    <MessageCircle className="text-[#25D366]" size={24} />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">WhatsApp Integration</h1>
                    <p className="text-zinc-400 text-sm">Manage WhatsApp messaging and notifications</p>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#25D366]/10 rounded-lg"><Users size={18} className="text-[#25D366]" /></div>
                        <div>
                            <p className="text-zinc-400 text-sm">Total Users</p>
                            <p className="text-xl font-bold text-white">{stats?.totalUsers ?? 0}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-500/10 rounded-lg"><Send size={18} className="text-blue-500" /></div>
                        <div>
                            <p className="text-zinc-400 text-sm">Messages Sent</p>
                            <p className="text-xl font-bold text-white">{stats?.totalMessages ?? 0}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-5">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg"><CheckCircle size={18} className="text-emerald-500" /></div>
                        <div>
                            <p className="text-zinc-400 text-sm">Active Bookings</p>
                            <p className="text-xl font-bold text-white">{stats?.pendingBookings ?? 0}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Features */}
                <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Settings size={18} className="text-[#F4A460]" /> Notification Channels
                    </h2>
                    <div className="space-y-3">
                        {features.map((f, i) => {
                            const Icon = f.icon;
                            return (
                                <div key={i} className="flex items-center gap-4 p-4 bg-[#181A20] rounded-xl">
                                    <div className="p-2 bg-[#25D366]/10 rounded-lg"><Icon size={18} className="text-[#25D366]" /></div>
                                    <div className="flex-1">
                                        <p className="text-white text-sm font-semibold">{f.title}</p>
                                        <p className="text-zinc-500 text-xs">{f.desc}</p>
                                    </div>
                                    <span className={`text-xs font-bold px-3 py-1 rounded-full ${f.status === 'Active' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#F4A460]/10 text-[#F4A460]'}`}>
                                        {f.status}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Broadcast */}
                <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Send size={18} className="text-[#F4A460]" /> Send Broadcast
                    </h2>

                    <div className="mb-4">
                        <label className="block text-sm text-zinc-400 mb-2">Message Template</label>
                        <select
                            value={selectedTemplate}
                            onChange={(e) => handleTemplateSelect(e.target.value)}
                            className="w-full bg-[#181A20] border border-[#35383F] rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#F4A460]"
                        >
                            <option value="">Select a template...</option>
                            {templates.map(t => (
                                <option key={t.id} value={t.id}>{t.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-sm text-zinc-400 mb-2">Message</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={5}
                            placeholder="Type your broadcast message..."
                            className="w-full bg-[#181A20] border border-[#35383F] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#F4A460] resize-none"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-xs text-zinc-500">
                            Will be sent to {stats?.totalUsers ?? 0} users
                        </p>
                        <button
                            onClick={handleSend}
                            disabled={!message.trim() || broadcastMutation.isPending}
                            className="bg-[#25D366] hover:bg-[#1da851] text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
                        >
                            <Send size={16} />
                            {broadcastMutation.isPending ? 'Sending...' : 'Send Broadcast'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
