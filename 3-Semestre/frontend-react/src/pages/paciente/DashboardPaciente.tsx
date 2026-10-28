import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    CalendarPlus,
    Calendar,
    FileHeart,
    HelpCircle,
    User,
    HeartPulse,
    Clock,
    Sparkles,
    PhoneCall,
    LogOut,
    CheckCircle2,
    Loader2
} from 'lucide-react';
import { FeedbackModal } from '../../components/common/FeedbackModal';
import { Footer } from '../../components/home/Footer';
import logoImg from '../../assets/logo-active-age.png';

interface PatientProfile {
    id: string;
    fullName: string;
    email: string;
    avatarUrl?: string;
    role: string;
    phone?: string;
    birthDate?: string;
    active: boolean;
}

export function DashboardPaciente() {
    const navigate = useNavigate();
    const [profile, setProfile] = useState<PatientProfile | null>(null);
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
                    const data: PatientProfile = await response.json();
                    setProfile(data);
                } else {
                    navigate('/login');
                }
            } catch (err) {
                console.error('Erro ao buscar perfil do paciente:', err);
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
            message: `${releaseDetail} Fique tranquilo, estamos preparando um ambiente seguro e de fácil acesso para você!`,
        });
    };

    // Formatador de data humanizado em português
    const todayFormatted = new Intl.DateTimeFormat('pt-BR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    }).format(new Date());

    const capitalizedDate = todayFormatted.charAt(0).toUpperCase() + todayFormatted.slice(1);
    const firstName = profile?.fullName ? profile.fullName.split(' ')[0] : 'Paciente';

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-brown-dark font-sans flex flex-col justify-between">
            {/* Header com Navegação Segura e Identificação do Paciente */}
            <header className="bg-white border-b border-brand-pot/40 sticky top-0 z-40 shadow-xs">
                <div className="max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 h-20 sm:h-24 flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-6">
                        <Link to="/" className="flex items-center gap-2 group" title="Ir para a página inicial">
                            <img src={logoImg} alt="Active Age" className="h-9 sm:h-12 w-auto transition-transform group-hover:scale-105" />
                        </Link>
                        
                        <div className="h-8 w-px bg-brand-pot/40 hidden sm:block" />
                        
                        {/* Identificação Completa (Desktop / Tablet) */}
                        <div className="hidden sm:flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-brand-orange/10 border border-brand-orange/20 overflow-hidden flex items-center justify-center text-brand-orange shadow-inner shrink-0">
                                {profile?.avatarUrl ? (
                                    <img src={profile.avatarUrl} alt={profile.fullName} className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-6 h-6" />
                                )}
                            </div>
                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-orange block">
                                    Portal do Paciente & Cuidador • Active Age
                                </span>
                                <h1 className="text-base sm:text-lg font-black text-brown-dark">
                                    Olá, {loading ? '...' : firstName}!
                                </h1>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-1.5 sm:gap-3">
                        {/* Chip Compacto do Paciente (Mobile) */}
                        <div className="sm:hidden flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-brand-orange/10 border border-brand-orange/20 text-brand-orange">
                            <User className="w-4 h-4 shrink-0" />
                            <span className="text-xs font-bold truncate max-w-[100px]">
                                {loading ? '...' : firstName}
                            </span>
                        </div>

                        <Link
                            to="/paciente/perfil"
                            className="p-2 sm:px-4 sm:py-2.5 rounded-xl border border-brand-pot bg-white hover:bg-brand-pot/20 text-brown-dark text-xs sm:text-sm font-bold transition-all shadow-xs inline-flex items-center gap-1.5 shrink-0"
                            title="Gerenciar Meu Perfil e Endereço"
                        >
                            {profile?.avatarUrl ? (
                                <img src={profile.avatarUrl} alt={profile.fullName} className="w-4 h-4 rounded-full object-cover shrink-0" />
                            ) : (
                                <User className="w-4 h-4 text-brand-orange shrink-0" />
                            )}
                            <span className="hidden sm:inline">Meu Perfil</span>
                        </Link>

                        <button
                            type="button"
                            onClick={() => handleFeatureNotice('Canais de Suporte & Cuidador', 'Nosso atendimento telefônico e via WhatsApp geriátrico está disponível de segunda a sexta, das 8h às 19h.')}
                            className="p-2 sm:px-4 sm:py-2.5 rounded-xl border border-brand-pot bg-white hover:bg-brand-pot/20 text-brown-dark text-xs sm:text-sm font-bold transition-all shadow-xs inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
                            title="Precisa de ajuda com a plataforma?"
                        >
                            <PhoneCall className="w-4 h-4 text-brand-orange shrink-0" />
                            <span className="hidden sm:inline">Precisa de Ajuda?</span>
                        </button>

                        <button
                            type="button"
                            onClick={handleLogout}
                            disabled={isLoggingOut}
                            className="inline-flex items-center gap-1.5 p-2 sm:px-4 sm:py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                            title="Encerrar sessão segura"
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
                {/* Saudação com Data e Mensagem Humanizada */}
                <div className="bg-gradient-to-r from-orange-50 via-white to-amber-50 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 border border-orange-200/60 shadow-sm relative overflow-hidden">
                    <div className="relative z-10 max-w-2xl">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 rounded-full bg-brand-orange/15 text-brand-orange text-xs sm:text-sm font-bold mb-2 sm:mb-3">
                            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                            {capitalizedDate}
                        </span>
                        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-brown-dark tracking-tight mb-1.5 sm:mb-2">
                            Que bom ter você aqui com a gente.
                        </h2>
                        <p className="text-brown-light text-sm sm:text-base md:text-lg leading-relaxed">
                            Cuidar da sua saúde e bem-estar nunca foi tão simples. Aqui você pode agendar consultas com médicos geriatras especializados, consultar suas receitas e acessar suas salas de atendimento sem sair de casa.
                        </p>
                    </div>
                </div>

                {/* Grid de Ações Rápidas Táteis Ampliadas (IHC Geriátrico) */}
                <div>
                    <h3 className="text-lg sm:text-2xl font-black text-brown-dark mb-3 sm:mb-4 flex items-center gap-2">
                        <HeartPulse className="w-5 h-5 sm:w-6 sm:h-6 text-brand-orange" />
                        O que você deseja fazer hoje?
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                        {/* Card 1: Agendar Teleconsulta */}
                        <div
                            onClick={() => handleFeatureNotice('Agendamento de Consultas', 'A vitrine com busca de médicos especialistas e horários de atendimento estará disponível em breve!')}
                            role="button"
                            tabIndex={0}
                            className="group p-4 sm:p-6 md:p-7 rounded-xl sm:rounded-2xl bg-white border-2 border-brand-orange/30 hover:border-brand-orange shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                        >
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-brand-orange/10 border border-brand-orange/20 flex items-center justify-center text-brand-orange shrink-0 group-hover:scale-105 transition-transform">
                                    <CalendarPlus className="w-6 h-6 sm:w-8 sm:h-8" />
                                </div>
                                <div>
                                    <h4 className="text-lg sm:text-xl font-black text-brown-dark group-hover:text-brand-orange transition-colors">
                                        Agendar Consulta Geriátrica
                                    </h4>
                                    <p className="text-brown-light text-xs sm:text-base mt-1 sm:mt-1.5 leading-snug">
                                        Encontre médicos especialistas credenciados, confira dias e horários livres e marque sua teleconsulta com facilidade.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-brand-pot/30 flex items-center justify-between">
                                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-brand-orange">
                                    Em breve
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-brand-orange group-hover:translate-x-1 transition-transform">
                                    Marcar Consulta →
                                </span>
                            </div>
                        </div>

                        {/* Card 2: Minhas Consultas Agendadas */}
                        <div
                            onClick={() => handleFeatureNotice('Minhas Consultas', 'Seu histórico e acompanhamento em tempo real de consultas agendadas estará disponível junto ao módulo de agenda.')}
                            role="button"
                            tabIndex={0}
                            className="group p-4 sm:p-6 md:p-7 rounded-xl sm:rounded-2xl bg-white border-2 border-brand-pot/60 hover:border-brand-orange shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                        >
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700 shrink-0 group-hover:scale-105 transition-transform">
                                    <Calendar className="w-6 h-6 sm:w-8 sm:h-8" />
                                </div>
                                <div>
                                    <h4 className="text-lg sm:text-xl font-black text-brown-dark group-hover:text-brand-orange transition-colors">
                                        Minhas Consultas & Horários
                                    </h4>
                                    <p className="text-brown-light text-xs sm:text-base mt-1 sm:mt-1.5 leading-snug">
                                        Veja detalhes dos seus compromissos médicos agendados, links da sala de teleconsulta e instruções prévias.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-brand-pot/30 flex items-center justify-between">
                                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-brown-light">
                                    0 consultas pendentes
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-brown-dark group-hover:text-brand-orange group-hover:translate-x-1 transition-transform">
                                    Ver Meus Horários →
                                </span>
                            </div>
                        </div>

                        {/* Card 3: Meu Cofre de Saúde & Documentos */}
                        <div
                            onClick={() => handleFeatureNotice('Cofre de Documentos de Saúde', 'O acesso aos seus documentos de saúde com assinatura digital ICP-Brasil estará disponível em breve!')}
                            role="button"
                            tabIndex={0}
                            className="group p-4 sm:p-6 md:p-7 rounded-xl sm:rounded-2xl bg-white border-2 border-brand-pot/60 hover:border-brand-orange shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                        >
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 shrink-0 group-hover:scale-105 transition-transform">
                                    <FileHeart className="w-6 h-6 sm:w-8 sm:h-8" />
                                </div>
                                <div>
                                    <h4 className="text-lg sm:text-xl font-black text-brown-dark group-hover:text-brand-orange transition-colors">
                                        Meu Cofre de Saúde
                                    </h4>
                                    <p className="text-brown-light text-xs sm:text-base mt-1 sm:mt-1.5 leading-snug">
                                        Acesse suas receitas com assinatura digital ICP-Brasil, pedidos de exames laboratoriais e laudos anteriores com total sigilo.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-brand-pot/30 flex items-center justify-between">
                                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-blue-700">
                                    Conformidade CFM / LGPD
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-brown-dark group-hover:text-brand-orange group-hover:translate-x-1 transition-transform">
                                    Abrir Cofre →
                                </span>
                            </div>
                        </div>

                        {/* Card 4: Ajuda & Conexão com Cuidador */}
                        <div
                            onClick={() => handleFeatureNotice('Ajuda e Cuidador Familiar', 'Nossos canais de suporte contam com atendimento humanizado para esclarecer dúvidas sobre áudio, vídeo e agendamentos.')}
                            role="button"
                            tabIndex={0}
                            className="group p-4 sm:p-6 md:p-7 rounded-xl sm:rounded-2xl bg-white border-2 border-brand-pot/60 hover:border-brand-orange shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                        >
                            <div className="flex items-start gap-3 sm:gap-4">
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0 group-hover:scale-105 transition-transform">
                                    <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8" />
                                </div>
                                <div>
                                    <h4 className="text-lg sm:text-xl font-black text-brown-dark group-hover:text-brand-orange transition-colors">
                                        Suporte & Cuidador Familiar
                                    </h4>
                                    <p className="text-brown-light text-xs sm:text-base mt-1 sm:mt-1.5 leading-snug">
                                        Orientações passo a passo para conectar seu cuidador, testar câmera e microfone e tirar dúvidas frequentes.
                                    </p>
                                </div>
                            </div>
                            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-brand-pot/30 flex items-center justify-between">
                                <span className="text-[11px] sm:text-xs font-bold uppercase tracking-wider text-emerald-700">
                                    Acessibilidade Geriátrica
                                </span>
                                <span className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-black text-brown-dark group-hover:text-brand-orange group-hover:translate-x-1 transition-transform">
                                    Obter Ajuda →
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Seção: Próximas Consultas (Estado Vazio Amigável) */}
                <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-pot/40 p-4 sm:p-6 md:p-8 shadow-xs">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 sm:pb-6 border-b border-brand-pot/30 gap-3 sm:gap-4">
                        <div>
                            <h3 className="text-lg sm:text-2xl font-black text-brown-dark">
                                Próxima Consulta Agendada
                            </h3>
                            <p className="text-brown-light text-xs sm:text-sm mt-0.5">
                                Acompanhe os horários marcados com seus especialistas
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={() => handleFeatureNotice('Agendamento de Consultas', 'A busca e agendamento de consultas com médicos geriatras estarão disponíveis em breve!')}
                            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold text-sm transition-all shadow-sm"
                        >
                            <CalendarPlus className="w-4 h-4" />
                            Buscar Médico Geriatra
                        </button>
                    </div>

                    {/* Empty State Acolhedor */}
                    <div className="py-8 sm:py-12 text-center max-w-md mx-auto">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-orange-50 border border-orange-200 flex items-center justify-center text-brand-orange mx-auto mb-3 sm:mb-4">
                            <Clock className="w-6 h-6 sm:w-8 sm:h-8" />
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-brown-dark mb-1">
                            Nenhuma consulta marcada no momento
                        </h4>
                        <p className="text-brown-light text-xs sm:text-sm leading-relaxed mb-5 sm:mb-6">
                            Você não possui nenhuma teleconsulta agendada para os próximos dias. Agende uma conversa preventiva com nossos médicos geriatras.
                        </p>
                        <button
                            type="button"
                            onClick={() => handleFeatureNotice('Agendamento de Consultas', 'A busca e agendamento de consultas com médicos geriatras estarão disponíveis em breve!')}
                            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-brand-orange text-brand-orange hover:bg-orange-50 font-bold text-sm transition-all inline-flex items-center justify-center gap-2"
                        >
                            <CalendarPlus className="w-4 h-4" />
                            Agendar Minha Primeira Consulta
                        </button>
                    </div>
                </div>

                {/* Card de Dica de Saúde Geriátrica & Longevidade */}
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-amber-200/80 flex items-start gap-3 sm:gap-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
                    </div>
                    <div>
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-amber-800 block">
                            Dica de Longevidade Ativa • Equipe Multidisciplinar Active Age
                        </span>
                        <h4 className="text-base sm:text-lg font-bold text-brown-dark mt-0.5">
                            Hidratação diária e rotina de sono
                        </h4>
                        <p className="text-brown-dark/80 text-xs sm:text-sm mt-1 leading-relaxed">
                            A percepção de sede pode diminuir com o passar dos anos. Mantenha uma garrafinha de água fresca por perto ao longo do dia e evite telas luminosas pelo menos 1 hora antes de dormir para melhorar a qualidade do seu repouso.
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
