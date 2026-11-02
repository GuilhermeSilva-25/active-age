import React, { useState, useEffect } from 'react';
import {
    X,
    FileText,
    ShieldCheck,
    Lock,
    Printer,
    FileSignature,
    Loader2,
    Calendar,
    User,
} from 'lucide-react';
import { DocumentPrintModal } from './DocumentPrintModal';
import type { MedicalRecord, MedicalDocument } from '../../types/teleconsulta';

interface MedicalRecordViewModalProps {
    isOpen: boolean;
    onClose: () => void;
    appointmentId: string | null;
    patientName?: string;
    doctorName?: string;
    startDateTime?: string;
}

export const MedicalRecordViewModal: React.FC<MedicalRecordViewModalProps> = ({
    isOpen,
    onClose,
    appointmentId,
    patientName,
    doctorName,
    startDateTime,
}) => {
    const [record, setRecord] = useState<MedicalRecord | null>(null);
    const [documents, setDocuments] = useState<MedicalDocument[]>([]);
    const [loading, setLoading] = useState(true);

    const [selectedDocForPrint, setSelectedDocForPrint] = useState<MedicalDocument | null>(null);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

    useEffect(() => {
        if (!isOpen || !appointmentId) return;

        const loadData = async () => {
            setLoading(true);
            try {
                const [recordRes, docsRes] = await Promise.all([
                    fetch(`/api/medical-records/appointment/${appointmentId}`),
                    fetch(`/api/medical-documents/appointment/${appointmentId}`),
                ]);

                if (recordRes.ok && recordRes.status !== 204) {
                    const recordData = await recordRes.json();
                    setRecord(recordData);
                } else {
                    setRecord(null);
                }

                if (docsRes.ok) {
                    const docsData = await docsRes.json();
                    setDocuments(docsData);
                } else {
                    setDocuments([]);
                }
            } catch (err) {
                console.error('Erro ao buscar prontuário:', err);
                setRecord(null);
                setDocuments([]);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [isOpen, appointmentId]);

    if (!isOpen || !appointmentId) return null;

    const formatDateTime = (isoStr?: string) => {
        if (!isoStr) return '';
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

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-brand-pot/30 overflow-hidden">
                {/* Topbar do Modal */}
                <header className="p-4 sm:p-5 bg-brand-ice/90 border-b border-brand-pot/30 flex items-center justify-between gap-3 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center font-bold">
                            <FileText className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-brand-orange block">
                                Prontuário Ético Eletrônico
                            </span>
                            <h3 className="text-base sm:text-lg font-black text-brown-dark">
                                {patientName ? `Paciente: ${patientName}` : 'Prontuário da Teleconsulta'}
                            </h3>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="w-9 h-9 rounded-full bg-white hover:bg-gray-100 text-brown-light flex items-center justify-center border border-brand-pot/30 transition-colors cursor-pointer"
                        aria-label="Fechar"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </header>

                {/* Conteúdo com Scroll */}
                <main className="p-5 sm:p-8 overflow-y-auto space-y-6 text-brown-dark">
                    {loading ? (
                        <div className="py-16 text-center text-brown-light">
                            <Loader2 className="w-8 h-8 animate-spin mx-auto text-brand-orange mb-2" />
                            <p className="text-xs sm:text-sm font-bold">Carregando dados do prontuário...</p>
                        </div>
                    ) : (
                        <>
                            {/* Metadados da Consulta */}
                            <div className="bg-brand-ice/60 p-4 rounded-2xl border border-brand-pot/20 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                                <div>
                                    <span className="text-brown-light uppercase font-bold text-[10px] block">
                                        Data do Atendimento:
                                    </span>
                                    <span className="font-bold text-brown-dark flex items-center gap-1 mt-0.5">
                                        <Calendar className="w-3.5 h-3.5 text-brand-orange" />
                                        {formatDateTime(startDateTime || record?.createdAt)}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-brown-light uppercase font-bold text-[10px] block">
                                        Médico Responsável:
                                    </span>
                                    <span className="font-bold text-brown-dark flex items-center gap-1 mt-0.5">
                                        <User className="w-3.5 h-3.5 text-brand-orange" />
                                        {doctorName || record?.doctorCrm ? `Dr(a). ${doctorName || ''} (CRM ${record?.doctorCrm})` : 'Médico Habilitado'}
                                    </span>
                                </div>

                                <div>
                                    <span className="text-brown-light uppercase font-bold text-[10px] block">
                                        Situação do Documento:
                                    </span>
                                    {record?.status === 'FINALIZED' ? (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md mt-0.5">
                                            <Lock className="w-3 h-3 text-emerald-700" />
                                            Assinado & Imutável
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md mt-0.5">
                                            Rascunho Clínico
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Relatório Clínico Integral */}
                            <div className="space-y-2">
                                <h4 className="text-xs uppercase tracking-wider font-black text-brand-orange flex items-center gap-1.5">
                                    <FileText className="w-4 h-4" />
                                    Relatório da Consulta & Evolução Médica
                                </h4>

                                <div className="bg-white p-5 rounded-2xl border border-brand-pot/30 shadow-inner min-h-[140px] whitespace-pre-line text-xs sm:text-sm text-brown-dark leading-relaxed font-sans">
                                    {record?.clinicalConduct || record?.clinicalEvolution || record?.chiefComplaint ? (
                                        record.clinicalConduct || record.clinicalEvolution || record.chiefComplaint
                                    ) : (
                                        <span className="text-brown-light italic">
                                            Nenhum relatório clínico foi registrado para este atendimento.
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Selo de Assinatura Digital e Integridade CFM */}
                            {record?.status === 'FINALIZED' && record.hashSignature && (
                                <div className="p-4 bg-emerald-50/70 border border-emerald-300 rounded-2xl space-y-1.5 text-xs text-emerald-950">
                                    <div className="flex items-center gap-2 font-black text-emerald-900">
                                        <ShieldCheck className="w-4 h-4 text-emerald-700" />
                                        <span>Documento Assinado Digitalmente perante o CFM</span>
                                    </div>
                                    <p className="text-[11px] text-emerald-800 font-medium">
                                        Finalizado em {formatDateTime(record.finalizedAt)} • Garantia de imutabilidade e integridade SBIS/CFM.
                                    </p>
                                    <p className="font-mono text-[10px] text-emerald-900 break-all bg-emerald-100/60 p-2 rounded-lg">
                                        <strong>Hash SHA-256: </strong>{record.hashSignature}
                                    </p>
                                </div>
                            )}

                            {/* Documentos e Prescrições Emitidos Nesta Consulta */}
                            <div className="space-y-3 pt-2 border-t border-brand-pot/20">
                                <h4 className="text-xs uppercase tracking-wider font-black text-brand-orange flex items-center gap-1.5">
                                    <FileSignature className="w-4 h-4" />
                                    Documentos e Prescrições Emitidos ({documents.length})
                                </h4>

                                {documents.length === 0 ? (
                                    <p className="text-xs text-brown-light italic bg-brand-ice/40 p-4 rounded-xl border border-brand-pot/20 text-center">
                                        Nenhuma receita médica, atestado ou pedido de exame foi emitido nesta sessão.
                                    </p>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {documents.map((doc) => (
                                            <div
                                                key={doc.id}
                                                className="bg-white p-4 rounded-2xl border border-brand-pot/30 hover:border-brand-orange transition-all flex items-center justify-between gap-3 shadow-xs"
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
                        </>
                    )}
                </main>

                {/* Rodapé com Botão Fechar */}
                <footer className="p-4 bg-brand-ice/60 border-t border-brand-pot/30 flex justify-end">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 rounded-xl bg-white hover:bg-gray-100 text-brown-dark font-bold text-xs sm:text-sm border border-brand-pot/40 transition-colors cursor-pointer min-h-[44px]"
                    >
                        Fechar
                    </button>
                </footer>
            </div>

            {/* Modal de Impressão de Documento em Preto e Branco */}
            <DocumentPrintModal
                isOpen={isPrintModalOpen}
                onClose={() => setIsPrintModalOpen(false)}
                document={selectedDocForPrint}
            />
        </div>
    );
};
