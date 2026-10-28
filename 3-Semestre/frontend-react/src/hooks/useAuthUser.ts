import { useState, useEffect, useCallback } from 'react';

export interface AuthUser {
    id: string;
    fullName: string;
    email: string;
    role: 'ROLE_PACIENTE' | 'ROLE_MEDICO' | 'ROLE_ADMIN';
    crm?: string;
    ufCrm?: string;
    dossierStatus?: 'PENDING_DOCS' | 'UNDER_REVIEW' | 'DOCS_REJECTED' | 'APPROVED';
    active?: boolean;
    avatarUrl?: string;
}

/**
 * Hook utilitário para recuperar os dados da sessão do usuário autenticado.
 * Retorna o usuário ativo, estado de carregamento, função de atualização e o caminho exato do dashboard.
 */
export function useAuthUser() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchUser = useCallback(async () => {
        try {
            const res = await fetch('/api/auth/me');
            if (res.ok) {
                const data: AuthUser = await res.json();
                setUser(data);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const getDashboardPath = (): string => {
        if (!user) return '/';
        if (user.role === 'ROLE_ADMIN') return '/admin';
        if (user.role === 'ROLE_MEDICO') {
            return user.dossierStatus === 'APPROVED' ? '/medico/dashboard' : '/medico/credenciamento';
        }
        return '/paciente/dashboard';
    };

    return {
        user,
        loading,
        isAuthenticated: !!user && user.active !== false,
        dashboardPath: getDashboardPath(),
        refreshUser: fetchUser,
    };
}
