import { useEffect, useState, useRef } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import api from '../lib/api';

interface User {
    id: string;
    role: string;
    [key: string]: any;
}

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const [isLoading, setIsLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);
    const location = useLocation();
    const checkedRef = useRef(false);

    useEffect(() => {
        // Only check auth once, not on every route change
        if (checkedRef.current && user) return;

        const checkAuth = async () => {
            try {
                const response = await api.get('/auth/me');
                console.log('Auth check response:', response.status, response.data);
                if (response.data?.user?.role === 'admin') {
                    setUser(response.data.user);
                    checkedRef.current = true;
                } else {
                    console.warn('User is not admin:', response.data);
                    setUser(null);
                }
            } catch (error: any) {
                console.error('Auth check failed:', error?.response?.status, error?.message);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, []); // Only run once on mount

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-bg-dark">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <>{children}</>;
}
