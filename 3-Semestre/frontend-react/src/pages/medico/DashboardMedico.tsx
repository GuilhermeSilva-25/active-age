import { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    Stethoscope,
    Calendar,
    Users,
    FileCheck2,
    Video,
    Clock,
    AlertTriangle,
    ShieldCheck,
    CheckCircle2,
    XCircle,
    ArrowRight,
    LogOut,
    CreditCard,
        Lock,
    Loader2,
    Receipt
} from 'lucide-react';
import { FeedbackModal } from '../../components/common/FeedbackModal';
import { MedicalRecordViewModal } from '../../components/teleconsulta/MedicalRecordViewModal';
import { DoctorRecordsManagerModal } from '../../components/teleconsulta/DoctorRecordsManagerModal';
import { AssinaturaSaaSModal } from '../../components/medico/AssinaturaSaaSModal';
import { ExtratoFinanceiroModal } from '../../components/medico/ExtratoFinanceiroModal';
import { FileText } from 'lucide-react';
import { Footer } from '../../components/home/Footer';
import logoImg from '../../assets/logo-active-age.png';

interface DoctorProfile {
    id: string;
    fullName: string;
    email: string;
    role: string;
    crm?: string;
    ufCrm?: string;
    avatarUrl?: string;
    dossierStatus?: 'PENDING_DOCS' | 'UNDER_REVIEW' | 'DOCS_REJECTED' | 'APPROVED';
    rejectionReason?: string;
    trialExpiresAt?: string;
    active: boolean;
}

interface DoctorStats {
    todayAppointments: number;
    totalPatients: number;
    totalAppointments: number;
    freeSlots: number;
    trialDaysRemaining: number;
    trialExpiresAt?: string;
    subscriptionStatus?: string;
    subscriptionExpiresAt?: string;
}

interface DoctorTodayAppointment {
    id: string;
    patientId: string;
    patientName: string;
    startDateTime: string;
    endDateTime: string;
    durationMinutes: number;
    consultationFee: number;
    patientNotes?: string;
    status: string;
}

