import { useEffect } from 'react';
import {
    X,
    ShieldCheck,
    Award,
    Clock,
    DollarSign,
    ExternalLink,
    Stethoscope,
    CalendarCheck2,
    BookOpen
} from 'lucide-react';

export interface DoctorPublicProfile {
    id: string;
    fullName: string;
    avatarUrl?: string;
    crm: string;
    ufCrm: string;
    rqe?: string;
    bio?: string;
    clinicalFocus?: string[];
    consultationFee?: number;
    consultationDurationMinutes?: number;
    lattesUrl?: string;
}

interface DoctorDetailModalProps {
    doctor: DoctorPublicProfile | null;
    isOpen: boolean;
    onClose: () => void;
    onSelectSchedule: (doctor: DoctorPublicProfile) => void;
}

export function DoctorDetailModal({
    doctor,
    isOpen,
    onClose,
    onSelectSchedule
}: DoctorDetailModalProps) {
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen || !doctor) return null;

    const formattedFee = doctor.consultationFee
        ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(doctor.consultationFee)
        : 'A consultar';

    const duration = doctor.consultationDurationMinutes || 50;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-doctor-title"
        >
            <div
                className="bg-white w-full max-w-2xl rounded-2xl sm:rounded-3xl shadow-2xl border border-brand-pot/40 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header com Foto de Rosto e Dados Principais */}
                <div className="bg-gradient-to-r from-orange-50 via-amber-50/50 to-white p-5 sm:p-6 border-b border-brand-pot/30 relative">
                    <button
                        type="button"
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-xl text-brown-dark/60 hover:text-brown-dark hover:bg-black/5 transition-colors cursor-pointer"
                        title="Fechar modal (Esc)"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-5 text-center sm:text-left">
                        {/* Avatar com borda */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-brand-orange/10 border-2 border-brand-orange/30 shadow-md shrink-0 flex items-center justify-center">
                            {doctor.avatarUrl ? (
                                <img
                                    src={doctor.avatarUrl}
                                    alt={doctor.fullName}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <Stethoscope className="w-10 h-10 text-brand-orange" />
                            )}
                        </div>

                        <div className="flex-1">
                            {/* Selo Homologado CFM */}
                            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mb-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>Homologado CFM & Active Age</span>
                            </div>

                            <h2 id="modal-doctor-title" className="text-xl sm:text-2xl font-black text-brown-dark leading-snug">
                                {doctor.fullName}
                            </h2>

                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-1 text-xs sm:text-sm text-brown-light font-medium">
                                <span className="bg-white/90 border border-brand-pot/50 px-2 py-0.5 rounded-md font-bold text-brown-dark">
                                    CRM {doctor.crm}/{doctor.ufCrm}
                                </span>
                                {doctor.rqe && (
                                    <span className="bg-brand-orange/10 border border-brand-orange/20 text-brand-orange px-2 py-0.5 rounded-md font-bold inline-flex items-center gap-1">
                                        <Award className="w-3.5 h-3.5" />
                                        RQE {doctor.rqe}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Corpo de Informações Regulatórias e Clínicas */}
                <div className="p-5 sm:p-6 overflow-y-auto space-y-5 text-brown-dark text-sm sm:text-base flex-1">
                    {/* Honorários e Duração */}
                    <div className="grid grid-cols-2 gap-3 sm:gap-4 bg-orange-50/60 p-3.5 sm:p-4 rounded-xl sm:rounded-2xl border border-orange-200/60">
                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-brand-orange/15 text-brand-orange flex items-center justify-center shrink-0">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[11px] sm:text-xs uppercase font-bold text-brown-light block">
                                    Valor da Consulta
                                </span>
                                <span className="text-base sm:text-lg font-black text-brand-orange">
                                    {formattedFee}
                                </span>
                            </div>
                        </div>

                        <div className="flex items-center gap-2.5">
                            <div className="w-9 h-9 rounded-lg bg-brand-orange/15 text-brand-orange flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5" />
                            </div>
                            <div>
                                <span className="text-[11px] sm:text-xs uppercase font-bold text-brown-light block">
                                    Tempo Estimado
                                </span>
                                <span className="text-base sm:text-lg font-black text-brown-dark">
                                    {duration} minutos
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Biografia Clínica & Formação */}
                    <div>
                        <h3 className="text-sm sm:text-base font-black text-brown-dark flex items-center gap-2 mb-2">
                            <BookOpen className="w-4 h-4 text-brand-orange" />
                            Apresentação & Trajetória Médica
                        </h3>
                        <p className="text-brown-light text-xs sm:text-sm leading-relaxed whitespace-pre-line bg-gray-50/80 p-3.5 rounded-xl border border-gray-100">
                            {doctor.bio || 'Médico(a) especialista em Geriatria credenciado(a) na plataforma Active Age.'}
                        </p>
                    </div>

                    {/* Áreas de Foco Clínico */}
                    {doctor.clinicalFocus && doctor.clinicalFocus.length > 0 && (
                        <div>
                            <h3 className="text-sm sm:text-base font-black text-brown-dark flex items-center gap-2 mb-2">
                                <Stethoscope className="w-4 h-4 text-brand-orange" />
                                Especialidades & Áreas de Foco
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {doctor.clinicalFocus.map((focus, index) => (
                                    <span
                                        key={index}
                                        className="px-3 py-1 rounded-lg bg-orange-100/70 border border-orange-200 text-brown-dark text-xs sm:text-sm font-semibold"
                                    >
                                        {focus}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Link para o Currículo Lattes */}
                    {doctor.lattesUrl && (
                        <div>
                            <a
                                href={doctor.lattesUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-brand-orange hover:text-brand-orange/80 underline decoration-2 transition-colors"
                            >
                                <ExternalLink className="w-4 h-4" />
                                Visualizar Currículo Lattes Oficial (CNPq)
                            </a>
                        </div>
                    )}

                    {/* Nota Ética de Conformidade CFM */}
                    <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/70 text-xs text-amber-900 leading-snug">
                        <strong>Nota Ética CFM:</strong> Atendimento por telemedicina regulamentado pelas Resoluções CFM nº 2.314/2022 e 2.336/2023. Prescrições digitais e atestados com assinatura padrão ICP-Brasil.
                    </div>
                </div>

                {/* Rodapé com Botão Principal de Agendamento */}
                <div className="p-4 sm:p-5 bg-gray-50 border-t border-brand-pot/30 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full sm:w-auto px-5 py-3 rounded-xl border border-brand-pot bg-white hover:bg-gray-100 text-brown-dark font-bold text-xs sm:text-sm transition-colors cursor-pointer"
                    >
                        Fechar
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            onClose();
                            onSelectSchedule(doctor);
                        }}
                        className="w-full sm:w-auto px-6 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black text-sm sm:text-base shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <CalendarCheck2 className="w-5 h-5" />
                        Ver Horários & Agendar
                    </button>
                </div>
            </div>
        </div>
    );
}
