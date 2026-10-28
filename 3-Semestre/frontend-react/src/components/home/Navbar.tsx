import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User as UserIcon, LayoutDashboard, Loader2 } from 'lucide-react';
import logoImg from '../../assets/logo-active-age.png';

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  role: 'ROLE_PACIENTE' | 'ROLE_MEDICO' | 'ROLE_ADMIN';
  crm?: string;
  ufCrm?: string;
  dossierStatus?: string;
}

export function Navbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const profile: UserProfile = await response.json();
          setCurrentUser(profile);
        } else {
          setCurrentUser(null);
        }
      } catch {
        setCurrentUser(null);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Erro ao realizar logout', err);
    } finally {
      setIsLoggingOut(false);
      setCurrentUser(null);
      navigate('/');
    }
  };

  const getRoleLabel = (role: string) => {
    if (role === 'ROLE_MEDICO') return 'Médico(a)';
    if (role === 'ROLE_ADMIN') return 'Admin';
    return 'Paciente';
  };

  const getDashboardPath = (role: string, dossierStatus?: string) => {
    if (role === 'ROLE_ADMIN') return '/admin';
    if (role === 'ROLE_MEDICO') {
      return dossierStatus === 'APPROVED' ? '/medico/dashboard' : '/medico/credenciamento';
    }
    return '/paciente/dashboard';
  };

  const firstName = currentUser?.fullName ? currentUser.fullName.split(' ')[0] : '';

  return (
    <nav className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-3">
              <img src={logoImg} alt="Active Age" className="h-14 sm:h-16 w-auto object-contain transition-transform hover:scale-105" />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/#beneficios" className="text-brown hover:text-brand-orange transition-colors font-medium">Benefícios</a>
            <a href="/#como-funciona" className="text-brown hover:text-brand-orange transition-colors font-medium">Como Funciona</a>
            
            <div className="flex items-center space-x-4 border-l-2 border-brand-pot pl-8 ml-4">
              {currentUser ? (
                <>
                  <Link
                    to={getDashboardPath(currentUser.role, currentUser.dossierStatus)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold text-sm transition-all shadow-sm"
                    title="Acessar painel do usuário"
                  >
                    <LayoutDashboard size={18} />
                    Meu Painel
                  </Link>

                  <div className="flex items-center gap-2 text-brown-dark font-medium px-3.5 py-2 rounded-xl bg-brand-pot/20">
                    <UserIcon size={18} className="text-brand-orange" />
                    <span className="text-sm">
                      Olá, <strong>{firstName}</strong> ({getRoleLabel(currentUser.role)})
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="inline-flex items-center gap-1.5 text-red-600 hover:text-red-700 font-semibold px-3 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                    title="Encerrar sessão segura"
                  >
                    {isLoggingOut ? (
                      <>
                        <Loader2 size={18} className="animate-spin text-red-600" />
                        <span>Saindo...</span>
                      </>
                    ) : (
                      <>
                        <LogOut size={18} />
                        <span>Sair</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-brown-dark font-semibold hover:text-brand-orange transition-colors">
                    Entrar
                  </Link>
                  <Link to="/cadastro" className="btn-primary">
                    Criar Conta
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-brown-dark hover:text-brand-orange p-2 focus:outline-none"
              aria-label="Abrir menu principal"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full left-0 transition-all">
          <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
            <a href="/#beneficios" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 text-brown hover:bg-brand-pot/20 rounded-md font-medium">Benefícios</a>
            <a href="/#como-funciona" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 text-brown hover:bg-brand-pot/20 rounded-md font-medium">Como Funciona</a>
            <div className="border-t border-brand-pot/50 my-2"></div>
            {currentUser ? (
              <>
                <Link
                  to={getDashboardPath(currentUser.role, currentUser.dossierStatus)}
                  onClick={() => setIsMenuOpen(false)}
                  className="w-full text-left px-3 py-3 text-brand-orange font-bold hover:bg-orange-50 rounded-md flex items-center gap-2"
                >
                  <LayoutDashboard size={18} />
                  Acessar Meu Painel
                </Link>

                <div className="px-3 py-2 text-sm text-brown-dark font-medium bg-brand-pot/20 rounded-md">
                  Conectado como <strong>{currentUser.fullName}</strong> ({getRoleLabel(currentUser.role)})
                </div>

                <button
                  onClick={() => {
                    setIsMenuOpen(false);
                    handleLogout();
                  }}
                  disabled={isLoggingOut}
                  className="w-full text-left px-3 py-3 text-red-600 font-semibold hover:bg-red-50 rounded-md flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoggingOut ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-red-600" />
                      <span>Saindo...</span>
                    </>
                  ) : (
                    <>
                      <LogOut size={18} />
                      <span>Sair da Conta</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 text-brown-dark font-semibold hover:bg-brand-pot/20 rounded-md">Entrar</Link>
                <Link to="/cadastro" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 text-center btn-primary w-full mt-4">Criar Conta</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
