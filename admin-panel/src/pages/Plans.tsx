import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import api from '../lib/api';
import { CheckCircle, XCircle, Edit2, Trash2, Plus, Zap, Star, Building2 } from 'lucide-react';

const TIER_ICONS: Record<string, any> = { Basic: Zap, Pro: Star, Enterprise: Building2 };
const TIER_COLORS: Record<string, string> = { Basic: '#6C63FF', Pro: '#F4A460', Enterprise: '#10B981' };

export default function Plans() {
    const qc = useQueryClient();
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState<any>(null);
    const [form, setForm] = useState({
        name: 'Basic', price: '', billingCycle: 'monthly',
        commissionRate: '5', maxBookings: '0', maxStaff: '0',
        features: '',
    });

    const { data: plans = [], isLoading } = useQuery({
        queryKey: ['plans'],
        queryFn: async () => { const { data } = await api.get('/admin/plans'); return data; },
    });

    const save = useMutation({
        mutationFn: async (payload: any) => {
            if (editing) {
                const { data } = await api.put(`/admin/plans/${editing.id}`, payload);
                return data;
            }
            const { data } = await api.post('/admin/plans', payload);
            return data;
        },
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['plans'] });
            setShowForm(false);
            setEditing(null);
            setForm({ name: 'Basic', price: '', billingCycle: 'monthly', commissionRate: '5', maxBookings: '0', maxStaff: '0', features: '' });
        },
    });

    const deletePlan = useMutation({
        mutationFn: async (id: string) => { await api.delete(`/admin/plans/${id}`); },
        onSuccess: () => qc.invalidateQueries({ queryKey: ['plans'] }),
    });

    const handleEdit = (plan: any) => {
        setEditing(plan);
        setForm({
            name: plan.name, price: String(plan.price), billingCycle: plan.billingCycle,
            commissionRate: String(plan.commissionRate), maxBookings: String(plan.maxBookings),
            maxStaff: String(plan.maxStaff), features: (plan.features || []).join('\n'),
        });
        setShowForm(true);
    };

    const handleSubmit = () => {
        save.mutate({
            name: form.name,
            price: parseFloat(form.price) || 0,
            billingCycle: form.billingCycle,
            commissionRate: parseFloat(form.commissionRate) || 5,
            maxBookings: parseInt(form.maxBookings) || 0,
            maxStaff: parseInt(form.maxStaff) || 0,
            features: form.features.split('\n').filter(Boolean),
        });
    };

    const field = (label: string, key: keyof typeof form, type = 'text', opts?: string[]) => (
        <div className="mb-4" key={key}>
            <label className="block text-xs text-gray-400 mb-1">{label}</label>
            {opts ? (
                <select value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-[#13151B] border border-[#35383F] rounded-lg px-3 py-2 text-white text-sm">
                    {opts.map(o => <option key={o} value={o}>{o}</option>)}
                </select>
            ) : key === 'features' ? (
                <textarea value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    rows={4} placeholder="ميزة واحدة في كل سطر"
                    className="w-full bg-[#13151B] border border-[#35383F] rounded-lg px-3 py-2 text-white text-sm resize-none" />
            ) : (
                <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-[#13151B] border border-[#35383F] rounded-lg px-3 py-2 text-white text-sm" />
            )}
        </div>
    );

    return (
        <div className="p-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-white">Subscription Plans</h1>
                    <p className="text-gray-400 text-sm mt-1">إدارة خطط الاشتراك للصالونات</p>
                </div>
                <button onClick={() => { setEditing(null); setShowForm(!showForm); }}
                    className="flex items-center gap-2 bg-[#F4A460] text-[#181A20] font-bold px-4 py-2 rounded-xl text-sm">
                    <Plus size={16} /> {showForm ? 'إلغاء' : 'خطة جديدة'}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-6 mb-6">
                    <h3 className="text-white font-bold text-lg mb-4">{editing ? 'تعديل الخطة' : 'إضافة خطة جديدة'}</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>{field('اسم الخطة', 'name', 'text', ['Basic', 'Pro', 'Enterprise'])}</div>
                        <div>{field('السعر ($)', 'price', 'number')}</div>
                        <div>{field('دورة الفوترة', 'billingCycle', 'text', ['monthly', 'annual'])}</div>
                        <div>{field('نسبة العمولة (%)', 'commissionRate', 'number')}</div>
                        <div>{field('حد الحجوزات (0=غير محدود)', 'maxBookings', 'number')}</div>
                        <div>{field('حد الموظفين (0=غير محدود)', 'maxStaff', 'number')}</div>
                    </div>
                    {field('المميزات (سطر لكل ميزة)', 'features')}
                    <button onClick={handleSubmit} disabled={save.isPending}
                        className="bg-[#F4A460] text-[#181A20] font-bold px-6 py-2 rounded-xl">
                        {save.isPending ? 'جاري الحفظ...' : 'حفظ الخطة'}
                    </button>
                </div>
            )}

            {/* Plans Grid */}
            {isLoading ? (
                <div className="text-center text-gray-400 py-20">جاري التحميل...</div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {plans.map((plan: any) => {
                        const Icon = TIER_ICONS[plan.name] || Zap;
                        const color = TIER_COLORS[plan.name] || '#F4A460';
                        return (
                            <div key={plan.id} className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-6 relative">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}22` }}>
                                        <Icon size={20} color={color} />
                                    </div>
                                    <div>
                                        <div className="text-white font-bold text-lg">{plan.name}</div>
                                        <div className="text-gray-400 text-xs">{plan.billingCycle}</div>
                                    </div>
                                    <div className="ml-auto flex gap-2">
                                        <button onClick={() => handleEdit(plan)} className="p-2 rounded-lg bg-[#35383F] hover:bg-[#F4A46022]">
                                            <Edit2 size={14} color="#F4A460" />
                                        </button>
                                        <button onClick={() => deletePlan.mutate(plan.id)} className="p-2 rounded-lg bg-[#35383F] hover:bg-red-500/20">
                                            <Trash2 size={14} color="#EF4444" />
                                        </button>
                                    </div>
                                </div>
                                <div className="text-3xl font-bold text-white mb-1">${plan.price}<span className="text-sm text-gray-400 font-normal">/mo</span></div>
                                <div className="flex gap-4 text-xs text-gray-400 mb-4">
                                    <span>عمولة: {plan.commissionRate}%</span>
                                    <span>موظفين: {plan.maxStaff === 0 ? '∞' : plan.maxStaff}</span>
                                    <span>حجوزات: {plan.maxBookings === 0 ? '∞' : plan.maxBookings}</span>
                                </div>
                                <ul className="space-y-2">
                                    {(plan.features || []).map((f: string, i: number) => (
                                        <li key={i} className="flex items-center gap-2 text-sm text-gray-300">
                                            <CheckCircle size={14} color={color} /> {f}
                                        </li>
                                    ))}
                                </ul>
                                <div className={`mt-4 inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full ${plan.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                                    {plan.isActive ? <CheckCircle size={12} /> : <XCircle size={12} />}
                                    {plan.isActive ? 'نشطة' : 'غير نشطة'}
                                </div>
                            </div>
                        );
                    })}
                    {plans.length === 0 && (
                        <div className="col-span-3 text-center text-gray-500 py-20">لا توجد خطط اشتراك. أنشئ خطة جديدة.</div>
                    )}
                </div>
            )}
        </div>
    );
}
