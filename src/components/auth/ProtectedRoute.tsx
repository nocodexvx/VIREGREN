import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = () => {
    const { user, loading, subscriptionStatus, isAdmin } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Allow admins to bypass subscription check
    if (isAdmin) {
        return <Outlet />;
    }

    // Check if user has active subscription
    if (subscriptionStatus !== 'active') {
        // If they are not active, redirect to subscribe page
        // But only if they are not already there (to avoid loops if we protect subscribe too, though subscribe usually shouldn't be protected by this same logic)
        // Ideally Subscribe page is a separate route not wrapped in THIS ProtectedRoute? 
        return <Navigate to="/subscribe" replace />;
    }

    return <Outlet />;
};
