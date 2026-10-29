import React, { useState, useEffect, useMemo } from 'react';
import {
    Calendar,
    Clock,
    X,
    CalendarCheck2,
    User,
    ShieldCheck,
    Loader2
} from 'lucide-react';
import { FeedbackModal } from '../common/FeedbackModal';

interface DoctorScheduleSlot {
    id: string;
    doctorId: string;
    startDateTime: string;
    endDateTime: string;
    durationMinutes: number;
    status: 'LIVRE' | 'OCUPADO' | 'BLOQUEADO';
}

interface DoctorSummary {
    id: string;
    fullName: string;
    crm: string;
    ufCrm: string;
    avatarUrl?: string;
    consultationFee?: number;
    consultationDurationMinutes?: number;
    clinicalFocus?: string[];
}

interface AgendarConsultaModalProps {
    doctor: DoctorSummary | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export const AgendarConsultaModal: React.FC<AgendarConsultaModalProps> = ({
    doctor,
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [slots, setSlots] = useState<DoctorScheduleSlot[]>([]);
    const [loadingSlots, setLoadingSlots] = useState(false);
    const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null);
    const [patientNotes, setPatientNotes] = useState('');
    const [submitting, setSubmitting] = useState(false);

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

    useEffect(() => {
        if (isOpen && doctor) {
            setSelectedSlotId(null);
            setPatientNotes('');
            fetchDoctorAvailability();
        }
    }, [isOpen, doctor]);

    const fetchDoctorAvailability = async () => {
        if (!doctor) return;
        setLoadingSlots(true);
        try {
            const res = await fetch(`/api/doctors/${doctor.id}/availability`);
            if (res.ok) {
                const data = await res.json();
                setSlots(data);
            } else {
                setSlots([]);
            }
        } catch (err) {
            console.error('Erro ao buscar horários livres:', err);
            setSlots([]);
        } finally {
            setLoadingSlots(false);
        }
    };

    // Agrupa slots livres por data
    const groupedSlots = useMemo(() => {
        const groups: { [key: string]: DoctorScheduleSlot[] } = {};
        slots.forEach(slot => {
            const datePart = slot.startDateTime.split('T')[0];
            if (!groups[datePart]) {
                groups[datePart] = [];
            }
            groups[datePart].push(slot);
        });
        return groups;
    }, [slots]);

    const formatHeaderDate = (dateStr: string) => {
        try {
            const [year, month, day] = dateStr.split('-').map(Number);
            const date = new Date(year, month - 1, day);
            return date.toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            });
        } catch {
            return dateStr;
        }
    };

    const formatTimeOnly = (isoStr: string) => {
        try {
            return isoStr.split('T')[1].substring(0, 5);
        } catch {
            return isoStr;
        }
    };

    const handleConfirmBooking = async () => {
        if (!selectedSlotId) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/patient/appointments', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    slotId: selectedSlotId,
                    patientNotes: patientNotes.trim() || undefined,
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.message || 'Não foi possível confirmar o agendamento.');
            }

            setFeedback({
                isOpen: true,
                title: 'Consulta Agendada com Sucesso!',
                message: `Sua teleconsulta com ${doctor?.fullName} foi confirmada. Você pode acompanhar os detalhes e instruções no seu painel em "Minhas Consultas".`,
                type: 'success',
            });
        } catch (err: any) {
            setFeedback({
                isOpen: true,
                title: 'Horário Indisponível',
                message: err.message || 'Este horário acabou de ser reservado. Por favor, escolha outro slot.',
                type: 'error',
            });
            // Recarrega horários atualizados
            fetchDoctorAvailability();
        } finally {
            setSubmitting(false);
        }
    };

    const handleFeedbackClose = () => {
        setFeedback(prev => ({ ...prev, isOpen: false }));
        if (feedback.type === 'success') {
            onSuccess?.();
            onClose();
        }
    };

    if (!isOpen || !doctor) return null;

    const formattedFee = doctor.consultationFee != null
        ? `R$ ${Number(doctor.consultationFee).toFixed(2).replace('.', ',')}`
        : 'R$ 250,00';

    const selectedSlotObj = slots.find(s => s.id === selectedSlotId);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-brand-pot/40 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Header com Dados do Especialista */}
                <div className="p-5 sm:p-6 bg-brand-ice/90 border-b border-brand-pot/30 flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                        {doctor.avatarUrl ? (
                            <img
                                src={doctor.avatarUrl}
                                alt={doctor.fullName}
                                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-brand-orange shadow-sm shrink-0"
                            />
                        ) : (
                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-orange-100 border-2 border-brand-orange flex items-center justify-center text-brand-orange shrink-0">
                                <User className="w-7 h-7" />
                            </div>
                        )}
                        <div>
                            <span className="text-[11px] font-black uppercase tracking-wider text-brand-orange">
                                Agendamento de Teleconsulta Geriátrica
                            </span>
                            <h2 className="text-lg sm:text-xl font-black text-brown-dark leading-tight">
                                {doctor.fullName}
                            </h2>
                            <p className="text-xs text-brown-light font-bold mt-0.5">
                                CRM {doctor.crm}/{doctor.ufCrm} • Consulta: {formattedFee}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-white/80 hover:bg-white text-brown-light hover:text-brown-dark flex items-center justify-center border border-brand-pot/30 transition-all cursor-pointer shrink-0"
                        aria-label="Fechar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Conteúdo Principal com Scroll */}
                <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
                    {/* Nota Ética de Concorrência e Atenção Individualizada */}
                    <div className="p-3.5 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900 font-medium">
                        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                        <span>
                            <strong>Garantia Anti-Double-Booking:</strong> Horário reservado com exclusividade no momento da confirmação. Atenção síncrona individualizada conforme Res. CFM nº 2.314/2022.
                        </span>
                    </div>

                    {/* Seleção de Horários Livres */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm sm:text-base font-black text-brown-dark flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-brand-orange" />
                                Escolha uma Data e Horário Disponível:
                            </h3>
                            <span className="text-xs font-bold text-brown-light">
                                Duração: {doctor.consultationDurationMinutes || 50} min
                            </span>
                        </div>

                        {loadingSlots ? (
                            <div className="py-12 text-center space-y-3">
                                <Loader2 className="w-8 h-8 text-brand-orange animate-spin mx-auto" />
                                <p className="text-xs sm:text-sm font-bold text-brown-light">
                                    Consultando a grade em tempo real do especialista...
                                </p>
                            </div>
                        ) : Object.keys(groupedSlots).length === 0 ? (
                            <div className="p-8 border-2 border-dashed border-brand-pot/40 rounded-2xl text-center space-y-2.5 bg-gray-50/50">
                                <Clock className="w-8 h-8 text-brown-light/60 mx-auto" />
                                <h4 className="text-sm font-bold text-brown-dark">
                                    Nenhum horário livre disponível no momento
                                </h4>
                                <p className="text-xs text-brown-light max-w-md mx-auto">
                                    Este médico ainda não disponibilizou novos turnos abertos para os próximos dias. Tente verificar outros especialistas ou volte em breve.
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {Object.entries(groupedSlots).map(([dateStr, daySlots]) => (
                                    <div key={dateStr} className="border border-brand-pot/30 rounded-2xl p-4 bg-white shadow-xs">
                                        <div className="flex items-center justify-between border-b border-brand-pot/20 pb-2.5 mb-3">
                                            <span className="text-xs sm:text-sm font-black text-brown-dark capitalize">
                                                {formatHeaderDate(dateStr)}
                                            </span>
                                            <span className="text-[11px] font-bold text-brand-orange px-2 py-0.5 bg-brand-orange/10 rounded-md">
                                                {daySlots.length} {daySlots.length === 1 ? 'vaga' : 'vagas'}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                                            {daySlots.map(slot => {
                                                const isSelected = selectedSlotId === slot.id;
                                                return (
                                                    <button
                                                        key={slot.id}
                                                        type="button"
                                                        onClick={() => setSelectedSlotId(slot.id)}
                                                        className={`py-2.5 px-3 rounded-xl border-2 text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer min-h-[46px] ${
                                                            isSelected
                                                                ? 'bg-brand-orange text-white border-brand-orange shadow-sm scale-102'
                                                                : 'bg-emerald-50/40 border-emerald-300 text-emerald-900 hover:border-emerald-500 hover:bg-emerald-50'
                                                        }`}
                                                    >
                                                        <Clock className="w-3.5 h-3.5 shrink-0" />
                                                        <span>{formatTimeOnly(slot.startDateTime)}</span>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Campo Opcional: Motivo da Consulta / Sintomas */}
                    {selectedSlotId && (
                        <div className="space-y-2 animate-in fade-in duration-200">
                            <label className="block text-xs font-bold text-brown-dark uppercase tracking-wider">
                                Motivo da Consulta ou Principais Sintomas (Opcional)
                            </label>
                            <textarea
                                rows={3}
                                maxLength={500}
                                value={patientNotes}
                                onChange={e => setPatientNotes(e.target.value)}
                                placeholder="Ex: Avaliação de esquecimentos recentes, tonturas frequentes e ajuste da receita de pressão..."
                                className="w-full px-4 py-3 rounded-xl border border-brand-pot/60 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 text-xs sm:text-sm text-brown-dark outline-none resize-none"
                            />
                            <p className="text-[11px] text-brown-light">
                                Estas informações serão encaminhadas com sigilo ao médico para preparo da teleconsulta.
                            </p>
                        </div>
                    )}
                </div>

                {/* Rodapé com Ações */}
                <div className="p-4 sm:p-5 bg-gray-50 border-t border-brand-pot/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-xs text-brown-dark font-medium text-center sm:text-left">
                        {selectedSlotObj ? (
                            <span>
                                Horário selecionado:{' '}
                                <strong className="text-brand-orange font-black">
                                    {formatHeaderDate(selectedSlotObj.startDateTime.split('T')[0])} às {formatTimeOnly(selectedSlotObj.startDateTime)}
                                </strong>
                            </span>
                        ) : (
                            <span className="text-brown-light italic">
                                Selecione um horário livre acima para prosseguir
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-5 py-3 rounded-xl border border-brand-pot bg-white hover:bg-gray-100 text-brown-dark font-bold text-xs sm:text-sm transition-colors cursor-pointer min-h-[48px]"
                        >
                            Voltar
                        </button>

                        <button
                            type="button"
                            disabled={!selectedSlotId || submitting}
                            onClick={handleConfirmBooking}
                            className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px]"
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                                    <span>Confirmando Reserva...</span>
                                </>
                            ) : (
                                <>
                                    <CalendarCheck2 className="w-4 h-4 shrink-0" />
                                    <span>Confirmar Agendamento</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Modal de Feedback Acessível */}
            <FeedbackModal
                isOpen={feedback.isOpen}
                type={feedback.type}
                title={feedback.title}
                message={feedback.message}
                onConfirm={handleFeedbackClose}
            />
        </div>
    );
};
