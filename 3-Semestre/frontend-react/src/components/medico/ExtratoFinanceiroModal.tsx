import React, { useState, useEffect, useMemo } from 'react';
import {
    X,
    Printer,
    DollarSign,
    ArrowDownLeft,
    ArrowUpRight,
    TrendingUp,
    Loader2,
    Receipt,
    CheckCircle2,
    Clock,
    Lock
} from 'lucide-react';
import { useBodyScrollLock } from '../../hooks/useBodyScrollLock';

interface PagamentoItem {
    id: number;
    tipo: 'CONSULTA_TELEMEDICINA' | 'ASSINATURA_SAAS_MEDICO';
    referenciaId: string;
    pagadorNome: string;
    beneficiarioId: string;
    valorTotal: number;
    valorBeneficiario: number;
    taxaPlataforma: number;
    metodo: 'PIX' | 'CARTAO_CREDITO' | 'MERCADO_PAGO_CHECKOUT';
    status: 'PENDENTE' | 'APROVADO' | 'CANCELADO' | 'ESTORNADO' | 'PENDENTE_CONTINGENCIA';
    mpPaymentId?: string;
    dataCriacao: string;
    dataConfirmacao?: string;
}

interface ExtratoFinanceiroModalProps {
    isOpen: boolean;
    onClose: () => void;
    doctorId: string;
    doctorName: string;
}

