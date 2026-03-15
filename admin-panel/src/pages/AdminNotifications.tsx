import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Bell, Send } from 'lucide-react';
import api from '../lib/api';

export default function AdminNotifications() {
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
                <div><h1 className="text-2xl font-bold text-white">Notifications</h1><p className="text-zinc-400 text-sm">Send platform-wide or targeted notifications</p></div>
            </div>

            <div className="max-w-xl bg-[#1F222A] border border-[#35383F] rounded-2xl p-6">
                <h2 className="font-bold text-white mb-6">Broadcast Message</h2>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm text-zinc-400 mb-1.5">Target</label>
                        <select value={targetUserId} onChange={e => setTargetUserId(e.target.value)} className="w-full bg-[#181A20] border border-[#35383F] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#F4A460]">
                            <option value="all">All Users</option>
                        </select>
                        <p className="text-xs text-zinc-500 mt-1">Custom user targeting: paste a user ID above</p>
                        <input
                            type="text"
                            placeholder="Or paste a specific user ID here"
                            value={targetUserId === 'all' ? '' : targetUserId}
                            onChange={e => setTargetUserId(e.target.value || 'all')}
                            className="w-full mt-2 bg-[#181A20] border border-[#35383F] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#F4A460] placeholder:text-zinc-600 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-sm text-zinc-400 mb-1.5">Message</label>
                        <textarea
                            value={content}
                            onChange={e => setContent(e.target.value)}
                            rows={4}
                            placeholder="Type your notification message..."
                            className="w-full bg-[#181A20] border border-[#35383F] text-white rounded-xl px-4 py-3 focus:outline-none focus:border-[#F4A460] placeholder:text-zinc-600 resize-none"
                        />
                    </div>
                    <button
                        onClick={() => send.mutate()}
                        disabled={!content.trim() || send.isPending}
                        className="flex items-center gap-2 bg-[#F4A460] hover:bg-[#e8935a] text-[#181A20] font-semibold px-5 py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Send size={16} />
                        {send.isPending ? 'Sending...' : 'Send Notification'}
                    </button>
                    {sent && <p className="text-emerald-400 text-sm">Notification sent successfully!</p>}
                </div>
            </div>
        </div>
    );
}
