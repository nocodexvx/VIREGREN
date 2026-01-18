import { supabase } from '@/lib/supabase';

interface FetchOptions extends RequestInit {
    requireAuth?: boolean;
}

// If no VITE_API_URL is set, default to empty string (relative path).
// CRITICAL FIX: Ignore 'localhost' if it accidentally leaks into production env vars.
let envUrl = import.meta.env.VITE_API_URL || '';
if (envUrl.includes('localhost')) {
    console.warn('⚠️ Localhost detected in API URL, switching to relative path.');
    envUrl = '';
}
const API_BASE_URL = envUrl;

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

        if (response.status === 401) {
            // Optional: redirect to login or clear token if needed
            sessionStorage.removeItem('sb-access-token'); // Example cleanup
            throw new Error('401 Unauthorized: Sessão expirada ou inválida.');
        }

        if (response.status === 403) {
            throw new Error('403 Forbidden: Você não tem permissão para realizar esta ação.');
        }

        if (response.status === 500) {
            throw new Error(`500 Internal Server Error: ${errorMsg}`);
        }

        throw new Error(`${response.status} ${errorMsg}`);
    }

    return data;
}