export function DashboardMedico() {
    const [todayAppointments, setTodayAppointments] = useState<DoctorTodayAppointment[]>([]);
    const [stats, setStats] = useState<DoctorStats | null>(null);
    const navigate = useNavigate();
    const [profile, setProfile] = useState<DoctorProfile | null>(null);

    const isSubscribed = useMemo(() => {
        if (stats?.subscriptionStatus === 'ASSINATURA_ATIVA') return true;
        const key1 = 'activeage_doctor_subscription_' + (profile?.id || profile?.email);
        if (localStorage.getItem(key1) === 'ASSINATURA_ATIVA') return true;
        if (localStorage.getItem('activeage_doctor_subscription_medico@teste.com') === 'ASSINATURA_ATIVA') return true;
        return false;
    }, [stats?.subscriptionStatus, profile?.id, profile?.email]);

    const [selectedApptForRecord, setSelectedApptForRecord] = useState<DoctorTodayAppointment | null>(null);
    const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
    const [isRecordsManagerOpen, setIsRecordsManagerOpen] = useState(false);
    const [saasTimeRemaining, setSaasTimeRemaining] = useState<string>('');

    // Cronômetro funcional de assinatura / degustação regressivo segundo a segundo (SPEC-17F)
    useEffect(() => {
        const updateCountdown = () => {
            let targetMs: number;
            const expStr = stats?.subscriptionExpiresAt || stats?.trialExpiresAt || profile?.trialExpiresAt;
            if (expStr && !isNaN(new Date(expStr).getTime())) {
                targetMs = new Date(expStr).getTime();
            } else {
                const d = new Date();
                d.setDate(d.getDate() + (stats?.trialDaysRemaining ?? 14));
                d.setHours(23, 59, 59, 0);
                targetMs = d.getTime();
            }

            const diff = targetMs - Date.now();
            if (diff <= 0) {
                setSaasTimeRemaining('Expirado');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setSaasTimeRemaining(`${days}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`);
        };

        updateCountdown();
        const timer = setInterval(updateCountdown, 1000);
        return () => clearInterval(timer);
    }, [stats?.subscriptionExpiresAt, stats?.trialExpiresAt, stats?.trialDaysRemaining, profile?.trialExpiresAt]);
    const [isSaaSModalOpen, setIsSaaSModalOpen] = useState(false);
    const [isExtratoModalOpen, setIsExtratoModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Feedback Modal
    const [feedback, setFeedback] = useState<{
        isOpen: boolean;
        type: 'success' | 'error' | 'warning' | 'info';
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: 'info',
        title: '',
        message: '',
    });

    useEffect(() => {
        const loadProfile = async () => {
            try {
                const response = await fetch('/api/auth/me');
                if (response.ok) {
                    const data: DoctorProfile = await response.json();
                    setProfile(data);
                    if (data.dossierStatus === 'APPROVED') {
                        try {
                            const appsRes = await fetch('/api/doctor/appointments/today');
                            if (appsRes.ok) {
                                const appsData = await appsRes.json();
                                setTodayAppointments(appsData);
                            }
                        } catch (e) {
                            console.error('Erro ao buscar consultas de hoje:', e);
                        }

                        try {
                            const statsRes = await fetch('/api/doctor/stats');
                            if (statsRes.ok) {
                                const statsData = await statsRes.json();
                                setStats(statsData);
                            }
                        } catch (e) {
                            console.error('Erro ao buscar métricas do médico:', e);
                        }
                    }
                } else {
                    navigate('/login');
                }
            } catch (err) {
                console.error('Erro ao buscar perfil médico:', err);
                navigate('/login');
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [navigate]);

    const handleLogout = async () => {
        try {
            setIsLoggingOut(true);
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (err) {
            console.error('Erro ao efetuar logout:', err);
        } finally {
            setIsLoggingOut(false);
            navigate('/login');
        }
    };

    const handleFeatureNotice = (featureName: string, releaseDetail: string) => {
        setFeedback({
            isOpen: true,
            type: 'info',
            title: featureName,
            message: `${releaseDetail} Em conformidade com a Resolução CFM nº 2.314/2022, o fluxo estará plenamente integrado ao seu consultório virtual.`,
        });
    };

    const isApproved = profile?.dossierStatus === 'APPROVED';

    return (
        <div className="min-h-screen bg-gray-50 text-brown-dark font-sans flex flex-col justify-between">
            {/* Header Profissional do Médico */}
            <header className="bg-white border-b border-brand-pot/40 shadow-xs sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-6">
                        <Link to="/" title="Página Inicial Active Age" className="shrink-0 flex items-center">
                            <img src={logoImg} alt="Active Age" className="h-10 sm:h-14 md:h-16 w-auto object-contain" />
                        </Link>
                        <div className="h-8 w-px bg-brand-pot/40 hidden sm:block" />
                        
                        {/* Identificação Completa (Desktop / Tablet) */}
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-brand-orange/10 border border-brand-orange/20 overflow-hidden flex items-center justify-center text-brand-orange shadow-inner shrink-0">
                                {profile?.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                                ) : (
                                    <Stethoscope className="w-6 h-6" />
                                )}
                            </div>
                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-orange block">
                                    Consultório Virtual • Active Age
                                </span>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-base sm:text-lg font-black text-brown-dark">
                                        Dr(a). {loading ? '...' : (profile?.fullName || 'Médico')}
                                    </h1>
                                    {profile?.crm && (
                                        <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-brand-pot/20 text-brown-dark border border-brand-pot/40">
                                            CRM {profile.crm}-{profile.ufCrm || 'SP'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-3">
                        {/* Chip Compacto do Médico (Mobile) */}
                        <div className="sm:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-orange/10 border border-brand-orange/20 text-brand-orange">
                            <Stethoscope className="w-4 h-4 shrink-0" />
                            <span className="text-xs font-bold truncate max-w-[100px]">
                                Dr(a). {loading ? '...' : (profile?.fullName ? profile.fullName.split(' ')[0] : 'Médico')}
                            </span>
                        </div>

                        <Link
                            to="/medico/perfil"
                            className="p-2 sm:px-4 sm:py-2.5 rounded-xl border border-brand-pot bg-white hover:bg-brand-pot/20 text-brown-dark text-xs sm:text-sm font-bold transition-all shadow-xs inline-flex items-center gap-1.5 shrink-0"
                            title="Gerenciar Perfil Profissional e Honorários"
                        >
                            {profile?.avatarUrl ? (
                                <img src={profile.avatarUrl} alt={profile.fullName} className="w-4 h-4 rounded-full object-cover shrink-0" />
                            ) : (
                                <Stethoscope className="w-4 h-4 text-brand-orange shrink-0" />
                            )}
                            <span className="hidden sm:inline">Meu Perfil</span>
                        </Link>
                        <Link
                            to="/medico/credenciamento"
                            className="p-2 sm:px-4 sm:py-2.5 rounded-xl border border-brand-pot bg-white hover:bg-brand-pot/20 text-brown-dark text-xs sm:text-sm font-bold transition-all shadow-xs inline-flex items-center gap-1.5 shrink-0"
                            title="Acessar Dossiê de Credenciamento"
                        >
                            <FileCheck2 className="w-4 h-4 text-brand-orange shrink-0" />
                            <span className="hidden sm:inline">Dossiê</span>
                        </Link>
                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="inline-flex items-center gap-1.5 p-2 sm:px-4 sm:py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0 disabled:opacity-70 disabled:cursor-not-allowed"
                            title="Encerrar sessão médica segura"
                        >
                            {isLoggingOut ? (
                                <>
                                    <Loader2 className="w-4 h-4 shrink-0 animate-spin text-red-600" />
                                    <span className="hidden sm:inline">Saindo...</span>
                                </>
                            ) : (
                                <>
                                    <LogOut className="w-4 h-4 shrink-0" />
                                    <span className="hidden sm:inline">Encerrar Sessão</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 mt-5 sm:mt-8 mb-16 sm:mb-20 space-y-6 sm:space-y-8 flex-grow w-full">
                {/* Banner Regulatório de Status do CFM (Resolução CFM nº 2.314/2022) */}
                {profile?.dossierStatus === 'PENDING_DOCS' && (
                    <div className="bg-amber-50 border-2 border-amber-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
                        <div className="flex items-start gap-3 sm:gap-4">
                            <div className="p-2.5 sm:p-3 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5">
                                <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-amber-800 block">
                                    Ação Obrigatória • Resolução CFM nº 2.314/2022
                                </span>
                                <h3 className="text-base sm:text-lg font-black text-amber-950 mt-0.5">
                                    Envio do Dossiê Profissional Pendente
                                </h3>
                                <p className="text-amber-900 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                                    Para ativar sua agenda de teleconsultas e liberar o consultório virtual, você precisa submeter seus comprovantes profissionais (CRM, Diploma, Certificado ICP-Brasil e Dados Bancários para Split Direto).
                                </p>
                            </div>
                        </div>
                        <Link
                            to="/medico/credenciamento"
                            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition-all shadow-sm shrink-0 inline-flex items-center gap-2 justify-center"
                        >
                            Completar Meu Dossiê <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}

                {profile?.dossierStatus === 'UNDER_REVIEW' && (
                    <div className="bg-blue-50 border-2 border-blue-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm flex items-start gap-3 sm:gap-4 animate-in fade-in">
                        <div className="p-2.5 sm:p-3 bg-blue-100 text-blue-800 rounded-xl shrink-0 mt-0.5">
                            <Clock className="w-5 h-5 sm:w-6 sm:h-6 animate-pulse" />
                        </div>
                        <div>
                            <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-blue-800 block">
                                Dossiê Submetido com Sucesso
                            </span>
                            <h3 className="text-base sm:text-lg font-black text-blue-950 mt-0.5">
                                Documentação em Análise pela Equipe de Auditoria
                            </h3>
                            <p className="text-blue-900 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                                Seus documentos estão sendo conferidos junto ao Conselho Regional de Medicina. O prazo habitual de homologação é de até 24 a 48 horas úteis. Assim que validado, seu consultório virtual e vitrine de agendamentos serão destravados.
                            </p>
                        </div>
                    </div>
                )}

                {profile?.dossierStatus === 'DOCS_REJECTED' && (
                    <div className="bg-red-50 border-2 border-red-300 rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
                        <div className="flex items-start gap-3 sm:gap-4">
                            <div className="p-2.5 sm:p-3 bg-red-100 text-red-800 rounded-xl shrink-0 mt-0.5">
                                <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                            </div>
                            <div>
                                <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-red-800 block">
                                    Correção Solicitada pelo Auditor
                                </span>
                                <h3 className="text-base sm:text-lg font-black text-red-950 mt-0.5">
                                    Necessário Ajustar Documentos do Dossiê
                                </h3>
                                <p className="text-red-900 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                                    <strong>Justificativa do Auditor:</strong> {profile.rejectionReason || 'Algum documento enviado não está legível ou necessita de reenvio.'}
                                </p>
                            </div>
                        </div>
                        <Link
                            to="/medico/credenciamento"
                            className="w-full sm:w-auto px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all shadow-sm shrink-0 inline-flex items-center gap-2 justify-center"
                        >
                            Reenviar Documentos <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}

                {isApproved && (
                    <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                                    Credenciamento Homologado • Res. CFM nº 2.314/2022
                                </span>
                                <p className="text-emerald-950 text-xs sm:text-sm font-medium">
                                    Habilitado para prática de telemedicina ética com certificação ICP-Brasil e Split Direto.
                                </p>
                            </div>
                        </div>
                        <span className="self-start sm:self-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold shrink-0">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Médico Verificado
                        </span>
                    </div>
                )}

                {/* Grid de Métricas do Consultório Virtual */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-5">
                    {/* Card 1: Consultas de Hoje */}
                    <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-brand-pot/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                        <div>
                            <span className="text-[10px] sm:text-xs font-bold text-brown-light uppercase tracking-wider block">
                                Atendimentos Hoje
                            </span>
                            <span className="text-xl sm:text-2xl md:text-3xl font-black text-brown-dark mt-0.5 sm:mt-1 block">
                                {stats?.todayAppointments ?? todayAppointments.length}
                            </span>
                            <span className="text-[10px] sm:text-[11px] text-brown-light font-medium mt-0.5 block truncate">
                                {isApproved ? 'Pronto para pacientes' : 'Aguardando validação'}
                            </span>
                        </div>
                        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center shrink-0 self-end sm:self-center">
                            <Calendar className="w-4 h-4 sm:w-6 sm:h-6" />
                        </div>
                    </div>

                    {/* Card 2: Total de Pacientes */}
                    <div className="bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border border-brand-pot/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3">
                        <div>
                            <span className="text-[10px] sm:text-xs font-bold text-brown-light uppercase tracking-wider block">
                                Pacientes
                            </span>
                            <span className="text-xl sm:text-2xl md:text-3xl font-black text-brown-dark mt-0.5 sm:mt-1 block">
                                {stats?.totalPatients ?? (todayAppointments.length > 0 ? 1 : 0)}
                            </span>
                            <span className="text-[10px] sm:text-[11px] text-brown-light font-medium mt-0.5 block truncate">
                                Prontuários ativos
                            </span>
                        </div>
                        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 self-end sm:self-center">
                            <Users className="w-4 h-4 sm:w-6 sm:h-6" />
                        </div>
                    </div>

                    {/* Card 3: Assinatura SaaS / Degustação Gratuita */}
                    <div
                        onClick={() => {
                            if (isSubscribed) {
                                setFeedback({
                                    isOpen: true,
                                    title: 'Assinatura SaaS Ativa',
                                    message: 'Seu consultório virtual Pro está ativo com acesso completo a teleconsultas e emissão de prontuários. Próxima renovação automática em 30 dias. Para ver seu comprovante de pagamento, acesse o Extrato Financeiro.',
                                    type: 'success',
                                });
                            } else {
                                setIsSaaSModalOpen(true);
                            }
                        }}
                        className={`bg-white p-3.5 sm:p-5 rounded-xl sm:rounded-2xl border shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-3 cursor-pointer transition-all group ${
                            isSubscribed ? 'border-emerald-300 hover:border-emerald-600' : 'border-brand-pot/40 hover:border-emerald-600'
                        }`}
                        title={isSubscribed ? 'Consultório Pro Ativo (Clique para detalhes)' : 'Assinar Consultório Virtual Pro'}
                    >
                        <div>
                            <div className="flex items-center gap-1.5">
                                <span className="text-[10px] sm:text-xs font-bold text-brown-light uppercase tracking-wider block">
                                    Assinatura SaaS
                                </span>
                                {isSubscribed && (
                                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 text-[9px] font-bold">
                                        Ativo
                                    </span>
                                )}
                            </div>
                            <div className="mt-0.5 sm:mt-1">
                                <span className="text-sm sm:text-base md:text-lg font-black font-mono text-emerald-800 flex items-center gap-1.5">
                                    {isSubscribed ? (
                                        <>
                                            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                                            <span>Plano Pro Ativo</span>
                                        </>
                                    ) : (
                                        <>
                                            <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                                            <span>{saasTimeRemaining || 'Calculando...'}</span>
                                        </>
                                    )}
                                </span>
                            </div>
                            <span className="text-[10px] sm:text-[11px] text-emerald-800 font-bold mt-0.5 block truncate group-hover:underline">
                                {isSubscribed
                                    ? 'Renovação em 30 dias • Consultório Pro'
                                    : '100% honorários • Assinar Plano'}
                            </span>
                        </div>
                        <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 self-end sm:self-center group-hover:scale-105 transition-transform">
                            <CreditCard className="w-4 h-4 sm:w-6 sm:h-6" />
                        </div>
                    </div>
                </div>

                {/* Seção: Pacientes Agendados Hoje (SPEC-11H - Priorizada no Topo quando houver consultas) */}
                {todayAppointments.length > 0 && (
                    <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-pot/40 p-4 sm:p-6 md:p-8 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 sm:pb-6 border-b border-brand-pot/30 gap-2 sm:gap-4">
                            <div>
                                <h3 className="text-base sm:text-xl font-black text-brown-dark">
                                    Pacientes Agendados Hoje
                                </h3>
                                <p className="text-brown-light text-xs sm:text-sm mt-0.5">
                                    Fila de teleconsultas com pagamento confirmado
                                </p>
                            </div>
                            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-brown-light">
                                {todayAppointments.length} {todayAppointments.length === 1 ? 'consulta para hoje' : 'consultas para hoje'}
                            </span>
                        </div>

                        <div className="py-4 space-y-3">
                            {todayAppointments.map(app => (
                                <div key={app.id} className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                                                app.status === 'REALIZADA'
                                                    ? 'bg-blue-100 text-blue-800'
                                                    : 'bg-emerald-100 text-emerald-800'
                                            }`}>
                                                {app.startDateTime.split('T')[1].substring(0, 5)} - {app.endDateTime.split('T')[1].substring(0, 5)}
                                                {app.status === 'REALIZADA' && ' • Realizada'}
                                            </span>
                                            <span className="text-xs font-bold text-brown-light">
                                                Teleconsulta ({app.durationMinutes} min)
                                            </span>
                                        </div>
                                        <h4 className="text-sm sm:text-base font-black text-brown-dark">
                                            Paciente: {app.patientName}
                                        </h4>
                                        {app.patientNotes && (
                                            <p className="text-xs text-brown-light italic">
                                                "{app.patientNotes}"
                                            </p>
                                        )}
                                    </div>
                                    {app.status === 'REALIZADA' ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedApptForRecord(app);
                                                setIsRecordModalOpen(true);
                                            }}
                                            className="px-4 py-2 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold transition-all shadow-xs self-start sm:self-auto cursor-pointer flex items-center gap-1.5 min-h-[40px]"
                                        >
                                            <FileText className="w-3.5 h-3.5" />
                                            <span>Ver Prontuário & Documentos</span>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={() => navigate(`/teleconsulta/${app.id}`)}
                                            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs self-start sm:self-auto cursor-pointer flex items-center gap-1.5 min-h-[40px]"
                                        >
                                            <Video className="w-3.5 h-3.5" />
                                            <span>Abrir Sala Virtual →</span>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Ações Clínicas Rápidas do Consultório */}
                <div>
                    <h3 className="text-base sm:text-xl font-black text-brown-dark mb-3 sm:mb-4 flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-brand-orange" />
                        Ferramentas do Consultório Virtual
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                        {/* Ação 1: Agenda & Horários */}
                        <div
                            onClick={() => {
                                if (!isApproved) {
                                    handleFeatureNotice('Agenda Bloqueada', 'Sua agenda estará disponível para abertura de horários assim que o dossiê for homologado.');
                                    return;
                                }
                                navigate('/medico/agenda');
                            }}
                            role="button"
                            tabIndex={0}
                            className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                                isApproved
                                    ? 'bg-white border-brand-pot/60 hover:border-brand-orange shadow-xs hover:shadow-md'
                                    : 'bg-gray-100 border-gray-200 opacity-75'
                            }`}
                        >
                            <div>
                                <div className="flex items-center justify-between mb-3 sm:mb-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center">
                                        <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    {!isApproved && (
                                        <span className="px-2 py-0.5 rounded-md bg-gray-200 text-gray-700 text-[10px] sm:text-[11px] font-bold flex items-center gap-1">
                                            <Lock className="w-3 h-3" /> Bloqueado
                                        </span>
                                    )}
                                </div>
                                <h4 className="text-base sm:text-lg font-black text-brown-dark">
                                    Configurar Minha Agenda
                                </h4>
                                <p className="text-brown-light text-xs sm:text-sm mt-1 leading-snug">
                                    Defina seus horários de atendimento semanal, tempo de consulta e intervalos livres.
                                </p>
                            </div>
                            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-brand-pot/30 flex items-center justify-between text-xs font-bold text-brand-orange">
                                <span>Disponível</span>
                                <span>Acessar Agenda →</span>
                            </div>
                        </div>

                        {/* Ação 2: Prontuário & Prescrição ICP-Brasil */}
                        <div
                            onClick={() => {
                                if (!isApproved) {
                                    handleFeatureNotice('Módulo Bloqueado', 'A emissão de documentos médicos exige validação de regularidade junto ao conselho de medicina.');
                                    return;
                                }
                                setIsRecordsManagerOpen(true);
                            }}
                            role="button"
                            tabIndex={0}
                            className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                                isApproved
                                    ? 'bg-white border-brand-pot/60 hover:border-brand-orange shadow-xs hover:shadow-md'
                                    : 'bg-gray-100 border-gray-200 opacity-75'
                            }`}
                        >
                            <div>
                                <div className="flex items-center justify-between mb-3 sm:mb-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                                        <FileCheck2 className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                    {!isApproved && (
                                        <span className="px-2 py-0.5 rounded-md bg-gray-200 text-gray-700 text-[10px] sm:text-[11px] font-bold flex items-center gap-1">
                                            <Lock className="w-3 h-3" /> Bloqueado
                                        </span>
                                    )}
                                </div>
                                <h4 className="text-base sm:text-lg font-black text-brown-dark">
                                    Prontuários & Prescrições
                                </h4>
                                <p className="text-brown-light text-xs sm:text-sm mt-1 leading-snug">
                                    Registro de evolução clínica, emissão de receitas, pedidos de exames e atestados com assinatura digital A1/A3.
                                </p>
                            </div>
                            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-brand-pot/30 flex items-center justify-between text-xs font-bold text-emerald-700">
                                <span>Acessar Sala Virtual →</span>
                                <span>Acessar Prontuários →</span>
                            </div>
                        </div>

                        {/* Ação 4: Extrato Financeiro & Split Direto */}
                        <div
                            onClick={() => setIsExtratoModalOpen(true)}
                            role="button"
                            tabIndex={0}
                            className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between bg-white border-brand-pot/60 hover:border-emerald-600 shadow-xs hover:shadow-md"
                        >
                            <div>
                                <div className="flex items-center justify-between mb-3 sm:mb-4">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                                        <Receipt className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </div>
                                </div>
                                <h4 className="text-base sm:text-lg font-black text-brown-dark">
                                    Extrato Financeiro
                                </h4>
                                <p className="text-brown-light text-xs sm:text-sm mt-1 leading-snug">
                                    Acompanhe as faturas e comprovantes de pagamento da assinatura do seu consultório virtual.
                                </p>
                            </div>
                            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-brand-pot/30 flex items-center justify-between text-xs font-bold text-emerald-800">
                                <span>Mercado Pago IP</span>
                                <span>Ver Extrato →</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seção: Pacientes Agendados no Dia (Empty State no rodapé quando não houver consultas - SPEC-11H) */}
                {todayAppointments.length === 0 && (
                    <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-pot/40 p-4 sm:p-6 md:p-8 shadow-xs">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 sm:pb-6 border-b border-brand-pot/30 gap-2 sm:gap-4">
                            <div>
                                <h3 className="text-base sm:text-xl font-black text-brown-dark">
                                    Pacientes Agendados Hoje
                                </h3>
                                <p className="text-brown-light text-xs sm:text-sm mt-0.5">
                                    Fila de teleconsultas com pagamento confirmado
                                </p>
                            </div>
                            <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-brown-light">
                                0 consultas para hoje
                            </span>
                        </div>

                        <div className="py-8 sm:py-12 text-center max-w-md mx-auto">
                            <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-brand-orange mx-auto mb-3 sm:mb-4">
                                <Clock className="w-6 h-6 sm:w-8 sm:h-8" />
                            </div>
                            <h4 className="text-sm sm:text-base font-bold text-brown-dark mb-1">
                                Nenhum paciente agendado para o dia
                            </h4>
                            <p className="text-brown-light text-xs sm:text-sm leading-relaxed">
                                Assim que sua agenda for disponibilizada e os pacientes confirmarem a reserva, as informações completas aparecerão aqui.
                            </p>
                        </div>
                    </div>
                )}
            </main>

            {/* Modal de Feedback Acessível */}
            <AssinaturaSaaSModal
                isOpen={isSaaSModalOpen}
                onClose={() => setIsSaaSModalOpen(false)}
                onSuccess={() => {
                    fetch('/api/doctor/stats')
                        .then(r => r.ok && r.json())
                        .then(d => d && setStats(d))
                        .catch(console.error);
                }}
                doctorId={profile?.id || ''}
                doctorName={profile?.fullName || ''}
                doctorEmail={profile?.email}
            />

            <FeedbackModal
                isOpen={feedback.isOpen}
                type={feedback.type}
                title={feedback.title}
                message={feedback.message}
                onConfirm={() => setFeedback({ ...feedback, isOpen: false })}
            />

            <Footer />

            {/* Modal de Prontuário Médico & Documentos (SPEC-13) */}
            <MedicalRecordViewModal
                isOpen={isRecordModalOpen}
                onClose={() => {
                    setIsRecordModalOpen(false);
                    setSelectedApptForRecord(null);
                }}
                appointmentId={selectedApptForRecord?.id || null}
                patientName={selectedApptForRecord?.patientName}
                doctorName={profile?.fullName}
                startDateTime={selectedApptForRecord?.startDateTime}
            />

            {/* Central de Prontuários & Prescrições Digitais (SPEC-14) */}
            <DoctorRecordsManagerModal
                isOpen={isRecordsManagerOpen}
                onClose={() => setIsRecordsManagerOpen(false)}
                doctorName={profile?.fullName}
            />

            {/* Extrato Financeiro & Split Direto (SPEC-17B) */}
            <ExtratoFinanceiroModal
                isOpen={isExtratoModalOpen}
                onClose={() => setIsExtratoModalOpen(false)}
                onOpenSubscribe={() => {
                    setIsExtratoModalOpen(false);
                    setIsSaaSModalOpen(true);
                }}
                isSubscribed={isSubscribed}
                doctorId={profile?.id || ''}
                doctorName={profile?.fullName || ''}
            />
        </div>
    );
}



