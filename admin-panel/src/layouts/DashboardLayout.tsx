import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Users, Scissors, CalendarCheck, LogOut, Ticket, CreditCard,
    BarChart3, MessageSquare, Settings as SettingsIcon, Menu, X, ChevronDown,
    Building2, Globe, UserCheck, Key, Activity,
    DollarSign, FileText, Bell, ClipboardList, Database, MessageCircle, Wallet,
    Zap, TrendingUp
} from 'lucide-react';
import api from '../lib/api';

interface NavSection {
    label: string;
    items: { name: string; path: string; icon: any }[];
}

const navSections: NavSection[] = [
    {
        label: 'OVERVIEW',
        items: [
            { name: 'Dashboard', path: '/', icon: LayoutDashboard },
        ]
    },
    {
        label: 'STORES',
        items: [
            { name: 'Store Manager', path: '/salons', icon: Building2 },
            { name: 'Landing Pages', path: '/landing-pages', icon: Globe },
        ]
    },
    {
        label: 'PLATFORM',
        items: [
            { name: 'Tenants', path: '/tenants', icon: UserCheck },
            { name: 'Subscriptions', path: '/subscriptions', icon: CreditCard },
            { name: 'License Keys', path: '/license-keys', icon: Key },
            { name: 'Plans Manager', path: '/plans', icon: Zap },
        ]
    },
    {
        label: 'ANALYTICS',
        items: [
            { name: 'Store Analytics', path: '/store-analytics', icon: TrendingUp },
            { name: 'Analytics', path: '/reports', icon: BarChart3 },
            { name: 'Commissions', path: '/commissions', icon: DollarSign },
            { name: 'System Health', path: '/system-health', icon: Activity },
        ]
    },
    {
        label: 'OPERATIONS',
        items: [
            { name: 'Notifications', path: '/notifications', icon: Bell },
            { name: 'Reports', path: '/admin-reports', icon: FileText },
            { name: 'Activity Log', path: '/activity-log', icon: ClipboardList },
            { name: 'Expenses', path: '/expenses', icon: Wallet },
            { name: 'Shifts', path: '/shifts', icon: CalendarCheck },
        ]
    },
    {
        label: 'MANAGEMENT',
        items: [
            { name: 'Users', path: '/users', icon: Users },
            { name: 'Bookings', path: '/bookings', icon: CalendarCheck },
            { name: 'Services', path: '/services', icon: Scissors },
            { name: 'Coupons', path: '/coupons', icon: Ticket },
            { name: 'Payments', path: '/payments', icon: CreditCard },
            { name: 'Messages', path: '/messages', icon: MessageSquare },
        ]
    },
    {
        label: 'SYSTEM',
        items: [
            { name: 'Backup & Restore', path: '/backup', icon: Database },
            { name: 'WhatsApp', path: '/whatsapp', icon: MessageCircle },
        ]
    },
    {
        label: 'ACCOUNT',
        items: [
            { name: 'Settings', path: '/settings', icon: SettingsIcon },
        ]
    },
];

export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

    useEffect(() => { setSidebarOpen(false); }, [location.pathname]);

    useEffect(() => {
        const handleResize = () => { if (window.innerWidth >= 768) setSidebarOpen(false); };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = async () => {
        try { await api.post('/auth/logout'); } catch { }
        navigate('/login');
    };

    const toggleSection = (label: string) => {
        setCollapsed(prev => ({ ...prev, [label]: !prev[label] }));
    };

    const sidebarContent = (
        <>
            <div className="p-5 flex items-center gap-3 border-b border-[#35383F]">
                <div className="w-9 h-9 rounded-xl bg-[#F4A460] flex items-center justify-center font-bold text-[#181A20] text-lg shrink-0">
                    <Scissors size={18} />
                </div>
                <span className="font-bold text-xl tracking-wide text-white">Barmagly</span>
                <button onClick={() => setSidebarOpen(false)} className="md:hidden ml-auto p-1.5 rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white transition-colors">
                    <X size={22} />
                </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navSections.map((section) => (
                    <div key={section.label} className="mb-2">
                        <button
                            onClick={() => toggleSection(section.label)}
                            className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-widest hover:text-zinc-400 transition-colors"
                        >
                            <span>{section.label}</span>
                            <ChevronDown size={14} className={`transition-transform ${collapsed[section.label] ? '-rotate-90' : ''}`} />
                        </button>
                        {!collapsed[section.label] && (
                            <div className="space-y-0.5 mt-1">
                                {section.items.map((item) => {
                                    const Icon = item.icon;
                                    return (
                                        <NavLink
                                            key={item.path}
                                            to={item.path}
                                            end={item.path === '/'}
                                            className={({ isActive }) =>
                                                `flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${isActive
                                                    ? 'bg-[#F4A460]/15 text-[#F4A460] font-medium'
                                                    : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                                                }`
                                            }
                                        >
                                            <Icon size={18} className="shrink-0" />
                                            <span className="truncate text-sm">{item.name}</span>
                                        </NavLink>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            <div className="p-3 border-t border-[#35383F]">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut size={18} className="shrink-0" />
                    <span className="text-sm">Logout</span>
                </button>
            </div>
        </>
    );

    return (
        <div className="flex h-screen w-full bg-[#181A20] text-white overflow-hidden">
            {sidebarOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            <aside className={`fixed md:static inset-y-0 left-0 z-50 w-64 lg:w-72 border-r border-[#35383F] bg-[#1F222A] flex flex-col transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 md:transform-none`}>
                {sidebarContent}
            </aside>

            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-[#1F222A] border-b border-[#35383F] shrink-0">
                    <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl text-zinc-400 hover:bg-white/10 hover:text-white transition-colors">
                        <Menu size={24} />
                    </button>
                    <div className="w-7 h-7 rounded-lg bg-[#F4A460] flex items-center justify-center font-bold text-[#181A20] text-sm">
                        <Scissors size={14} />
                    </div>
                    <span className="font-semibold text-lg text-white">Barmagly</span>
                </header>

                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
