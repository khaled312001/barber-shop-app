import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, Scissors, CalendarCheck, LogOut, Ticket, CreditCard, BarChart3, MessageSquare, Settings as SettingsIcon } from 'lucide-react';

export default function DashboardLayout() {
    const navigate = useNavigate();

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

    return (
        <div className="flex h-screen w-full bg-bg-dark text-text overflow-hidden">
            {/* Sidebar */}
            <aside className="w-64 border-r border-border bg-bg-card flex flex-col">
                <div className="p-6 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center font-bold text-bg-dark">
                        B
                    </div>
                    <span className="font-bold text-xl tracking-wide text-white">Barber Admin</span>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-1">
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
                                <Icon size={20} />
                                {item.name}
                            </NavLink>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-border">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-colors"
                    >
                        <LogOut size={20} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
}
