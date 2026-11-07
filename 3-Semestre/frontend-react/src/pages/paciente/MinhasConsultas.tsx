import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Clock,
    ArrowLeft,
    CalendarCheck,
    XCircle,
    Video,
    Loader2,
    CalendarX,
    FileText,
    Printer,
    CreditCard,
    X,
    Receipt,
} from 'lucide-react';
import { FeedbackModal } from '../../components/common/FeedbackModal';
import { DocumentPrintModal } from '../../components/teleconsulta/DocumentPrintModal';
import { ComprovantePagamentoModal } from '../../components/paciente/ComprovantePagamentoModal';
import type { ComprovanteData } from '../../components/paciente/ComprovantePagamentoModal';
import { Footer } from '../../components/home/Footer';
import type { MedicalDocument } from '../../types/teleconsulta';

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
    status: 'AGUARDANDO_PAGAMENTO' | 'AGENDADA' | 'REALIZADA' | 'CANCELADA_PELO_PACIENTE' | 'CANCELADA_PELO_MEDICO' | 'CANCELADA_FALTA_PAGAMENTO';
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

    // Documentos da Consulta (SPEC-12B)
    const [selectedDocForPrint, setSelectedDocForPrint] = useState<MedicalDocument | null>(null);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [loadingDocApptId, setLoadingDocApptId] = useState<string | null>(null);
    const [appointmentDocsModal, setAppointmentDocsModal] = useState<{
        isOpen: boolean;
        doctorName: string;
        docs: MedicalDocument[];
    }>({
        isOpen: false,
        doctorName: '',
        docs: [],
    });

    // Comprovante de Pagamento (SPEC-17B)
    const [receiptData, setReceiptData] = useState<ComprovanteData | null>(null);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

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
        a => (a.status === 'AGENDADA' || a.status === 'AGUARDANDO_PAGAMENTO') && new Date(a.startDateTime) >= new Date()
    );

    const historyAppointments = appointments.filter(
        a => (a.status !== 'AGENDADA' && a.status !== 'AGUARDANDO_PAGAMENTO') || new Date(a.startDateTime) < new Date()
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

    // Busca e visualização de documentos da consulta (SPEC-12B)
    const handleViewDocuments = async (app: AppointmentItem) => {
        setLoadingDocApptId(app.id);
        try {
            const res = await fetch(`/api/medical-documents/appointment/${app.id}`);
            if (res.ok) {
                const docs: MedicalDocument[] = await res.json();
                if (docs.length === 0) {
                    setFeedback({
                        isOpen: true,
                        type: 'info',
                        title: 'Nenhum Documento Emitido',
                        message: `Nenhum documento médico (receita, pedido de exame ou atestado) foi emitido nesta consulta com Dr(a). ${app.doctorName}.`,
                    });
                } else if (docs.length === 1) {
                    setSelectedDocForPrint(docs[0]);
                    setIsPrintModalOpen(true);
                } else {
                    setAppointmentDocsModal({
                        isOpen: true,
                        doctorName: app.doctorName,
                        docs,
                    });
                }
            } else {
                setFeedback({
                    isOpen: true,
                    type: 'error',
                    title: 'Não foi possível carregar',
                    message: 'Erro ao buscar os documentos emitidos nesta consulta.',
                });
            }
        } catch {
            setFeedback({
                isOpen: true,
                type: 'error',
                title: 'Erro de Conexão',
                message: 'Falha de comunicação ao buscar documentos.',
            });
        } finally {
            setLoadingDocApptId(null);
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
                message: 'Sua consulta foi cancelada com sucesso e o horário foi liberado na agenda médica.',
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

    const handleOpenReceipt = async (app: AppointmentItem) => {
        let paymentMethodStr = 'Pix Instantâneo';
        let mpPaymentIdStr = 'MP-' + app.id.substring(0, 8);

        try {
            const res = await fetch(`/api/v1/pagamentos/consulta/${app.id}`);
            if (res.ok) {
                const json = await res.json();
                if (json.data) {
                    if (json.data.metodo === 'CARTAO_CREDITO') paymentMethodStr = 'Cartão de Crédito';
                    else if (json.data.metodo === 'MERCADO_PAGO_CHECKOUT') paymentMethodStr = 'Mercado Pago Pro';
                    if (json.data.mpPaymentId) mpPaymentIdStr = json.data.mpPaymentId;
                }
            }
        } catch (e) {
            console.warn('Erro ao consultar faturamento da consulta:', e);
        }

        setReceiptData({
            appointmentId: app.id,
            patientName: app.patientName,
            doctorName: app.doctorName,
            doctorCrm: app.doctorCrm,
            doctorUfCrm: app.doctorUfCrm,
            doctorSpecialty: app.doctorSpecialty,
            startDateTime: app.startDateTime,
            consultationFee: app.consultationFee,
            paymentMethod: paymentMethodStr,
            mpPaymentId: mpPaymentIdStr,
        });
        setIsReceiptModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-brand-ice flex flex-col justify-between">
            {/* Topbar Operacional */}
            <header className="bg-white border-b border-brand-pot/30 sticky top-0 z-20 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/paciente/dashboard')}
                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-brown-dark hover:text-brand-orange transition-colors cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Voltar ao Meu Painel</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-xs font-bold text-brown-light">
                            Agenda & Histórico em Tempo Real
                        </span>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
                {/* Título da Página e Navegação de Abas */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <span className="text-xs uppercase font-black text-brand-orange tracking-wider block mb-1">
                            Acompanhamento de Consultas
                        </span>
                        <h1 className="text-2xl sm:text-3xl font-black text-brown-dark">
                            Minhas Consultas & Histórico
                        </h1>
                        <p className="text-sm text-brown-light mt-1">
                            Acompanhe suas teleconsultas agendadas e consulte documentos médicos emitidos.
                        </p>
                    </div>

                    {/* Abas */}
                    <div className="flex items-center bg-white p-1 rounded-2xl border border-brand-pot/30 shadow-xs">
                        <button
                            type="button"
                            onClick={() => setTab('upcoming')}
                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer min-h-[44px] ${
                                tab === 'upcoming'
                                    ? 'bg-brand-orange text-white shadow-xs'
                                    : 'text-brown-light hover:text-brown-dark'
                            }`}
                        >
                            Consultas Marcadas ({upcomingAppointments.length})
                        </button>
                        <button
                            type="button"
                            onClick={() => setTab('history')}
                            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all cursor-pointer min-h-[44px] ${
                                tab === 'history'
                                    ? 'bg-brand-orange text-white shadow-xs'
                                    : 'text-brown-light hover:text-brown-dark'
                            }`}
                        >
                            Histórico de Atendimentos ({historyAppointments.length})
                        </button>
                    </div>
                </div>

                {/* Conteúdo das Consultas */}
                {loading ? (
                    <div className="py-20 text-center">
                        <Loader2 className="w-10 h-10 text-brand-orange animate-spin mx-auto mb-3" />
                        <p className="text-sm font-bold text-brown-dark">Carregando seus horários...</p>
                    </div>
                ) : (tab === 'upcoming' ? upcomingAppointments : historyAppointments).length === 0 ? (
                    /* Empty State */
                    <div className="bg-white rounded-3xl border border-brand-pot/30 p-8 sm:p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
                        <div className="w-16 h-16 rounded-2xl bg-brand-orange/10 text-brand-orange flex items-center justify-center mx-auto">
                            <CalendarX className="w-8 h-8" />
                        </div>
                        <h3 className="text-lg font-black text-brown-dark">
                            {tab === 'upcoming' ? 'Nenhuma teleconsulta agendada' : 'Nenhuma consulta no histórico'}
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
                                        {app.status === 'AGUARDANDO_PAGAMENTO' && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-amber-100 text-amber-900 border border-amber-300">
                                                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                                Aguardando Pagamento Pix
                                            </span>
                                        )}
                                        {app.status === 'CANCELADA_FALTA_PAGAMENTO' && (
                                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-black bg-red-100 text-red-800 border border-red-300">
                                                Cancelada (Pagamento Expirado)
                                            </span>
                                        )}
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

                                {/* Ações do Card */}
                                <div className="pt-3 border-t border-brand-pot/20 flex flex-col sm:flex-row items-center justify-between gap-3">
                                    <div className="flex flex-wrap items-center gap-2 text-xs w-full sm:w-auto">
                                        {app.status === 'AGUARDANDO_PAGAMENTO' && (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setFeedback({
                                                        isOpen: true,
                                                        title: 'Pagamento Pix da Teleconsulta',
                                                        message: `Para confirmar sua consulta com ${app.doctorName}, realize a transferência Pix no valor de R$ ${Number(app.consultationFee).toFixed(2).replace('.', ',')}. O repasse é 100% destinado ao médico sem cobrança de taxas clínicas.`,
                                                        type: 'info',
                                                    });
                                                }}
                                                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer min-h-[44px]"
                                            >
                                                <CreditCard className="w-4 h-4" />
                                                <span>Pagar via Pix</span>
                                            </button>
                                        )}
                                        {app.status === 'AGENDADA' && (
                                            <button
                                                type="button"
                                                onClick={() => navigate(`/teleconsulta/${app.id}`)}
                                                className="px-4 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer min-h-[44px]"
                                            >
                                                <Video className="w-4 h-4" />
                                                <span>Entrar na Sala Virtual</span>
                                            </button>
                                        )}

                                        {/* Botão para Visualizar Documentos e Receitas Emitidos (SPEC-12B) */}
                                        <button
                                            type="button"
                                            onClick={() => handleViewDocuments(app)}
                                            disabled={loadingDocApptId === app.id}
                                            className="px-4 py-2.5 rounded-xl border border-brand-pot/40 hover:bg-brand-ice text-brown-dark font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer min-h-[44px]"
                                        >
                                            {loadingDocApptId === app.id ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-brand-orange" />
                                            ) : (
                                                <FileText className="w-4 h-4 text-brand-orange" />
                                            )}
                                            <span>Documentos & Receitas</span>
                                        </button>

                                        {/* Botão de Comprovante Oficial de Pagamento (SPEC-17B) */}
                                        {(app.status === 'AGENDADA' || app.status === 'REALIZADA') && (
                                            <button
                                                type="button"
                                                onClick={() => handleOpenReceipt(app)}
                                                className="px-4 py-2.5 rounded-xl border border-emerald-600/40 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 font-bold text-xs flex items-center gap-2 shadow-xs transition-all cursor-pointer min-h-[44px]"
                                            >
                                                <Receipt className="w-4 h-4 text-emerald-700" />
                                                <span>Comprovante de Pagamento</span>
                                            </button>
                                        )}
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
                                                    title="Cancelamento bloqueado: faltam menos de 24 horas para a consulta conforme política de agendamento"
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

            {/* Modal de Múltiplos Documentos da Consulta */}
            {appointmentDocsModal.isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-brand-pot/30 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-brand-pot/20">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-brand-orange block">
                                    Documentos Emitidos
                                </span>
                                <h3 className="text-base font-black text-brown-dark">
                                    Dr(a). {appointmentDocsModal.doctorName}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setAppointmentDocsModal(prev => ({ ...prev, isOpen: false }))}
                                className="w-8 h-8 rounded-full bg-brand-ice hover:bg-gray-100 text-brown-light flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                            {appointmentDocsModal.docs.map(doc => (
                                <div
                                    key={doc.id}
                                    className="p-4 rounded-2xl border border-brand-pot/30 bg-brand-ice/50 hover:border-brand-orange transition-all flex items-center justify-between gap-3"
                                >
                                    <div className="min-w-0">
                                        <span className="text-[10px] font-black uppercase text-brand-orange block">
                                            {doc.documentType === 'RECEITA_MEDICA' ? 'Receita Médica' : doc.documentType === 'PEDIDO_EXAME' ? 'Pedido de Exame' : 'Atestado'}
                                        </span>
                                        <h4 className="text-xs sm:text-sm font-bold text-brown-dark truncate">
                                            {doc.title}
                                        </h4>
                                        <p className="text-[11px] text-brown-light font-mono mt-0.5">
                                            {doc.validationCode}
                                        </p>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedDocForPrint(doc);
                                            setIsPrintModalOpen(true);
                                            setAppointmentDocsModal(prev => ({ ...prev, isOpen: false }));
                                        }}
                                        className="px-3.5 py-2 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer min-h-[40px]"
                                    >
                                        <Printer className="w-3.5 h-3.5" />
                                        <span>Imprimir</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Impressão de Documento em Preto e Branco */}
            <DocumentPrintModal
                isOpen={isPrintModalOpen}
                onClose={() => setIsPrintModalOpen(false)}
                document={selectedDocForPrint}
            />

            {/* Modal de Comprovante Oficial de Pagamento (SPEC-17B) */}
            <ComprovantePagamentoModal
                isOpen={isReceiptModalOpen}
                onClose={() => setIsReceiptModalOpen(false)}
                data={receiptData}
            />

            {/* Modal Acessível de Confirmação de Cancelamento */}
            {targetCancelId && (
                <FeedbackModal
                    isOpen={true}
                    type="warning"
                    title="Cancelar Teleconsulta?"
                    message="Tem certeza que deseja cancelar esta consulta? O horário será liberado para outros pacientes que necessitam de atendimento."
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
