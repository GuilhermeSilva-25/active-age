import React, { useState } from 'react';
import { X, Calendar, Clock, Sparkles, Plus, Check } from 'lucide-react';
import { FeedbackModal } from '../common/FeedbackModal';

interface GerarHorariosModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const GerarHorariosModal: React.FC<GerarHorariosModalProps> = ({
    isOpen,
    onClose,
    onSuccess,
}) => {
    const [mode, setMode] = useState<'batch' | 'single'>('batch');
    const [loading, setLoading] = useState(false);

    // Estado da Geração em Lote
    const tomorrowStr = new Date(Date.now() + 86400000).toISOString().split('T')[0];
    const [batchDate, setBatchDate] = useState(tomorrowStr);
    const [startTime, setStartTime] = useState('08:00');
    const [endTime, setEndTime] = useState('12:00');
    const [durationMinutes, setDurationMinutes] = useState(50);
    const [breakMinutes, setBreakMinutes] = useState(10);
    const [batchNotes, setBatchNotes] = useState('Turno de Consultas Geriátricas');

    // Estado do Slot Avulso
    const [singleDate, setSingleDate] = useState(tomorrowStr);
    const [singleTime, setSingleTime] = useState('14:00');
    const [singleDuration, setSingleDuration] = useState(50);
    const [singleNotes, setSingleNotes] = useState('');

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

    if (!isOpen) return null;

    // Cálculo estimado de slots no lote
    const calculateEstimatedSlots = () => {
        try {
            const [startH, startM] = startTime.split(':').map(Number);
            const [endH, endM] = endTime.split(':').map(Number);
            const totalStartMin = startH * 60 + startM;
            const totalEndMin = endH * 60 + endM;

            if (totalEndMin <= totalStartMin) return 0;

            const totalAvailableMin = totalEndMin - totalStartMin;
            const slotCycle = durationMinutes + breakMinutes;
            return Math.floor((totalAvailableMin + breakMinutes) / slotCycle);
        } catch {
            return 0;
        }
    };

    const estimatedSlots = calculateEstimatedSlots();

    const handleBatchSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                date: batchDate,
                startTime: `${startTime}:00`,
                endTime: `${endTime}:00`,
                durationMinutes,
                breakMinutes,
                notes: batchNotes.trim() || undefined,
            };

            const response = await fetch('/api/doctor/schedule/batch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Erro ao gerar grade de horários.');
            }

            const data = await response.json();
            setFeedback({
                isOpen: true,
                title: 'Grade Gerada com Sucesso!',
                message: `${data.length} horários foram adicionados à sua agenda e já estão disponíveis para agendamento pelos pacientes.`,
                type: 'success',
            });
        } catch (err: any) {
            setFeedback({
                isOpen: true,
                title: 'Não foi possível gerar os horários',
                message: err.message || 'Verifique se os horários não estão sobrepostos.',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSingleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const payload = {
                startDateTime: `${singleDate}T${singleTime}:00`,
                durationMinutes: singleDuration,
                notes: singleNotes.trim() || undefined,
            };

            const response = await fetch('/api/doctor/schedule/slot', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.message || 'Erro ao cadastrar horário avulso.');
            }

            setFeedback({
                isOpen: true,
                title: 'Horário Disponibilizado!',
                message: 'O novo horário foi adicionado com sucesso e está visível na vitrine pública.',
                type: 'success',
            });
        } catch (err: any) {
            setFeedback({
                isOpen: true,
                title: 'Conflito de Horário',
                message: err.message || 'Você já possui um horário cadastrado neste mesmo intervalo.',
                type: 'error',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleFeedbackClose = () => {
        setFeedback(prev => ({ ...prev, isOpen: false }));
        if (feedback.type === 'success') {
            onSuccess();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border border-brand-pot/40 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {/* Cabeçalho */}
                <div className="bg-brand-ice/80 px-6 py-5 border-b border-brand-pot/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-brown-dark">
                                Disponibilizar Horários
                            </h3>
                            <p className="text-xs text-brown-light">
                                Configure seus turnos no consultório virtual
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-white/80 hover:bg-white text-brown-light hover:text-brown-dark flex items-center justify-center border border-brand-pot/30 transition-all cursor-pointer"
                        aria-label="Fechar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Alternador de Abas */}
                <div className="p-6 pb-0">
                    <div className="grid grid-cols-2 gap-2 p-1.5 bg-gray-100 rounded-2xl">
                        <button
                            type="button"
                            onClick={() => setMode('batch')}
                            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                mode === 'batch'
                                    ? 'bg-white text-brown-dark shadow-xs'
                                    : 'text-brown-light hover:text-brown-dark'
                            }`}
                        >
                            <Sparkles className="w-4 h-4 text-brand-orange" />
                            Turno em Lote (Recomendado)
                        </button>
                        <button
                            type="button"
                            onClick={() => setMode('single')}
                            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                                mode === 'single'
                                    ? 'bg-white text-brown-dark shadow-xs'
                                    : 'text-brown-light hover:text-brown-dark'
                            }`}
                        >
                            <Plus className="w-4 h-4 text-brand-orange" />
                            Horário Avulso
                        </button>
                    </div>
                </div>

                {/* Formulário: Geração em Lote */}
                {mode === 'batch' ? (
                    <form onSubmit={handleBatchSubmit} className="p-6 space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-brown-dark uppercase tracking-wider mb-1.5">
                                Data do Turno
                            </label>
                            <input
                                type="date"
                                required
                                min={tomorrowStr}
                                value={batchDate}
                                onChange={e => setBatchDate(e.target.value)}
                                className="w-full px-4 py-3 rounded-xl border border-brand-pot/50 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 text-sm font-medium text-brown-dark outline-none bg-white"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-brown-dark uppercase tracking-wider mb-1.5">
                                    Início do Turno
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={startTime}
                                    onChange={e => setStartTime(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-brand-pot/50 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 text-sm font-medium text-brown-dark outline-none bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-brown-dark uppercase tracking-wider mb-1.5">
                                    Término do Turno
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={endTime}
                                    onChange={e => setEndTime(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-brand-pot/50 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 text-sm font-medium text-brown-dark outline-none bg-white"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-brown-dark uppercase tracking-wider mb-1.5">
                                    Duração da Consulta
                                </label>
                                <select
                                    value={durationMinutes}
                                    onChange={e => setDurationMinutes(Number(e.target.value))}
                                    className="w-full px-4 py-3 rounded-xl border border-brand-pot/50 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 text-sm font-medium text-brown-dark outline-none bg-white"
                                >
                                    <option value={45}>45 minutos</option>
                                    <option value={50}>50 minutos (Padrão Geriátrico)</option>
                                    <option value={60}>60 minutos (Avaliação Ampla)</option>
                                    <option value={30}>30 minutos (Retorno Rápido)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-brown-dark uppercase tracking-wider mb-1.5">
                                    Pausa Técnica
                                </label>
                                <select
                                    value={breakMinutes}
                                    onChange={e => setBreakMinutes(Number(e.target.value))}
                                    className="w-full px-4 py-3 rounded-xl border border-brand-pot/50 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 text-sm font-medium text-brown-dark outline-none bg-white"
                                >
                                    <option value={0}>Sem intervalo</option>
                                    <option value={10}>10 minutos (Recomendado)</option>
                                    <option value={15}>15 minutos</option>
                                    <option value={20}>20 minutos</option>
                                </select>
                            </div>
                        </div>

                        {/* Banner de Prévia Reativa */}
                        <div className="p-3.5 bg-brand-orange/5 border border-brand-orange/20 rounded-2xl flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2 text-brown-dark">
                                <Clock className="w-4 h-4 text-brand-orange" />
                                <span>Estimativa de consultas geradas:</span>
                            </div>
                            <span className="font-black text-brand-orange text-sm px-2.5 py-0.5 bg-brand-orange/10 rounded-lg">
                                {estimatedSlots} {estimatedSlots === 1 ? 'consulta' : 'consultas'}
                            </span>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-brown-dark uppercase tracking-wider mb-1.5">
                                Observação Interna (Opcional)
                            </label>
                            <input
                                type="text"
                                maxLength={60}
                                placeholder="Ex: Turno da manhã no consultório"
                                value={batchNotes}
                                onChange={e => setBatchNotes(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-brand-pot/50 focus:border-brand-orange text-xs text-brown-dark outline-none"
                            />
                        </div>

                        {/* Ações */}
                        <div className="pt-2 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="whitespace-nowrap px-5 py-3 rounded-xl border border-brand-pot/60 text-brown-dark text-xs sm:text-sm font-bold hover:bg-gray-50 transition-all cursor-pointer min-h-[48px] shrink-0"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading || estimatedSlots <= 0}
                                className="whitespace-nowrap px-6 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow flex items-center gap-2 cursor-pointer disabled:opacity-50 min-h-[48px] shrink-0"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Gerando Grade...
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4" />
                                        Gerar {estimatedSlots} Horários
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                ) : (
                    /* Formulário: Horário Avulso */
                    <form onSubmit={handleSingleSubmit} className="p-6 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-brown-dark uppercase tracking-wider mb-1.5">
                                    Data
                                </label>
                                <input
                                    type="date"
                                    required
                                    min={tomorrowStr}
                                    value={singleDate}
                                    onChange={e => setSingleDate(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-brand-pot/50 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 text-sm font-medium text-brown-dark outline-none bg-white"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-brown-dark uppercase tracking-wider mb-1.5">
                                    Horário de Início
                                </label>
                                <input
                                    type="time"
                                    required
                                    value={singleTime}
                                    onChange={e => setSingleTime(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-brand-pot/50 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 text-sm font-medium text-brown-dark outline-none bg-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-brown-dark uppercase tracking-wider mb-1.5">
                                Duração da Consulta
                            </label>
                            <select
                                value={singleDuration}
                                onChange={e => setSingleDuration(Number(e.target.value))}
                                className="w-full px-4 py-3 rounded-xl border border-brand-pot/50 focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 text-sm font-medium text-brown-dark outline-none bg-white"
                            >
                                <option value={50}>50 minutos (Padrão Geriátrico)</option>
                                <option value={45}>45 minutos</option>
                                <option value={60}>60 minutos (Avaliação Ampla)</option>
                                <option value={30}>30 minutos (Retorno Rápido)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-brown-dark uppercase tracking-wider mb-1.5">
                                Observação (Opcional)
                            </label>
                            <input
                                type="text"
                                maxLength={60}
                                placeholder="Ex: Encaixe especial de paciente"
                                value={singleNotes}
                                onChange={e => setSingleNotes(e.target.value)}
                                className="w-full px-4 py-2.5 rounded-xl border border-brand-pot/50 focus:border-brand-orange text-xs text-brown-dark outline-none"
                            />
                        </div>

                        {/* Ações */}
                        <div className="pt-2 flex items-center justify-end gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="whitespace-nowrap px-5 py-3 rounded-xl border border-brand-pot/60 text-brown-dark text-xs sm:text-sm font-bold hover:bg-gray-50 transition-all cursor-pointer min-h-[48px] shrink-0"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="whitespace-nowrap px-6 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white text-xs sm:text-sm font-bold transition-all shadow-sm hover:shadow flex items-center gap-2 cursor-pointer disabled:opacity-50 min-h-[48px] shrink-0"
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Disponibilizando...
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4" />
                                        Cadastrar Horário
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>

            {/* Modal Acessível de Feedback */}
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
