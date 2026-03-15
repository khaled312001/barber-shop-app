import { useQuery } from '@tanstack/react-query';
import { CalendarCheck } from 'lucide-react';
import api from '../lib/api';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function AdminShifts() {
    const { data: shifts = [], isLoading } = useQuery({
        queryKey: ['all-shifts'],
        queryFn: async () => { const { data } = await api.get('/admin/shifts'); return data; },
    });
    const { data: salons = [] } = useQuery({ queryKey: ['salons'], queryFn: async () => { const { data } = await api.get('/admin/salons'); return data; } });

    const getSalonName = (id: string) => salons.find((s: any) => s.id === id)?.name || id.slice(0, 8) + '...';

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
                <CalendarCheck className="text-[#F4A460]" size={24} />
                <div><h1 className="text-2xl font-bold text-white">Shifts</h1><p className="text-zinc-400 text-sm">Staff shifts across all salons</p></div>
            </div>

            <div className="bg-[#1F222A] border border-[#35383F] rounded-2xl overflow-hidden">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-[#35383F] text-zinc-400">
                            <th className="text-left px-6 py-4 font-medium">Salon</th>
                            <th className="text-left px-6 py-4 font-medium">Day</th>
                            <th className="text-left px-6 py-4 font-medium">Hours</th>
                        </tr>
                    </thead>
                    <tbody>
                        {isLoading ? (
                            <tr><td colSpan={3} className="px-6 py-12 text-center"><div className="animate-spin rounded-full h-6 w-6 border-t-2 border-[#F4A460] mx-auto" /></td></tr>
                        ) : shifts.map((s: any) => (
                            <tr key={s.id} className="border-b border-[#35383F]/50 hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 text-zinc-300">{getSalonName(s.salonId)}</td>
                                <td className="px-6 py-4 text-white">{DAYS[s.dayOfWeek]}</td>
                                <td className="px-6 py-4 text-zinc-400">{s.startTime} — {s.endTime}</td>
                            </tr>
                        ))}
                        {!isLoading && shifts.length === 0 && <tr><td colSpan={3} className="px-6 py-12 text-center text-zinc-500">No shifts defined</td></tr>}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
