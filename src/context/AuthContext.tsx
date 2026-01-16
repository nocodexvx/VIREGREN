import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Session, User } from '@supabase/supabase-js';

// Define status type similar to Stripe/Supabase
type SubscriptionStatus = 'active' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'trialing' | 'unpaid' | null;

interface AuthContextType {
    user: User | null;
    session: Session | null;
    loading: boolean;
    isAdmin: boolean;
    subscriptionStatus: SubscriptionStatus;
    checkSubscription: () => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    session: null,
    loading: true,
    isAdmin: false,
    subscriptionStatus: null,
    checkSubscription: async () => { },
    signOut: async () => { },
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);
    const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus>(null);

    useEffect(() => {
        // Check active sessions and sets the user
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                // Parallel check for admin and subscription
                Promise.all([
                    checkAdminRole(session.user.id, session.user.email),
                    fetchSubscriptionStatus(session.user.id)
                ]).finally(() => setLoading(false));
            } else {
                setLoading(false);
            }
        });

        // Listen for changes on auth state
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                checkAdminRole(session.user.id, session.user.email);
                fetchSubscriptionStatus(session.user.id);
            } else {
                setIsAdmin(false);
                setSubscriptionStatus(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchSubscriptionStatus = async (userId: string) => {
        try {
            const { data, error } = await supabase
                .from('subscriptions')
                .select('status')
                .eq('user_id', userId)
                .maybeSingle(); // Use maybeSingle to avoid errors if no row exists

            if (!error && data) {
                setSubscriptionStatus(data.status);
            } else {
                setSubscriptionStatus(null);
            }
        } catch (error) {
            console.error('Error fetching subscription:', error);
            setSubscriptionStatus(null);
        }
    };

    const checkAdminRole = async (userId: string, email?: string) => {
        // 1. First check hardcoded emails (fastest and most reliable if DB is incomplete)
        const adminEmails = ['admin@variagen.com', 'admin@admin.com', 'suporte@variagen.com', 'yurigabriel160218@gmail.com'];
        if (email && adminEmails.includes(email.toLowerCase())) {
            setIsAdmin(true);
            return;
        }

        // 2. Fallback to DB check (only if needed)
        try {
            const { data, error } = await supabase
                .from('users')
                .select('role')
                .eq('id', userId)
                .maybeSingle();

            if (!error && data?.role === 'admin') {
                setIsAdmin(true);
            } else {
                setIsAdmin(false);
            }
        } catch (e) {
            console.error('Error checking admin role', e);
            // Default to false on error
            setIsAdmin(false);
        }
        // Don't modify loading here as it is handled in useEffect
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setSubscriptionStatus(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            session,
            loading,
            isAdmin,
            subscriptionStatus,
            checkSubscription: async () => {
                if (user) await fetchSubscriptionStatus(user.id);
            },
            signOut
        }}>
            {children}
        </AuthContext.Provider>
    );
}
