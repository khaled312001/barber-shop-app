import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, CalendarCheck, Users, Scissors, UserCircle, CreditCard,
    BarChart3, LogOut, Menu, X, Settings, Clock, Wallet, ChevronDown
} from 'lucide-react';
import api from '../lib/api';

const navSections = [
    {
        label: 'OVERVIEW',
        items: [{ name: 'Dashboard', path: '/salon', icon: LayoutDashboard }],
    },
    {
        label: 'OPERATIONS',
        items: [
            { name: 'Appointments', path: '/salon/appointments', icon: CalendarCheck },
            { name: 'Customers', path: '/salon/customers', icon: UserCircle },
            { name: 'Staff', path: '/salon/staff', icon: Users },
            { name: 'Shifts', path: '/salon/shifts', icon: Clock },
        ],
    },
    {
        label: 'BUSINESS',
        items: [
            { name: 'Services', path: '/salon/services', icon: Scissors },
            { name: 'Payments', path: '/salon/payments', icon: CreditCard },
            { name: 'Expenses', path: '/salon/expenses', icon: Wallet },
            { name: 'Analytics', path: '/salon/analytics', icon: BarChart3 },
        ],
    },
    {
        label: 'ACCOUNT',
        items: [
            { name: 'Subscription', path: '/salon/subscription', icon: CreditCard },
            { name: 'Settings', path: '/salon/settings', icon: Settings },
        ],
    },
];

export default function SalonAdminLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

    useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

    const handleLogout = async () => {
        try { await api.post('/auth/logout'); } catch { }
        navigate('/login');
    };

    const toggleSection = (label: string) => setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));

    const sidebar = (
        <>
            <div className="p-5 flex items-center gap-3 border-b border-[#35383F]">
                <div className="w-9 h-9 rounded-xl bg-[#F4A460] flex items-center justify-center shrink-0">
                    <Scissors size={18} className="text-[#181A20]" />
                </div>
                <div>
                    <p className="font-bold text-white text-base">Barmagly</p>
                    <p className="text-zinc-500 text-xs">Salon Admin</p>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="md:hidden ml-auto p-1.5 rounded-lg text-zinc-400 hover:bg-white/10"><X size={20} /></button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navSections.map(section => (
                    <div key={section.label} className="mb-2">
                        <button onClick={() => toggleSection(section.label)} className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-widest hover:text-zinc-400 transition-colors">
                            <span>{section.label}</span>
                            <ChevronDown size={14} className={`transition-transform ${collapsed[section.label] ? '-rotate-90' : ''}`} />
                        </button>
                        {!collapsed[section.label] && (
                            <div className="space-y-0.5 mt-1">
                                {section.items.map(item => {
                                    const Icon = item.icon;
                                    return (
                                        <NavLink key={item.path} to={item.path} end={item.path === '/salon'}
                                            className={({ isActive }) => `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm transition-all ${isActive ? 'bg-[#F4A460]/15 text-[#F4A460] font-medium' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>
                                            <Icon size={18} className="shrink-0" /><span>{item.name}</span>
                                        </NavLink>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            <div className="p-3 border-t border-[#35383F]">
                <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors text-sm">
                    <LogOut size={18} /><span>Logout</span>
                </button>
            </div>
        </>
    );

    return (
        <div className="flex h-screen w-full bg-[#181A20] text-white overflow-hidden">
            {sidebarOpen && <div className="fixed inset-0 bg-black/60 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}
            <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 lg:w-72 border-r border-[#35383F] bg-[#1F222A] flex flex-col transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                {sidebar}
            </aside>
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#1F222A] border-b border-[#35383F]">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl text-zinc-400 hover:bg-white/10"><Menu size={22} /></button>
                    <span className="font-semibold text-white">Salon Admin</span>
                </header>
                <main className="flex-1 overflow-y-auto"><Outlet /></main>
            </div>
        </div>
    );
}
