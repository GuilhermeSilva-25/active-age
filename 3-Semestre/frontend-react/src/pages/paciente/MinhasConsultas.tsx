import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Clock,
    ArrowLeft,
    Stethoscope,
    CalendarCheck,
    XCircle,
    Video,
    ShieldCheck,
    Loader2,
    CalendarX
} from 'lucide-react';
import { FeedbackModal } from '../../components/common/FeedbackModal';
import { Footer } from '../../components/home/Footer';

interface AppointmentItem {
    id: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    doctorCrm: string;
    doctorUfCrm: string;
    doctorSpecialty: string;
    slotId: string;
    startDateTime: string;
    endDateTime: string;
    durationMinutes: number;
    consultationFee: number;
    status: 'AGENDADA' | 'REALIZADA' | 'CANCELADA_PELO_PACIENTE' | 'CANCELADA_PELO_MEDICO';
    patientNotes?: string;
    meetRoomId?: string;
    canCancel: boolean;
    createdAt: string;
}

export const MinhasConsultas: React.FC = () => {
    const navigate = useNavigate();

    const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming');

    // Cancelamento
    const [targetCancelId, setTargetCancelId] = useState<string | null>(null);
    const [cancelling, setCancelling] = useState(false);

    // Feedback Modal
    const [feedback, setFeedback] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        type: 'success' | 'error' | 'warning' | 'info';
    }>({
        isOpen: false,
        title: '',
        message: '',
        type: 'info',
    });

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/patient/appointments');
            if (res.ok) {
                const data = await res.json();
                setAppointments(data);
            } else {
                setAppointments([]);
            }
        } catch (err) {
            console.error('Erro ao buscar consultas:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAppointments();
    }, []);

    const upcomingAppointments = appointments.filter(
        a => a.status === 'AGENDADA' && new Date(a.startDateTime) >= new Date()
    );

    const historyAppointments = appointments.filter(
        a => a.status !== 'AGENDADA' || new Date(a.startDateTime) < new Date()
    );

    const formatFullDate = (isoStr: string) => {
        try {
            const date = new Date(isoStr);
            return date.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            });
        } catch {
            return isoStr;
        }
    };

    const formatTime = (isoStr: string) => {
        try {
            return isoStr.split('T')[1].substring(0, 5);
        } catch {
            return isoStr;
        }
    };

    const handleConfirmCancel = async () => {
        if (!targetCancelId) return;

        setCancelling(true);
        try {
            const res = await fetch(`/api/patient/appointments/${targetCancelId}/cancel`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    reason: 'Cancelamento solicitado pelo paciente via portal.',
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Erro ao cancelar consulta.');
            }

            setTargetCancelId(null);
            fetchAppointments();
            setFeedback({
                isOpen: true,
                title: 'Consulta Cancelada',
                message: 'Sua consulta foi cancelada com sucesso e o horário foi devolvido à vitrine pública (RN002).',
                type: 'success',
            });
        } catch (err: any) {
            setFeedback({
                isOpen: true,
                title: 'Não foi possível cancelar',
                message: err.message,
                type: 'error',
            });
        } finally {
            setCancelling(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-ice flex flex-col justify-between">
            {/* Topbar Operacional */}
            <header className="bg-white border-b border-brand-pot/30 sticky top-0 z-20 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/paciente/dashboard')}
                        className="flex items-center gap-2 text-brown-dark hover:text-brand-orange text-xs sm:text-sm font-bold transition-all cursor-pointer min-h-[44px]"
                    >
                        <ArrowLeft className="w-5 h-5 text-brand-orange" />
                        <span>Voltar ao Dashboard</span>
                    </button>

                    <button
                        onClick={() => navigate('/paciente/busca-medicos')}
                        className="px-4 sm:px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-2 cursor-pointer min-h-[44px]"
                    >
                        <Calendar className="w-4 h-4" />
                        <span>Agendar Nova Consulta</span>
                    </button>
                </div>
            </header>

            <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 pb-16 space-y-6 flex-1 w-full">
                {/* Banner de Apresentação */}
                <div className="bg-white rounded-3xl border border-brand-pot/30 p-6 sm:p-8 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-black text-brand-orange uppercase tracking-wider">
                                <Stethoscope className="w-4 h-4" />
                                <span>Acompanhamento Clínico Geriátrico</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black text-brown-dark tracking-tight">
                                Minhas Teleconsultas
                            </h1>
                            <p className="text-xs sm:text-sm text-brown-light leading-relaxed max-w-2xl">
                                Acompanhe seus horários agendados, links de chamada e histórico de atendimentos com total zelo ético conforme a Resolução CFM nº 2.314/2022.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-3 bg-amber-50 border border-amber-200/80 rounded-2xl text-xs font-semibold text-amber-900 self-start md:self-auto">
                            <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0" />
                            <span>Cancelamento com 24h de antecedência (RN002)</span>
                        </div>
                    </div>

                    {/* Alternador de Abas */}
                    <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100 rounded-2xl mt-6">
                        <button
                            type="button"
                            onClick={() => setTab('upcoming')}
                            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                tab === 'upcoming'
                                    ? 'bg-white text-brown-dark shadow-xs'
                                    : 'text-brown-light hover:text-brown-dark'
                            }`}
                        >
                            <CalendarCheck className="w-4 h-4 text-emerald-600" />
                            <span>Próximas Consultas ({upcomingAppointments.length})</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab('history')}
                            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                tab === 'history'
                                    ? 'bg-white text-brown-dark shadow-xs'
                                    : 'text-brown-light hover:text-brown-dark'
                            }`}
                        >
                            <CalendarX className="w-4 h-4 text-brown-light" />
                            <span>Histórico & Encerradas ({historyAppointments.length})</span>
                        </button>
                    </div>
                </div>

                {/* Listagem de Consultas */}
                {loading ? (
                    <div className="py-20 text-center space-y-3">
                        <Loader2 className="w-10 h-10 text-brand-orange animate-spin mx-auto" />
                        <p className="text-sm font-bold text-brown-dark">
                            Buscando suas consultas agendadas...
                        </p>
                    </div>
                ) : (tab === 'upcoming' ? upcomingAppointments : historyAppointments).length === 0 ? (
                    /* Empty State */
                    <div className="bg-white rounded-3xl border border-brand-pot/30 p-10 sm:p-14 text-center shadow-xs max-w-lg mx-auto space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-orange-100/70 text-brand-orange flex items-center justify-center mx-auto">
                            <Calendar className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-brown-dark">
                            {tab === 'upcoming'
                                ? 'Nenhuma consulta futura agendada'
                                : 'Nenhum histórico de consulta anterior'}
                        </h3>
                        <p className="text-xs sm:text-sm text-brown-light leading-relaxed">
                            {tab === 'upcoming'
                                ? 'Você não possui compromissos médicos marcados no momento. Que tal escolher um especialista geriatra na nossa vitrine e agendar seu atendimento?'
                                : 'Quando você concluir ou cancelar consultas, o registro detalhado aparecerá neste histórico.'}
                        </p>
                        {tab === 'upcoming' && (
                            <button
                                onClick={() => navigate('/paciente/busca-medicos')}
                                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-orange text-white text-xs sm:text-sm font-bold hover:bg-brand-orange/90 transition-all shadow-sm cursor-pointer min-h-[48px]"
                            >
                                <Calendar className="w-4 h-4" />
                                <span>Agendar Consulta Agora</span>
                            </button>
                        )}
                    </div>
                ) : (
                    /* Cards de Consultas */
                    <div className="space-y-4">
                        {(tab === 'upcoming' ? upcomingAppointments : historyAppointments).map(app => (
                            <div
                                key={app.id}
                                className="bg-white rounded-3xl border-2 border-brand-pot/40 p-5 sm:p-7 shadow-xs hover:shadow-md transition-all space-y-4"
                            >
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-brand-pot/20 gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center font-bold shrink-0">
                                            <Calendar className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <span className="text-[11px] font-black uppercase tracking-wider text-brand-orange">
                                                Teleconsulta Geriátrica
                                            </span>
                                            <h3 className="text-base sm:text-lg font-black text-brown-dark capitalize">
                                                {formatFullDate(app.startDateTime)}
                                            </h3>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="self-start sm:self-auto">
                                        {app.status === 'AGENDADA' && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                                                <CalendarCheck className="w-3.5 h-3.5 text-emerald-600" />
                                                Confirmada
                                            </span>
                                        )}
                                        {app.status === 'REALIZADA' && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-blue-100 text-blue-800 border border-blue-300">
                                                Realizada
                                            </span>
                                        )}
                                        {app.status === 'CANCELADA_PELO_PACIENTE' && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-gray-100 text-gray-700 border border-gray-300">
                                                Cancelada pelo Paciente
                                            </span>
                                        )}
                                        {app.status === 'CANCELADA_PELO_MEDICO' && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-red-100 text-red-800 border border-red-300">
                                                Cancelada pelo Médico
                                            </span>
                                        )}
                                    </div>
                                </div>

                                {/* Dados do Médico e Horário */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs sm:text-sm">
                                    <div className="space-y-1">
                                        <span className="text-xs font-bold text-brown-light uppercase block">
                                            Médico Especialista
                                        </span>
                                        <p className="font-black text-brown-dark text-sm sm:text-base">
                                            {app.doctorName}
                                        </p>
                                        <p className="text-xs text-brown-light">
                                            CRM {app.doctorCrm}/{app.doctorUfCrm} • {app.doctorSpecialty}
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <span className="text-xs font-bold text-brown-light uppercase block">
                                            Horário do Atendimento
                                        </span>
                                        <div className="flex items-center gap-1.5 font-black text-brown-dark text-sm sm:text-base">
                                            <Clock className="w-4 h-4 text-brand-orange" />
                                            <span>
                                                {formatTime(app.startDateTime)} às {formatTime(app.endDateTime)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-brown-light">
                                            Duração estimada: {app.durationMinutes} minutos
                                        </p>
                                    </div>

                                    <div className="space-y-1">
                                        <span className="text-xs font-bold text-brown-light uppercase block">
                                            Honorários Médicos
                                        </span>
                                        <p className="font-black text-brand-orange text-sm sm:text-base">
                                            R$ {Number(app.consultationFee).toFixed(2).replace('.', ',')}
                                        </p>
                                        <p className="text-[11px] text-brown-light">
                                            Telemedicina Direta (Sem Dicotomia)
                                        </p>
                                    </div>
                                </div>

                                {app.patientNotes && (
                                    <div className="p-3 bg-gray-50 rounded-xl border border-brand-pot/20 text-xs">
                                        <strong className="text-brown-dark">Sintomas informados: </strong>
                                        <span className="text-brown-light italic">"{app.patientNotes}"</span>
                                    </div>
                                )}

                                {/* Ações do Card */}
                                <div className="pt-3 border-t border-brand-pot/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 text-xs text-brown-light">
                                        <Video className="w-4 h-4 text-blue-600" />
                                        <span>Link seguro gerado para sala virtual (UC12 em breve)</span>
                                    </div>

                                    {app.status === 'AGENDADA' && (
                                        <div className="flex items-center gap-2 w-full sm:w-auto">
                                            {app.canCancel ? (
                                                <button
                                                    type="button"
                                                    onClick={() => setTargetCancelId(app.id)}
                                                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    <span>Cancelar Consulta</span>
                                                </button>
                                            ) : (
                                                <span
                                                    title="Cancelamento bloqueado: faltam menos de 24 horas para a consulta (RN002)"
                                                    className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gray-100 text-gray-400 text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed min-h-[44px]"
                                                >
                                                    <XCircle className="w-4 h-4" />
                                                    <span>Cancelamento indisponível (&lt; 24h)</span>
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal Acessível de Confirmação de Cancelamento */}
            {targetCancelId && (
                <FeedbackModal
                    isOpen={true}
                    type="warning"
                    title="Cancelar Teleconsulta?"
                    message="Tem certeza que deseja cancelar esta consulta? O horário será liberado imediatamente para outros idosos na vitrine (RN002)."
                    confirmText={cancelling ? 'Cancelando...' : 'Sim, Cancelar Consulta'}
                    cancelText="Manter Consulta"
                    showCancelButton={true}
                    isLoading={cancelling}
                    onConfirm={handleConfirmCancel}
                    onCancel={() => setTargetCancelId(null)}
                />
            )}

            {/* Modal de Feedback Geral */}
            <FeedbackModal
                isOpen={feedback.isOpen}
                type={feedback.type}
                title={feedback.title}
                message={feedback.message}
                onConfirm={() => setFeedback(prev => ({ ...prev, isOpen: false }))}
            />

            <Footer />
        </div>
    );
};
