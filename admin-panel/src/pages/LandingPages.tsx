import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Globe, Eye, Copy, ExternalLink, Check, RefreshCw, ChevronDown, ChevronUp, Link2, Palette, BookOpen } from 'lucide-react';
import api from '../lib/api';

interface Salon {
    id: string;
    name: string;
    image: string;
    address: string;
    phone: string;
    rating: number;
    reviewCount: number;
    isOpen: boolean;
    status: string;
    landingEnabled: boolean;
    landingSlug: string;
    landingViews: number;
    landingTheme: string;
    landingAccentColor: string;
    landingBookingUrl: string;
}

const ACCENT_PRESETS = ['#F4A460', '#f97316', '#22c55e', '#3b82f6', '#a855f7', '#ec4899', '#ef4444', '#eab308'];

export default function LandingPages() {
    const qc = useQueryClient();
    const [expanded, setExpanded] = useState<string | null>(null);
    const [editing, setEditing] = useState<Record<string, Partial<Salon>>>({});
    const [copied, setCopied] = useState('');
    const [slugError, setSlugError] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState<string | null>(null);

    const { data: salons = [], isLoading } = useQuery<Salon[]>({
        queryKey: ['landing-pages'],
        queryFn: async () => { const { data } = await api.get('/admin/landing-pages'); return data; },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<Salon> }) =>
            api.put(`/admin/landing-pages/${id}`, payload),
        onSuccess: (_, { id }) => {
            qc.invalidateQueries({ queryKey: ['landing-pages'] });
            setEditing(prev => { const n = { ...prev }; delete n[id]; return n; });
            setSlugError(prev => { const n = { ...prev }; delete n[id]; return n; });
            setSaving(null);
        },
        onError: (err: any, { id }) => {
            const msg = err?.response?.data?.message || 'Failed to save';
            setSlugError(prev => ({ ...prev, [id]: msg }));
            setSaving(null);
        },
    });

    const resetViewsMutation = useMutation({
        mutationFn: (id: string) => api.post(`/admin/landing-pages/${id}/reset-views`),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['landing-pages'] }),
    });

    const toggleEnabled = (salon: Salon) => {
        updateMutation.mutate({ id: salon.id, payload: { landingEnabled: !salon.landingEnabled } });
    };

    const getEdit = (salon: Salon) => ({ ...salon, ...(editing[salon.id] || {}) });
    const setField = (id: string, field: string, value: any) =>
        setEditing(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

    const saveEdits = async (salon: Salon) => {
        const edits = editing[salon.id];
        if (!edits || Object.keys(edits).length === 0) return;
        setSlugError(prev => { const n = { ...prev }; delete n[salon.id]; return n; });
        setSaving(salon.id);
        updateMutation.mutate({ id: salon.id, payload: edits });
    };

    const hasEdits = (id: string) => editing[id] && Object.keys(editing[id]).length > 0;

    const publicUrl = (slug: string) => {
        const host = window.location.hostname === 'localhost'
            ? `http://localhost:${window.location.port}`
            : `https://${window.location.hostname}`;
        return `${host}/salon/${slug}`;
    };

    const copyUrl = (slug: string) => {
        navigator.clipboard.writeText(publicUrl(slug));
        setCopied(slug);
        setTimeout(() => setCopied(''), 2000);
    };

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
                <Globe className="text-[#F4A460]" size={24} />
                <div>
                    <h1 className="text-2xl font-bold text-white">Landing Pages</h1>
                    <p className="text-zinc-400 text-sm">Manage per-salon public landing pages</p>
                </div>
                <div className="ml-auto flex items-center gap-2 bg-[#1F222A] border border-[#35383F] rounded-xl px-4 py-2">
                    <Globe size={14} className="text-green-400" />
                    <span className="text-xs text-zinc-300">
                        {salons.filter(s => s.landingEnabled && s.landingSlug).length} pages live
                    </span>
                </div>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center h-48 text-zinc-500">Loading…</div>
            ) : salons.length === 0 ? (
                <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-12 text-center">
                    <Globe size={48} className="text-zinc-600 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-white mb-2">No Salons Yet</h2>
                    <p className="text-zinc-400">Create salons in Store Manager to enable landing pages.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {salons.map(salon => {
                        const edit = getEdit(salon);
                        const isExpanded = expanded === salon.id;
                        const liveUrl = salon.landingSlug ? publicUrl(salon.landingSlug) : null;
                        const editUrl = edit.landingSlug ? publicUrl(edit.landingSlug) : null;

                        return (
                            <div key={salon.id} className="bg-[#1F222A] border border-[#35383F] rounded-2xl overflow-hidden">
                                {/* Row */}
                                <div className="flex items-center gap-4 px-5 py-4">
                                    <img
                                        src={salon.image}
                                        alt={salon.name}
                                        className="w-10 h-10 rounded-xl object-cover border border-[#35383F] flex-shrink-0"
                                        onError={e => { (e.target as HTMLImageElement).src = 'https://placehold.co/40x40/1F222A/F4A460?text=S'; }}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white font-semibold text-sm truncate">{salon.name}</p>
                                        <p className="text-zinc-500 text-xs truncate">{salon.address || 'No address'}</p>
                                    </div>

                                    {/* View count */}
                                    <div className="flex items-center gap-1.5 text-zinc-400 text-xs min-w-[60px]">
                                        <Eye size={13} />
                                        <span className="font-medium text-white">{(salon.landingViews || 0).toLocaleString()}</span>
                                    </div>

                                    {/* Live URL chip */}
                                    {salon.landingEnabled && salon.landingSlug ? (
                                        <div className="flex items-center gap-1.5 bg-green-500/10 text-green-400 text-xs px-3 py-1 rounded-full border border-green-500/20 min-w-0 max-w-[180px] hidden sm:flex">
                                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full flex-shrink-0 animate-pulse" />
                                            <span className="truncate">/salon/{salon.landingSlug}</span>
                                        </div>
                                    ) : (
                                        <div className="hidden sm:flex items-center gap-1.5 bg-zinc-800 text-zinc-500 text-xs px-3 py-1 rounded-full border border-zinc-700 min-w-0 max-w-[180px]">
                                            <span className="w-1.5 h-1.5 bg-zinc-600 rounded-full flex-shrink-0" />
                                            <span className="truncate">{salon.landingSlug ? 'Disabled' : 'No slug'}</span>
                                        </div>
                                    )}

                                    {/* Toggle */}
                                    <button
                                        onClick={() => toggleEnabled(salon)}
                                        className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${salon.landingEnabled ? 'bg-[#F4A460]' : 'bg-zinc-700'}`}
                                        title={salon.landingEnabled ? 'Disable' : 'Enable'}
                                    >
                                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${salon.landingEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                                    </button>

                                    {/* Expand */}
                                    <button
                                        onClick={() => setExpanded(isExpanded ? null : salon.id)}
                                        className="text-zinc-400 hover:text-white transition-colors ml-1 flex-shrink-0"
                                    >
                                        {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                    </button>
                                </div>

                                {/* Expanded Editor */}
                                {isExpanded && (
                                    <div className="border-t border-[#35383F] px-5 py-5 space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {/* Slug */}
                                            <div>
                                                <label className="text-xs text-zinc-400 uppercase font-semibold tracking-wider flex items-center gap-1.5 mb-2">
                                                    <Link2 size={12} />URL Slug
                                                </label>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-zinc-500 text-sm flex-shrink-0">/salon/</span>
                                                    <input
                                                        value={edit.landingSlug ?? ''}
                                                        onChange={e => setField(salon.id, 'landingSlug', e.target.value)}
                                                        placeholder="my-salon"
                                                        className="flex-1 bg-[#181A20] border border-[#35383F] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F4A460]"
                                                    />
                                                </div>
                                                {slugError[salon.id] && (
                                                    <p className="text-red-400 text-xs mt-1">{slugError[salon.id]}</p>
                                                )}
                                            </div>

                                            {/* Booking URL */}
                                            <div>
                                                <label className="text-xs text-zinc-400 uppercase font-semibold tracking-wider flex items-center gap-1.5 mb-2">
                                                    <BookOpen size={12} />Booking URL
                                                </label>
                                                <input
                                                    value={edit.landingBookingUrl ?? ''}
                                                    onChange={e => setField(salon.id, 'landingBookingUrl', e.target.value)}
                                                    placeholder="https://calendly.com/..."
                                                    className="w-full bg-[#181A20] border border-[#35383F] rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#F4A460]"
                                                />
                                            </div>
                                        </div>

                                        {/* Theme + Accent */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <div>
                                                <label className="text-xs text-zinc-400 uppercase font-semibold tracking-wider flex items-center gap-1.5 mb-2">
                                                    <Palette size={12} />Theme
                                                </label>
                                                <div className="flex gap-2">
                                                    {(['dark', 'light'] as const).map(t => (
                                                        <button
                                                            key={t}
                                                            onClick={() => setField(salon.id, 'landingTheme', t)}
                                                            className={`flex-1 py-2 rounded-xl text-sm font-semibold border transition-all capitalize ${(edit.landingTheme || 'dark') === t
                                                                ? 'bg-[#F4A460] text-black border-[#F4A460]'
                                                                : 'bg-[#181A20] text-zinc-400 border-[#35383F] hover:border-zinc-500'
                                                                }`}
                                                        >
                                                            {t === 'dark' ? '🌙 Dark' : '☀️ Light'}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-xs text-zinc-400 uppercase font-semibold tracking-wider flex items-center gap-1.5 mb-2">
                                                    <Palette size={12} />Accent Color
                                                </label>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {ACCENT_PRESETS.map(c => (
                                                        <button
                                                            key={c}
                                                            onClick={() => setField(salon.id, 'landingAccentColor', c)}
                                                            style={{ background: c }}
                                                            className={`w-7 h-7 rounded-full border-2 transition-transform ${(edit.landingAccentColor || '#F4A460') === c ? 'border-white scale-110' : 'border-transparent'}`}
                                                            title={c}
                                                        />
                                                    ))}
                                                    <input
                                                        type="color"
                                                        value={edit.landingAccentColor || '#F4A460'}
                                                        onChange={e => setField(salon.id, 'landingAccentColor', e.target.value)}
                                                        className="w-7 h-7 rounded-full border border-[#35383F] cursor-pointer bg-transparent"
                                                        title="Custom color"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Actions row */}
                                        <div className="flex flex-wrap items-center gap-3 pt-2">
                                            <button
                                                onClick={() => saveEdits(salon)}
                                                disabled={!hasEdits(salon.id) || saving === salon.id}
                                                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${hasEdits(salon.id) && saving !== salon.id
                                                    ? 'bg-[#F4A460] text-black hover:opacity-90'
                                                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                                                    }`}
                                            >
                                                {saving === salon.id ? (
                                                    <RefreshCw size={14} className="animate-spin" />
                                                ) : (
                                                    <Check size={14} />
                                                )}
                                                Save Changes
                                            </button>

                                            {liveUrl && (
                                                <>
                                                    <a
                                                        href={editUrl || liveUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#181A20] text-zinc-300 border border-[#35383F] hover:border-zinc-500 transition-colors"
                                                    >
                                                        <ExternalLink size={14} />Preview
                                                    </a>
                                                    <button
                                                        onClick={() => copyUrl(salon.landingSlug)}
                                                        className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#181A20] text-zinc-300 border border-[#35383F] hover:border-zinc-500 transition-colors"
                                                    >
                                                        {copied === salon.landingSlug ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                                                        {copied === salon.landingSlug ? 'Copied!' : 'Copy Link'}
                                                    </button>
                                                </>
                                            )}

                                            <button
                                                onClick={() => resetViewsMutation.mutate(salon.id)}
                                                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-[#181A20] text-zinc-500 border border-[#35383F] hover:border-zinc-500 hover:text-zinc-300 transition-colors ml-auto"
                                                title="Reset view count"
                                            >
                                                <RefreshCw size={13} />
                                                Reset Views
                                            </button>
                                        </div>

                                        {/* Preview bar */}
                                        {(edit.landingSlug || salon.landingSlug) && (
                                            <div className="bg-[#181A20] border border-[#35383F] rounded-xl px-4 py-2.5 flex items-center gap-2">
                                                <Globe size={13} className="text-zinc-500 flex-shrink-0" />
                                                <span className="text-zinc-500 text-xs truncate">
                                                    {editUrl || liveUrl}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
