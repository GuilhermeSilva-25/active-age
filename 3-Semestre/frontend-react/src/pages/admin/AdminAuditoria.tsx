import { useState, useEffect } from 'react';
import {
    FileText,
    Search,
    RefreshCw,
    Loader2,
    ShieldCheck,
    Clock,
    Activity,
    Eye,
    CheckCircle2,
    XCircle,
    UserX,
    UserCheck,
    UploadCloud,
    X,
    Globe
} from 'lucide-react';
import type { AuditLogResponse, AuditLogStatsResponse } from '../../types/admin';

export function AdminAuditoria() {
    const [logs, setLogs] = useState<AuditLogResponse[]>([]);
    const [stats, setStats] = useState<AuditLogStatsResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionFilter, setActionFilter] = useState<string>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLog, setSelectedLog] = useState<AuditLogResponse | null>(null);

    const formatRoleName = (role?: string) => {
        if (!role) return 'Não informado';
        switch (role) {
            case 'ROLE_ADMIN':
                return 'Administrador';
            case 'ROLE_MEDICO':
                return 'Médico';
            case 'ROLE_PACIENTE':
                return 'Paciente';
            default:
                return role.replace('ROLE_', '');
        }
    };

    const loadData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (actionFilter !== 'ALL') params.append('action', actionFilter);

            const [logsRes, statsRes] = await Promise.all([
                fetch(`/api/admin/audit-logs${params.toString() ? '?' + params.toString() : ''}`),
                fetch('/api/admin/audit-logs/stats'),
            ]);

            if (logsRes.ok) {
                const logsData: AuditLogResponse[] = await logsRes.json();
                setLogs(logsData);
            }
            if (statsRes.ok) {
                const statsData: AuditLogStatsResponse = await statsRes.json();
                setStats(statsData);
            }
        } catch (err) {
            console.error('Erro ao carregar trilha de auditoria:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [actionFilter]);

    const filteredLogs = logs.filter(l => {
        const lowerSearch = searchTerm.toLowerCase();
        return (
            (l.userEmail && l.userEmail.toLowerCase().includes(lowerSearch)) ||
            (l.details && l.details.toLowerCase().includes(lowerSearch)) ||
            (l.ipAddress && l.ipAddress.includes(searchTerm)) ||
            (l.targetUserId && l.targetUserId.includes(searchTerm)) ||
            (l.action && l.action.toLowerCase().includes(lowerSearch))
        );
    });

    const getActionBadge = (action: string) => {
        switch (action) {
            case 'VIEW_DOCUMENT':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
                        <Eye className="w-3 h-3" /> Ver Documento
                    </span>
                );
            case 'VIEW_DOSSIER':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-800 border border-indigo-200">
                        <FileText className="w-3 h-3" /> Ver Dossiê
                    </span>
                );
            case 'REVIEW_DOSSIER_APPROVE':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-green-100 text-green-800 border border-green-200">
                        <CheckCircle2 className="w-3 h-3" /> Homologou Médico
                    </span>
                );
            case 'REVIEW_DOSSIER_REJECT':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-red-100 text-red-800 border border-red-200">
                        <XCircle className="w-3 h-3" /> Reprovou Dossiê
                    </span>
                );
            case 'ACTIVATE_USER':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                        <UserCheck className="w-3 h-3" /> Reativou Conta
                    </span>
                );
            case 'DEACTIVATE_USER':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
                        <UserX className="w-3 h-3" /> Inativou Conta
                    </span>
                );
            case 'UPLOAD_DOCUMENT':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <UploadCloud className="w-3 h-3" /> Upload de Arquivo
                    </span>
                );
            case 'SUBMIT_DOSSIER':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-800 border border-purple-200">
                        Submissão Dossiê
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-gray-100 text-gray-800">
                        {action}
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8">
            
            {/* Header da Página */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                <div>
                    <h1 className="text-xl sm:text-2xl font-bold text-brown-dark flex items-center gap-2.5 sm:gap-3">
                        <ShieldCheck className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600 shrink-0" />
                        <span>Trilha de Auditoria Imutável</span>
                    </h1>
                    <p className="text-xs sm:text-sm text-brown mt-1">
                        Rastreabilidade perene de acessos a prontuários e documentos clínicos (SBIS NGS1 / LGPD Art. 37).
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadData}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white border border-brand-pot/40 rounded-xl text-xs font-bold text-brown hover:text-brown-dark hover:bg-brand-pot/10 transition-colors shadow-xs"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    <span>Atualizar Logs</span>
                </button>
            </div>

            {/* Cards de Métricas da Auditoria */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
                <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-brand-pot/30 shadow-xs">
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-brown">Total de Eventos</span>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Activity className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                    </div>
                    <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-brown-dark">
                        {stats ? stats.totalLogs : '...'}
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-brown mt-0.5 truncate">Registros perpétuos de conformidade</p>
                </div>

                <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-brand-pot/30 shadow-xs">
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-brown">Últimas 24 Horas</span>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                    </div>
                    <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-brown-dark">
                        {stats ? stats.logsLast24Hours : '...'}
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-brown mt-0.5 truncate">Operações recentes registradas</p>
                </div>

                <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-brand-pot/30 shadow-xs">
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-brown">Documentos Vistos</span>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                    </div>
                    <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-brown-dark">
                        {stats ? stats.documentViewsCount : '...'}
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-brown mt-0.5 truncate">Inspeções de CRM / Diplomas</p>
                </div>

                <div className="bg-white rounded-xl sm:rounded-2xl p-3.5 sm:p-5 border border-brand-pot/30 shadow-xs">
                    <div className="flex items-center justify-between mb-1.5 sm:mb-2">
                        <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-brown">Decisões de Dossiê</span>
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg sm:rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                            <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                    </div>
                    <div className="text-xl sm:text-2xl md:text-3xl font-extrabold text-brown-dark">
                        {stats ? stats.dossierReviewsCount : '...'}
                    </div>
                    <p className="text-[10px] sm:text-[11px] text-brown mt-0.5 truncate">Homologações e reprovações</p>
                </div>
            </div>

            {/* Painel de Filtros e Busca */}
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-brand-pot/30 shadow-sm space-y-3 sm:space-y-4">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 sm:gap-4">
                    
                    {/* Tabs de Filtro de Ação */}
                    <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto w-full lg:w-auto pb-2 lg:pb-0 scrollbar-none">
                        {[
                            { label: 'Todas as Ações', value: 'ALL' },
                            { label: 'Docs Inspecionados', value: 'VIEW_DOCUMENT' },
                            { label: 'Dossiês Aprovados', value: 'REVIEW_DOSSIER_APPROVE' },
                            { label: 'Dossiês Reprovados', value: 'REVIEW_DOSSIER_REJECT' },
                            { label: 'Moderação de Contas', value: 'ACTIVATE_USER' },
                            { label: 'Uploads', value: 'UPLOAD_DOCUMENT' },
                        ].map(tab => (
                            <button
                                key={tab.value}
                                type="button"
                                onClick={() => setActionFilter(tab.value)}
                                className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                    actionFilter === tab.value
                                        ? 'bg-emerald-600 text-white shadow-xs'
                                        : 'bg-brand-pot/10 text-brown hover:bg-brand-pot/20 hover:text-brown-dark'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Busca Textual */}
                    <div className="relative w-full lg:w-72">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brown" />
                        <input
                            type="text"
                            placeholder="Buscar por Operador, IP, Detalhes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-brand-pot/40 text-xs text-brown-dark focus:border-emerald-600 outline-none bg-brand-pot/5"
                        />
                    </div>

                </div>
            </div>

            {/* Tabela de Logs */}
            <div className="bg-white rounded-2xl sm:rounded-3xl border border-brand-pot/30 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-12 sm:p-16 flex items-center justify-center gap-3 text-brown font-bold text-sm">
                        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
                        Carregando registros de auditoria...
                    </div>
                ) : filteredLogs.length === 0 ? (
                    <div className="p-12 sm:p-16 text-center text-brown space-y-2">
                        <FileText className="w-12 h-12 text-brand-pot/50 mx-auto" />
                        <p className="font-bold text-base text-brown-dark">Nenhum evento registrado com os filtros atuais.</p>
                        <p className="text-xs text-brown">Tente ajustar a busca ou o tipo de ação.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px] text-left border-collapse">
                            <thead>
                                <tr className="border-b border-brand-pot/30 bg-brand-pot/10 text-[11px] font-bold text-brown uppercase tracking-wider">
                                    <th className="py-3.5 px-4 sm:px-6">Data e Hora</th>
                                    <th className="py-3.5 px-4 sm:px-6">Operador</th>
                                    <th className="py-3.5 px-4 sm:px-6">Ação Auditada</th>
                                    <th className="py-3.5 px-4 sm:px-6">Endereço IP</th>
                                    <th className="py-3.5 px-4 sm:px-6">Detalhes da Operação</th>
                                    <th className="py-3.5 px-4 sm:px-6 text-right">Inspecionar</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-pot/20 text-xs text-brown-dark">
                                {filteredLogs.map(log => (
                                    <tr key={log.id} className="hover:bg-brand-pot/5 transition-colors">
                                        <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap text-brown">
                                            <div className="font-bold text-brown-dark">
                                                {new Date(log.timestamp).toLocaleDateString('pt-BR')}
                                            </div>
                                            <div className="text-[11px]">
                                                {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                                            </div>
                                        </td>
                                        <td className="py-3.5 px-4 sm:px-6">
                                            <div className="font-bold">{log.userEmail}</div>
                                            <span className="text-[10px] text-brown bg-brand-pot/10 px-1.5 py-0.5 rounded font-medium">
                                                {formatRoleName(log.userRole)}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 sm:px-6 whitespace-nowrap">
                                            {getActionBadge(log.action)}
                                        </td>
                                        <td className="py-3.5 px-4 sm:px-6 font-mono text-[11px] text-brown">
                                            <span className="inline-flex items-center gap-1">
                                                <Globe className="w-3 text-brown-light" />
                                                {log.ipAddress}
                                            </span>
                                        </td>
                                        <td className="py-3.5 px-4 sm:px-6 max-w-xs truncate text-brown-dark" title={log.details}>
                                            {log.details}
                                        </td>
                                        <td className="py-3.5 px-4 sm:px-6 text-right whitespace-nowrap">
                                            <button
                                                type="button"
                                                onClick={() => setSelectedLog(log)}
                                                className="px-3 py-1.5 rounded-xl border border-brand-pot/50 text-brown hover:text-brown-dark hover:bg-brand-pot/20 text-xs font-bold transition-all"
                                            >
                                                Detalhes
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de Detalhes do Log */}
            {selectedLog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brown-dark/70 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full shadow-2xl border border-brand-pot/50 space-y-5">
                        <div className="flex items-center justify-between border-b border-brand-pot/30 pb-4">
                            <div className="flex items-center gap-3">
                                <span className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-800">
                                    <FileText className="w-6 h-6" />
                                </span>
                                <div>
                                    <h3 className="font-bold text-lg text-brown-dark">Registro de Auditoria</h3>
                                    <p className="text-xs text-brown">ID: {selectedLog.id}</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSelectedLog(null)}
                                className="p-2 rounded-full hover:bg-brand-pot/20 text-brown transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div>
                                <span className="font-bold text-brown block">Ação Executada:</span>
                                <div className="mt-1">{getActionBadge(selectedLog.action)}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="font-bold text-brown block">Data e Hora:</span>
                                    <span className="text-brown-dark font-medium">
                                        {new Date(selectedLog.timestamp).toLocaleString('pt-BR')}
                                    </span>
                                </div>
                                <div>
                                    <span className="font-bold text-brown block">Endereço IP:</span>
                                    <span className="text-brown-dark font-mono font-medium">
                                        {selectedLog.ipAddress}
                                    </span>
                                </div>
                            </div>
                            <div>
                                <span className="font-bold text-brown block">Operador Responsável:</span>
                                <span className="text-brown-dark font-medium">
                                    {selectedLog.userEmail} ({formatRoleName(selectedLog.userRole)})
                                </span>
                            </div>
                            {selectedLog.targetUserId && (
                                <div>
                                    <span className="font-bold text-brown block">ID do Usuário Alvo:</span>
                                    <span className="text-brown-dark font-mono text-[11px]">
                                        {selectedLog.targetUserId}
                                    </span>
                                </div>
                            )}
                            <div className="p-4 bg-brand-pot/10 rounded-2xl border border-brand-pot/30">
                                <span className="font-bold text-brown-dark block mb-1">Descrição Completa:</span>
                                <p className="text-brown text-xs leading-relaxed">{selectedLog.details}</p>
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={() => setSelectedLog(null)}
                                className="px-5 py-2.5 rounded-xl bg-brand-mint hover:bg-brand-mint/80 text-brown-dark font-bold text-xs shadow-sm transition-all"
                            >
                                Fechar
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}
