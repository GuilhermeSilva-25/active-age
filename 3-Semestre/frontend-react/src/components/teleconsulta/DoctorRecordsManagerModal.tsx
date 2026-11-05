import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import React, { useState, useEffect } from 'react';
import {
    X,
    Search,
    FileText,
    Calendar,
    Clock,
    User,
    CheckCircle2,
    Printer,
    FileSignature,
    Loader2,
    FolderOpen,
} from 'lucide-react';
import { MedicalRecordViewModal } from './MedicalRecordViewModal';
import { DocumentPrintModal } from './DocumentPrintModal';
import type { MedicalDocument } from '../../types/teleconsulta';

interface DoctorAppointmentItem {
    id: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    doctorCrm: string;
    doctorUfCrm: string;
    startDateTime: string;
    endDateTime: string;
    durationMinutes: number;
    status: 'AGENDADA' | 'REALIZADA' | 'CANCELADA_PELO_PACIENTE' | 'CANCELADA_PELO_MEDICO';
    patientNotes?: string;
    createdAt: string;
}

interface DoctorRecordsManagerModalProps {
    isOpen: boolean;
    onClose: () => void;
    doctorName?: string;
}

export const DoctorRecordsManagerModal: React.FC<DoctorRecordsManagerModalProps> = ({
    isOpen,
    onClose,
    doctorName,
}) => {
    const [appointments, setAppointments] = useState<DoctorAppointmentItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState<'ALL' | 'REALIZADA' | 'AGENDADA'>('ALL');

    // Visualização de Prontuário
    const [selectedApptForRecord, setSelectedApptForRecord] = useState<DoctorAppointmentItem | null>(null);
    const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);

    // Visualização de Documentos / Impressão
    const [selectedDocForPrint, setSelectedDocForPrint] = useState<MedicalDocument | null>(null);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
    const [loadingDocsApptId, setLoadingDocsApptId] = useState<string | null>(null);

    // Modal de Múltiplos Documentos
    const [docsSelectorModal, setDocsSelectorModal] = useState<{
        isOpen: boolean;
        patientName: string;
        docs: MedicalDocument[];
    }>({
        isOpen: false,
        patientName: '',
        docs: [],
    });

    useEffect(() => {
        if (!isOpen) return;

        const fetchDoctorAppointments = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/doctor/appointments');
                if (res.ok) {
                    const data = await res.json();
                    setAppointments(data);
                } else {
                    setAppointments([]);
                }
            } catch (err) {
                console.error('Erro ao buscar atendimentos do médico:', err);
                setAppointments([]);
            } finally {
                setLoading(false);
            }
        };

        fetchDoctorAppointments();
    }, [isOpen]);

    useBodyScrollLock(isOpen);

    if (!isOpen) return null;

    const formatDateTime = (isoStr: string) => {
        try {
            return new Date(isoStr).toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return isoStr;
        }
    };

    const filteredAppointments = appointments.filter((app) => {
        const matchesStatus = filterStatus === 'ALL' || app.status === filterStatus;
        const query = searchQuery.toLowerCase();
        const matchesQuery =
            !query ||
            app.patientName.toLowerCase().includes(query) ||
            app.startDateTime.includes(query);

        return matchesStatus && matchesQuery;
    });

    const handleViewDocs = async (app: DoctorAppointmentItem) => {
        setLoadingDocsApptId(app.id);
        try {
            const res = await fetch(`/api/medical-documents/appointment/${app.id}`);
            if (res.ok) {
                const docs: MedicalDocument[] = await res.json();
                if (docs.length === 1) {
                    setSelectedDocForPrint(docs[0]);
                    setIsPrintModalOpen(true);
                } else {
                    setDocsSelectorModal({
                        isOpen: true,
                        patientName: app.patientName,
                        docs,
                    });
                }
            }
        } catch (err) {
            console.error('Erro ao buscar documentos da consulta:', err);
        } finally {
            setLoadingDocsApptId(null);
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-brand-pot/30 overflow-hidden">
                {/* Header do Modal */}
                <header className="p-5 sm:p-6 bg-brand-ice/90 border-b border-brand-pot/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-brand-orange text-white flex items-center justify-center font-bold shadow-xs shrink-0">
                            <FileSignature className="w-6 h-6" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-brand-orange block">
                                Consultório Virtual • Active Age
                            </span>
                            <h2 className="text-lg sm:text-xl font-black text-brown-dark">
                                Central de Prontuários & Prescrições Digitais
                            </h2>
                            <p className="text-xs text-brown-light mt-0.5">
                                Gerencie seus relatórios clínicos, atestados e receitas emitidos com validade CFM e ICP-Brasil.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 text-brown-light flex items-center justify-center border border-brand-pot/30 transition-colors cursor-pointer self-end sm:self-auto"
                        aria-label="Fechar"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </header>

                {/* Barra de Filtros e Busca */}
                <div className="p-4 sm:p-6 bg-white border-b border-brand-pot/20 space-y-3 shrink-0">
                    <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
                        {/* Busca */}
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-brown-light absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar por paciente ou data..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-brand-pot/40 bg-gray-50/70 text-xs sm:text-sm focus:ring-2 focus:ring-brand-orange focus:bg-white outline-none transition-all"
                            />
                        </div>

                        {/* Abas Rápidas de Status */}
                        <div className="flex items-center gap-1.5 bg-brand-ice/70 p-1 rounded-xl border border-brand-pot/30 shrink-0">
                            <button
                                type="button"
                                onClick={() => setFilterStatus('ALL')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    filterStatus === 'ALL'
                                        ? 'bg-brand-orange text-white font-black shadow-xs'
                                        : 'text-brown-light hover:text-brown-dark'
                                }`}
                            >
                                Todas ({appointments.length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilterStatus('REALIZADA')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    filterStatus === 'REALIZADA'
                                        ? 'bg-brand-orange text-white font-black shadow-xs'
                                        : 'text-brown-light hover:text-brown-dark'
                                }`}
                            >
                                Realizadas ({appointments.filter((a) => a.status === 'REALIZADA').length})
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilterStatus('AGENDADA')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                                    filterStatus === 'AGENDADA'
                                        ? 'bg-brand-orange text-white font-black shadow-xs'
                                        : 'text-brown-light hover:text-brown-dark'
                                }`}
                            >
                                Agendadas ({appointments.filter((a) => a.status === 'AGENDADA').length})
                            </button>
                        </div>
                    </div>
                </div>

                {/* Lista de Atendimentos */}
                <main className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
                    {loading ? (
                        <div className="py-20 text-center text-brown-light">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-orange mb-2" />
                            <p className="text-xs sm:text-sm font-bold">Carregando seus atendimentos...</p>
                        </div>
                    ) : filteredAppointments.length === 0 ? (
                        <div className="bg-brand-ice/40 rounded-3xl border border-dashed border-brand-pot/30 p-8 sm:p-12 text-center max-w-md mx-auto space-y-3">
                            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto" />
                            <h4 className="text-base font-black text-brown-dark">
                                Nenhum atendimento encontrado
                            </h4>
                            <p className="text-xs text-brown-light leading-relaxed">
                                {searchQuery || filterStatus !== 'ALL'
                                    ? 'Nenhuma consulta corresponde aos filtros aplicados. Tente buscar por outro termo ou alternar o filtro para "Todas".'
                                    : 'Você ainda não possui atendimentos registrados. Assim que suas teleconsultas forem realizadas, os prontuários e receitas ficarão disponíveis aqui.'}
                            </p>
                        </div>
                    ) : (
                        filteredAppointments.map((app) => (
                            <div
                                key={app.id}
                                className="bg-white p-4 sm:p-5 rounded-2xl border-2 border-brand-pot/30 hover:border-brand-orange/60 shadow-xs transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                                <div className="space-y-1.5">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-bold text-xs text-brown-dark flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-brand-orange" />
                                            {formatDateTime(app.startDateTime)}
                                        </span>

                                        <span className="text-[10px] font-bold text-brown-light px-2 py-0.5 rounded-md bg-gray-100">
                                            {app.durationMinutes} min
                                        </span>

                                        {app.status === 'REALIZADA' && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-blue-800 bg-blue-100 px-2 py-0.5 rounded-md">
                                                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                                                Realizada
                                            </span>
                                        )}

                                        {app.status === 'AGENDADA' && (
                                            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                                                <Clock className="w-3 h-3 text-emerald-600" />
                                                Agendada
                                            </span>
                                        )}
                                    </div>

                                    <h4 className="text-sm sm:text-base font-black text-brown-dark flex items-center gap-1.5">
                                        <User className="w-4 h-4 text-brand-orange" />
                                        Paciente: {app.patientName}
                                    </h4>
                                </div>

                                <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedApptForRecord(app);
                                            setIsRecordModalOpen(true);
                                        }}
                                        className="px-4 py-2 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer min-h-[40px]"
                                    >
                                        <FileText className="w-3.5 h-3.5" />
                                        <span>Ver Prontuário Clínico</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => handleViewDocs(app)}
                                        disabled={loadingDocsApptId === app.id}
                                        className="px-4 py-2 rounded-xl bg-white hover:bg-brand-ice border border-brand-pot/40 text-brown-dark font-bold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer min-h-[40px]"
                                    >
                                        {loadingDocsApptId === app.id ? (
                                            <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-orange" />
                                        ) : (
                                            <Printer className="w-3.5 h-3.5 text-brand-orange" />
                                        )}
                                        <span>Documentos & Receitas</span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </main>

                {/* Footer do Modal */}
                <footer className="p-4 bg-brand-ice/60 border-t border-brand-pot/30 flex justify-end shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-brown-dark font-bold text-xs sm:text-sm border border-brand-pot/40 transition-colors cursor-pointer min-h-[44px]"
                    >
                        Fechar Central
                    </button>
                </footer>
            </div>

            {/* Modal de Detalhes do Prontuário */}
            <MedicalRecordViewModal
                isOpen={isRecordModalOpen}
                onClose={() => {
                    setIsRecordModalOpen(false);
                    setSelectedApptForRecord(null);
                }}
                appointmentId={selectedApptForRecord?.id || null}
                patientName={selectedApptForRecord?.patientName}
                doctorName={doctorName}
                startDateTime={selectedApptForRecord?.startDateTime}
            />

            {/* Modal de Impressão de Documento em Preto e Branco */}
            <DocumentPrintModal
                isOpen={isPrintModalOpen}
                onClose={() => setIsPrintModalOpen(false)}
                document={selectedDocForPrint}
            />

            {/* Modal Seletor de Múltiplos Documentos da Consulta */}
            {docsSelectorModal.isOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
                    role="dialog"
                    aria-modal="true"
                >
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-brand-pot/30 space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-brand-pot/20">
                            <div>
                                <span className="text-[10px] font-black uppercase tracking-wider text-brand-orange block">
                                    Prescrições da Consulta
                                </span>
                                <h3 className="text-base font-black text-brown-dark">
                                    Paciente: {docsSelectorModal.patientName}
                                </h3>
                            </div>
                            <button
                                type="button"
                                onClick={() => setDocsSelectorModal((prev) => ({ ...prev, isOpen: false }))}
                                className="w-8 h-8 rounded-full bg-brand-ice hover:bg-gray-100 text-brown-light flex items-center justify-center transition-colors cursor-pointer"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>

                        {docsSelectorModal.docs.length === 0 ? (
                            <p className="text-xs text-brown-light italic text-center py-4">
                                Nenhum documento (receita, pedido de exame ou atestado) foi emitido nesta sessão.
                            </p>
                        ) : (
                            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
                                {docsSelectorModal.docs.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="p-3.5 rounded-2xl border border-brand-pot/30 bg-brand-ice/40 flex items-center justify-between gap-3"
                                    >
                                        <div className="min-w-0">
                                            <span className="text-[10px] font-black uppercase text-brand-orange block">
                                                {doc.documentType === 'RECEITA_MEDICA' ? 'Receita Médica' : doc.documentType === 'PEDIDO_EXAME' ? 'Pedido de Exame' : 'Atestado'}
                                            </span>
                                            <h5 className="text-xs sm:text-sm font-bold text-brown-dark truncate">
                                                {doc.title}
                                            </h5>
                                            <p className="text-[11px] text-brown-light font-mono mt-0.5">
                                                {doc.validationCode}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedDocForPrint(doc);
                                                setIsPrintModalOpen(true);
                                                setDocsSelectorModal((prev) => ({ ...prev, isOpen: false }));
                                            }}
                                            className="px-3.5 py-2 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer min-h-[40px]"
                                        >
                                            <Printer className="w-3.5 h-3.5" />
                                            <span>Imprimir</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

