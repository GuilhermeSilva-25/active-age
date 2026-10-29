import React from 'react';
import { X, Printer, ShieldCheck, CheckCircle2 } from 'lucide-react';
import type { MedicalDocument } from '../../types/teleconsulta';

interface DocumentPrintModalProps {
    isOpen: boolean;
    onClose: () => void;
    document: MedicalDocument | null;
}

export const DocumentPrintModal: React.FC<DocumentPrintModalProps> = ({
    isOpen,
    onClose,
    document,
}) => {
    if (!isOpen || !document) return null;

    const handlePrint = () => {
        window.print();
    };

    const formatDate = (isoStr: string) => {
        try {
            const date = new Date(isoStr);
            return date.toLocaleDateString('pt-BR', {
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

    const getDocumentBadgeLabel = (type: string) => {
        switch (type) {
            case 'RECEITA_MEDICA':
                return 'Receita Médica Digital';
            case 'PEDIDO_EXAME':
                return 'Pedido de Exames Complementares';
            case 'ATESTADO_MEDICO':
                return 'Atestado Médico Geriátrico';
            default:
                return 'Documento Clínico';
        }
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
        >
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-brand-pot/20 overflow-hidden">
                {/* Barra de Ferramentas Superior (Não sai na impressão) */}
                <div className="p-4 bg-brand-ice/90 border-b border-brand-pot/30 flex items-center justify-between gap-3 shrink-0 print:hidden">
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-brand-orange/10 text-brand-orange text-xs font-black rounded-lg">
                            {getDocumentBadgeLabel(document.documentType)}
                        </span>
                        <span className="text-xs text-brown-light font-mono font-bold">
                            {document.validationCode}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs sm:text-sm font-black rounded-xl shadow-sm transition-all cursor-pointer min-h-[44px]"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Imprimir / Salvar PDF</span>
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-white hover:bg-gray-100 text-brown-light flex items-center justify-center border border-brand-pot/30 transition-all cursor-pointer"
                            aria-label="Fechar"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Corpo Timbrado Oficial do Documento (Área Imprimível) */}
                <div className="p-6 sm:p-10 overflow-y-auto space-y-6 text-brown-dark bg-white print:p-0 print:overflow-visible">
                    {/* Cabeçalho Timbrado */}
                    <div className="border-b-2 border-brand-orange pb-5 flex items-start justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xl sm:text-2xl font-black text-brand-orange tracking-tight">
                                    Active Age
                                </span>
                                <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded">
                                    Telessaúde Geriátrica
                                </span>
                            </div>
                            <p className="text-xs text-brown-light mt-1 font-medium">
                                Plataforma Regulada de Atendimento Clínico e Prescrição Digital
                            </p>
                        </div>

                        <div className="text-right">
                            <h3 className="text-sm sm:text-base font-black text-brown-dark">
                                {document.doctorName}
                            </h3>
                            <p className="text-xs text-brown-light font-bold">
                                CRM {document.doctorCrm}/{document.doctorUfCrm}
                                {document.doctorRqe && ` • RQE ${document.doctorRqe}`}
                            </p>
                            <p className="text-[11px] text-emerald-700 font-semibold flex items-center justify-end gap-1 mt-0.5">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                Habilitado CFM & ICP-Brasil
                            </p>
                        </div>
                    </div>

                    {/* Dados do Paciente */}
                    <div className="bg-brand-ice/60 p-4 rounded-2xl border border-brand-pot/20 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                            <span className="text-brown-light uppercase font-bold text-[10px] block">
                                Paciente:
                            </span>
                            <span className="font-black text-sm text-brown-dark">
                                {document.patientName}
                            </span>
                        </div>
                        <div>
                            <span className="text-brown-light uppercase font-bold text-[10px] block">
                                Data e Hora da Emissão:
                            </span>
                            <span className="font-bold text-brown-dark">
                                {formatDate(document.issuedAt || document.createdAt)}
                            </span>
                        </div>
                    </div>

                    {/* Título do Documento */}
                    <div className="text-center py-2">
                        <h2 className="text-lg sm:text-xl font-black text-brown-dark uppercase tracking-wide">
                            {document.title}
                        </h2>
                    </div>

                    {/* Conteúdo / Prescrição Médica */}
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 min-h-[160px] whitespace-pre-line text-sm sm:text-base text-gray-800 font-medium leading-relaxed font-sans shadow-inner">
                        {document.content}
                    </div>

                    {/* Recomendações e Cuidados Especiais (Se houver) */}
                    {document.recommendations && (
                        <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs space-y-1">
                            <h4 className="font-black text-amber-900 uppercase text-[11px] tracking-wide">
                                Recomendações & Orientações Clínicas:
                            </h4>
                            <p className="text-amber-800 whitespace-pre-line font-medium leading-relaxed">
                                {document.recommendations}
                            </p>
                        </div>
                    )}

                    {/* Rodapé e Autenticação ICP-Brasil */}
                    <div className="border-t border-brand-pot/30 pt-6 mt-8 space-y-4">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                    <CheckCircle2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-xs font-black text-emerald-950">
                                        Documento Assinado Digitalmente
                                    </p>
                                    <p className="text-[11px] text-emerald-800 font-medium">
                                        Válido em todo o território nacional conforme Medida Provisória nº 2.200-2/2001 e Resolução CFM nº 2.314/2022.
                                    </p>
                                </div>
                            </div>

                            <div className="text-left sm:text-right border-t sm:border-t-0 sm:border-l border-emerald-300 pt-2 sm:pt-0 sm:pl-4">
                                <span className="text-[10px] text-emerald-800 uppercase font-black block">
                                    Código de Autenticação:
                                </span>
                                <span className="font-mono font-black text-sm text-emerald-950 tracking-wider">
                                    {document.validationCode}
                                </span>
                            </div>
                        </div>

                        <p className="text-center text-[11px] text-brown-light font-medium print:text-[9px]">
                            Validação pública por farmácias e laboratórios disponível em:{' '}
                            <strong className="text-brand-orange font-bold">
                                activeage.com/validar-documento
                            </strong>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
