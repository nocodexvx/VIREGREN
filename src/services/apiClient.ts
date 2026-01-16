import { supabase } from '@/lib/supabase';

interface FetchOptions extends RequestInit {
    requireAuth?: boolean;
}

const API_BASE_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3000');

export async function apiFetch(endpoint: string, options: FetchOptions = {}) {
    const { requireAuth = true, ...fetchOptions } = options;
    const headers = new Headers(fetchOptions.headers);

    // Default headers
    if (!headers.has('Content-Type') && !(fetchOptions.body instanceof FormData)) {
        headers.set('Content-Type', 'application/json');
    }

    // Auth Injection
    if (requireAuth) {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
            headers.set('Authorization', `Bearer ${session.access_token}`);
        } else {
            throw new Error('No active session');
        }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers,
    });

    // Handle Response
    const contentType = response.headers.get('content-type');
    const isJson = contentType && contentType.includes('application/json');

    // Safe Parse
    const data = isJson ? await response.json() : await response.text();

    if (!response.ok) {
        const errorMsg = typeof data === 'object' && data.error ? data.error : 'API Error';
        throw new Error(`${response.status} ${errorMsg}`);
    }

    return data;
}
