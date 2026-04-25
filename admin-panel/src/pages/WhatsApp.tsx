import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MessageCircle, Send, Settings, Users, Bell, CheckCircle, Clock, Phone, Link, Webhook, TestTube, Save, ExternalLink } from 'lucide-react';
import api from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';

export default function WhatsApp() {
    const { t } = useLanguage();
    const qc = useQueryClient();
    const [message, setMessage] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [testPhone, setTestPhone] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'config' | 'broadcast'>('overview');

    // Config form
    const [config, setConfig] = useState({
        whatsapp_enabled: 'false',
        whatsapp_admin_number: '',
        whatsapp_api_token: '',
        whatsapp_phone_id: '',
        whatsapp_webhook_url: '',
    });

    const { data: stats } = useQuery({
        queryKey: ['admin-stats'],
        queryFn: async () => { const { data } = await api.get('/admin/stats'); return data; },
    });

    const { data: waConfig } = useQuery({
        queryKey: ['whatsapp-config'],
        queryFn: async () => { const { data } = await api.get('/admin/whatsapp/config'); return data; },
    });

    useEffect(() => {
        if (waConfig) {
            setConfig(prev => ({ ...prev, ...waConfig }));
        }
    }, [waConfig]);

    const saveConfig = useMutation({
        mutationFn: async () => { await api.post('/admin/whatsapp/config', config); },
        onSuccess: () => {
            alert('WhatsApp configuration saved!');
            qc.invalidateQueries({ queryKey: ['whatsapp-config'] });
        },
        onError: (err: any) => alert(err.response?.data?.message || 'Failed to save'),
    });

    const testMessage = useMutation({
        mutationFn: async () => {
            const { data } = await api.post('/admin/whatsapp/test', { phone: testPhone, message: 'Test message from Barmagly Salon!' });
            return data;
        },
        onSuccess: (data) => alert(data.message || 'Test sent!'),
        onError: (err: any) => alert(err.response?.data?.message || 'Test failed'),
    });

    const broadcastMutation = useMutation({
        mutationFn: async () => {
            await api.post('/admin/whatsapp/broadcast', { content: message, targetUserId: 'all' });
        },
        onSuccess: () => {
            setMessage('');
            alert(t('broadcast_sent'));
            qc.invalidateQueries({ queryKey: ['admin-stats'] });
        },
        onError: (err: any) => alert(err.response?.data?.message || 'Failed to send'),
    });

    const templates = [
        { id: 'booking_confirm', label: 'Booking Confirmation', text: 'Your booking at {salon} on {date} at {time} has been confirmed. See you soon!' },
        { id: 'booking_reminder', label: 'Appointment Reminder', text: 'Reminder: Your appointment is tomorrow at {time}. Reply CANCEL to cancel.' },
        { id: 'promo', label: 'Promotional Offer', text: 'Special offer! Get {discount}% off your next booking. Use code {code}. Limited time!' },
        { id: 'welcome', label: 'Welcome Message', text: 'Welcome to Barmagly! Book your next haircut in seconds. Explore salons near you today.' },
    ];

    const features = [
        { icon: CheckCircle, title: t('booking_confirmations'), desc: t('auto_send_confirmations'), enabled: config.whatsapp_enabled === 'true' },
        { icon: Clock, title: t('appointment_reminders'), desc: t('advance_reminders'), enabled: config.whatsapp_enabled === 'true' },
        { icon: Bell, title: t('platform_notifications'), desc: t('system_alerts'), enabled: config.whatsapp_enabled === 'true' },
        { icon: Send, title: t('broadcast_messages'), desc: t('send_mass_notifications'), enabled: true },
    ];

    const inputClass = "w-full bg-[#181A20] border border-[#35383F] text-white rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#25D366]";
    const isConfigured = config.whatsapp_admin_number && (config.whatsapp_api_token || config.whatsapp_webhook_url);

    return (
        <div className="p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-[#25D366]/10 rounded-xl">
                        <MessageCircle className="text-[#25D366]" size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">{t('whatsapp_integration')}</h1>
                        <p className="text-zinc-400 text-sm">{t('whatsapp_desc')}</p>
                    </div>
                </div>
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${isConfigured ? 'bg-[#25D366]/10 text-[#25D366]' : 'bg-red-500/10 text-red-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${isConfigured ? 'bg-[#25D366] animate-pulse' : 'bg-red-400'}`} />
                    {isConfigured ? 'Connected' : 'Not Configured'}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 mb-6">
                {(['overview', 'config', 'broadcast'] as const).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)}
                        className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${activeTab === tab ? 'bg-[#25D366] text-white' : 'bg-[#1F222A] text-zinc-400 hover:text-white border border-[#35383F]'}`}>
                        {tab === 'overview' ? 'Overview' : tab === 'config' ? 'Configuration' : 'Broadcast'}
                    </button>
                ))}
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
                <>
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                        <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-[#25D366]/10 rounded-lg"><Users size={18} className="text-[#25D366]" /></div>
                                <div><p className="text-zinc-400 text-sm">{t('total_users')}</p><p className="text-xl font-bold text-white">{stats?.totalUsers ?? 0}</p></div>
                            </div>
                        </div>
                        <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-500/10 rounded-lg"><Send size={18} className="text-blue-500" /></div>
                                <div><p className="text-zinc-400 text-sm">{t('messages_sent')}</p><p className="text-xl font-bold text-white">{stats?.totalMessages ?? 0}</p></div>
                            </div>
                        </div>
                        <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-emerald-500/10 rounded-lg"><CheckCircle size={18} className="text-emerald-500" /></div>
                                <div><p className="text-zinc-400 text-sm">{t('active_bookings')}</p><p className="text-xl font-bold text-white">{stats?.pendingBookings ?? 0}</p></div>
                            </div>
                        </div>
                    </div>

                    {/* Features */}
                    <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Settings size={18} className="text-[#F4A460]" /> {t('notification_channels')}
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
                                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${f.enabled ? 'bg-emerald-500/10 text-emerald-400' : 'bg-zinc-700/30 text-zinc-500'}`}>
                                            {f.enabled ? 'Active' : 'Inactive'}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </>
            )}

            {/* Config Tab */}
            {activeTab === 'config' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Connection Settings */}
                    <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                            <Settings size={18} className="text-[#25D366]" /> Connection Settings
                        </h2>

                        <div className="mb-5">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className={`w-12 h-6 rounded-full transition-colors relative ${config.whatsapp_enabled === 'true' ? 'bg-[#25D366]' : 'bg-zinc-700'}`}
                                    onClick={() => setConfig(p => ({ ...p, whatsapp_enabled: p.whatsapp_enabled === 'true' ? 'false' : 'true' }))}>
                                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${config.whatsapp_enabled === 'true' ? 'translate-x-6' : 'translate-x-0.5'}`} />
                                </div>
                                <span className="text-white font-semibold">Enable WhatsApp Notifications</span>
                            </label>
                            <p className="text-zinc-500 text-xs mt-1 ml-15">Auto-send booking confirmations, reminders, and alerts</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm text-zinc-400 mb-1.5 flex items-center gap-1.5"><Phone size={14} /> Admin WhatsApp Number</label>
                            <input className={inputClass} placeholder="+41 79 123 4567" value={config.whatsapp_admin_number}
                                onChange={e => setConfig(p => ({ ...p, whatsapp_admin_number: e.target.value }))} />
                            <p className="text-zinc-600 text-xs mt-1">Super admin receives all system notifications here</p>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm text-zinc-400 mb-1.5 flex items-center gap-1.5"><Link size={14} /> WhatsApp Cloud API Token</label>
                            <input className={inputClass} type="password" placeholder="EAAxxxxxxx..." value={config.whatsapp_api_token}
                                onChange={e => setConfig(p => ({ ...p, whatsapp_api_token: e.target.value }))} />
                            <a href="https://developers.facebook.com/docs/whatsapp/cloud-api/get-started" target="_blank" rel="noopener noreferrer"
                                className="text-[#25D366] text-xs mt-1 flex items-center gap-1 hover:underline">
                                <ExternalLink size={10} /> Get your API token from Meta
                            </a>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm text-zinc-400 mb-1.5">Phone Number ID</label>
                            <input className={inputClass} placeholder="1234567890" value={config.whatsapp_phone_id}
                                onChange={e => setConfig(p => ({ ...p, whatsapp_phone_id: e.target.value }))} />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm text-zinc-400 mb-1.5 flex items-center gap-1.5"><Webhook size={14} /> Webhook URL (Alternative)</label>
                            <input className={inputClass} placeholder="https://your-gateway.com/send" value={config.whatsapp_webhook_url}
                                onChange={e => setConfig(p => ({ ...p, whatsapp_webhook_url: e.target.value }))} />
                            <p className="text-zinc-600 text-xs mt-1">Use a custom WhatsApp gateway webhook instead of Cloud API</p>
                        </div>

                        <button onClick={() => saveConfig.mutate()} disabled={saveConfig.isPending}
                            className="w-full bg-[#25D366] hover:bg-[#1da851] text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50">
                            <Save size={16} /> {saveConfig.isPending ? 'Saving...' : 'Save Configuration'}
                        </button>
                    </div>

                    {/* Test & Info */}
                    <div className="space-y-6">
                        {/* Test Message */}
                        <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                                <TestTube size={18} className="text-[#F4A460]" /> Test Message
                            </h2>
                            <div className="mb-3">
                                <input className={inputClass} placeholder="+41 79 123 4567" value={testPhone}
                                    onChange={e => setTestPhone(e.target.value)} />
                            </div>
                            <button onClick={() => testMessage.mutate()} disabled={!testPhone || testMessage.isPending}
                                className="w-full bg-[#F4A460] hover:bg-[#e8935a] text-[#181A20] px-4 py-2.5 rounded-xl text-sm font-bold disabled:opacity-50">
                                {testMessage.isPending ? 'Sending...' : 'Send Test Message'}
                            </button>
                        </div>

                        {/* How it works */}
                        <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-6">
                            <h2 className="text-lg font-bold text-white mb-4">How It Works</h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center text-xs font-bold shrink-0">1</div>
                                    <p className="text-zinc-400">Set up a <a href="https://business.whatsapp.com/" target="_blank" rel="noopener noreferrer" className="text-[#25D366] hover:underline">WhatsApp Business</a> account and get your Cloud API token</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center text-xs font-bold shrink-0">2</div>
                                    <p className="text-zinc-400">Enter your API token and Phone Number ID above</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center text-xs font-bold shrink-0">3</div>
                                    <p className="text-zinc-400">Enable notifications and send a test message to verify</p>
                                </div>
                                <div className="flex gap-3">
                                    <div className="w-6 h-6 rounded-full bg-[#25D366]/20 text-[#25D366] flex items-center justify-center text-xs font-bold shrink-0">4</div>
                                    <p className="text-zinc-400">All bookings, messages, and alerts will be forwarded to WhatsApp automatically</p>
                                </div>
                            </div>
                            <div className="mt-4 p-3 bg-[#181A20] rounded-xl">
                                <p className="text-zinc-500 text-xs">
                                    <strong className="text-zinc-400">Alternative:</strong> Use a custom webhook URL to connect any WhatsApp gateway (e.g., wppconnect-server, Baileys, etc.)
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Broadcast Tab */}
            {activeTab === 'broadcast' && (
                <div className="max-w-2xl mx-auto">
                    <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-6">
                        <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <Send size={18} className="text-[#F4A460]" /> {t('send_broadcast')}
                        </h2>

                        <div className="mb-4">
                            <label className="block text-sm text-zinc-400 mb-2">{t('message_template')}</label>
                            <select value={selectedTemplate}
                                onChange={(e) => { const tpl = templates.find(t => t.id === e.target.value); if (tpl) { setMessage(tpl.text); setSelectedTemplate(tpl.id); } }}
                                className={inputClass}>
                                <option value="">{t('select_template')}</option>
                                {templates.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                            </select>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm text-zinc-400 mb-2">{t('message')}</label>
                            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={5}
                                placeholder="Type your broadcast message..."
                                className={`${inputClass} resize-none`} />
                        </div>

                        <div className="flex items-center justify-between">
                            <p className="text-xs text-zinc-500">Sent to {stats?.totalUsers ?? 0} users (in-app + WhatsApp)</p>
                            <button onClick={() => broadcastMutation.mutate()} disabled={!message.trim() || broadcastMutation.isPending}
                                className="bg-[#25D366] hover:bg-[#1da851] text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-50">
                                <Send size={16} /> {broadcastMutation.isPending ? t('loading') : t('send_broadcast')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
