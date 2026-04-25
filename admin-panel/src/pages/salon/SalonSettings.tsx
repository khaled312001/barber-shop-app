import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Settings, Save, CheckCircle } from 'lucide-react';
import api from '../../lib/api';
import { useLanguage } from '../../contexts/LanguageContext';

export default function SalonSettings() {
    const { t } = useLanguage();
    const [saved, setSaved] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', address: '', description: '' });

    const { isLoading } = useQuery({
        queryKey: ['my-salon'],
        queryFn: async () => {
            const { data } = await api.get('/salon/me');
            setForm({ name: data.name || '', phone: data.phone || '', address: data.address || '', description: data.description || '' });
            return data;
        },
    });

    const save = useMutation({
        mutationFn: () => api.put('/salon/me', form),
        onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000); },
    });

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
                <Settings className="text-[#F4A460]" size={24} />
                <div><h1 className="text-2xl font-bold text-white">{t('salon_settings_title')}</h1><p className="text-zinc-400 text-sm">{t('update_profile')}</p></div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#F4A460]" /></div>
            ) : (
                <div className="max-w-xl bg-[#1F222A] border border-[#35383F] rounded-2xl p-6 space-y-4">
                    {[
                        { label: t('salon_name'), key: 'name', type: 'text', placeholder: 'My Barber Shop' },
                        { label: t('phone'), key: 'phone', type: 'text', placeholder: '+1 234 567 8900' },
                        { label: t('address'), key: 'address', type: 'text', placeholder: '123 Main St, City' },
                    ].map(f => (
                        <div key={f.key}>
                            <label className="block text-sm text-zinc-400 mb-1.5">{f.label}</label>
                            <input type={f.type} placeholder={f.placeholder} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                className="w-full bg-[#181A20] border border-[#35383F] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#F4A460] placeholder:text-zinc-600" />
                        </div>
                    ))}
                    <div>
                        <label className="block text-sm text-zinc-400 mb-1.5">{t('description')}</label>
                        <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} rows={3} placeholder="Tell clients about your salon..."
                            className="w-full bg-[#181A20] border border-[#35383F] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#F4A460] placeholder:text-zinc-600 resize-none" />
                    </div>
                    <button onClick={() => save.mutate()} disabled={save.isPending}
                        className="flex items-center gap-2 bg-[#F4A460] hover:bg-[#e8935a] text-[#181A20] font-semibold px-5 py-3 rounded-xl transition-colors disabled:opacity-50">
                        <Save size={16} /> {t('save_changes')}
                    </button>
                    {saved && <p className="flex items-center gap-2 text-emerald-400 text-sm"><CheckCircle size={16} /> {t('saved_successfully')}</p>}
                </div>
            )}
        </div>
    );
}
