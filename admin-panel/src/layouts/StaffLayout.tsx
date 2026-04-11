import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { CalendarCheck, UserCircle, Clock, LogOut, Scissors } from 'lucide-react';
import api from '../lib/api';

const navItems = [
    { name: 'Schedule', path: '/staff', icon: Clock },
    { name: 'Appointments', path: '/staff/appointments', icon: CalendarCheck },
    { name: 'My Profile', path: '/staff/profile', icon: UserCircle },
];

export default function StaffLayout() {
    const navigate = useNavigate();

    const handleLogout = async () => {
        try { await api.post('/auth/logout'); } catch { }
        navigate('/login');
    };

    return (
        <div className="flex h-screen w-full bg-[#181A20] text-white overflow-hidden">
            <aside className="w-60 border-r border-[#35383F] bg-[#1F222A] flex flex-col">
                <div className="p-5 flex items-center gap-3 border-b border-[#35383F]">
                    <div className="w-9 h-9 rounded-xl bg-[#F4A460] flex items-center justify-center shrink-0">
                        <Scissors size={18} className="text-[#181A20]" />
                    </div>
                    <div>
                        <p className="font-bold text-white">Barmagly</p>
                        <p className="text-zinc-500 text-xs">Staff View</p>
                    </div>
                </div>

                <nav className="flex-1 px-3 py-4 space-y-1">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <NavLink key={item.path} to={item.path} end={item.path === '/staff'}
                                className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${isActive ? 'bg-[#F4A460]/15 text-[#F4A460] font-medium' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>
                                <Icon size={18} className="shrink-0" /><span>{item.name}</span>
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="p-3 border-t border-[#35383F]">
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm">
                        <LogOut size={18} /><span>Logout</span>
                    </button>
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto"><Outlet /></main>
        </div>
    );
}
