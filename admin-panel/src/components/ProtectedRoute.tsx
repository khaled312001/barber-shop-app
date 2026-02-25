import { useEffect, useState } from 'react';
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

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await api.get('/auth/me');
                if (response.data && response.data.user && response.data.user.role === 'admin') {
                    setUser(response.data.user);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                setUser(null);
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [location.pathname]);

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
