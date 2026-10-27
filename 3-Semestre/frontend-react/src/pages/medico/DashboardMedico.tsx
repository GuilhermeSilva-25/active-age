import { useState, useEffect } from 'react';
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
    Star,
    Lock
} from 'lucide-react';
import { FeedbackModal } from '../../components/common/FeedbackModal';
import { Footer } from '../../components/home/Footer';
import logoImg from '../../assets/logo-active-age.png';

interface DoctorProfile {
    id: string;
    fullName: string;
    email: string;
    role: string;
    crm?: string;
    ufCrm?: string;
    dossierStatus?: 'PENDING_DOCS' | 'UNDER_REVIEW' | 'DOCS_REJECTED' | 'APPROVED';
    rejectionReason?: string;
    trialExpiresAt?: string;
    active: boolean;
}

export function DashboardMedico() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<DoctorProfile | null>(null);
    const [loading, setLoading] = useState(true);

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
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (err) {
            console.error('Erro ao efetuar logout:', err);
        } finally {
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
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-6">
                        <Link to="/" title="Página Inicial Active Age" className="shrink-0 flex items-center">
                            <img src={logoImg} alt="Active Age" className="h-10 sm:h-14 md:h-16 w-auto object-contain" />
                        </Link>
                        <div className="h-8 w-px bg-brand-pot/40 hidden sm:block" />
                        
                        {/* Identificação Completa (Desktop / Tablet) */}
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center text-brand-orange shadow-inner shrink-0">
                                <Stethoscope className="w-6 h-6" />
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

                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Chip Compacto do Médico (Mobile) */}
                        <div className="sm:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-orange/10 border border-brand-orange/20 text-brand-orange">
                            <Stethoscope className="w-4 h-4 shrink-0" />
                            <span className="text-xs font-bold truncate max-w-[100px]">
                                Dr(a). {loading ? '...' : (profile?.fullName ? profile.fullName.split(' ')[0] : 'Médico')}
                            </span>
                        </div>

                        <Link
                            to="/medico/credenciamento"
                            className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-pot bg-white hover:bg-brand-pot/20 text-brown-dark text-xs sm:text-sm font-bold transition-all shadow-xs"
                        >
                            <FileCheck2 className="w-4 h-4 text-brand-orange" />
                            Dossiê de Credenciamento
                        </Link>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="inline-flex items-center gap-1.5 p-2.5 sm:px-4 sm:py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0"
                            title="Encerrar sessão médica segura"
                        >
                            <LogOut className="w-4 h-4 shrink-0" />
                            <span className="hidden sm:inline">Encerrar Sessão</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 mb-16 sm:mb-20 space-y-8 flex-grow w-full">
                {/* Banner Regulatório de Status do CFM (Resolução CFM nº 2.314/2022) */}
                {profile?.dossierStatus === 'PENDING_DOCS' && (
                    <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-amber-100 text-amber-800 rounded-xl shrink-0 mt-0.5">
                                <AlertTriangle className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-xs font-black uppercase tracking-wider text-amber-800 block">
                                    Ação Obrigatória • Resolução CFM nº 2.314/2022
                                </span>
                                <h3 className="text-lg font-black text-amber-950 mt-0.5">
                                    Envio do Dossiê Profissional Pendente
                                </h3>
                                <p className="text-amber-900 text-sm mt-1 max-w-2xl leading-relaxed">
                                    Para ativar sua agenda de teleconsultas e liberar o consultório virtual, você precisa submeter seus comprovantes profissionais (CRM, Diploma, Certificado ICP-Brasil e Dados Bancários para Split Direto).
                                </p>
                            </div>
                        </div>
                        <Link
                            to="/medico/credenciamento"
                            className="px-5 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm transition-all shadow-sm shrink-0 inline-flex items-center gap-2 justify-center"
                        >
                            Completar Meu Dossiê <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}

                {profile?.dossierStatus === 'UNDER_REVIEW' && (
                    <div className="bg-blue-50 border-2 border-blue-300 rounded-2xl p-6 shadow-sm flex items-start gap-4 animate-in fade-in">
                        <div className="p-3 bg-blue-100 text-blue-800 rounded-xl shrink-0 mt-0.5">
                            <Clock className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <span className="text-xs font-black uppercase tracking-wider text-blue-800 block">
                                Dossiê Submetido com Sucesso
                            </span>
                            <h3 className="text-lg font-black text-blue-950 mt-0.5">
                                Documentação em Análise pela Equipe de Auditoria
                            </h3>
                            <p className="text-blue-900 text-sm mt-1 max-w-2xl leading-relaxed">
                                Seus documentos estão sendo conferidos junto ao Conselho Regional de Medicina. O prazo habitual de homologação é de até 24 a 48 horas úteis. Assim que validado, seu consultório virtual e vitrine de agendamentos serão destravados.
                            </p>
                        </div>
                    </div>
                )}

                {profile?.dossierStatus === 'DOCS_REJECTED' && (
                    <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in fade-in">
                        <div className="flex items-start gap-4">
                            <div className="p-3 bg-red-100 text-red-800 rounded-xl shrink-0 mt-0.5">
                                <XCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-xs font-black uppercase tracking-wider text-red-800 block">
                                    Correção Solicitada pelo Auditor
                                </span>
                                <h3 className="text-lg font-black text-red-950 mt-0.5">
                                    Necessário Ajustar Documentos do Dossiê
                                </h3>
                                <p className="text-red-900 text-sm mt-1 max-w-2xl leading-relaxed">
                                    <strong>Justificativa do Auditor:</strong> {profile.rejectionReason || 'Algum documento enviado não está legível ou necessita de reenvio.'}
                                </p>
                            </div>
                        </div>
                        <Link
                            to="/medico/credenciamento"
                            className="px-5 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-sm transition-all shadow-sm shrink-0 inline-flex items-center gap-2 justify-center"
                        >
                            Reenviar Documentos <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                )}

                {isApproved && (
                    <div className="bg-emerald-50 border-2 border-emerald-300 rounded-2xl p-5 shadow-xs flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 text-emerald-800 rounded-lg shrink-0">
                                <ShieldCheck className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 block">
                                    Credenciamento Homologado • Res. CFM nº 2.314/2022
                                </span>
                                <p className="text-emerald-950 text-sm font-medium">
                                    Habilitado para prática de telemedicina ética com certificação ICP-Brasil e Split Direto.
                                </p>
                            </div>
                        </div>
                        <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Médico Verificado
                        </span>
                    </div>
                )}

                {/* Grid de Métricas do Consultório Virtual */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    {/* Card 1: Consultas de Hoje */}
                    <div className="bg-white p-5 rounded-2xl border border-brand-pot/40 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-brown-light uppercase tracking-wider block">
                                Atendimentos Hoje
                            </span>
                            <span className="text-2xl sm:text-3xl font-black text-brown-dark mt-1 block">
                                0
                            </span>
                            <span className="text-[11px] text-brown-light font-medium mt-0.5 block">
                                {isApproved ? 'Pronto para novos pacientes' : 'Aguardando homologação'}
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center">
                            <Calendar className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Card 2: Total de Pacientes */}
                    <div className="bg-white p-5 rounded-2xl border border-brand-pot/40 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-brown-light uppercase tracking-wider block">
                                Pacientes Assistidos
                            </span>
                            <span className="text-2xl sm:text-3xl font-black text-brown-dark mt-1 block">
                                0
                            </span>
                            <span className="text-[11px] text-brown-light font-medium mt-0.5 block">
                                Prontuários ativos no cofre
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Users className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Card 3: Assinatura SaaS / Degustação Gratuita */}
                    <div className="bg-white p-5 rounded-2xl border border-brand-pot/40 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-brown-light uppercase tracking-wider block">
                                Assinatura SaaS
                            </span>
                            <span className="text-base sm:text-lg font-black text-emerald-700 mt-1 block">
                                Degustação 15 Dias
                            </span>
                            <span className="text-[11px] text-emerald-800 font-bold mt-0.5 block">
                                100% dos honorários ao médico
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                            <CreditCard className="w-6 h-6" />
                        </div>
                    </div>

                    {/* Card 4: Avaliação Média */}
                    <div className="bg-white p-5 rounded-2xl border border-brand-pot/40 shadow-xs flex items-center justify-between">
                        <div>
                            <span className="text-xs font-bold text-brown-light uppercase tracking-wider block">
                                Avaliação Média
                            </span>
                            <div className="flex items-center gap-1.5 mt-1">
                                <span className="text-2xl sm:text-3xl font-black text-brown-dark">
                                    5.0
                                </span>
                                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                            </div>
                            <span className="text-[11px] text-brown-light font-medium mt-0.5 block">
                                Res. CFM 2.336/2023 (Sem autopromoção)
                            </span>
                        </div>
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Star className="w-6 h-6" />
                        </div>
                    </div>
                </div>

                {/* Ações Clínicas Rápidas do Consultório */}
                <div>
                    <h3 className="text-lg sm:text-xl font-black text-brown-dark mb-4 flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-brand-orange" />
                        Ferramentas do Consultório Virtual
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                        {/* Ação 1: Agenda & Horários */}
                        <div
                            onClick={() => {
                                if (!isApproved) {
                                    handleFeatureNotice('Agenda Bloqueada', 'Sua agenda estará disponível para abertura de slots assim que o dossiê for homologado.');
                                    return;
                                }
                                handleFeatureNotice('Gestão de Agenda (Sprint 3)', 'O módulo de criação e gerenciamento de slots de horários livres será entregue na Release v0.3.0!');
                            }}
                            role="button"
                            tabIndex={0}
                            className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                                isApproved
                                    ? 'bg-white border-brand-pot/60 hover:border-brand-orange shadow-xs hover:shadow-md'
                                    : 'bg-gray-100 border-gray-200 opacity-75'
                            }`}
                        >
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-orange-50 text-brand-orange flex items-center justify-center">
                                        <Calendar className="w-6 h-6" />
                                    </div>
                                    {!isApproved && (
                                        <span className="px-2 py-0.5 rounded-md bg-gray-200 text-gray-700 text-[11px] font-bold flex items-center gap-1">
                                            <Lock className="w-3 h-3" /> Bloqueado
                                        </span>
                                    )}
                                </div>
                                <h4 className="text-lg font-black text-brown-dark">
                                    Configurar Minha Agenda
                                </h4>
                                <p className="text-brown-light text-sm mt-1 leading-snug">
                                    Defina seus horários de atendimento semanal, tempo de consulta e intervalos livres.
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-brand-pot/30 flex items-center justify-between text-xs font-bold text-brand-orange">
                                <span>Release v0.3.0</span>
                                <span>Acessar Agenda →</span>
                            </div>
                        </div>

                        {/* Ação 2: Sala de Teleconsulta WebRTC */}
                        <div
                            onClick={() => {
                                if (!isApproved) {
                                    handleFeatureNotice('Sala Bloqueada', 'A teleconsulta exige homologação formal do CRM antes de iniciar qualquer chamada.');
                                    return;
                                }
                                handleFeatureNotice('Sala de Teleconsulta (Sprint 5)', 'A sala de videoconferência nativa com link exclusivo criptografado será ativada na Release v0.5.0!');
                            }}
                            role="button"
                            tabIndex={0}
                            className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                                isApproved
                                    ? 'bg-white border-brand-pot/60 hover:border-brand-orange shadow-xs hover:shadow-md'
                                    : 'bg-gray-100 border-gray-200 opacity-75'
                            }`}
                        >
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                                        <Video className="w-6 h-6" />
                                    </div>
                                    {!isApproved && (
                                        <span className="px-2 py-0.5 rounded-md bg-gray-200 text-gray-700 text-[11px] font-bold flex items-center gap-1">
                                            <Lock className="w-3 h-3" /> Bloqueado
                                        </span>
                                    )}
                                </div>
                                <h4 className="text-lg font-black text-brown-dark">
                                    Sala de Teleconsulta
                                </h4>
                                <p className="text-brown-light text-sm mt-1 leading-snug">
                                    Conexão direta de áudio e vídeo com o paciente, tela compartilhada e monitoramento geriátrico.
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-brand-pot/30 flex items-center justify-between text-xs font-bold text-blue-600">
                                <span>Release v0.5.0</span>
                                <span>Abrir Sala →</span>
                            </div>
                        </div>

                        {/* Ação 3: Prontuário & Prescrição ICP-Brasil */}
                        <div
                            onClick={() => {
                                if (!isApproved) {
                                    handleFeatureNotice('Módulo Bloqueado', 'A emissão de documentos médicos exige validação de regularidade junto ao conselho de medicina.');
                                    return;
                                }
                                handleFeatureNotice('Prontuário & Prescrição Digital (Sprint 4)', 'O prontuário eletrônico imutável e a emissão de receitas com assinatura ICP-Brasil serão entregues na Release v0.4.0!');
                            }}
                            role="button"
                            tabIndex={0}
                            className={`p-6 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                                isApproved
                                    ? 'bg-white border-brand-pot/60 hover:border-brand-orange shadow-xs hover:shadow-md'
                                    : 'bg-gray-100 border-gray-200 opacity-75'
                            }`}
                        >
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                                        <FileCheck2 className="w-6 h-6" />
                                    </div>
                                    {!isApproved && (
                                        <span className="px-2 py-0.5 rounded-md bg-gray-200 text-gray-700 text-[11px] font-bold flex items-center gap-1">
                                            <Lock className="w-3 h-3" /> Bloqueado
                                        </span>
                                    )}
                                </div>
                                <h4 className="text-lg font-black text-brown-dark">
                                    Prontuário & ICP-Brasil
                                </h4>
                                <p className="text-brown-light text-sm mt-1 leading-snug">
                                    Registro de evolução clínica, emissão de receitas, pedidos de exames e atestados com assinatura digital A1/A3.
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-brand-pot/30 flex items-center justify-between text-xs font-bold text-emerald-700">
                                <span>Release v0.4.0</span>
                                <span>Acessar Prontuários →</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seção: Pacientes Agendados no Dia (Empty State) */}
                <div className="bg-white rounded-3xl border border-brand-pot/40 p-6 sm:p-8 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-brand-pot/30 gap-4">
                        <div>
                            <h3 className="text-lg sm:text-xl font-black text-brown-dark">
                                Pacientes Agendados Hoje
                            </h3>
                            <p className="text-brown-light text-sm mt-0.5">
                                Fila de teleconsultas com pagamento confirmado
                            </p>
                        </div>
                        <span className="text-xs font-bold uppercase tracking-wider text-brown-light">
                            0 consultas para hoje
                        </span>
                    </div>

                    <div className="py-12 text-center max-w-md mx-auto">
                        <div className="w-16 h-16 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-brand-orange mx-auto mb-4">
                            <Clock className="w-8 h-8" />
                        </div>
                        <h4 className="text-base font-bold text-brown-dark mb-1">
                            Nenhum paciente agendado para o dia
                        </h4>
                        <p className="text-brown-light text-sm leading-relaxed mb-6">
                            Assim que sua agenda for disponibilizada e os pacientes confirmarem a reserva, as informações completas aparecerão aqui.
                        </p>
                    </div>
                </div>
            </main>

            {/* Modal de Feedback Acessível */}
            <FeedbackModal
                isOpen={feedback.isOpen}
                type={feedback.type}
                title={feedback.title}
                message={feedback.message}
                onConfirm={() => setFeedback({ ...feedback, isOpen: false })}
            />

            <Footer />
        </div>
    );
}
