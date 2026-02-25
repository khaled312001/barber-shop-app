import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Scissors, CalendarCheck, LogOut, Ticket, CreditCard, BarChart3, MessageSquare, Settings as SettingsIcon, Menu, X } from 'lucide-react';

export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Close sidebar on route change (mobile)
    useEffect(() => {
        setSidebarOpen(false);
    }, [location.pathname]);

    // Close sidebar on window resize to desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setSidebarOpen(false);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleLogout = () => {
        document.cookie = 'connect.sid=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        navigate('/login');
    };

    const navItems = [
        { name: 'Overview', path: '/', icon: LayoutDashboard },
        { name: 'Users', path: '/users', icon: Users },
        { name: 'Salons', path: '/salons', icon: Scissors },
        { name: 'Bookings', path: '/bookings', icon: CalendarCheck },
        { name: 'Services', path: '/services', icon: Scissors },
        { name: 'Coupons', path: '/coupons', icon: Ticket },
        { name: 'Payments', path: '/payments', icon: CreditCard },
        { name: 'Messages', path: '/messages', icon: MessageSquare },
        { name: 'Reports', path: '/reports', icon: BarChart3 },
        { name: 'Settings', path: '/settings', icon: SettingsIcon },
    ];

    const sidebarContent = (
        <>
            <div className="p-5 md:p-6 flex items-center gap-3 border-b border-border">
                <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center font-bold text-bg-dark text-lg shrink-0">
                    B
                </div>
                <span className="font-bold text-xl tracking-wide text-white">Barber Admin</span>
                {/* Close button on mobile */}
                <button
                    onClick={() => setSidebarOpen(false)}
                    className="md:hidden ml-auto p-1.5 rounded-lg text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                    aria-label="Close sidebar"
                >
                    <X size={22} />
                </button>
            </div>

            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                                    ? 'bg-primary/10 text-primary font-medium'
                                    : 'text-text-muted hover:bg-white/5 hover:text-white'
                                }`
                            }
                        >
                            <Icon size={20} className="shrink-0" />
                            <span className="truncate">{item.name}</span>
                        </NavLink>
                    );
                })}
            </nav>

            <div className="p-3 border-t border-border">
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                >
                    <LogOut size={20} className="shrink-0" />
                    <span>Logout</span>
                </button>
            </div>
        </>
    );

    return (
        <div className="flex h-screen w-full bg-bg-dark text-text overflow-hidden">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar — mobile: slide-in overlay, tablet+: always visible */}
            <aside
                className={`
                    fixed md:static inset-y-0 left-0 z-50
                    w-72 md:w-64 lg:w-72
                    border-r border-border bg-bg-card flex flex-col
                    transform transition-transform duration-300 ease-in-out
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
                    md:translate-x-0 md:transform-none
                `}
            >
                {sidebarContent}
            </aside>

            {/* Main content area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Mobile top bar */}
                <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-bg-card border-b border-border shrink-0">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 rounded-xl text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
                        aria-label="Open menu"
                    >
                        <Menu size={24} />
                    </button>
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center font-bold text-bg-dark text-sm">
                        B
                    </div>
                    <span className="font-semibold text-lg text-white">Barber Admin</span>
                </header>

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
