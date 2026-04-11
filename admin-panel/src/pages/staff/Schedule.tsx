import { useQuery } from '@tanstack/react-query';
import { Clock } from 'lucide-react';
import api from '../../lib/api';

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function StaffSchedule() {
    const { data: shifts = [], isLoading } = useQuery({
        queryKey: ['staff-shifts'],
        queryFn: async () => { const { data } = await api.get('/staff/shifts'); return data; },
    });

    return (
        <div className="p-6">
            <div className="flex items-center gap-3 mb-8">
                <Clock className="text-[#F4A460]" size={24} />
                <div><h1 className="text-2xl font-bold text-white">My Schedule</h1><p className="text-zinc-400 text-sm">Your weekly work schedule</p></div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {isLoading ? (
                    <div className="col-span-4 flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#F4A460]" /></div>
                ) : shifts.length > 0 ? shifts.map((shift: any) => (
                    <div key={shift.id} className="bg-[#1F222A] border border-[#35383F] rounded-2xl p-5">
                        <p className="text-[#F4A460] font-semibold text-lg mb-1">{DAYS[shift.dayOfWeek]}</p>
                        <p className="text-white text-2xl font-bold">{shift.startTime}</p>
                        <p className="text-zinc-400 text-sm mt-1">to {shift.endTime}</p>
                    </div>
                )) : (
                    <div className="col-span-4 py-12 text-center">
                        <Clock size={48} className="text-zinc-600 mx-auto mb-4" />
                        <p className="text-zinc-500">No shifts assigned yet.</p>
                        <p className="text-zinc-600 text-sm mt-1">Contact your salon admin to get your schedule set up.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