export const ExtratoFinanceiroModal: React.FC<ExtratoFinanceiroModalProps> = ({
    isOpen,
    onClose,
    doctorId,
    doctorName,
}) => {
    useBodyScrollLock(isOpen);

    const [pagamentos, setPagamentos] = useState<PagamentoItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<'TODOS' | 'CONSULTAS' | 'SAAS'>('TODOS');

    useEffect(() => {
        if (isOpen && doctorId) {
            fetchExtrato();
        }
    }, [isOpen, doctorId]);

    const fetchExtrato = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/v1/pagamentos/medico/${doctorId}`);
            if (res.ok) {
                const json = await res.json();
                setPagamentos(json.data || []);
            } else {
                setPagamentos([]);
            }
        } catch (err) {
            console.error('Erro ao buscar extrato financeiro:', err);
            setPagamentos([]);
        } finally {
            setLoading(false);
        }
    };

    // Cálculos consolidados
    const metrics = useMemo(() => {
        let totalConsultas = 0;
        let totalSaas = 0;

        pagamentos.forEach(p => {
            if (p.status === 'APROVADO' || p.status === 'PENDENTE') {
                if (p.tipo === 'CONSULTA_TELEMEDICINA') {
                    totalConsultas += Number(p.valorBeneficiario || p.valorTotal);
                } else if (p.tipo === 'ASSINATURA_SAAS_MEDICO') {
                    totalSaas += Number(p.valorTotal);
                }
            }
        });

        return {
            totalConsultas,
            totalSaas,
            saldoLiquido: totalConsultas - totalSaas,
        };
    }, [pagamentos]);

    const filteredList = useMemo(() => {
        return pagamentos.filter(p => {
            if (filter === 'CONSULTAS') return p.tipo === 'CONSULTA_TELEMEDICINA';
            if (filter === 'SAAS') return p.tipo === 'ASSINATURA_SAAS_MEDICO';
            return true;
        });
    }, [pagamentos, filter]);

    const formatDate = (isoStr: string) => {
        try {
            const d = new Date(isoStr);
            return d.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return isoStr;
        }
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 print:p-0 print:bg-white print:static">
            <div
                className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-brand-pot/40 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none print:w-full"
                onClick={e => e.stopPropagation()}
            >
                {/* Header - Não impresso */}
                <div className="px-5 sm:px-6 py-4 bg-emerald-900 text-white flex items-center justify-between shrink-0 print:hidden">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-300">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 block">
                                Gestão Financeira de Consultório
                            </span>
                            <h2 className="text-base sm:text-lg font-black text-white">
                                Extrato de Honorários &amp; Faturamento SaaS
                            </h2>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
                        title="Fechar extrato"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Conteúdo com rolagem */}
                <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 text-brown-dark print:p-6 print:overflow-visible">
                    {/* Cabeçalho do Extrato (visível na tela e impressão) */}
                    <div className="border-b-2 border-emerald-900/30 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-emerald-950 font-serif">
                                EXTRATO FINANCEIRO CONSOLIDADO
                            </h1>
                            <p className="text-xs font-bold text-brown-light mt-0.5">
                                Médico: {doctorName} • Consultório Virtual Active Age
                            </p>
                            <p className="text-[11px] text-brown-light">
                                Processamento via Mercado Pago Instituição de Pagamento (BACEN)
                            </p>
                        </div>
                        <div className="text-left sm:text-right">
                            <span className="text-[10px] uppercase font-bold text-emerald-800 block">Emissão</span>
                            <span className="text-xs font-mono font-bold text-emerald-950">
                                {new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR').substring(0, 5)}
                            </span>
                        </div>
                    </div>

                    {/* Cards de Métricas Consolidadas */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-4">
                            <div className="flex items-center justify-between text-emerald-800 text-xs font-black uppercase tracking-wider">
                                <span>Honorários de Consultas</span>
                                <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
                            </div>
                            <span className="text-2xl font-black text-emerald-950 block mt-2">
                                {formatCurrency(metrics.totalConsultas)}
                            </span>
                            <span className="text-[10px] text-emerald-800 font-bold block mt-1">
                                Split Direto 100% (Sem Dicotomia)
                            </span>
                        </div>

                        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4">
                            <div className="flex items-center justify-between text-amber-800 text-xs font-black uppercase tracking-wider">
                                <span>Assinatura SaaS Plataforma</span>
                                <ArrowUpRight className="w-4 h-4 text-amber-600" />
                            </div>
                            <span className="text-2xl font-black text-amber-950 block mt-2">
                                {formatCurrency(metrics.totalSaas)}
                            </span>
                            <span className="text-[10px] text-amber-800 font-bold block mt-1">
                                R$ 149,90/mês (Consultório Pro)
                            </span>
                        </div>

                        <div className="bg-sky-50 border border-sky-300 rounded-2xl p-4">
                            <div className="flex items-center justify-between text-sky-800 text-xs font-black uppercase tracking-wider">
                                <span>Saldo Consolidado</span>
                                <DollarSign className="w-4 h-4 text-sky-600" />
                            </div>
                            <span className="text-2xl font-black text-sky-950 block mt-2">
                                {formatCurrency(metrics.saldoLiquido)}
                            </span>
                            <span className="text-[10px] text-sky-800 font-bold block mt-1">
                                Total Líquido do Período
                            </span>
                        </div>
                    </div>

                    {/* Filtros - Não impressos */}
                    <div className="flex items-center justify-between border-b border-brand-pot/20 pb-3 print:hidden">
                        <span className="text-xs font-black uppercase text-brown-light tracking-wider">
                            Movimentações Financeiras ({filteredList.length})
                        </span>
                        <div className="flex items-center bg-gray-100 p-1 rounded-xl">
                            <button
                                type="button"
                                onClick={() => setFilter('TODOS')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                    filter === 'TODOS'
                                        ? 'bg-white text-emerald-900 shadow-xs'
                                        : 'text-brown-light hover:text-brown-dark'
                                }`}
                            >
                                Todas
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilter('CONSULTAS')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                    filter === 'CONSULTAS'
                                        ? 'bg-white text-emerald-900 shadow-xs'
                                        : 'text-brown-light hover:text-brown-dark'
                                }`}
                            >
                                Consultas
                            </button>
                            <button
                                type="button"
                                onClick={() => setFilter('SAAS')}
                                className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                                    filter === 'SAAS'
                                        ? 'bg-white text-emerald-900 shadow-xs'
                                        : 'text-brown-light hover:text-brown-dark'
                                }`}
                            >
                                Faturas SaaS
                            </button>
                        </div>
                    </div>

                    {/* Tabela de Transações */}
                    {loading ? (
                        <div className="py-12 text-center text-brown-light">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-700 mx-auto mb-2" />
                            <p className="text-xs font-bold">Carregando extrato bancário...</p>
                        </div>
                    ) : filteredList.length === 0 ? (
                        <div className="py-10 text-center bg-gray-50 rounded-2xl border border-dashed border-brand-pot/40 space-y-2">
                            <Receipt className="w-8 h-8 text-brown-light mx-auto" />
                            <p className="text-sm font-bold text-brown-dark">Nenhuma transação registrada</p>
                            <p className="text-xs text-brown-light">
                                Quando consultas forem agendadas ou a assinatura SaaS for liquidada, o histórico aparecerá aqui.
                            </p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-xs border border-brand-pot/30 rounded-2xl overflow-hidden">
                                <thead className="bg-gray-100 text-brown-dark font-black uppercase text-[10px] tracking-wider border-b border-brand-pot/30">
                                    <tr>
                                        <th className="p-3">Data / Hora</th>
                                        <th className="p-3">Descrição da Transação</th>
                                        <th className="p-3">Método</th>
                                        <th className="p-3">Status</th>
                                        <th className="p-3 text-right">Valor</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-brand-pot/20">
                                    {filteredList.map(p => {
                                        const isConsulta = p.tipo === 'CONSULTA_TELEMEDICINA';
                                        return (
                                            <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                                                <td className="p-3 font-mono text-[11px] text-brown-light whitespace-nowrap">
                                                    {formatDate(p.dataCriacao)}
                                                </td>
                                                <td className="p-3">
                                                    <span className="font-bold text-brown-dark block">
                                                        {isConsulta
                                                            ? `Teleconsulta com ${p.pagadorNome}`
                                                            : 'Assinatura SaaS Mensal (Consultório Pro)'}
                                                    </span>
                                                    <span className="text-[10px] font-mono text-brown-light">
                                                        ID: {p.mpPaymentId || 'PREF-' + p.referenciaId}
                                                    </span>
                                                </td>
                                                <td className="p-3 whitespace-nowrap">
                                                    <span className="font-bold text-brown-dark">
                                                        {p.metodo === 'PIX'
                                                            ? 'Pix Instantâneo'
                                                            : p.metodo === 'MERCADO_PAGO_CHECKOUT'
                                                            ? 'Mercado Pago Pro'
                                                            : 'Cartão de Crédito'}
                                                    </span>
                                                </td>
                                                <td className="p-3 whitespace-nowrap">
                                                    {p.status === 'APROVADO' ? (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                                                            <CheckCircle2 className="w-3 h-3" /> Aprovado
                                                        </span>
                                                    ) : p.status === 'PENDENTE' || p.status === 'PENDENTE_CONTINGENCIA' ? (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                                                            <Clock className="w-3 h-3" /> Pendente
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-800 bg-red-100 px-2 py-0.5 rounded-full">
                                                            {p.status}
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-3 text-right whitespace-nowrap font-black font-mono">
                                                    <span className={isConsulta ? 'text-emerald-700' : 'text-amber-800'}>
                                                        {isConsulta ? '+' : '-'} {formatCurrency(p.valorTotal)}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* Nota Legal e LGPD */}
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-300 text-[11px] text-emerald-950 space-y-1 leading-relaxed">
                        <div className="font-black text-emerald-900 flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Transparência Ética &amp; Vedação à Dicotomia (CFM Res. nº 2.314/2022)</span>
                        </div>
                        <p>
                            A plataforma Active Age opera como intermediadora tecnológica sob modelo SaaS fixo, vedando categoricamente qualquer retenção de percentual sobre consultas de telemedicina. O valor integral das consultas é creditado na conta do médico assistente no gateway regulado.
                        </p>
                    </div>
                </div>

                {/* Footer - Não impresso */}
                <div className="p-4 sm:p-5 bg-gray-50 border-t border-brand-pot/30 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
                    <span className="text-xs text-brown-light text-center sm:text-left">
                        Relatório contábil consolidado gerado automaticamente.
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
                            onClick={() => window.print()}
                            className="flex-1 sm:flex-none px-6 py-3 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white text-xs sm:text-sm font-black flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer min-h-[44px]"
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
