import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '../lib/api';

interface User {
    id: string;
    role: string;
    [key: string]: any;
}

const SUPER_ADMIN_ROLES = ['super_admin', 'admin'];

export function SuperAdminRoute({ children }: { children: React.ReactNode }) {
    return <RoleGuard allowedRoles={SUPER_ADMIN_ROLES} redirectTo="/login">{children}</RoleGuard>;
}

export function SalonAdminRoute({ children }: { children: React.ReactNode }) {
    return <RoleGuard allowedRoles={['salon_admin']} redirectTo="/login">{children}</RoleGuard>;
}

export function StaffRoute({ children }: { children: React.ReactNode }) {
    return <RoleGuard allowedRoles={['staff']} redirectTo="/login">{children}</RoleGuard>;
}

function RoleGuard({ children, allowedRoles, redirectTo }: { children: React.ReactNode; allowedRoles: string[]; redirectTo: string }) {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const location = useLocation();

    useEffect(() => {
        api.get('/auth/me')
            .then(res => {
                const u = res.data?.user;
                if (u && allowedRoles.includes(u.role)) {
                    setUser(u);
                } else {
                    setUser(null);
                }
            })
            .catch(() => setUser(null))
            .finally(() => setIsLoading(false));
    }, []);

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-[#181A20]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#F4A460]"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to={redirectTo} replace state={{ from: location }} />;
    }

    return <>{children}</>;
}

// Legacy default export for backward compatibility
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    return <SuperAdminRoute>{children}</SuperAdminRoute>;
}
