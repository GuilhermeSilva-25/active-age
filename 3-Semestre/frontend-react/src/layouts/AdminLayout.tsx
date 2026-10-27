import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCheck, 
  Users, 
  FileText, 
  LogOut, 
  Menu, 
  X, 
  ShieldCheck, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import logoImg from '../assets/logo-active-age.png';

export const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (error) {
      console.error('Erro ao efetuar logout:', error);
    } finally {
      navigate('/login');
    }
  };

  const navItems = [
    {
      to: '/admin',
      end: true,
      label: 'Visão Geral',
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
      description: 'Métricas e resumo do sistema',
    },
    {
      to: '/admin/credenciamento',
      end: false,
      label: 'Credenciamento',
      icon: <UserCheck className="w-5 h-5 shrink-0" />,
      description: 'Auditoria de Dossiê CFM (Res. 2.314/2022)',
    },
    {
      to: '/admin/usuarios',
      end: false,
      label: 'Gestão de Usuários',
      icon: <Users className="w-5 h-5 shrink-0" />,
      description: 'Moderação de contas e RBAC',
    },
    {
      to: '/admin/auditoria',
      end: false,
      label: 'Logs de Auditoria',
      icon: <FileText className="w-5 h-5 shrink-0" />,
      description: 'Trilha de conformidade CFM/LGPD',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row text-brown-dark font-sans">
      {/* === SIDEBAR (DESKTOP) === */}
      <aside className="hidden md:flex flex-col w-72 bg-white border-r border-brand-pot/40 shadow-xs z-20">
        {/* Topo do Sidebar com Logo */}
        <div className="p-6 border-b border-brand-pot/30 flex items-center gap-3">
          <img src={logoImg} alt="Active Age" className="h-10 w-auto" />
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-brand-orange block">
              Painel de Gestão
            </span>
            <span className="text-xs bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full inline-flex items-center gap-1 mt-0.5">
              <ShieldCheck className="w-3.5 h-3.5" /> ROLE_ADMIN
            </span>
          </div>
        </div>

        {/* Menu de Navegação */}
        <nav className="flex-1 px-4 py-6 space-y-1.5" aria-label="Navegação Administrativa">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3.5 rounded-xl font-bold transition-all text-sm group ${
                  isActive
                    ? 'bg-brand-orange text-white shadow-md'
                    : 'text-brown-dark hover:bg-orange-50 hover:text-brand-orange'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className={isActive ? 'text-white' : 'text-brown-light group-hover:text-brand-orange transition-colors'}>
                    {item.icon}
                  </span>
                  <div className="flex-1 min-w-0">
                    <span className="block truncate">{item.label}</span>
                    <span
                      className={`text-xs block font-normal truncate ${
                        isActive ? 'text-white/80' : 'text-gray-400'
                      }`}
                    >
                      {item.description}
                    </span>
                  </div>
                  <ChevronRight className={`w-4 h-4 shrink-0 transition-transform ${isActive ? 'text-white' : 'opacity-0 group-hover:opacity-100'}`} />
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Rodapé da Sidebar: Link para Site Público e Botão Sair */}
        <div className="p-4 border-t border-brand-pot/30 space-y-2">
          <a
            href="/"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-brown-light hover:text-brand-orange hover:bg-gray-100 transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            <span>Ver Plataforma Pública</span>
          </a>

          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition-colors border border-red-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Encerrar Sessão</span>
          </button>
        </div>
      </aside>

      {/* === HEADER MOBILE === */}
      <header className="md:hidden bg-white border-b border-brand-pot/40 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2.5">
          <img src={logoImg} alt="Active Age" className="h-9 w-auto object-contain" />
          <span className="text-[11px] bg-amber-100 text-amber-800 font-extrabold px-2 py-0.5 rounded-full inline-flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-amber-700" /> Admin
          </span>
        </div>

        <button
          type="button"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-xl text-brown-dark hover:bg-gray-100 focus:outline-none transition-colors border border-brand-pot/30"
          aria-label="Abrir menu"
        >
          {isMobileMenuOpen ? <X className="w-5 h-5 text-brand-orange" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* === MENU RETRÁTIL MOBILE === */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-brand-pot/40 px-4 py-4 space-y-2 z-30 animate-in fade-in shadow-md">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${
                  isActive
                    ? 'bg-brand-orange text-white shadow-xs'
                    : 'text-brown-dark hover:bg-orange-50 hover:text-brand-orange'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
          <div className="pt-2 border-t border-gray-100 space-y-2">
            <a
              href="/"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-brown-light hover:text-brand-orange hover:bg-gray-100 transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Ver Plataforma Pública</span>
            </a>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 border border-red-200 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sair do Painel</span>
            </button>
          </div>
        </div>
      )}

      {/* === ÁREA PRINCIPAL DE CONTEÚDO (COM PADDING PADRONIZADO) === */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-gray-50/60 p-4 sm:p-6 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
