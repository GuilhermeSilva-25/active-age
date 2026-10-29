import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Calendar,
    Clock,
    Plus,
    Lock,
    Unlock,
    Trash2,
    CheckCircle2,
    ArrowLeft,
    ShieldCheck,
    UserCheck,
    CalendarDays
} from 'lucide-react';
import { GerarHorariosModal } from '../../components/medico/GerarHorariosModal';
import { FeedbackModal } from '../../components/common/FeedbackModal';

interface DoctorScheduleSlot {
    id: string;
    doctorId: string;
    startDateTime: string;
    endDateTime: string;
    durationMinutes: number;
    status: 'LIVRE' | 'OCUPADO' | 'BLOQUEADO';
    appointmentId?: string;
    patientId?: string;
    patientName?: string;
    notes?: string;
}

interface ScheduleSummary {
    totalSlots: number;
    totalFreeSlots: number;
    totalBookedSlots: number;
    totalBlockedSlots: number;
    occupancyRatePercentage: number;
}

export const MinhaAgenda: React.FC = () => {
    const navigate = useNavigate();

    const [slots, setSlots] = useState<DoctorScheduleSlot[]>([]);
    const [summary, setSummary] = useState<ScheduleSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<'TODOS' | 'LIVRE' | 'OCUPADO' | 'BLOQUEADO'>('TODOS');
    const [periodDays, setPeriodDays] = useState<number>(15);

    // Modais
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState(false);

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

    const fetchData = async () => {
        setLoading(true);
        try {
            // Calcula janela temporal
            const now = new Date();
            const startStr = now.toISOString();
            const endDate = new Date(now.getTime() + periodDays * 86400000);
            const endStr = endDate.toISOString();

            const [slotsRes, summaryRes] = await Promise.all([
                fetch(`/api/doctor/schedule?startDate=${encodeURIComponent(startStr)}&endDate=${encodeURIComponent(endStr)}`),
                fetch('/api/doctor/schedule/summary'),
            ]);

            if (slotsRes.ok) {
                const data = await slotsRes.json();
                setSlots(data);
            }

            if (summaryRes.ok) {
                const summaryData = await summaryRes.json();
                setSummary(summaryData);
            }
        } catch (err) {
            console.error('Erro ao carregar agenda médica:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [periodDays]);

    // Alternar bloqueio
    const handleToggleBlock = async (slotId: string) => {
        setActionLoading(true);
        try {
            const res = await fetch(`/api/doctor/schedule/slot/${slotId}/toggle-block`, {
                method: 'PATCH',
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Erro ao alterar status do horário.');
            }

            const updatedSlot: DoctorScheduleSlot = await res.json();
            setSlots(prev => prev.map(s => (s.id === slotId ? updatedSlot : s)));
            fetchData();
        } catch (err: any) {
            setFeedback({
                isOpen: true,
                title: 'Não foi possível alterar o horário',
                message: err.message,
                type: 'error',
            });
        } finally {
            setActionLoading(false);
        }
    };

    // Confirmar exclusão
    const handleDeleteSlot = async () => {
        if (!deleteTargetId) return;

        setActionLoading(true);
        try {
            const res = await fetch(`/api/doctor/schedule/slot/${deleteTargetId}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.message || 'Erro ao excluir horário.');
            }

            setSlots(prev => prev.filter(s => s.id !== deleteTargetId));
            setDeleteTargetId(null);
            fetchData();
            setFeedback({
                isOpen: true,
                title: 'Horário Removido',
                message: 'O horário foi removido com sucesso da sua grade de atendimento.',
                type: 'success',
            });
        } catch (err: any) {
            setFeedback({
                isOpen: true,
                title: 'Não foi possível excluir o horário',
                message: err.message,
                type: 'error',
            });
        } finally {
            setActionLoading(false);
        }
    };

    // Agrupamento de slots por data
    const groupedSlots = useMemo(() => {
        const filtered = slots.filter(s => {
            if (statusFilter === 'TODOS') return true;
            return s.status === statusFilter;
        });

        const groups: { [key: string]: DoctorScheduleSlot[] } = {};

        filtered.forEach(slot => {
            const datePart = slot.startDateTime.split('T')[0];
            if (!groups[datePart]) {
                groups[datePart] = [];
            }
            groups[datePart].push(slot);
        });

        return groups;
    }, [slots, statusFilter]);

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

    const formatTimeRange = (startIso: string, endIso: string) => {
        const start = startIso.split('T')[1].substring(0, 5);
        const end = endIso.split('T')[1].substring(0, 5);
        return `${start} às ${end}`;
    };

    return (
        <div className="min-h-screen bg-brand-ice pb-16">
            {/* Topbar Operacional */}
            <header className="bg-white border-b border-brand-pot/30 sticky top-0 z-20 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
                    <button
                        onClick={() => navigate('/medico/dashboard')}
                        className="flex items-center gap-2 text-brown-dark hover:text-brand-orange text-sm font-bold transition-all cursor-pointer min-h-[44px]"
                    >
                        <ArrowLeft className="w-5 h-5 text-brand-orange" />
                        <span>Voltar ao Painel Médico</span>
                    </button>

                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-5 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow flex items-center gap-2 cursor-pointer min-h-[44px]"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Disponibilizar Novos Horários</span>
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 sm:pt-8 space-y-6">
                {/* Título e Banner Regulatório */}
                <div className="bg-white rounded-3xl border border-brand-pot/30 p-6 sm:p-8 shadow-xs">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs font-black text-brand-orange uppercase tracking-wider">
                                <CalendarDays className="w-4 h-4" />
                                <span>Consultório Virtual & Telemedicina</span>
                            </div>
                            <h1 className="text-2xl sm:text-3xl font-black text-brown-dark tracking-tight">
                                Minha Agenda & Grade de Atendimento
                            </h1>
                            <p className="text-xs sm:text-sm text-brown-light leading-relaxed max-w-2xl">
                                Configure seus turnos de consulta geriátrica com tempos humanizados (45-60 min) e intervalos técnicos entre atendimentos conforme a Resolução CFM nº 2.314/2022.
                            </p>
                        </div>

                        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200/80 rounded-2xl text-xs font-semibold text-emerald-800 self-start md:self-auto">
                            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                            <span>Reserva Exclusiva de Horários Ativa</span>
                        </div>
                    </div>

                    {/* Cards de Métricas da Agenda */}
                    {summary && (
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-6 border-t border-brand-pot/20">
                            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/60">
                                <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                                    Horários Livres
                                </span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl sm:text-3xl font-black text-emerald-900">
                                        {summary.totalFreeSlots}
                                    </span>
                                    <span className="text-xs text-emerald-700 font-medium">na vitrine</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/60">
                                <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider block mb-1">
                                    Consultas Agendadas
                                </span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl sm:text-3xl font-black text-blue-900">
                                        {summary.totalBookedSlots}
                                    </span>
                                    <span className="text-xs text-blue-700 font-medium">confirmadas</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200">
                                <span className="text-[11px] font-bold text-gray-600 uppercase tracking-wider block mb-1">
                                    Horários Bloqueados
                                </span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl sm:text-3xl font-black text-gray-800">
                                        {summary.totalBlockedSlots}
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium">pausas/folgas</span>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-brand-orange/10 border border-brand-orange/20">
                                <span className="text-[11px] font-bold text-brand-orange uppercase tracking-wider block mb-1">
                                    Taxa de Ocupação
                                </span>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-2xl sm:text-3xl font-black text-brand-orange">
                                        {summary.occupancyRatePercentage}%
                                    </span>
                                    <span className="text-xs text-brand-orange/80 font-medium">da grade</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Barra de Filtros */}
                <div className="bg-white rounded-2xl border border-brand-pot/30 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
                    {/* Filtro de Status */}
                    <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
                        <span className="text-xs font-bold text-brown-light uppercase mr-1 hidden md:inline">
                            Status:
                        </span>
                        {(['TODOS', 'LIVRE', 'OCUPADO', 'BLOQUEADO'] as const).map(st => (
                            <button
                                key={st}
                                onClick={() => setStatusFilter(st)}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap min-h-[36px] ${
                                    statusFilter === st
                                        ? 'bg-brown-dark text-white shadow-xs'
                                        : 'bg-gray-100 text-brown-dark hover:bg-gray-200'
                                }`}
                            >
                                {st === 'TODOS' && 'Todos os Horários'}
                                {st === 'LIVRE' && 'Apenas Livres'}
                                {st === 'OCUPADO' && 'Consultas Agendadas'}
                                {st === 'BLOQUEADO' && 'Bloqueados'}
                            </button>
                        ))}
                    </div>

                    {/* Janela Temporal */}
                    <div className="flex items-center gap-2 self-end sm:self-auto">
                        <Clock className="w-4 h-4 text-brown-light" />
                        <select
                            value={periodDays}
                            onChange={e => setPeriodDays(Number(e.target.value))}
                            className="text-xs font-bold text-brown-dark bg-gray-50 border border-brand-pot/40 rounded-xl px-3 py-2 outline-none focus:border-brand-orange cursor-pointer"
                        >
                            <option value={7}>Próximos 7 dias</option>
                            <option value={15}>Próximos 15 dias</option>
                            <option value={30}>Próximos 30 dias</option>
                            <option value={60}>Próximos 60 dias</option>
                        </select>
                    </div>
                </div>

                {/* Grade de Atendimentos */}
                {loading ? (
                    <div className="bg-white rounded-3xl border border-brand-pot/30 p-12 text-center shadow-xs">
                        <div className="w-10 h-10 border-4 border-brand-orange border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-sm font-bold text-brown-dark">Carregando sua grade de horários...</p>
                    </div>
                ) : Object.keys(groupedSlots).length === 0 ? (
                    /* Empty State */
                    <div className="bg-white rounded-3xl border border-brand-pot/30 p-12 text-center shadow-xs max-w-xl mx-auto space-y-4">
                        <div className="w-16 h-16 rounded-2xl bg-brand-orange/10 text-brand-orange flex items-center justify-center mx-auto">
                            <Calendar className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl font-black text-brown-dark">
                            Nenhum horário encontrado
                        </h3>
                        <p className="text-xs sm:text-sm text-brown-light leading-relaxed">
                            {statusFilter !== 'TODOS'
                                ? 'Não há horários cadastrados com o filtro de status selecionado. Tente alternar para "Todos os Horários".'
                                : 'Você ainda não possui horários cadastrados para este período. Comece gerando um turno completo de atendimento para abrir sua vitrine aos pacientes.'}
                        </p>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-orange text-white text-xs sm:text-sm font-bold hover:bg-brand-orange/90 transition-all shadow-sm cursor-pointer min-h-[48px]"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Disponibilizar Primeiro Turno</span>
                        </button>
                    </div>
                ) : (
                    /* Lista Agrupada por Data */
                    <div className="space-y-6">
                        {Object.entries(groupedSlots).map(([dateStr, daySlots]) => (
                            <section
                                key={dateStr}
                                className="bg-white rounded-3xl border border-brand-pot/30 p-5 sm:p-7 shadow-xs space-y-4"
                            >
                                <div className="flex items-center justify-between border-b border-brand-pot/20 pb-3">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-lg bg-brand-orange/10 text-brand-orange flex items-center justify-center font-bold text-xs">
                                            {dateStr.split('-')[2]}
                                        </div>
                                        <h2 className="text-base sm:text-lg font-black text-brown-dark capitalize">
                                            {formatHeaderDate(dateStr)}
                                        </h2>
                                    </div>
                                    <span className="text-xs font-bold text-brown-light px-2.5 py-1 bg-gray-100 rounded-lg">
                                        {daySlots.length} {daySlots.length === 1 ? 'horário' : 'horários'}
                                    </span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {daySlots.map(slot => (
                                        <div
                                            key={slot.id}
                                            className={`p-4 rounded-2xl border-2 transition-all flex flex-col justify-between ${
                                                slot.status === 'LIVRE'
                                                    ? 'bg-emerald-50/30 border-emerald-300 hover:border-emerald-500 shadow-xs'
                                                    : slot.status === 'OCUPADO'
                                                    ? 'bg-blue-50/40 border-blue-300 shadow-xs'
                                                    : 'bg-gray-50 border-gray-200 opacity-80'
                                            }`}
                                        >
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className={`w-4 h-4 ${
                                                            slot.status === 'LIVRE' ? 'text-emerald-700' :
                                                            slot.status === 'OCUPADO' ? 'text-blue-700' : 'text-gray-500'
                                                        }`} />
                                                        <span className="text-sm font-black text-brown-dark">
                                                            {formatTimeRange(slot.startDateTime, slot.endDateTime)}
                                                        </span>
                                                    </div>
                                                    <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-white border border-brand-pot/20 text-brown-dark">
                                                        {slot.durationMinutes} min
                                                    </span>
                                                </div>

                                                {/* Status Tag */}
                                                <div className="mb-2">
                                                    {slot.status === 'LIVRE' && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md">
                                                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                                            Disponível na Vitrine
                                                        </span>
                                                    )}
                                                    {slot.status === 'OCUPADO' && (
                                                        <div className="space-y-1">
                                                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-800 bg-blue-100/70 px-2 py-0.5 rounded-md">
                                                                <UserCheck className="w-3 h-3 text-blue-600" />
                                                                Consulta Agendada
                                                            </span>
                                                            {slot.patientName && (
                                                                <p className="text-xs font-bold text-blue-900 truncate">
                                                                    Paciente: {slot.patientName}
                                                                </p>
                                                            )}
                                                        </div>
                                                    )}
                                                    {slot.status === 'BLOQUEADO' && (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-gray-700 bg-gray-200 px-2 py-0.5 rounded-md">
                                                            <Lock className="w-3 h-3 text-gray-500" />
                                                            Pausa / Horário Bloqueado
                                                        </span>
                                                    )}
                                                </div>

                                                {slot.notes && (
                                                    <p className="text-[11px] text-brown-light italic line-clamp-1 mb-2">
                                                        "{slot.notes}"
                                                    </p>
                                                )}
                                            </div>

                                            {/* Ações do Slot */}
                                            <div className="pt-3 border-t border-brand-pot/20 flex items-center justify-between gap-2 mt-2">
                                                {slot.status === 'OCUPADO' ? (
                                                    <span className="text-[11px] font-medium text-blue-700 italic">
                                                        Consulta confirmada
                                                    </span>
                                                ) : (
                                                    <>
                                                        <button
                                                            onClick={() => handleToggleBlock(slot.id)}
                                                            disabled={actionLoading}
                                                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer min-h-[36px] ${
                                                                slot.status === 'LIVRE'
                                                                    ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                                                    : 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                                            }`}
                                                            title={slot.status === 'LIVRE' ? 'Bloquear para pausas/reuniões' : 'Tornar livre para os pacientes'}
                                                        >
                                                            {slot.status === 'LIVRE' ? (
                                                                <>
                                                                    <Lock className="w-3.5 h-3.5" />
                                                                    <span>Bloquear</span>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <Unlock className="w-3.5 h-3.5" />
                                                                    <span>Liberar</span>
                                                                </>
                                                            )}
                                                        </button>

                                                        <button
                                                            onClick={() => setDeleteTargetId(slot.id)}
                                                            disabled={actionLoading}
                                                            className="p-2 rounded-xl text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-all cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                                                            title="Excluir este horário"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal de Geração de Horários */}
            <GerarHorariosModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={fetchData}
            />

            {/* Modal de Confirmação de Exclusão */}
            {deleteTargetId && (
                <FeedbackModal
                    isOpen={true}
                    type="warning"
                    title="Excluir Horário de Atendimento?"
                    message="Tem certeza que deseja remover este horário da sua grade? Pacientes não poderão mais visualizá-lo para agendamentos."
                    confirmText={actionLoading ? 'Excluindo...' : 'Sim, Excluir Horário'}
                    cancelText="Cancelar"
                    showCancelButton={true}
                    isLoading={actionLoading}
                    onConfirm={handleDeleteSlot}
                    onCancel={() => setDeleteTargetId(null)}
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
        </div>
    );
};
