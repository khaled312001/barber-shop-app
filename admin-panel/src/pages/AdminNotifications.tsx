import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Bell, Send } from 'lucide-react';
import api from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';

export default function AdminNotifications() {
    const { t } = useLanguage();
    const [targetUserId, setTargetUserId] = useState('all');
    const [content, setContent] = useState('');
    const [sent, setSent] = useState(false);

    const send = useMutation({
        mutationFn: () => api.post('/admin/messages/broadcast', { targetUserId, content }),
        onSuccess: () => { setSent(true); setContent(''); setTimeout(() => setSent(false), 3000); },
    });

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
                <Bell className="text-[#F4A460]" size={24} />
                <div><h1 className="text-2xl font-bold text-white">{t('admin_notifications')}</h1><p className="text-zinc-400 text-sm">{t('send_platform_notifications')}</p></div>
            </div>

            <div className="max-w-xl bg-[#1F222A] border border-[#35383F] rounded-2xl p-6">
                <h2 className="font-bold text-white mb-6">{t('broadcast_message')}</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-zinc-400 mb-1.5">{t('target')}</label>
                        <select value={targetUserId} onChange={e => setTargetUserId(e.target.value)} className="w-full bg-[#181A20] border border-[#35383F] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#F4A460]">
                            <option value="all">{t('all_users_target')}</option>
                        </select>
                        <p className="text-xs text-zinc-500 mt-1">{t('custom_user_id')}</p>
                        <input
                            type="text"
                            placeholder={t('custom_user_id')}
                            value={targetUserId === 'all' ? '' : targetUserId}
                            onChange={e => setTargetUserId(e.target.value || 'all')}
                            className="w-full mt-2 bg-[#181A20] border border-[#35383F] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#F4A460] placeholder:text-zinc-600 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-zinc-400 mb-1.5">{t('message')}</label>
                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            rows={4}
                            placeholder={t('type_notification')}
                            className="w-full bg-[#181A20] border border-[#35383F] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#F4A460] placeholder:text-zinc-600 resize-none"
                        />
                    </div>
                    <button
                        onClick={() => send.mutate()}
                        disabled={!content.trim() || send.isPending}
                        className="flex items-center gap-2 bg-[#F4A460] hover:bg-[#e8935a] text-[#181A20] font-semibold px-5 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={16} />
                        {send.isPending ? t('loading') : t('send_notification')}
                    </button>
                    {sent && <p className="text-emerald-400 text-sm">{t('notification_sent')}</p>}
                </div>
            </div>
        </div>
    );
}
