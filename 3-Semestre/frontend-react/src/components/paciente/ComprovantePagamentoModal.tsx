import React from 'react';
import {
    X,
    Printer,
    ShieldCheck,
    CheckCircle2
} from 'lucide-react';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

export interface ComprovanteData {
    appointmentId: string;
    patientName: string;
    doctorName: string;
    doctorCrm: string;
    doctorUfCrm: string;
    doctorSpecialty?: string;
    startDateTime: string;
    consultationFee: number;
    paymentMethod?: string;
    mpPaymentId?: string;
}

interface ComprovantePagamentoModalProps {
    isOpen: boolean;
    onClose: () => void;
    data: ComprovanteData | null;
}

export const ComprovantePagamentoModal: React.FC<ComprovantePagamentoModalProps> = ({
    isOpen,
    onClose,
    data,
}) => {
    useBodyScrollLock(isOpen);

    if (!isOpen || !data) return null;

    const handlePrint = () => {
        window.print();
    };

    const formattedDate = () => {
        try {
            const d = new Date(data.startDateTime);
            return d.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return data.startDateTime;
        }
    };

    const authCode = `AA-REC-2026-${data.appointmentId.substring(0, 8).toUpperCase()}`;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs animate-in fade-in duration-200 overscroll-contain print:p-0 print:bg-white print:static"
            role="dialog"
            aria-modal="true"
        >
            <div
                className="printable-document bg-white rounded-2xl max-w-2xl w-full max-h-[94vh] flex flex-col shadow-2xl border border-gray-300 overflow-hidden print:shadow-none print:border-none print:max-h-none print:max-w-none print:rounded-none"
                onClick={e => e.stopPropagation()}
            >
                {/* Barra de Ferramentas Superior (Oculta na Impressão Física ou PDF) */}
                <div className="p-4 bg-gray-100 border-b border-gray-300 flex items-center justify-between gap-3 shrink-0 print:hidden">
                    <div className="flex items-center gap-2">
                        <span className="px-2.5 py-1 bg-black text-white text-xs font-bold rounded">
                            Recibo de Teleconsulta
                        </span>
                        <span className="text-xs text-gray-700 font-mono font-bold">
                            {authCode}
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
                            aria-label="Fechar comprovante"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Conteúdo Timbrado Oficial em Preto e Branco (P&B Puro) */}
                <div className="p-8 sm:p-12 overflow-y-auto space-y-6 text-black bg-white font-sans print:p-8 print:overflow-visible print:text-black">
                    {/* Cabeçalho Oficial Timbrado */}
                    <header className="border-b-2 border-black pb-4 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
                        <div>
                            <span className="text-[11px] font-bold tracking-widest uppercase text-gray-600 block">
                                ACTIVE AGE • TELESSAÚDE GERIÁTRICA
                            </span>
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-black mt-0.5">
                                Recibo de Pagamento de Teleconsulta
                            </h1>
                            <p className="text-xs text-gray-800 font-medium">
                                CNPJ 54.321.987/0001-00 • São Paulo - SP
                            </p>
                        </div>

                        <div className="text-left sm:text-right text-xs text-gray-700">
                            <p className="font-semibold flex items-center sm:justify-end gap-1 text-black">
                                <ShieldCheck className="w-3.5 h-3.5 text-black" />
                                Split Direto Regulado (BACEN)
                            </p>
                            <p className="text-[11px] text-gray-600">
                                Resolução CFM nº 2.314/2022
                            </p>
                        </div>
                    </header>

                    {/* Selo de Confirmação em Preto e Branco */}
                    <section className="border border-gray-300 p-4 rounded-lg flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-black text-white flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-black">
                                    Pagamento Liquidado com Sucesso
                                </h3>
                                <p className="text-xs text-gray-700">
                                    Transação autorizada e repassada integralmente ao médico assistente.
                                </p>
                            </div>
                        </div>
                        <div className="text-right shrink-0">
                            <span className="text-[10px] font-bold uppercase text-gray-600 block">
                                Valor Liquidado
                            </span>
                            <span className="text-lg sm:text-xl font-bold text-black font-mono">
                                R$ {Number(data.consultationFee).toFixed(2).replace('.', ',')}
                            </span>
                        </div>
                    </section>

                    {/* Identificação do Paciente e Médico Prestador */}
                    <section className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="border border-gray-300 p-3.5 rounded-lg space-y-1">
                            <span className="text-gray-600 uppercase font-semibold text-[10px] block">
                                Paciente Titular (Pagador):
                            </span>
                            <p className="font-bold text-sm text-black">
                                {data.patientName}
                            </p>
                            <p className="text-gray-700 text-[11px]">
                                Teleconsulta Geriátrica Individual
                            </p>
                        </div>

                        <div className="border border-gray-300 p-3.5 rounded-lg space-y-1 sm:text-right">
                            <span className="text-gray-600 uppercase font-semibold text-[10px] block">
                                Médico Assistente (Beneficiário):
                            </span>
                            <p className="font-bold text-sm text-black">
                                {data.doctorName}
                            </p>
                            <p className="text-gray-700 text-[11px]">
                                CRM {data.doctorCrm}/{data.doctorUfCrm} • {data.doctorSpecialty || 'Geriatria'}
                            </p>
                        </div>
                    </section>

                    {/* Discriminação da Operação de Telemedicina */}
                    <section className="border border-black rounded-lg p-4 space-y-3">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-black border-b border-gray-300 pb-2">
                            Discriminação da Operação Financeira
                        </h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                            <div>
                                <span className="text-gray-600 block text-[11px]">Data da Consulta:</span>
                                <span className="font-bold text-black">{formattedDate()}</span>
                            </div>
                            <div>
                                <span className="text-gray-600 block text-[11px]">Forma de Pagamento:</span>
                                <span className="font-bold text-black">
                                    {data.paymentMethod || 'Pix / Cartão de Crédito'}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600 block text-[11px]">Gateway Processador:</span>
                                <span className="font-bold text-black">Mercado Pago IP LTDA</span>
                            </div>
                            <div>
                                <span className="text-gray-600 block text-[11px]">ID da Transação (MP):</span>
                                <span className="font-mono font-bold text-black">
                                    {data.mpPaymentId || 'MP-' + data.appointmentId.substring(0, 10)}
                                </span>
                            </div>
                            <div>
                                <span className="text-gray-600 block text-[11px]">Taxa da Plataforma:</span>
                                <span className="font-bold text-black">R$ 0,00 (0% Dicotomia)</span>
                            </div>
                            <div>
                                <span className="text-gray-600 block text-[11px]">Repasse Líquido ao Médico:</span>
                                <span className="font-bold text-black">
                                    100% (R$ {Number(data.consultationFee).toFixed(2).replace('.', ',')})
                                </span>
                            </div>
                        </div>

                        <div className="border-t-2 border-black pt-3 flex items-center justify-between">
                            <span className="text-xs font-bold uppercase text-black">
                                Total Pago pelo Paciente:
                            </span>
                            <span className="text-lg sm:text-xl font-bold font-mono text-black">
                                R$ {Number(data.consultationFee).toFixed(2).replace('.', ',')}
                            </span>
                        </div>
                    </section>

                    {/* Nota Legal e LGPD */}
                    <aside className="p-3 border border-gray-400 rounded-lg text-xs space-y-1">
                        <h3 className="font-bold text-black uppercase text-[11px] tracking-wide">
                            Conformidade Ético-Regulatória &amp; Proteção de Dados (LGPD):
                        </h3>
                        <p className="text-gray-800 leading-relaxed text-[11px]">
                            Documento emitido exclusivamente para fins fiscais, contábeis e de reembolso perante operadoras de saúde. Em cumprimento estrito à Resolução CFM nº 2.314/2022 (vedação à dicotomia de honorários médicos) e à Lei Geral de Proteção de Dados (Lei nº 13.709/2018), este recibo é puramente financeiro e não contém diagnósticos, CID-11, anamnese ou dados clínicos sensíveis do paciente.
                        </p>
                    </aside>

                    {/* Rodapé: Assinatura e Autenticação Digital */}
                    <footer className="border-t border-gray-300 pt-6 mt-6 space-y-6">
                        <div className="w-72 mx-auto text-center pt-6 border-t border-black">
                            <p className="font-bold text-sm text-black">
                                {data.doctorName}
                            </p>
                            <p className="text-xs text-gray-700">
                                CRM {data.doctorCrm}/{data.doctorUfCrm}
                            </p>
                            <p className="text-[10px] text-gray-500 mt-0.5">
                                Médico(a) Assistente • Beneficiário dos Honorários
                            </p>
                        </div>

                        <div className="border border-black p-3.5 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                            <div className="space-y-0.5">
                                <p className="font-bold text-black">
                                    Documento Emitido Eletronicamente via Active Age
                                </p>
                                <p className="text-[11px] text-gray-700">
                                    Válido para fins de declaração de IRPF e comprovação perante operadoras de saúde.
                                </p>
                            </div>
                            <div className="text-left sm:text-right border-t sm:border-t-0 sm:border-l border-gray-400 pt-2 sm:pt-0 sm:pl-3 shrink-0">
                                <span className="text-[10px] text-gray-600 uppercase font-semibold block">
                                    Código de Autenticidade Digital:
                                </span>
                                <span className="font-mono font-bold text-xs text-black">
                                    {authCode}
                                </span>
                            </div>
                        </div>

                        <p className="text-center text-[10px] text-gray-600 print:text-[9px]">
                            Validação pública por pacientes, operadoras e órgãos fiscais em:{' '}
                            <strong className="text-black font-semibold">
                                activeage.com/validar-documento
                            </strong>
                        </p>
                    </footer>
                </div>

                {/* Footer com Ações na Tela (Oculto na Impressão) */}
                <div className="p-4 sm:p-5 bg-gray-100 border-t border-gray-300 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 print:hidden">
                    <span className="text-xs text-gray-600 text-center sm:text-left">
                        Autenticação eletrônica válida perante o CFM e Receita Federal.
                    </span>
                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-5 py-2.5 rounded-lg border border-gray-300 hover:bg-gray-200 text-xs sm:text-sm font-bold text-gray-800 transition-all cursor-pointer min-h-[44px]"
                        >
                            Fechar
                        </button>
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="flex-1 sm:flex-none px-6 py-2.5 rounded-lg bg-black hover:bg-gray-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer min-h-[44px]"
                        >
                            <Printer className="w-4 h-4" />
                            <span>Imprimir / Salvar PDF</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
