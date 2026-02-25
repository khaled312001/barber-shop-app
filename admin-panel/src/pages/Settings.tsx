import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Activity, Save, Globe, Shield, Bell, Phone, Info } from 'lucide-react';
import api from '../lib/api';

interface Setting {
    id: string;
    key: string;
    value: string;
    description: string;
}

export default function Settings() {
    const qc = useQueryClient();
    const [activeTab, setActiveTab] = React.useState('general');

    const { data: settings, isLoading } = useQuery<Setting[]>({
        queryKey: ['admin-settings'],
        queryFn: async () => {
            const { data } = await api.get('/admin/settings');
            return data;
        },
    });

    const saveMutation = useMutation({
        mutationFn: async (data: { key: string; value: string; description: string }) => {
            await api.post('/admin/settings', data);
        },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-settings'] }),
    });

    const getSetting = (key: string) => settings?.find(s => s.key === key)?.value || '';

    const handleSave = (key: string, value: string, description: string) => {
        saveMutation.mutate({ key, value, description });
    };

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Activity className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    const tabs = [
        { id: 'general', label: 'General Info', icon: Globe },
        { id: 'security', label: 'Security', icon: Shield },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'contact', label: 'Contact Details', icon: Phone },
    ];

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-6 sm:mb-8">System Settings</h1>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Sidebar Tabs */}
                <div className="w-full md:w-64 space-y-1">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium text-sm ${activeTab === tab.id
                                ? 'bg-primary text-bg-dark'
                                : 'text-text-muted hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="flex-1 bg-bg-card border border-border rounded-2xl p-8 shadow-xl">
                    {activeTab === 'general' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Globe className="text-primary" size={20} /> General Configuration
                            </h2>
                            <div className="space-y-4">
                                <SettingItem
                                    label="Application Name"
                                    value={getSetting('app_name') || 'Casca Barber'}
                                    onSave={(val) => handleSave('app_name', val, 'Global application name.')}
                                />
                                <SettingItem
                                    label="Maintenance Mode"
                                    value={getSetting('maintenance_mode') || 'OFF'}
                                    type="select"
                                    options={['ON', 'OFF']}
                                    onSave={(val) => handleSave('maintenance_mode', val, 'Puts the app in maintenance mode.')}
                                />
                                <SettingItem
                                    label="Primary Currency"
                                    value={getSetting('currency') || 'USD'}
                                    onSave={(val) => handleSave('currency', val, 'Base currency for payments.')}
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'contact' && (
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <Phone className="text-primary" size={20} /> Contact Information
                            </h2>
                            <div className="space-y-4">
                                <SettingItem
                                    label="Support Email"
                                    value={getSetting('support_email') || 'support@casca.com'}
                                    onSave={(val) => handleSave('support_email', val, 'Customer support email address.')}
                                />
                                <SettingItem
                                    label="Contact Number"
                                    value={getSetting('contact_phone') || '+1 234 567 890'}
                                    onSave={(val) => handleSave('contact_phone', val, 'Public contact phone.')}
                                />
                            </div>
                        </div>
                    )}

                    {(activeTab === 'security' || activeTab === 'notifications') && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <Info className="text-text-muted mb-4" size={40} />
                            <h3 className="text-lg font-bold text-white mb-1">Coming Soon</h3>
                            <p className="text-sm text-text-muted max-w-xs">These advanced settings are being prepared and will be available in the next update.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SettingItem({ label, value, onSave, type = 'text', options = [] }: { label: string; value: string; onSave: (val: string) => void; type?: string; options?: string[] }) {
    const [val, setVal] = React.useState(value);
    const hasChanged = val !== value;

    return (
        <div className="group">
            <label className="block text-sm font-medium text-text-muted mb-2">{label}</label>
            <div className="flex gap-3">
                {type === 'select' ? (
                    <select
                        className="flex-1 bg-bg-dark border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:border-primary focus:outline-none transition-colors"
                        value={val}
                        onChange={(e) => setVal(e.target.value)}
                    >
                        {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                ) : (
                    <input
                        type="text"
                        className="flex-1 bg-bg-dark border border-border rounded-lg px-4 py-2.5 text-sm text-white focus:border-primary focus:outline-none transition-colors"
                        value={val}
                        onChange={(e) => setVal(e.target.value)}
                    />
                )}
                <button
                    onClick={() => onSave(val)}
                    disabled={!hasChanged}
                    className="bg-primary text-bg-dark p-2.5 rounded-lg transition-all opacity-0 group-hover:opacity-100 disabled:opacity-0"
                >
                    <Save size={20} />
                </button>
            </div>
        </div>
    );
}
