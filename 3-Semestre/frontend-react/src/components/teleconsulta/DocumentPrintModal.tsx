import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';
import React from 'react';
import { X, Printer, ShieldCheck } from 'lucide-react';
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
    useBodyScrollLock(isOpen);

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
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain print:p-0 print:bg-white print:static"
            role="dialog"
            aria-modal="true"
        >
            <div className="printable-document bg-white rounded-2xl max-w-2xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-gray-300 overflow-hidden print:shadow-none print:border-none print:max-h-none print:max-w-none print:rounded-none">
                {/* Barra de Ferramentas Superior (Oculta na impressão física ou PDF) */}
                <div className="p-4 bg-gray-100 border-b border-gray-300 flex items-center justify-between gap-3 shrink-0 print:hidden">
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-black text-white text-xs font-bold rounded">
                            {getDocumentBadgeLabel(document.documentType)}
                        </span>
                        <span className="text-xs text-gray-700 font-mono font-bold">
                            {document.validationCode}
                        </span>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-gray-800 text-white text-xs sm:text-sm font-bold rounded-lg shadow-xs transition-colors cursor-pointer min-h-[44px]"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Imprimir / Salvar PDF</span>
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-10 h-10 rounded-lg bg-white hover:bg-gray-200 text-gray-800 flex items-center justify-center border border-gray-300 transition-colors cursor-pointer"
                            aria-label="Fechar visualização"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Corpo Timbrado Oficial em Preto e Branco (Área Imprimível) */}
                <div className="p-8 sm:p-12 overflow-y-auto space-y-6 text-black bg-white font-sans print:p-8 print:overflow-visible print:text-black">
                    {/* Cabeçalho Oficial Preto e Branco */}
                    <header className="border-b-2 border-black pb-4 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
                        <div>
                            <span className="text-[11px] font-bold tracking-widest uppercase text-gray-600 block">
                                ACTIVE AGE • TELESSAÚDE GERIÁTRICA
                            </span>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-black mt-0.5">
                                {document.doctorName}
                            </h1>
                            <p className="text-xs text-gray-800 font-medium">
                                CRM {document.doctorCrm}/{document.doctorUfCrm}
                                {document.doctorRqe && ` • RQE ${document.doctorRqe}`}
                            </p>
                        </div>

                        <div className="text-left sm:text-right text-xs text-gray-700">
                            <p className="font-semibold flex items-center sm:justify-end gap-1 text-black">
                                <ShieldCheck className="w-3.5 h-3.5 text-black" />
                                Prescrição Eletrônica Regulada
                            </p>
                            <p className="text-[11px] text-gray-600">
                                Resolução CFM nº 2.314/2022
                            </p>
                        </div>
                    </header>

                    {/* Identificação do Paciente e Data */}
                    <section className="border-b border-gray-300 pb-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        <div>
                            <span className="text-gray-600 uppercase font-semibold text-[10px] block">
                                Paciente:
                            </span>
                            <span className="font-bold text-sm text-black">
                                {document.patientName}
                            </span>
                        </div>
                        <div className="sm:text-right">
                            <span className="text-gray-600 uppercase font-semibold text-[10px] block">
                                Data e Hora da Emissão:
                            </span>
                            <span className="font-medium text-black">
                                {formatDate(document.issuedAt || document.createdAt)}
                            </span>
                        </div>
                    </section>

                    {/* Título Centralizado do Documento */}
                    <div className="text-center py-2">
                        <h2 className="text-base sm:text-lg font-bold text-black uppercase tracking-wider">
                            {document.title}
                        </h2>
                    </div>

                    {/* Conteúdo Clínico da Prescrição / Atestado */}
                    <main className="min-h-[220px] whitespace-pre-line text-sm sm:text-base text-black leading-relaxed font-sans py-2">
                        {document.content}
                    </main>

                    {/* Orientações Gerais (Se houver) */}
                    {document.recommendations && (
                        <aside className="p-3 border border-gray-400 rounded-lg text-xs space-y-1">
                            <h3 className="font-bold text-black uppercase text-[11px] tracking-wide">
                                Recomendações e Orientações Clínicas:
                            </h3>
                            <p className="text-gray-900 whitespace-pre-line font-medium leading-relaxed">
                                {document.recommendations}
                            </p>
                        </aside>
                    )}

                    {/* Rodapé: Assinatura Médica e Autenticação Digital (P&B) */}
                    <footer className="border-t border-gray-300 pt-6 mt-8 space-y-6">
                        {/* Linha de Assinatura Médica */}
                        <div className="w-72 mx-auto text-center pt-8 border-t border-black">
                            <p className="font-bold text-sm text-black">
                                {document.doctorName}
                            </p>
                            <p className="text-xs text-gray-700">
                                CRM {document.doctorCrm}/{document.doctorUfCrm}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-0.5">
                                Assinatura Eletrônica Gov.br / ICP-Brasil
                            </p>
                        </div>

                        {/* Bloco de Validação da Prescrição */}
                        <div className="border border-black p-3.5 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                            <div className="space-y-0.5">
                                <p className="font-bold text-black">
                                    Documento Emitido Eletronicamente via Active Age
                                </p>
                                <p className="text-[11px] text-gray-700">
                                    Conformidade com a Medida Provisória nº 2.200-2/2001 e Resolução CFM nº 2.314/2022.
                                </p>
                            </div>

                            <div className="text-left sm:text-right border-t sm:border-t-0 sm:border-l border-gray-400 pt-2 sm:pt-0 sm:pl-3 shrink-0">
                                <span className="text-[10px] text-gray-600 uppercase font-semibold block">
                                    Código de Validação:
                                </span>
                                <span className="font-mono font-bold text-xs text-black">
                                    {document.validationCode}
                                </span>
                            </div>
                        </div>

                        <p className="text-center text-[10px] text-gray-600 print:text-[9px]">
                            Validação pública por farmácias, laboratórios e pacientes em:{' '}
                            <strong className="text-black font-semibold">
                                activeage.com/validar-documento
                            </strong>
                        </p>
                    </footer>
                </div>
            </div>
        </div>
    );
};
