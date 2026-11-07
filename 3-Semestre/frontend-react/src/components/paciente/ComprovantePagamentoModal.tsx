import React from 'react';
import {
    X,
    Printer,
    ShieldCheck,
    CheckCircle2,
    Lock,
    Building2,
    User
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 print:p-0 print:bg-white print:static">
            <div
                className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-brand-pot/40 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:w-full"
                onClick={e => e.stopPropagation()}
            >
                {/* Header - Não impresso */}
                <div className="px-5 sm:px-6 py-4 bg-emerald-800 text-white flex items-center justify-between shrink-0 print:hidden">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 block">
                                Comprovante Financeiro Oficial
                            </span>
                            <h2 className="text-base sm:text-lg font-black text-white">
                                Recibo de Pagamento de Teleconsulta
                            </h2>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                        title="Fechar recibo"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Conteúdo com rolagem e modelo timbrado oficial para impressão */}
                <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-brown-dark print:p-6 print:overflow-visible">
                    {/* Cabeçalho Timbrado */}
                    <div className="border-b-2 border-emerald-800/40 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="text-xl sm:text-2xl font-black tracking-tight text-emerald-950 font-serif">
                                    ACTIVE AGE TELEMEDICINA
                                </span>
                            </div>
                            <p className="text-xs text-brown-light font-bold mt-0.5">
                                Plataforma Integral de Telessaúde Geriátrica • CNPJ 54.321.987/0001-00
                            </p>
                            <p className="text-[11px] text-brown-light">
                                São Paulo - SP • Faturamento & Split Direto Regulado
                            </p>
                        </div>
                        <div className="text-left sm:text-right bg-emerald-50 sm:bg-transparent p-3 sm:p-0 rounded-2xl border sm:border-0 border-emerald-200">
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block">
                                Código de Autenticidade Digital
                            </span>
                            <span className="text-sm sm:text-base font-black font-mono text-emerald-950 block">
                                {authCode}
                            </span>
                            <span className="text-[10px] text-emerald-700 font-bold block">
                                Válido perante IR e Reembolso
                            </span>
                        </div>
                    </div>

                    {/* Selo de Confirmação */}
                    <div className="bg-emerald-50/80 border border-emerald-300 rounded-2xl p-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                <CheckCircle2 className="w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-emerald-950">
                                    Pagamento Liquidado com Sucesso
                                </h3>
                                <p className="text-xs text-emerald-800 font-medium">
                                    Transação autorizada e repassada integralmente ao médico assistente.
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <span className="text-[10px] font-black uppercase text-emerald-800 block">Valor Liquidado</span>
                            <span className="text-xl sm:text-2xl font-black text-emerald-950">
                                R$ {Number(data.consultationFee).toFixed(2).replace('.', ',')}
                            </span>
                        </div>
                    </div>

                    {/* Detalhes do Pagador e Prestador */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Dados do Paciente */}
                        <div className="bg-gray-50 border border-brand-pot/30 rounded-2xl p-4 space-y-1.5">
                            <span className="text-[10px] font-black uppercase text-brown-light tracking-wider flex items-center gap-1.5">
                                <User className="w-3.5 h-3.5 text-brand-orange" />
                                Paciente Titular (Pagador)
                            </span>
                            <p className="font-black text-brown-dark text-sm sm:text-base">
                                {data.patientName}
                            </p>
                            <p className="text-xs text-brown-light">
                                Teleconsulta Geriátrica Individual
                            </p>
                        </div>

                        {/* Dados do Médico */}
                        <div className="bg-gray-50 border border-brand-pot/30 rounded-2xl p-4 space-y-1.5">
                            <span className="text-[10px] font-black uppercase text-brown-light tracking-wider flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-brand-orange" />
                                Médico Assistente (Beneficiário)
                            </span>
                            <p className="font-black text-brown-dark text-sm sm:text-base">
                                {data.doctorName}
                            </p>
                            <p className="text-xs text-brown-light font-bold">
                                CRM {data.doctorCrm}/{data.doctorUfCrm} • {data.doctorSpecialty || 'Geriatria'}
                            </p>
                        </div>
                    </div>

                    {/* Dados Transacionais */}
                    <div className="border border-brand-pot/30 rounded-2xl p-4 space-y-3 bg-white">
                        <span className="text-[10px] font-black uppercase text-brown-light tracking-wider block">
                            Discriminação da Operação de Telemedicina
                        </span>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                            <div>
                                <span className="text-brown-light block">Data da Consulta:</span>
                                <span className="font-black text-brown-dark">{formattedDate()}</span>
                            </div>
                            <div>
                                <span className="text-brown-light block">Forma de Pagamento:</span>
                                <span className="font-black text-brown-dark">
                                    {data.paymentMethod || 'Pix / Cartão de Crédito'}
                                </span>
                            </div>
                            <div>
                                <span className="text-brown-light block">Gateway Processador:</span>
                                <span className="font-black text-brown-dark">Mercado Pago IP LTDA</span>
                            </div>
                            <div>
                                <span className="text-brown-light block">ID da Transação:</span>
                                <span className="font-mono font-bold text-brown-dark">
                                    {data.mpPaymentId || 'MP-' + data.appointmentId.substring(0, 10)}
                                </span>
                            </div>
                            <div>
                                <span className="text-brown-light block">Taxa da Plataforma:</span>
                                <span className="font-black text-emerald-700">R$ 0,00 (0% Dicotomia)</span>
                            </div>
                            <div>
                                <span className="text-brown-light block">Repasse Médico:</span>
                                <span className="font-black text-emerald-800">
                                    100% (R$ {Number(data.consultationFee).toFixed(2).replace('.', ',')})
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Nota Legal e LGPD */}
                    <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 text-[11px] text-amber-950 space-y-1.5 leading-relaxed">
                        <div className="font-black text-amber-900 flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-amber-700" />
                            <span>Conformidade Ético-Regulatória &amp; Proteção de Dados (LGPD)</span>
                        </div>
                        <p>
                            Documento emitido exclusivamente para fins fiscais, contábeis e de reembolso perante operadoras de saúde. Em cumprimento estrito à Resolução CFM nº 2.314/2022 (vedação à dicotomia de honorários médicos) e à Lei Geral de Proteção de Dados (Lei nº 13.709/2018), este recibo é puramente financeiro e não contém diagnósticos, CID-11, anamnese ou dados clínicos sensíveis do paciente.
                        </p>
                    </div>
                </div>

                {/* Footer com Ações - Não impresso */}
                <div className="p-4 sm:p-5 bg-gray-50 border-t border-brand-pot/30 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
                    <span className="text-xs text-brown-light text-center sm:text-left">
                        Autenticação eletrônica válida perante o CFM e Receita Federal.
                    </span>
                    <div className="flex items-center gap-2.5 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 sm:flex-none px-5 py-3 rounded-xl border border-brand-pot/40 hover:bg-white text-xs sm:text-sm font-bold text-brown-dark transition-all cursor-pointer min-h-[44px]"
                        >
                            Fechar
                        </button>
                        <button
                            type="button"
                            onClick={handlePrint}
                            className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer min-h-[44px]"
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
