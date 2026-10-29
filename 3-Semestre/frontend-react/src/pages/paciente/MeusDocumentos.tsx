import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    FileSignature,
    Search,
    Printer,
    ShieldCheck,
    Calendar,
    User,
    Loader2,
    ArrowLeft,
    CheckCircle2,
} from 'lucide-react';
import { DocumentPrintModal } from '../../components/teleconsulta/DocumentPrintModal';
import { FeedbackModal } from '../../components/common/FeedbackModal';
import type { MedicalDocument, MedicalDocumentType } from '../../types/teleconsulta';

export const MeusDocumentos: React.FC = () => {
    const navigate = useNavigate();

    const [documents, setDocuments] = useState<MedicalDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedType, setSelectedType] = useState<string>('ALL');

    const [selectedDoc, setSelectedDoc] = useState<MedicalDocument | null>(null);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

    const [feedback, setFeedback] = useState<{
        isOpen: boolean;
        type: 'success' | 'error' | 'warning' | 'info';
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: 'info',
        title: '',
        message: '',
    });

    useEffect(() => {
        const fetchDocuments = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/medical-documents/my-documents');
                if (res.ok) {
                    const data = await res.json();
                    setDocuments(data);
                } else {
                    setFeedback({
                        isOpen: true,
                        type: 'error',
                        title: 'Não foi possível carregar',
                        message: 'Erro ao buscar suas receitas e atestados médicos.',
                    });
                }
            } catch {
                setFeedback({
                    isOpen: true,
                    type: 'error',
                    title: 'Erro de Conexão',
                    message: 'Falha ao conectar com o servidor para buscar seus documentos.',
                });
            } finally {
                setLoading(false);
            }
        };

        fetchDocuments();
    }, []);

    const filteredDocs = documents.filter((doc) => {
        const matchesType = selectedType === 'ALL' || doc.documentType === selectedType;
        const query = searchQuery.toLowerCase();
        const matchesSearch =
            !searchQuery ||
            doc.title.toLowerCase().includes(query) ||
            doc.doctorName.toLowerCase().includes(query) ||
            doc.validationCode.toLowerCase().includes(query);

        return matchesType && matchesSearch;
    });

    const getDocumentBadge = (type: MedicalDocumentType) => {
        switch (type) {
            case 'RECEITA_MEDICA':
                return {
                    label: 'Receita Médica',
                    bg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
                };
            case 'PEDIDO_EXAME':
                return {
                    label: 'Pedido de Exame',
                    bg: 'bg-blue-100 text-blue-900 border-blue-300',
                };
            case 'ATESTADO_MEDICO':
                return {
                    label: 'Atestado Médico',
                    bg: 'bg-amber-100 text-amber-900 border-amber-300',
                };
            default:
                return {
                    label: 'Documento Clínico',
                    bg: 'bg-gray-100 text-gray-800 border-gray-300',
                };
        }
    };

    const formatDate = (isoStr: string) => {
        try {
            const date = new Date(isoStr);
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            });
        } catch {
            return isoStr;
        }
    };

    return (
        <div className="min-h-screen bg-brand-ice py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-6">
                {/* Botão Voltar e Cabeçalho Principal */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <button
                            type="button"
                            onClick={() => navigate('/paciente/dashboard')}
                            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-brown-light hover:text-brown-dark transition-colors mb-2 cursor-pointer"
                        >
                            <ArrowLeft className="w-4 h-4 text-brand-orange" />
                            <span>Voltar para o Painel do Paciente</span>
                        </button>
                        <h1 className="text-2xl sm:text-3xl font-black text-brown-dark flex items-center gap-3">
                            <FileSignature className="w-8 h-8 text-brand-orange" />
                            Minhas Receitas & Atestados
                        </h1>
                        <p className="text-xs sm:text-sm text-brown-light mt-1">
                            Acesse, visualize e imprima suas prescrições e pedidos médicos com selo de autenticidade ICP-Brasil.
                        </p>
                    </div>

                    <div className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2 text-xs text-emerald-900 font-bold">
                        <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0" />
                        <span>Validação Pública Conforme Res. CFM nº 2.314/2022</span>
                    </div>
                </div>

                {/* Filtros e Barra de Busca */}
                <div className="bg-white p-4 sm:p-5 rounded-3xl border border-brand-pot/30 shadow-xs space-y-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        {/* Busca Textual */}
                        <div className="relative flex-1">
                            <Search className="w-4 h-4 text-brown-light absolute left-3.5 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Buscar por médico, remédio ou código de validação..."
                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm text-brown-dark placeholder-brown-light/60 focus:ring-2 focus:ring-brand-orange"
                            />
                        </div>

                        {/* Abas Rápidas de Tipo */}
                        <div className="flex items-center gap-1.5 overflow-x-auto">
                            {[
                                { key: 'ALL', label: 'Todos' },
                                { key: 'RECEITA_MEDICA', label: 'Receitas' },
                                { key: 'PEDIDO_EXAME', label: 'Exames' },
                                { key: 'ATESTADO_MEDICO', label: 'Atestados' },
                            ].map((tab) => (
                                <button
                                    key={tab.key}
                                    type="button"
                                    onClick={() => setSelectedType(tab.key)}
                                    className={`px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer min-h-[40px] ${
                                        selectedType === tab.key
                                            ? 'bg-brand-orange text-white font-black shadow-xs'
                                            : 'bg-brand-ice text-brown-dark hover:bg-orange-100'
                                    }`}
                                >
                                    {tab.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Listagem de Documentos */}
                {loading ? (
                    <div className="py-20 text-center">
                        <Loader2 className="w-10 h-10 animate-spin text-brand-orange mx-auto mb-3" />
                        <p className="text-sm font-bold text-brown-dark">
                            Carregando suas prescrições e atestados...
                        </p>
                    </div>
                ) : filteredDocs.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-brand-pot/30 text-center space-y-3 shadow-xs">
                        <FileSignature className="w-16 h-16 text-gray-300 mx-auto" />
                        <h3 className="text-lg font-black text-brown-dark">
                            Nenhum documento encontrado
                        </h3>
                        <p className="text-xs sm:text-sm text-brown-light max-w-md mx-auto">
                            {searchQuery || selectedType !== 'ALL'
                                ? 'Nenhum resultado corresponde aos filtros selecionados.'
                                : 'Você ainda não possui receitas ou documentos emitidos em teleconsultas.'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredDocs.map((doc) => {
                            const badge = getDocumentBadge(doc.documentType);
                            return (
                                <div
                                    key={doc.id}
                                    className="bg-white p-5 rounded-3xl border border-brand-pot/30 shadow-xs hover:border-brand-orange hover:shadow-md transition-all flex flex-col justify-between gap-4"
                                >
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className={`px-2.5 py-1 rounded-lg text-[11px] font-black border ${badge.bg}`}>
                                                {badge.label}
                                            </span>
                                            <span className="font-mono text-xs font-black text-brand-orange">
                                                {doc.validationCode}
                                            </span>
                                        </div>

                                        <h3 className="text-base font-black text-brown-dark leading-tight">
                                            {doc.title}
                                        </h3>

                                        <div className="space-y-1 text-xs text-brown-light">
                                            <p className="flex items-center gap-1.5 font-bold text-brown-dark">
                                                <User className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                                                {doc.doctorName} (CRM {doc.doctorCrm}/{doc.doctorUfCrm})
                                            </p>
                                            <p className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                                                Emitido em {formatDate(doc.issuedAt || doc.createdAt)}
                                            </p>
                                        </div>

                                        <div className="bg-brand-ice/70 p-3 rounded-2xl border border-brand-pot/20 text-xs text-brown-dark line-clamp-3 font-mono">
                                            {doc.content}
                                        </div>
                                    </div>

                                    <div className="pt-2 border-t border-brand-pot/20 flex items-center justify-between gap-3">
                                        <span className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
                                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                            Autêntico
                                        </span>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setSelectedDoc(doc);
                                                setIsPrintModalOpen(true);
                                            }}
                                            className="px-4 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer min-h-[44px]"
                                        >
                                            <Printer className="w-4 h-4" />
                                            <span>Visualizar e Imprimir</span>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Modal de Impressão Oficial do Documento */}
            <DocumentPrintModal
                isOpen={isPrintModalOpen}
                onClose={() => setIsPrintModalOpen(false)}
                document={selectedDoc}
            />

            {/* Modal de Feedback Acessível */}
            <FeedbackModal
                isOpen={feedback.isOpen}
                type={feedback.type}
                title={feedback.title}
                message={feedback.message}
                onConfirm={() => setFeedback({ ...feedback, isOpen: false })}
            />
        </div>
    );
};
