import { useState, useEffect } from 'react';
import {
    ShieldCheck,
    Search,
    Clock,
    CheckCircle2,
    XCircle,
    FileText,
    Loader2,
    RefreshCw,
    Award
} from 'lucide-react';
import type { AdminDoctorItemResponse, DoctorDossierStatus } from '../../types/dossier';
import { AdminDossierModal } from '../../components/admin/AdminDossierModal';

export function AdminCredenciamento() {
    const [doctors, setDoctors] = useState<AdminDoctorItemResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const loadDoctors = async () => {
        setLoading(true);
        try {
            const query = statusFilter !== 'ALL' ? `?status=${statusFilter}` : '';
            const res = await fetch(`/api/admin/doctors/pending${query}`);
            if (res.ok) {
                const data: AdminDoctorItemResponse[] = await res.json();
                setDoctors(data);
            }
        } catch (err) {
            console.error('Erro ao buscar fila de credenciamento:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDoctors();
    }, [statusFilter]);

    const filteredDoctors = doctors.filter(doc => {
        const matchesSearch =
            doc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.crm.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.email.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
    });

    const getStatusBadge = (status: DoctorDossierStatus) => {
        switch (status) {
            case 'PENDING_DOCS':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                        <Clock className="w-3.5 h-3.5" /> Pendente de Docs
                    </span>
                );
            case 'UNDER_REVIEW':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 animate-pulse">
                        <Clock className="w-3.5 h-3.5" /> Em Auditoria
                    </span>
                );
            case 'DOCS_REJECTED':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-100 text-red-800 border border-red-200">
                        <XCircle className="w-3.5 h-3.5" /> Ajustes Solicitados
                    </span>
                );
            case 'APPROVED':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Homologado
                    </span>
                );
            case 'SUSPENDED':
                return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800 border border-gray-200">
                        Suspenso
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="space-y-8">
            
            {/* Header da Página */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-brown-dark flex items-center gap-3">
                        <ShieldCheck className="w-8 h-8 text-brand-mint" />
                        Fila de Credenciamento Médico
                    </h1>
                    <p className="text-sm text-brown mt-1">
                        Auditoria de habilitação, regularidade ética, telemedicina ICP-Brasil (Res. CFM nº 2.314/2022) e dados bancários.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadDoctors}
                    className="self-start md:self-auto px-4 py-2.5 bg-white border border-brand-pot/40 rounded-xl text-xs font-bold text-brown hover:text-brown-dark hover:bg-brand-pot/10 transition-colors flex items-center gap-2 shadow-sm"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Atualizar Fila
                </button>
            </div>

            {/* Filtros e Barra de Busca */}
            <div className="bg-white rounded-3xl p-6 border border-brand-pot/30 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    
                    {/* Tabs de Status */}
                    <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
                        {[
                            { label: 'Todos', value: 'ALL' },
                            { label: 'Em Auditoria', value: 'UNDER_REVIEW' },
                            { label: 'Pendentes de Docs', value: 'PENDING_DOCS' },
                            { label: 'Homologados', value: 'APPROVED' },
                            { label: 'Rejeitados', value: 'DOCS_REJECTED' },
                        ].map(tab => (
                            <button
                                key={tab.value}
                                type="button"
                                onClick={() => setStatusFilter(tab.value)}
                                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                                    statusFilter === tab.value
                                        ? 'bg-brand-mint text-brown-dark shadow-sm'
                                        : 'bg-brand-pot/10 text-brown hover:bg-brand-pot/20 hover:text-brown-dark'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Busca por Nome ou CRM */}
                    <div className="relative w-full sm:w-72">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-brown" />
                        <input
                            type="text"
                            placeholder="Buscar por Nome ou CRM..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-brand-pot/40 text-xs text-brown-dark focus:border-brand-mint outline-none bg-brand-pot/5"
                        />
                    </div>

                </div>
            </div>

            {/* Tabela de Médicos na Fila */}
            <div className="bg-white rounded-3xl border border-brand-pot/30 shadow-sm overflow-hidden">
                {loading ? (
                    <div className="p-16 flex items-center justify-center gap-3 text-brown font-bold text-sm">
                        <Loader2 className="w-6 h-6 animate-spin text-brand-mint" />
                        Carregando fila de credenciamento...
                    </div>
                ) : filteredDoctors.length === 0 ? (
                    <div className="p-16 text-center text-brown space-y-2">
                        <FileText className="w-12 h-12 text-brand-pot/50 mx-auto" />
                        <p className="font-bold text-base text-brown-dark">Nenhum médico encontrado nesta categoria.</p>
                        <p className="text-xs text-brown">Tente ajustar os filtros ou aguardar novos cadastros de profissionais.</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-brand-pot/30 bg-brand-pot/10 text-[11px] font-bold text-brown uppercase tracking-wider">
                                    <th className="py-4 px-6">Médico / Especialista</th>
                                    <th className="py-4 px-6">CRM / UF</th>
                                    <th className="py-4 px-6">Status do Dossiê</th>
                                    <th className="py-4 px-6">Documentos</th>
                                    <th className="py-4 px-6">Data de Entrada</th>
                                    <th className="py-4 px-6 text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-brand-pot/20 text-xs text-brown-dark">
                                {filteredDoctors.map(doctor => (
                                    <tr key={doctor.id} className="hover:bg-brand-pot/5 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="font-bold text-sm text-brown-dark">{doctor.fullName}</div>
                                            <div className="text-brown text-[11px]">{doctor.email}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="font-bold flex items-center gap-1">
                                                <Award className="w-3.5 h-3.5 text-brand-mint" />
                                                {doctor.crm}/{doctor.ufCrm}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            {getStatusBadge(doctor.dossierStatus)}
                                        </td>
                                        <td className="py-4 px-6">
                                            <span className="font-medium text-brown">
                                                {doctor.uploadedDocsCount} anexados
                                            </span>
                                            {doctor.hasFinancialInfo && (
                                                <span className="ml-2 text-[10px] text-green-700 bg-green-100 px-1.5 py-0.5 rounded font-bold">
                                                    PIX OK
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4 px-6 text-brown">
                                            {doctor.submittedAt
                                                ? new Date(doctor.submittedAt).toLocaleDateString('pt-BR')
                                                : new Date(doctor.createdAt).toLocaleDateString('pt-BR')}
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedDoctorId(doctor.id);
                                                    setIsModalOpen(true);
                                                }}
                                                className="px-4 py-2 bg-brand-mint hover:bg-brand-mint/80 text-brown-dark font-bold rounded-xl transition-all shadow-sm text-xs"
                                            >
                                                Auditar Dossiê
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal de Auditoria do Dossiê */}
            <AdminDossierModal
                doctorId={selectedDoctorId}
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setSelectedDoctorId(null);
                }}
                onReviewSuccess={() => {
                    loadDoctors();
                }}
            />

        </div>
    );
}
