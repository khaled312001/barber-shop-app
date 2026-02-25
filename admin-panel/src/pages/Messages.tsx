import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Activity, Search, MessageSquare, Send, User, Plus, X, Globe } from 'lucide-react';
import api from '../lib/api';

interface Message {
    id: string;
    userId: string;
    salonId: string;
    salonName: string;
    content: string;
    sender: string;
    createdAt: string;
}

interface UserData {
    id: string;
    fullName: string;
    email: string;
}

export default function Messages() {
    const qc = useQueryClient();
    const [searchTerm, setSearchTerm] = React.useState('');
    const [selectedUser, setSelectedUser] = React.useState<string | null>(null);
    const [replyContent, setReplyContent] = React.useState('');
    const [isComposeOpen, setIsComposeOpen] = React.useState(false);
    const [composeTarget, setComposeTarget] = React.useState<string>(''); // 'all' or userId
    const [composeContent, setComposeContent] = React.useState('');
    const [userSearch, setUserSearch] = React.useState('');

    const { data: messages, isLoading } = useQuery<Message[]>({
        queryKey: ['admin-messages'],
        queryFn: async () => {
            const { data } = await api.get('/admin/messages');
            return data;
        },
    });

    const { data: allUsers } = useQuery<UserData[]>({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const { data } = await api.get('/admin/users');
            return data;
        },
    });

    const replyMutation = useMutation({
        mutationFn: async (data: any) => {
            await api.post('/admin/messages/reply', data);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-messages'] });
            setReplyContent('');
        },
    });

    const broadcastMutation = useMutation({
        mutationFn: async (data: { targetUserId: string, content: string }) => {
            await api.post('/admin/messages/broadcast', data);
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-messages'] });
            setIsComposeOpen(false);
            setComposeContent('');
            setComposeTarget('');
        },
        onError: (err: any) => alert(err.message),
    });

    // Group messages by userId to simulate conversations
    const conversations = React.useMemo(() => {
        if (!messages) return {};
        return messages.reduce((acc: any, msg: Message) => {
            if (!acc[msg.userId]) acc[msg.userId] = [];
            acc[msg.userId].push(msg);
            return acc;
        }, {});
    }, [messages]);

    const userIds = Object.keys(conversations);
    const displayedUserIds = userIds.filter(id => id.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleSendReply = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedUser || !replyContent.trim()) return;

        const convo = conversations[selectedUser];
        const lastMsg = convo[0]; // Get some basic info from any msg in convo
        replyMutation.mutate({
            userId: selectedUser,
            salonId: lastMsg?.salonId || 'admin',
            salonName: lastMsg?.salonName || 'System Admin',
            salonImage: '',
            content: replyContent
        });
    };

    const handleSendBroadcast = (e: React.FormEvent) => {
        e.preventDefault();
        if (!composeTarget || !composeContent.trim()) return;

        broadcastMutation.mutate({
            targetUserId: composeTarget,
            content: composeContent
        });
    };

    const filteredUsers = allUsers?.filter(u =>
        u.fullName.toLowerCase().includes(userSearch.toLowerCase()) ||
        u.email.toLowerCase().includes(userSearch.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex h-full items-center justify-center">
                <Activity className="animate-spin text-primary" size={32} />
            </div>
        );
    }

    return (
        <div className="flex h-full bg-bg-dark">
            {/* Sidebar List */}
            <div className="w-80 border-r border-border bg-bg-card flex flex-col">
                <div className="p-4 border-b border-border space-y-3">
                    <div className="flex justify-between items-center">
                        <h2 className="text-white font-bold">Messages</h2>
                        <button
                            onClick={() => setIsComposeOpen(true)}
                            className="p-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors"
                        >
                            <Plus size={18} />
                        </button>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="w-full bg-bg-dark border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {displayedUserIds.map((id) => {
                        const convo = conversations[id];
                        const lastMsg = convo[convo.length - 1];
                        return (
                            <button
                                key={id}
                                onClick={() => setSelectedUser(id)}
                                className={`w-full p-4 flex items-start gap-3 hover:bg-white/5 transition-colors border-b border-border/50 text-left ${selectedUser === id ? 'bg-primary/5 border-l-4 border-l-primary' : ''}`}
                            >
                                <div className="w-10 h-10 rounded-full bg-bg-dark flex items-center justify-center text-text-muted border border-border">
                                    <User size={20} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-baseline">
                                        <p className="font-bold text-white text-sm truncate">User {id.split('-')[0]}</p>
                                        <span className="text-[10px] text-text-muted">
                                            {lastMsg ? new Date(lastMsg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                        </span>
                                    </div>
                                    <p className="text-xs text-text-muted truncate mt-0.5">{lastMsg?.content}</p>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {selectedUser ? (
                    <>
                        <div className="p-4 border-b border-border bg-bg-card flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <User size={20} />
                                </div>
                                <div>
                                    <p className="font-bold text-white">Chat with User {selectedUser.split('-')[0]}</p>
                                    <p className="text-xs text-emerald-500">Active Now</p>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4">
                            {conversations[selectedUser]?.map((msg: Message) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'salon' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] p-3 rounded-2xl text-sm ${msg.sender === 'salon'
                                        ? 'bg-primary text-bg-dark rounded-tr-sm font-medium'
                                        : 'bg-bg-card border border-border text-white rounded-tl-sm'
                                        }`}>
                                        {msg.content}
                                        <p className={`text-[10px] mt-1.5 ${msg.sender === 'salon' ? 'text-bg-dark/60' : 'text-text-muted'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-4 border-t border-border bg-bg-card">
                            <form onSubmit={handleSendReply} className="flex gap-3">
                                <input
                                    type="text"
                                    placeholder="Type your reply..."
                                    className="flex-1 bg-bg-dark border border-border rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                                    value={replyContent}
                                    onChange={(e) => setReplyContent(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={!replyContent.trim() || replyMutation.isPending}
                                    className="bg-primary hover:bg-primary-dark text-bg-dark p-2.5 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-12 text-center">
                        <div className="w-20 h-20 rounded-full bg-bg-card border border-border flex items-center justify-center mb-6">
                            <MessageSquare size={40} className="text-border" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Select a Conversation</h3>
                        <p className="max-w-xs">Pick a chat from the sidebar or start a new one to message users.</p>
                        <button
                            onClick={() => setIsComposeOpen(true)}
                            className="mt-6 bg-primary hover:bg-primary-dark text-bg-dark px-6 py-2.5 rounded-xl text-sm font-bold transition-colors"
                        >
                            Send New Message
                        </button>
                    </div>
                )}
            </div>

            {/* Compose Modal */}
            {isComposeOpen && (
                <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-bg-card border border-border rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
                        <div className="flex justify-between items-center p-6 border-b border-border">
                            <h2 className="text-xl font-bold tracking-tight text-white">New Message</h2>
                            <button onClick={() => setIsComposeOpen(false)} className="text-text-muted hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSendBroadcast} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">Select Recipient</label>
                                <div className="space-y-4">
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => setComposeTarget('all')}
                                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${composeTarget === 'all'
                                                ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                                                : 'bg-bg-dark border-border text-text-muted hover:border-zinc-700'}`}
                                        >
                                            <Globe size={18} />
                                            <span className="text-sm font-bold">All Users</span>
                                        </button>
                                    </div>

                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={16} />
                                        <input
                                            type="text"
                                            placeholder="Search users..."
                                            value={userSearch}
                                            onChange={(e) => setUserSearch(e.target.value)}
                                            className="w-full bg-bg-dark border border-border rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary"
                                        />
                                    </div>

                                    <div className="max-height-[200px] overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                        {filteredUsers?.map(user => (
                                            <button
                                                key={user.id}
                                                type="button"
                                                onClick={() => setComposeTarget(user.id)}
                                                className={`w-full p-3 flex items-center gap-3 rounded-lg text-left transition-colors ${composeTarget === user.id
                                                    ? 'bg-primary/10 text-primary'
                                                    : 'hover:bg-white/5 text-zinc-300'}`}
                                            >
                                                <div className="w-8 h-8 rounded-full bg-bg-dark flex items-center justify-center border border-border text-text-muted">
                                                    <User size={14} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-sm font-medium truncate">{user.fullName}</p>
                                                    <p className="text-[10px] text-text-muted truncate">{user.email}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-muted mb-1.5">Message Content</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={composeContent}
                                    onChange={e => setComposeContent(e.target.value)}
                                    placeholder="Write your message here..."
                                    className="w-full bg-bg-dark border border-border rounded-xl px-4 py-3 text-sm text-white focus:border-primary focus:outline-none transition-colors resize-none"
                                />
                            </div>

                            <div className="pt-4 flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setIsComposeOpen(false)}
                                    className="flex-1 bg-transparent border border-border hover:bg-white/5 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={!composeTarget || !composeContent.trim() || broadcastMutation.isPending}
                                    className="flex-1 bg-primary hover:bg-primary-dark text-bg-dark py-2.5 rounded-xl text-sm font-bold transition-colors disabled:opacity-50"
                                >
                                    {broadcastMutation.isPending ? 'Sending...' : 'Send Message'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
