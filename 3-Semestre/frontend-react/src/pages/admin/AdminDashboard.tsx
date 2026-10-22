import React from 'react';
import { Link } from 'react-router-dom';
import { 
  UserCheck, 
  Users, 
  ShieldAlert, 
  FileText, 
  ArrowRight, 
  Server, 
  Database, 
  Globe 
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto w-full space-y-8 animate-fade-in">
      {/* === CABEÇALHO DA PÁGINA === */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-brand-pot/40">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-brown-dark tracking-tight">
            Visão Geral do Sistema
          </h1>
          <p className="text-base text-brown-light mt-1">
            Controle de governança, credenciamento médico e auditoria da plataforma Active Age.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Serviços Operacionais (Live)
          </span>
        </div>
      </div>

      {/* === CARDS DE MÉTRICAS (KPIS) === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Médicos Pendentes (Destaque) */}
        <div className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Credenciamento
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-brown-dark mb-1">
            Fila Ativa
          </div>
          <p className="text-xs text-brown-light font-medium mb-4">
            Médicos aguardando verificação de CRM/RQE (UC03 / UC04)
          </p>
          <Link
            to="/admin/medicos"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:underline group-hover:translate-x-0.5 transition-transform"
          >
            Acessar fila de validação <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 2: Gestão de Usuários */}
        <div className="bg-white rounded-2xl p-6 border border-brand-pot/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brown-light">
              Usuários
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-brown-dark mb-1">
            RBAC Ativo
          </div>
          <p className="text-xs text-brown-light font-medium mb-4">
            Segregação de perfis Paciente, Médico e Administrador
          </p>
          <Link
            to="/admin/usuarios"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:underline"
          >
            Gerenciar contas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 3: Segurança & Proteção de Acesso */}
        <div className="bg-white rounded-2xl p-6 border border-brand-pot/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brown-light">
              Segurança
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-brown-dark mb-1">
            Bucket4j
          </div>
          <p className="text-xs text-brown-light font-medium mb-4">
            Rate limiting contra força bruta (5 tentativas / 15 min)
          </p>
          <span className="text-xs font-bold text-emerald-600 inline-flex items-center gap-1">
            Proteção perimetral ativa
          </span>
        </div>

        {/* Card 4: Trilha de Auditoria (CFM & LGPD) */}
        <div className="bg-white rounded-2xl p-6 border border-brand-pot/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brown-light">
              Conformidade
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-brown-dark mb-1">
            CFM & LGPD
          </div>
          <p className="text-xs text-brown-light font-medium mb-4">
            Trilha de auditoria imutável para ações administrativas
          </p>
          <Link
            to="/admin/auditoria"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:underline"
          >
            Ver logs do sistema <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* === STATUS DA INFRAESTRUTURA EM NUVEM === */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-brand-pot/40 shadow-sm">
        <h2 className="text-xl font-bold text-brown-dark mb-2">
          Infraestrutura em Produção
        </h2>
        <p className="text-sm text-brown-light mb-6">
          Conexões em tempo real validadas com os provedores da Release v0.1.0 e Sprint 2.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-brand-orange">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-400 block font-bold">BACKEND CORE</span>
              <span className="text-sm font-extrabold text-brown-dark">Render (Docker)</span>
              <span className="text-xs text-emerald-600 font-bold block mt-0.5">HTTP 200 OK</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-emerald-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-400 block font-bold">BANCO DE DADOS</span>
              <span className="text-sm font-extrabold text-brown-dark">MongoDB Atlas</span>
              <span className="text-xs text-emerald-600 font-bold block mt-0.5">Replica Set Conectado</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-sky-600">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-400 block font-bold">FRONTEND SPA</span>
              <span className="text-sm font-extrabold text-brown-dark">Vercel Edge</span>
              <span className="text-xs text-emerald-600 font-bold block mt-0.5">Proxy Rewrite Ativo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
