import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  UserCheck, 
  Users, 
  Calendar, 
  FileText, 
  ArrowRight, 
  Server, 
  Database, 
  Globe,
  Loader2
} from 'lucide-react';

interface AdminStats {
  totalPatients: number;
  totalApprovedDoctors: number;
  pendingDoctorsQueue: number;
  totalAppointments: number;
  scheduledAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  availableScheduleSlots: number;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch (err) {
        console.error('Erro ao carregar estatísticas do admin:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* === CABEÇALHO DA PÁGINA === */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-4 sm:pb-6 border-b border-brand-pot/40">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-brown-dark tracking-tight">
            Visão Geral do Sistema
          </h1>
          <p className="text-xs sm:text-base text-brown-light mt-1">
            Controle de governança, credenciamento médico e auditoria da plataforma Active Age.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Serviços Operacionais (Live)
          </span>
        </div>
      </div>

      {/* === CARDS DE MÉTRICAS (KPIS) === */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Credenciamento Médico */}
        <div className="bg-white rounded-2xl p-6 border-2 border-amber-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
              Credenciamento
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-brown-dark mb-1">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-amber-600" />
            ) : stats && stats.pendingDoctorsQueue > 0 ? (
              `${stats.pendingDoctorsQueue} Pendente(s)`
            ) : (
              'Fila Zerada'
            )}
          </div>
          <p className="text-xs text-brown-light font-medium mb-4">
            {stats ? `${stats.totalApprovedDoctors} médicos homologados no catálogo` : 'Médicos aguardando verificação de CRM'}
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
          <div className="text-2xl sm:text-3xl font-extrabold text-brown-dark mb-1">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            ) : stats ? (
              `${stats.totalPatients + stats.totalApprovedDoctors} Contas`
            ) : (
              'Acesso Ativo'
            )}
          </div>
          <p className="text-xs text-brown-light font-medium mb-4">
            {stats ? `${stats.totalPatients} pacientes e ${stats.totalApprovedDoctors} médicos ativos` : 'Segregação de perfis Paciente, Médico e Admin'}
          </p>
          <Link
            to="/admin/usuarios"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:underline"
          >
            Gerenciar contas <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 3: Teleconsultas & Agendamentos */}
        <div className="bg-white rounded-2xl p-6 border border-brand-pot/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brown-light">
              Teleconsultas
            </span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-brown-dark mb-1">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            ) : stats ? (
              `${stats.scheduledAppointments} Ativa(s)`
            ) : (
              '0 Agendadas'
            )}
          </div>
          <p className="text-xs text-brown-light font-medium mb-4">
            {stats ? `${stats.availableScheduleSlots} horários livres disponíveis na rede` : 'Monitoramento de consultas e turnos livres'}
          </p>
          <Link
            to="/admin/auditoria"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:underline"
          >
            Auditar agendamentos <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Card 4: Trilha de Auditoria (CFM & LGPD) */}
        <div className="bg-white rounded-2xl p-6 border border-brand-pot/50 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-brown-light">
              Governança
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-brown-dark mb-1">
            CFM & LGPD
          </div>
          <p className="text-xs text-brown-light font-medium mb-4">
            Rastreabilidade perene com Nível de Segurança SBIS NGS1
          </p>
          <Link
            to="/admin/auditoria"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-orange hover:underline"
          >
            Ver trilha de logs <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* === STATUS DA INFRAESTRUTURA EM NUVEM === */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-brand-pot/40 shadow-sm">
        <h2 className="text-xl font-bold text-brown-dark mb-2">
          Infraestrutura em Produção
        </h2>
        <p className="text-sm text-brown-light mb-6">
          Monitoramento em tempo real dos serviços essenciais da plataforma.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-brand-orange">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-400 block font-bold">SERVIÇO PRINCIPAL</span>
              <span className="text-sm font-extrabold text-brown-dark">Servidor da Aplicação</span>
              <span className="text-xs text-emerald-600 font-bold block mt-0.5">Operacional</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-emerald-600">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-400 block font-bold">DADOS SEGUROS</span>
              <span className="text-sm font-extrabold text-brown-dark">Armazenamento em Nuvem</span>
              <span className="text-xs text-emerald-600 font-bold block mt-0.5">Conexão Criptografada Ativa</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-sky-600">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs text-gray-400 block font-bold">PORTAL WEB</span>
              <span className="text-sm font-extrabold text-brown-dark">Interface de Atendimento</span>
              <span className="text-xs text-emerald-600 font-bold block mt-0.5">Disponível Globalmente</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
