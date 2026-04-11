import { useQuery } from '@tanstack/react-query';
import { CreditCard, CheckCircle, AlertCircle } from 'lucide-react';
import api from '../../lib/api';

export default function SalonSubscription() {
    const { data: sub, isLoading } = useQuery({
        queryKey: ['my-subscription'],
        queryFn: async () => { const { data } = await api.get('/salon/subscription'); return data; },
    });

    const { data: plans = [] } = useQuery({
        queryKey: ['plans'],
        queryFn: async () => { const { data } = await api.get('/admin/plans'); return data; },
    });

    const isActive = sub?.status === 'active';

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
                <CreditCard className="text-[#F4A460]" size={24} />
                <div><h1 className="text-2xl font-bold text-white">Subscription</h1><p className="text-zinc-400 text-sm">Your current plan and billing</p></div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#F4A460]" /></div>
            ) : (
                <>
                    <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-6 mb-6 max-w-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="font-bold text-white text-lg">Current Plan</h2>
                            {isActive
                                ? <span className="flex items-center gap-1.5 text-emerald-400 text-sm"><CheckCircle size={16} /> Active</span>
                                : <span className="flex items-center gap-1.5 text-red-400 text-sm"><AlertCircle size={16} /> {sub?.status || 'No plan'}</span>
                            }
                        </div>
                        {sub ? (
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between"><span className="text-zinc-400">Plan</span><span className="text-white font-medium">{plans.find((p: any) => p.id === sub.planId)?.name || 'Unknown'}</span></div>
                                <div className="flex justify-between"><span className="text-zinc-400">Start Date</span><span className="text-white">{sub.startDate}</span></div>
                                <div className="flex justify-between"><span className="text-zinc-400">End Date</span><span className="text-white">{sub.endDate}</span></div>
                                <div className="flex justify-between"><span className="text-zinc-400">Status</span><span className={isActive ? 'text-emerald-400' : 'text-red-400'}>{sub.status}</span></div>
                            </div>
                        ) : (
                            <p className="text-zinc-500">No active subscription. Contact your platform admin to get started.</p>
                        )}
                    </div>

                    {plans.length > 0 && (
                        <div>
                            <h2 className="font-bold text-white mb-4">Available Plans</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {plans.map((plan: any) => (
                                    <div key={plan.id} className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-5 hover:border-[#F4A460]/50 transition-colors">
                                        <h3 className="font-bold text-white mb-1">{plan.name}</h3>
                                        <p className="text-3xl font-bold text-[#F4A460] mb-1">${plan.price}<span className="text-base text-zinc-400 font-normal">/{plan.billingCycle}</span></p>
                                        <p className="text-zinc-500 text-sm">{plan.description}</p>
                                    </div>
                                ))}
                            </div>
                            <p className="text-zinc-500 text-sm mt-4">To change your plan, contact your platform administrator.</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
