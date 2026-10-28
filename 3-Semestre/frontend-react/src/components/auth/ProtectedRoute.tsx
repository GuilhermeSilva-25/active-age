import React, { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2, ShieldAlert, UserX, LogOut } from 'lucide-react';

export type UserRole = 'ROLE_PACIENTE' | 'ROLE_MEDICO' | 'ROLE_ADMIN';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  active?: boolean;
  crm?: string;
  ufCrm?: string;
}

interface ProtectedRouteProps {
  requiredRole?: UserRole;
  children?: React.ReactNode;
}

/**
 * Guarda de Rotas Baseado em Papéis (RBAC - Role-Based Access Control).
 * Intercepta o acesso a rotas privadas, consulta o perfil ativo na sessão (JWT HttpOnly)
 * e redireciona usuários anônimos ou sem privilégio suficiente.
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  requiredRole,
  children,
}) => {
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    let isMounted = true;

    const checkAuthentication = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const profile: UserProfile = await response.json();
          if (isMounted) {
            setCurrentUser(profile);
          }
        } else {
          if (isMounted) {
            setCurrentUser(null);
          }
        }
      } catch (error) {
        if (isMounted) {
          setCurrentUser(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    checkAuthentication();

    return () => {
      isMounted = false;
    };
  }, []);

  // 1. Tela de Carregamento Acessível (Enquanto valida a sessão)
  if (isLoading) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center"
        role="status"
        aria-live="polite"
      >
        <Loader2 className="w-12 h-12 text-brand-orange animate-spin mb-4" />
        <h2 className="text-xl font-bold text-brown-dark mb-1">
          Validando credenciais de acesso...
        </h2>
        <p className="text-sm text-brown-light font-medium">
          Verificando sua sessão segura com o Active Age.
        </p>
      </div>
    );
  }

  // 2. Não Autenticado -> Redireciona para /login
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 3. Autenticado mas com Conta Inativada / Suspensa (UC05)
  if (currentUser.active === false) {
    const handleLogoutAndExit = async () => {
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (err) {
        console.error('Erro ao efetuar logout de conta suspensa:', err);
      } finally {
        window.location.href = '/login';
      }
    };

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center animate-fade-in">
        <div className="w-16 h-16 rounded-2xl bg-red-50 border-2 border-red-200 flex items-center justify-center mb-4 text-red-600">
          <UserX className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-brown-dark mb-2">
          Conta Suspensa ou Desativada
        </h2>
        <p className="text-brown max-w-md mb-6 text-sm leading-relaxed">
          Olá, <strong>{currentUser.fullName}</strong>. Sua conta encontra-se atualmente inativa ou suspensa pela administração da plataforma Active Age. Caso acredite que isto seja um engano, entre em contato com nossa equipe de suporte.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <a
            href="mailto:suporte@activeage.com.br"
            className="px-6 py-3 rounded-xl border border-brand-pot/50 text-brown-dark font-bold text-xs hover:bg-brand-pot/10 transition-colors"
          >
            Falar com o Suporte
          </a>
          <button
            type="button"
            onClick={handleLogoutAndExit}
            className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors shadow-xs inline-flex items-center gap-1.5"
          >
            <LogOut className="w-4 h-4" />
            <span>Sair da Conta</span>
          </button>
        </div>
      </div>
    );
  }

  // 4. Autenticado mas sem o papel exigido (RBAC restrito)
  if (requiredRole && currentUser.role !== requiredRole) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center mb-4 text-amber-600">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-brown-dark mb-2">
          Acesso Restrito
        </h2>
        <p className="text-brown-light max-w-md mb-6 leading-relaxed">
          Seu perfil ({currentUser.role}) não possui privilégios para acessar este módulo administrativo.
        </p>
        <a
          href="/"
          className="btn-primary"
        >
          Voltar para a Página Inicial
        </a>
      </div>
    );
  }

  // 4. Acesso Concedido
  return children ? <>{children}</> : <Outlet context={{ currentUser }} />;
};
