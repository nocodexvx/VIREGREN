import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { apiFetch } from "@/services/apiClient";

interface UseUsersParams {
    page: number;
    limit: number;
    search?: string;
    role?: string;
}

interface User {
    id: string;
    full_name: string;
    email: string;
    role: string;
    created_at: string;
    avatar_url?: string;
    [key: string]: any;
}

interface UsersResponse {
    users: User[];
    total: number;
    page: number;
    pages: number;
}

export const useUsers = ({ page, limit, search, role }: UseUsersParams) => {
    return useQuery<UsersResponse>({
        queryKey: ['users', { page, limit, search, role }],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: limit.toString(),
            });

            if (search) params.append('search', search);
            if (role && role !== 'Todos') params.append('role', role);

            return await apiFetch(`/api/admin/users?${params.toString()}`);
        },
        placeholderData: keepPreviousData,
        staleTime: 1000 * 60, // 1 minute
        retry: (failureCount, error) => {
            // Don't retry on 401/403/404
            if (error.message.includes('401') || error.message.includes('403') || error.message.includes('404')) return false;
            return failureCount < 2;
        }
    });
};
