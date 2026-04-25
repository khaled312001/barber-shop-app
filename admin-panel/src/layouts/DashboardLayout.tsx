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
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';

interface NavItem {
    nameKey: string;
    path: string;
    icon: any;
}

interface NavSection {
    labelKey: string;
    items: NavItem[];
}

const navSections: NavSection[] = [
    {
        labelKey: 'nav_overview',
        items: [
            { nameKey: 'dashboard', path: '/', icon: LayoutDashboard },
        ]
    },
    {
        labelKey: 'nav_stores',
        items: [
            { nameKey: 'nav_store_manager', path: '/salons', icon: Building2 },
            { nameKey: 'landing_pages', path: '/landing-pages', icon: Globe },
        ]
    },
    {
        labelKey: 'nav_platform',
        items: [
            { nameKey: 'tenants', path: '/tenants', icon: UserCheck },
            { nameKey: 'subscriptions', path: '/subscriptions', icon: CreditCard },
            { nameKey: 'license_keys', path: '/license-keys', icon: Key },
            { nameKey: 'nav_plans_manager', path: '/plans', icon: Zap },
        ]
    },
    {
        labelKey: 'nav_analytics',
        items: [
            { nameKey: 'store_analytics', path: '/store-analytics', icon: TrendingUp },
            { nameKey: 'nav_analytics_item', path: '/reports', icon: BarChart3 },
            { nameKey: 'commissions_title', path: '/commissions', icon: DollarSign },
            { nameKey: 'system_health', path: '/system-health', icon: Activity },
        ]
    },
    {
        labelKey: 'nav_operations',
        items: [
            { nameKey: 'notifications', path: '/notifications', icon: Bell },
            { nameKey: 'admin_reports', path: '/admin-reports', icon: FileText },
            { nameKey: 'activity_log', path: '/activity-log', icon: ClipboardList },
            { nameKey: 'admin_expenses', path: '/expenses', icon: Wallet },
            { nameKey: 'admin_shifts', path: '/shifts', icon: CalendarCheck },
        ]
    },
    {
        labelKey: 'nav_management',
        items: [
            { nameKey: 'users', path: '/users', icon: Users },
            { nameKey: 'tab_bookings', path: '/bookings', icon: CalendarCheck },
            { nameKey: 'services', path: '/services', icon: Scissors },
            { nameKey: 'nav_coupons', path: '/coupons', icon: Ticket },
            { nameKey: 'payments', path: '/payments', icon: CreditCard },
            { nameKey: 'nav_messages', path: '/messages', icon: MessageSquare },
        ]
    },
    {
        labelKey: 'nav_system',
        items: [
            { nameKey: 'backup_restore', path: '/backup', icon: Database },
            { nameKey: 'whatsapp', path: '/whatsapp', icon: MessageCircle },
        ]
    },
    {
        labelKey: 'nav_account',
        items: [
            { nameKey: 'settings', path: '/settings', icon: SettingsIcon },
        ]
    },
];

export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useLanguage();
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

            <div className="px-4 pt-3">
                <LanguageSwitcher />
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navSections.map((section) => (
                    <div key={section.labelKey} className="mb-2">
                        <button
                            onClick={() => toggleSection(section.labelKey)}
                            className="w-full flex items-center justify-between px-3 py-1.5 text-xs font-semibold text-zinc-500 uppercase tracking-widest hover:text-zinc-400 transition-colors"
                        >
                            <span>{t(section.labelKey)}</span>
                            <ChevronDown size={14} className={`transition-transform ${collapsed[section.labelKey] ? '-rotate-90' : ''}`} />
                        </button>
                        {!collapsed[section.labelKey] && (
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
                                            <span className="truncate text-sm">{t(item.nameKey)}</span>
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
                    <span className="text-sm">{t('logout')}</span>
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
