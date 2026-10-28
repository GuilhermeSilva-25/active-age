import { useState, useEffect } from 'react';
import {
    X,
    CheckCircle2,
    XCircle,
    FileText,
    ShieldCheck,
    CreditCard,
    Award,
    Loader2,
    AlertCircle,
    User,
    Calendar,
    Mail
} from 'lucide-react';
import {
    type DoctorDossierStatusResponse,
    type DocumentType,
    DOSSIER_DOCUMENT_DEFINITIONS
} from '../../types/dossier';
import { FeedbackModal } from '../common/FeedbackModal';

interface AdminDossierModalProps {
    doctorId: string | null;
    isOpen: boolean;
    onClose: () => void;
    onReviewSuccess: () => void;
}

export function AdminDossierModal({ doctorId, isOpen, onClose, onReviewSuccess }: AdminDossierModalProps) {
    const [dossier, setDossier] = useState<DoctorDossierStatusResponse | null>(null);
    const [loading, setLoading] = useState(false);
    const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(null);
    const [reviewMode, setReviewMode] = useState<'IDLE' | 'APPROVE' | 'REJECT'>('IDLE');
    const [rejectionReason, setRejectionReason] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);

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

    const loadDossier = async () => {
        if (!doctorId) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/doctors/${doctorId}/dossier`);
            if (res.ok) {
                const data: DoctorDossierStatusResponse = await res.json();
                setDossier(data);
                // Pré-seleciona o primeiro documento disponível
                const firstAvailable = DOSSIER_DOCUMENT_DEFINITIONS.find(d => data.documents[d.type]);
                if (firstAvailable) {
                    setSelectedDocType(firstAvailable.type);
                }
            } else {
                setFeedback({
                    isOpen: true,
                    type: 'error',
                    title: 'Falha ao Carregar Dossiê',
                    message: 'Não foi possível carregar os dados deste médico.',
                });
            }
        } catch (err) {
            console.error('Erro ao buscar dossiê médico:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen && doctorId) {
            setReviewMode('IDLE');
            setRejectionReason('');
            setSelectedDocType(null);
            loadDossier();
        }
    }, [isOpen, doctorId]);

    const handleExecuteReview = async (forcedAction?: 'APPROVE' | 'REJECT') => {
        const actionToExecute = forcedAction || reviewMode;
        if (!doctorId || actionToExecute === 'IDLE') return;

        if (actionToExecute === 'REJECT' && (!rejectionReason || rejectionReason.trim().length < 10)) {
            setFeedback({
                isOpen: true,
                type: 'warning',
                title: 'Justificativa Obrigatória',
                message: 'Por favor, detalhe o motivo da reprovação com no mínimo 10 caracteres.',
            });
            return;
        }

        setSubmittingReview(true);
        try {
            const res = await fetch(`/api/admin/doctors/${doctorId}/review`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: actionToExecute,
                    rejectionReason: actionToExecute === 'REJECT' ? rejectionReason.trim() : null,
                }),
            });

            if (res.ok) {
                const actionTitle = actionToExecute === 'APPROVE' ? 'Credenciamento Homologado!' : 'Dossiê Reprovado!';
                const actionMsg = actionToExecute === 'APPROVE'
                    ? 'O médico foi aprovado e seu consultório virtual foi liberado com 15 dias de teste grátis. A operação foi registrada na trilha de auditoria e conformidade.'
                    : 'A solicitação de ajustes foi registrada e o médico foi notificado no painel. A operação foi registrada na trilha de auditoria e conformidade.';

                setFeedback({
                    isOpen: true,
                    type: actionToExecute === 'APPROVE' ? 'success' : 'info',
                    title: actionTitle,
                    message: actionMsg,
                });

                onReviewSuccess();
            } else {
                const errData = await res.json().catch(() => ({}));
                setFeedback({
                    isOpen: true,
                    type: 'error',
                    title: 'Erro na Decisão de Auditoria',
                    message: errData.message || 'Falha ao registrar parecer.',
                });
            }
        } catch (err) {
            setFeedback({
                isOpen: true,
                type: 'error',
                title: 'Falha de Conexão',
                message: 'Ocorreu um erro ao comunicar com a API de auditoria.',
            });
        } finally {
            setSubmittingReview(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-brown-dark/70 backdrop-blur-sm animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[92vh] flex flex-col overflow-hidden border border-brand-pot/50">
                
                {/* Cabeçalho do Modal */}
                <div className="p-6 bg-brand-pot/10 border-b border-brand-pot/30 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="p-2.5 bg-brand-mint/30 rounded-2xl text-brown-dark">
                            <ShieldCheck className="w-6 h-6" />
                        </span>
                        <div>
                            <h2 className="text-xl font-bold text-brown-dark">
                                Auditoria de Credenciamento Médico
                            </h2>
                            <p className="text-xs text-brown">
                                {dossier ? `${dossier.fullName} • CRM ${dossier.crm}/${dossier.ufCrm}` : 'Carregando...'}
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2.5 rounded-full hover:bg-brand-pot/20 text-brown transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {loading ? (
                    <div className="p-16 flex items-center justify-center gap-3 text-brown font-bold text-base">
                        <Loader2 className="w-6 h-6 animate-spin text-brand-mint" />
                        Carregando dossiê médico...
                    </div>
                ) : !dossier ? (
                    <div className="p-16 text-center text-brown">Não foi possível carregar as informações.</div>
                ) : (
                    <div className="flex-grow flex flex-col md:flex-row overflow-hidden">
                        
                        {/* Coluna da Esquerda: Dados do Médico e Checklist Documental */}
                        <div className="w-full md:w-5/12 border-r border-brand-pot/30 flex flex-col overflow-y-auto p-6 space-y-6">
                            
                            {/* Card Resumo do Médico */}
                            <div className="p-4 bg-brand-pot/10 rounded-2xl border border-brand-pot/30 space-y-2 text-xs text-brown-dark">
                                <div className="flex items-center gap-2 font-bold text-sm">
                                    <User className="w-4 h-4 text-brand-mint" /> {dossier.fullName}
                                </div>
                                <div className="flex items-center gap-2 text-brown">
                                    <Mail className="w-3.5 h-3.5" /> {dossier.email}
                                </div>
                                <div className="flex items-center gap-2 text-brown">
                                    <Award className="w-3.5 h-3.5" /> CRM: <strong>{dossier.crm}/{dossier.ufCrm}</strong>
                                </div>
                                {dossier.submittedAt && (
                                    <div className="flex items-center gap-2 text-brown">
                                        <Calendar className="w-3.5 h-3.5" /> Submetido em: {new Date(dossier.submittedAt).toLocaleDateString('pt-BR')} às {new Date(dossier.submittedAt).toLocaleTimeString('pt-BR')}
                                    </div>
                                )}
                            </div>

                            {/* Dados Bancários para Split Direto */}
                            {dossier.financialInfo ? (
                                <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/60 text-xs space-y-2">
                                    <h4 className="font-bold text-blue-900 flex items-center gap-1.5">
                                        <CreditCard className="w-4 h-4 text-blue-700" /> Dados para Split Direto de Honorários
                                    </h4>
                                    <p className="text-blue-800">
                                        Banco: <strong>{dossier.financialInfo.bankName}</strong> • Ag: <strong>{dossier.financialInfo.agency}</strong> • Conta: <strong>{dossier.financialInfo.accountNumber} ({dossier.financialInfo.accountType})</strong>
                                    </p>
                                    <p className="text-blue-800">
                                        Chave PIX: <strong>{dossier.financialInfo.pixKey}</strong> ({dossier.financialInfo.pixKeyType})
                                    </p>
                                    {dossier.financialInfo.cnpj && (
                                        <p className="text-blue-800">
                                            PJ Médica: <strong>{dossier.financialInfo.cnpj}</strong> ({dossier.financialInfo.corporateName})
                                        </p>
                                    )}
                                </div>
                            ) : (
                                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                                    <span>Dados bancários para Split Direto ainda não informados.</span>
                                </div>
                            )}

                            {/* Checklist dos Documentos */}
                            <div className="space-y-3">
                                <h4 className="font-bold text-brown-dark text-sm border-b border-brand-pot/30 pb-2">
                                    Documentos do Dossiê ({dossier.mandatoryUploadedCount} de {dossier.totalMandatoryCount} obrigatórios)
                                </h4>

                                <div className="space-y-2">
                                    {DOSSIER_DOCUMENT_DEFINITIONS.map(def => {
                                        const doc = dossier.documents[def.type];
                                        const isSelected = selectedDocType === def.type;

                                        return (
                                            <button
                                                key={def.type}
                                                type="button"
                                                onClick={() => doc && setSelectedDocType(def.type)}
                                                disabled={!doc}
                                                className={`w-full text-left p-3 rounded-xl text-xs flex items-center justify-between border transition-all ${
                                                    !doc
                                                        ? 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                                                        : isSelected
                                                        ? 'bg-brand-mint/20 border-brand-mint text-brown-dark font-bold shadow-sm'
                                                        : 'bg-white border-brand-pot/40 hover:bg-brand-pot/10 text-brown-dark'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2.5 truncate">
                                                    {doc ? (
                                                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                                                    ) : def.mandatory ? (
                                                        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                                                    ) : (
                                                        <div className="w-4 h-4 rounded-full border border-gray-300 shrink-0" />
                                                    )}
                                                    <span className="truncate">{def.title}</span>
                                                </div>

                                                {doc && (
                                                    <span className="text-[10px] uppercase font-bold text-brand-mint ml-2 shrink-0">
                                                        Visualizar
                                                    </span>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                        </div>

                        {/* Coluna da Direita: Visualizador de Documento Seguro & Ações de Decisão */}
                        <div className="w-full md:w-7/12 flex flex-col bg-gray-50 overflow-hidden">
                            
                            {/* Painel de Visualização do Documento */}
                            <div className="flex-grow p-4 flex flex-col overflow-hidden">
                                {selectedDocType && dossier.documents[selectedDocType] ? (
                                    <div className="flex-grow bg-white rounded-2xl border border-brand-pot/30 shadow-sm flex flex-col overflow-hidden">
                                        <div className="p-3 bg-brand-pot/10 border-b border-brand-pot/30 flex items-center justify-between text-xs">
                                            <span className="font-bold text-brown-dark">
                                                📄 {dossier.documents[selectedDocType].originalFileName}
                                            </span>
                                            <a
                                                href={`/api/admin/doctors/${doctorId}/documents/${selectedDocType}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-brand-mint font-bold hover:underline"
                                            >
                                                Abrir em nova aba ↗
                                            </a>
                                        </div>
                                        <div className="flex-grow relative overflow-hidden bg-gray-100 flex items-center justify-center">
                                            {dossier.documents[selectedDocType].contentType.startsWith('image/') ? (
                                                <img
                                                    src={`/api/admin/doctors/${doctorId}/documents/${selectedDocType}`}
                                                    alt="Documento Médico"
                                                    className="max-h-full max-w-full object-contain p-4"
                                                />
                                            ) : (
                                                <iframe
                                                    src={`/api/admin/doctors/${doctorId}/documents/${selectedDocType}`}
                                                    title="Visualizador Seguro de Documento"
                                                    className="w-full h-full border-none"
                                                />
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-grow flex flex-col items-center justify-center text-brown text-sm p-8 text-center bg-white rounded-2xl border border-dashed border-brand-pot/40">
                                        <FileText className="w-12 h-12 text-brand-pot/60 mb-2" />
                                        <p className="font-bold">Nenhum documento selecionado para inspeção.</p>
                                        <p className="text-xs text-brown mt-1">
                                            Clique em qualquer item com o ícone verde na lista ao lado para visualizá-lo em ambiente auditado.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Rodapé com as Decisões de Auditoria */}
                            <div className="p-6 bg-white border-t border-brand-pot/30 space-y-4">
                                {reviewMode === 'REJECT' ? (
                                    <div className="space-y-3">
                                        <label className="block text-xs font-bold text-red-700">
                                            Justificativa Técnica de Reprovação (obrigatória, mín. 10 caracteres) *:
                                        </label>
                                        <textarea
                                            rows={3}
                                            required
                                            placeholder="Ex: A certidão ético-profissional está vencida ou ilegível. Por favor reenvie a cópia atualizada emitida no portal do CRM..."
                                            value={rejectionReason}
                                            onChange={(e) => setRejectionReason(e.target.value)}
                                            className="w-full p-3 rounded-xl border border-red-300 focus:border-red-500 outline-none text-xs text-brown-dark"
                                        />
                                        <div className="flex justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={() => setReviewMode('IDLE')}
                                                className="px-4 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-brown hover:bg-gray-50"
                                            >
                                                Cancelar
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => handleExecuteReview()}
                                                disabled={submittingReview}
                                                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 disabled:opacity-70"
                                            >
                                                {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                                                Confirmar Reprovação e Notificar
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                                        <div className="text-xs text-brown">
                                            Status Atual: <strong>{dossier.dossierStatus}</strong>
                                        </div>
                                        <div className="flex items-center gap-3 w-full sm:w-auto">
                                            <button
                                                type="button"
                                                onClick={() => setReviewMode('REJECT')}
                                                className="w-1/2 sm:w-auto px-5 py-3 rounded-xl border border-red-300 text-red-700 hover:bg-red-50 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                                            >
                                                <XCircle className="w-4 h-4" />
                                                Reprovar / Solicitar Ajustes
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setReviewMode('APPROVE');
                                                    handleExecuteReview('APPROVE');
                                                }}
                                                disabled={submittingReview}
                                                className="w-1/2 sm:w-auto px-6 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 disabled:opacity-70"
                                            >
                                                {submittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                                Homologar e Aprovar Dossiê
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>

                        </div>

                    </div>
                )}

            </div>

            <FeedbackModal
                isOpen={feedback.isOpen}
                type={feedback.type}
                title={feedback.title}
                message={feedback.message}
                onConfirm={() => {
                    const shouldClose = feedback.type === 'success' || feedback.type === 'info';
                    setFeedback({ ...feedback, isOpen: false });
                    if (shouldClose) {
                        onClose();
                    }
                }}
            />
        </div>
    );
}
