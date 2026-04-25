import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { UserCircle, Save, CheckCircle } from 'lucide-react';
import api from '../../lib/api';
import { useLanguage } from '../../contexts/LanguageContext';

export default function StaffProfile() {
    const { t } = useLanguage();
    const [saved, setSaved] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', phone: '' });

    const { isLoading } = useQuery({
        queryKey: ['staff-profile'],
        queryFn: async () => {
            const { data } = await api.get('/auth/me');
            const u = data.user;
            setForm({ name: u.name || '', email: u.email || '', phone: u.phone || '' });
            return u;
        },
    });

    const save = useMutation({
        mutationFn: () => api.put('/staff/profile', form),
        onSuccess: () => { setSaved(true); setTimeout(() => setSaved(false), 3000); },
    });

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
                <UserCircle className="text-[#F4A460]" size={24} />
                <div><h1 className="text-2xl font-bold text-white">{t('staff_profile_title')}</h1><p className="text-zinc-400 text-sm">{t('manage_account')}</p></div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#F4A460]" /></div>
            ) : (
                <div className="max-w-md bg-[#1F222A] border border-[#35383F] rounded-2xl p-6 space-y-4">
                    <div className="flex justify-center mb-4">
                        <div className="w-20 h-20 rounded-full bg-[#F4A460]/15 flex items-center justify-center text-[#F4A460] text-3xl font-bold">
                            {form.name[0] || '?'}
                        </div>
                    </div>
                    {[
                        { label: t('full_name'), key: 'name', type: 'text' },
                        { label: t('email'), key: 'email', type: 'email' },
                        { label: t('phone'), key: 'phone', type: 'text' },
                    ].map(f => (
                        <div key={f.key}>
                            <label className="block text-sm text-zinc-400 mb-1.5">{f.label}</label>
                            <input type={f.type} value={(form as any)[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                                className="w-full bg-[#181A20] border border-[#35383F] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#F4A460]" />
                        </div>
                    ))}
                    <button onClick={() => save.mutate()} disabled={save.isPending}
                        className="flex items-center gap-2 bg-[#F4A460] hover:bg-[#e8935a] text-[#181A20] font-semibold px-5 py-3 rounded-xl transition-colors disabled:opacity-50">
                        <Save size={16} /> {t('save_profile')}
                    </button>
                    {saved && <p className="flex items-center gap-2 text-emerald-400 text-sm"><CheckCircle size={16} /> {t('profile_saved')}</p>}
                </div>
            )}
        </div>
    );
}
