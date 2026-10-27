import { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
    UploadCloud,
    CheckCircle2,
    AlertCircle,
    Clock,
    XCircle,
    Building2,
    ShieldCheck,
    CreditCard,
    Award,
    Loader2,
    Eye,
    ChevronRight,
    ArrowLeft,
    LogOut
} from 'lucide-react';
import { FeedbackModal } from '../../components/common/FeedbackModal';
import { Footer } from '../../components/home/Footer';
import logoImg from '../../assets/logo-active-age.png';
import {
    type DoctorDossierStatusResponse,
    type DocumentType,
    type DocumentDefinition,
    DOSSIER_DOCUMENT_DEFINITIONS
} from '../../types/dossier';

export function DossieCredenciamento() {
    const navigate = useNavigate();
    const [dossier, setDossier] = useState<DoctorDossierStatusResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploadingType, setUploadingType] = useState<DocumentType | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<number>(1);

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch (err) {
            console.error('Erro ao efetuar logout:', err);
        } finally {
            navigate('/login');
        }
    };

    // Form de Dados Bancários
    const [bankForm, setBankForm] = useState({
        bankName: '',
        agency: '',
        accountNumber: '',
        accountType: 'CORRENTE',
        pixKey: '',
        pixKeyType: 'CPF',
        cnpj: '',
        corporateName: '',
    });
    const [savingFinancial, setSavingFinancial] = useState(false);

    // Modal de Feedback
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
        try {
            const res = await fetch('/api/doctor/dossier/status');
            if (res.ok) {
                const data: DoctorDossierStatusResponse = await res.json();
                setDossier(data);
                if (data.financialInfo) {
                    setBankForm({
                        bankName: data.financialInfo.bankName || '',
                        agency: data.financialInfo.agency || '',
                        accountNumber: data.financialInfo.accountNumber || '',
                        accountType: data.financialInfo.accountType || 'CORRENTE',
                        pixKey: data.financialInfo.pixKey || '',
                        pixKeyType: data.financialInfo.pixKeyType || 'CPF',
                        cnpj: data.financialInfo.cnpj || '',
                        corporateName: data.financialInfo.corporateName || '',
                    });
                }
            } else {
                setFeedback({
                    isOpen: true,
                    type: 'error',
                    title: 'Falha ao carregar dossiê',
                    message: 'Não foi possível carregar as informações do seu credenciamento.',
                });
            }
        } catch (err) {
            console.error('Erro ao buscar status do dossiê:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDossier();
    }, []);

    const handleFileUpload = async (docType: DocumentType, file: File) => {
        if (!file) return;

        if (file.size > 10 * 1024 * 1024) {
            setFeedback({
                isOpen: true,
                type: 'warning',
                title: 'Arquivo muito pesado',
                message: 'O documento excede o limite máximo permitido de 10MB.',
            });
            return;
        }

        setUploadingType(docType);
        const formData = new FormData();
        formData.append('documentType', docType);
        formData.append('file', file);

        try {
            const res = await fetch('/api/doctor/documents/upload', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                await loadDossier();
                setFeedback({
                    isOpen: true,
                    type: 'success',
                    title: 'Documento Recebido!',
                    message: 'O arquivo foi salvo com sucesso no repositório seguro da Active Age.',
                });
            } else {
                const errData = await res.json().catch(() => ({}));
                setFeedback({
                    isOpen: true,
                    type: 'error',
                    title: 'Erro no Upload',
                    message: errData.message || 'Falha ao processar o arquivo.',
                });
            }
        } catch (err) {
            setFeedback({
                isOpen: true,
                type: 'error',
                title: 'Falha de Conexão',
                message: 'Não foi possível se comunicar com o servidor para enviar o documento.',
            });
        } finally {
            setUploadingType(null);
        }
    };

    const handleSaveFinancial = async (e: FormEvent) => {
        e.preventDefault();
        setSavingFinancial(true);

        try {
            const res = await fetch('/api/doctor/financial-info', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bankForm),
            });

            if (res.ok) {
                await loadDossier();
                setFeedback({
                    isOpen: true,
                    type: 'success',
                    title: 'Dados Financeiros Salvos!',
                    message: 'Suas informações bancárias para Split Direto foram atualizadas com sucesso.',
                });
            } else {
                const errData = await res.json().catch(() => ({}));
                setFeedback({
                    isOpen: true,
                    type: 'error',
                    title: 'Erro ao Salvar',
                    message: errData.message || 'Verifique os campos informados.',
                });
            }
        } catch (err) {
            setFeedback({
                isOpen: true,
                type: 'error',
                title: 'Falha de Conexão',
                message: 'Não foi possível salvar os dados bancários.',
            });
        } finally {
            setSavingFinancial(false);
        }
    };

    const handleSubmitDossier = async () => {
        setSubmitting(true);
        try {
            const res = await fetch('/api/doctor/dossier/submit', {
                method: 'POST',
            });

            if (res.ok) {
                await loadDossier();
                setFeedback({
                    isOpen: true,
                    type: 'success',
                    title: 'Dossiê Submetido para Auditoria!',
                    message: 'Seus documentos e informações foram encaminhados para a equipe de compliance médico. Você receberá o retorno em até 48 horas úteis.',
                });
            } else {
                const errData = await res.json().catch(() => ({}));
                setFeedback({
                    isOpen: true,
                    type: 'warning',
                    title: 'Pendências no Dossiê',
                    message: errData.message || 'Complete todos os documentos obrigatórios antes de submeter.',
                });
            }
        } catch (err) {
            setFeedback({
                isOpen: true,
                type: 'error',
                title: 'Falha na Submissão',
                message: 'Ocorreu um erro ao enviar o dossiê para auditoria.',
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-grow flex items-center justify-center p-12 bg-brand-pot/5">
                <div className="flex items-center gap-3 text-brown-dark font-bold text-lg">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-mint" />
                    Carregando Dossiê de Credenciamento...
                </div>
            </div>
        );
    }

    if (!dossier) return null;

    const renderPillarDocs = (pillarNumber: number) => {
        const pillarDocs = DOSSIER_DOCUMENT_DEFINITIONS.filter(d => d.pillar === pillarNumber);

        return (
            <div className="grid md:grid-cols-2 gap-6">
                {pillarDocs.map((def: DocumentDefinition) => {
                    const uploadedInfo = dossier.documents[def.type];
                    const isUploading = uploadingType === def.type;

                    return (
                        <div
                            key={def.type}
                            className={`p-6 rounded-2xl border transition-all ${
                                uploadedInfo
                                    ? 'bg-white border-green-200 shadow-sm'
                                    : def.mandatory
                                    ? 'bg-white border-brand-pot/60 hover:border-brand-mint'
                                    : 'bg-brand-pot/5 border-dashed border-brand-pot/40'
                            }`}
                        >
                            <div className="flex justify-between items-start gap-3 mb-3">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-brown-dark text-base">{def.title}</h4>
                                        {def.mandatory ? (
                                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                                                Obrigatório
                                            </span>
                                        ) : (
                                            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                                                Opcional
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-brown mt-1">{def.description}</p>
                                </div>

                                {uploadedInfo ? (
                                    <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2.5 py-1 rounded-full shrink-0">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Enviado
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full shrink-0">
                                        <Clock className="w-3.5 h-3.5" /> Pendente
                                    </span>
                                )}
                            </div>

                            <p className="text-[11px] text-brown/80 mb-4">
                                Formatos: <span className="font-medium text-brown-dark">{def.allowedFormats}</span>
                            </p>

                            {uploadedInfo && (
                                <div className="mb-4 p-3 bg-brand-pot/10 rounded-xl flex items-center justify-between text-xs text-brown-dark">
                                    <span className="truncate max-w-[200px] font-medium" title={uploadedInfo.originalFileName}>
                                        📄 {uploadedInfo.originalFileName}
                                    </span>
                                    <a
                                        href={`/api/doctor/documents/${def.type}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-brand-mint font-bold hover:underline flex items-center gap-1 shrink-0 ml-2"
                                    >
                                        <Eye className="w-3.5 h-3.5" /> Ver
                                    </a>
                                </div>
                            )}

                            {/* Botão de Upload */}
                            {dossier.dossierStatus !== 'APPROVED' && (
                                <label className="cursor-pointer block">
                                    <input
                                        type="file"
                                        className="sr-only"
                                        disabled={isUploading}
                                        accept={def.type === 'ETHICAL_CERTIFICATE' ? '.pdf' : '.pdf,image/png,image/jpeg,image/jpg'}
                                        onChange={(e) => {
                                            if (e.target.files && e.target.files[0]) {
                                                handleFileUpload(def.type, e.target.files[0]);
                                            }
                                        }}
                                    />
                                    <div
                                        className={`w-full py-3 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 border transition-all ${
                                            isUploading
                                                ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed'
                                                : uploadedInfo
                                                ? 'bg-brand-pot/10 hover:bg-brand-pot/20 text-brown-dark border-brand-pot/30'
                                                : 'bg-brand-mint hover:bg-brand-mint/80 text-brown-dark border-transparent shadow-sm'
                                        }`}
                                    >
                                        {isUploading ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" /> Enviando...
                                            </>
                                        ) : (
                                            <>
                                                <UploadCloud className="w-4 h-4" />
                                                {uploadedInfo ? 'Substituir Arquivo' : 'Selecionar Documento'}
                                            </>
                                        )}
                                    </div>
                                </label>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 text-brown-dark flex flex-col font-sans">
            {/* Header Profissional do Dossiê */}
            <header className="bg-white border-b border-brand-pot/40 shadow-xs sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-4 sm:gap-6">
                        <Link to="/" title="Página Inicial Active Age" className="shrink-0 flex items-center">
                            <img src={logoImg} alt="Active Age" className="h-14 sm:h-16 w-auto object-contain" />
                        </Link>
                        <div className="h-8 w-px bg-brand-pot/40 hidden sm:block" />
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-xl bg-brand-mint/20 flex items-center justify-center text-brown-dark shadow-inner shrink-0">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                            <div>
                                <span className="text-[11px] font-bold uppercase tracking-wider text-brand-orange block">
                                    Credenciamento Médico • CFM
                                </span>
                                <h1 className="text-base sm:text-lg font-black text-brown-dark">
                                    Dossiê de Habilitação Ética
                                </h1>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link
                            to="/medico/dashboard"
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-brand-pot bg-white hover:bg-brand-pot/20 text-brown-dark text-xs sm:text-sm font-bold transition-all shadow-xs"
                        >
                            <ArrowLeft className="w-4 h-4 text-brand-orange" />
                            <span className="hidden sm:inline">Voltar ao Consultório</span>
                            <span className="sm:hidden">Voltar</span>
                        </Link>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs sm:text-sm font-bold transition-all shadow-xs"
                            title="Encerrar sessão segura"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">Encerrar Sessão</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-grow bg-brand-pot/5 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">
                
                {/* Header do Dossiê */}
                <div className="bg-white rounded-3xl p-8 border border-brand-pot/40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <span className="p-2.5 rounded-2xl bg-brand-mint/20 text-brown-dark">
                                <ShieldCheck className="w-7 h-7" />
                            </span>
                            <div>
                                <h1 className="text-2xl md:text-3xl font-bold text-brown-dark">
                                    Dossiê de Credenciamento Médico
                                </h1>
                                <p className="text-sm text-brown">
                                    Dr(a). {dossier.fullName} • CRM {dossier.crm}/{dossier.ufCrm}
                                </p>
                            </div>
                        </div>
                        <p className="text-xs text-brown max-w-xl leading-relaxed mt-2">
                            Em conformidade com a <strong>Resolução CFM nº 2.314/2022</strong> e a LGPD, o envio destes documentos é indispensável para habilitar o seu consultório virtual e liberar a vitrine de teleconsultas.
                        </p>
                    </div>

                    <div className="shrink-0 flex flex-col items-start md:items-end gap-2">
                        {dossier.dossierStatus === 'PENDING_DOCS' && (
                            <span className="px-4 py-2 rounded-xl text-sm font-bold bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-2">
                                <Clock className="w-4 h-4" /> Pré-Cadastro (Pendente de Docs)
                            </span>
                        )}
                        {dossier.dossierStatus === 'UNDER_REVIEW' && (
                            <span className="px-4 py-2 rounded-xl text-sm font-bold bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-2 animate-pulse">
                                <Clock className="w-4 h-4" /> Em Análise de Compliance
                            </span>
                        )}
                        {dossier.dossierStatus === 'DOCS_REJECTED' && (
                            <span className="px-4 py-2 rounded-xl text-sm font-bold bg-red-100 text-red-800 border border-red-200 flex items-center gap-2">
                                <XCircle className="w-4 h-4" /> Dossiê Requer Ajustes
                            </span>
                        )}
                        {dossier.dossierStatus === 'APPROVED' && (
                            <span className="px-4 py-2 rounded-xl text-sm font-bold bg-green-100 text-green-800 border border-green-200 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" /> Credenciamento Homologado
                            </span>
                        )}

                        <div className="text-xs text-brown">
                            Progresso Obrigatório: <strong>{dossier.mandatoryUploadedCount} de {dossier.totalMandatoryCount} itens</strong>
                        </div>
                        <div className="w-48 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-brand-mint transition-all duration-500"
                                style={{
                                    width: `${(dossier.mandatoryUploadedCount / dossier.totalMandatoryCount) * 100}%`,
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Banner de Reprovação (se houver) */}
                {dossier.dossierStatus === 'DOCS_REJECTED' && dossier.rejectionReason && (
                    <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 text-red-800 flex items-start gap-4">
                        <AlertCircle className="w-6 h-6 shrink-0 mt-0.5 text-red-600" />
                        <div>
                            <h3 className="font-bold text-lg mb-1">Parecer da Auditoria de Conformidade:</h3>
                            <p className="text-sm leading-relaxed">{dossier.rejectionReason}</p>
                            <p className="text-xs text-red-600 mt-2 font-medium">
                                Por favor, substitua os documentos inconsistentes abaixo e clique novamente em "Submeter Dossiê para Auditoria".
                            </p>
                        </div>
                    </div>
                )}

                {/* Banner de Homologação (se aprovado) */}
                {dossier.dossierStatus === 'APPROVED' && (
                    <div className="bg-green-50 border-2 border-green-300 rounded-2xl p-6 text-green-800 flex items-start gap-4">
                        <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5 text-green-600" />
                        <div>
                            <h3 className="font-bold text-lg mb-1">Parabéns! Seu Credenciamento foi Homologado com Sucesso.</h3>
                            <p className="text-sm leading-relaxed">
                                Suas credenciais foram conferidas perante o CRM e as normas do CFM. Seu consultório virtual está totalmente liberado com <strong>15 dias de teste grátis</strong> ativados.
                            </p>
                        </div>
                    </div>
                )}

                {/* Abas dos 4 Pilares */}
                <div className="bg-white rounded-3xl border border-brand-pot/40 shadow-sm overflow-hidden">
                    <div className="flex border-b border-brand-pot/30 overflow-x-auto scrollbar-none">
                        <button
                            type="button"
                            onClick={() => setActiveTab(1)}
                            className={`flex items-center gap-2 px-6 py-4 font-bold text-sm border-b-2 whitespace-nowrap transition-colors ${
                                activeTab === 1
                                    ? 'border-brand-mint text-brown-dark bg-brand-mint/10'
                                    : 'border-transparent text-brown hover:text-brown-dark'
                            }`}
                        >
                            <Award className="w-4 h-4" />
                            Pilar 1: Habilitação & ID
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab(2)}
                            className={`flex items-center gap-2 px-6 py-4 font-bold text-sm border-b-2 whitespace-nowrap transition-colors ${
                                activeTab === 2
                                    ? 'border-brand-mint text-brown-dark bg-brand-mint/10'
                                    : 'border-transparent text-brown hover:text-brown-dark'
                            }`}
                        >
                            <ShieldCheck className="w-4 h-4" />
                            Pilar 2: Regularidade Ética
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab(3)}
                            className={`flex items-center gap-2 px-6 py-4 font-bold text-sm border-b-2 whitespace-nowrap transition-colors ${
                                activeTab === 3
                                    ? 'border-brand-mint text-brown-dark bg-brand-mint/10'
                                    : 'border-transparent text-brown hover:text-brown-dark'
                            }`}
                        >
                            <Building2 className="w-4 h-4" />
                            Pilar 3: Telemedicina (ICP-Brasil)
                        </button>
                        <button
                            type="button"
                            onClick={() => setActiveTab(4)}
                            className={`flex items-center gap-2 px-6 py-4 font-bold text-sm border-b-2 whitespace-nowrap transition-colors ${
                                activeTab === 4
                                    ? 'border-brand-mint text-brown-dark bg-brand-mint/10'
                                    : 'border-transparent text-brown hover:text-brown-dark'
                            }`}
                        >
                            <CreditCard className="w-4 h-4" />
                            Pilar 4: Dados Financeiros & Split
                        </button>
                    </div>

                    <div className="p-8">
                        {activeTab === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-brown-dark">1. Habilitação Profissional e Identificação Civil</h3>
                                    <p className="text-sm text-brown">Comprovação da titulação médica e identificação oficial perante os órgãos de classe.</p>
                                </div>
                                {renderPillarDocs(1)}
                            </div>
                        )}

                        {activeTab === 2 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-brown-dark">2. Regularidade Ético-Profissional (CRM)</h3>
                                    <p className="text-sm text-brown">Atestado emitido pelo Conselho Regional de Medicina de que sua inscrição está ativa e sem interdições.</p>
                                </div>
                                {renderPillarDocs(2)}
                            </div>
                        )}

                        {activeTab === 3 && (
                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-bold text-brown-dark">3. Requisitos Técnicos para Telemedicina (Resolução CFM nº 2.314/2022)</h3>
                                    <p className="text-sm text-brown">Exigência legal de Certificado Digital ICP-Brasil (A1/A3) e ciência de prática de telemedicina no CRM.</p>
                                </div>
                                {renderPillarDocs(3)}
                            </div>
                        )}

                        {activeTab === 4 && (
                            <div className="space-y-8">
                                <div>
                                    <h3 className="text-lg font-bold text-brown-dark">4. Dados Cadastrais e Financeiros (Split Direto)</h3>
                                    <p className="text-sm text-brown">
                                        Em cumprimento à vedação de dicotomia do CFM, seus honorários liquidam diretamente nesta conta via Split de Pagamento do gateway, sem trânsito pela conta do Active Age.
                                    </p>
                                </div>

                                {/* Uploads do Pilar 4 */}
                                {renderPillarDocs(4)}

                                {/* Formulário Bancário */}
                                <form onSubmit={handleSaveFinancial} className="p-6 bg-brand-pot/5 rounded-2xl border border-brand-pot/40 space-y-6">
                                    <h4 className="font-bold text-brown-dark text-base flex items-center gap-2 border-b border-brand-pot/30 pb-3">
                                        <CreditCard className="w-5 h-5 text-brand-mint" />
                                        Conta de Liquidação e Chave PIX (Titularidade Médica ou PJ)
                                    </h4>

                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-brown-dark mb-1">Banco *</label>
                                            <input
                                                type="text"
                                                placeholder="Ex: Itaú (341)"
                                                required
                                                value={bankForm.bankName}
                                                onChange={(e) => setBankForm({ ...bankForm, bankName: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-brand-pot/80 focus:border-brand-mint outline-none text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-brown-dark mb-1">Agência (com dígito) *</label>
                                            <input
                                                type="text"
                                                placeholder="Ex: 1234"
                                                required
                                                value={bankForm.agency}
                                                onChange={(e) => setBankForm({ ...bankForm, agency: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-brand-pot/80 focus:border-brand-mint outline-none text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-brown-dark mb-1">Número da Conta *</label>
                                            <input
                                                type="text"
                                                placeholder="Ex: 56789-0"
                                                required
                                                value={bankForm.accountNumber}
                                                onChange={(e) => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-brand-pot/80 focus:border-brand-mint outline-none text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-xs font-bold text-brown-dark mb-1">Tipo de Conta *</label>
                                            <select
                                                value={bankForm.accountType}
                                                onChange={(e) => setBankForm({ ...bankForm, accountType: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-brand-pot/80 focus:border-brand-mint outline-none text-sm bg-white"
                                            >
                                                <option value="CORRENTE">Conta Corrente</option>
                                                <option value="POUPANCA">Conta Poupança</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-brown-dark mb-1">Tipo de Chave PIX *</label>
                                            <select
                                                value={bankForm.pixKeyType}
                                                onChange={(e) => setBankForm({ ...bankForm, pixKeyType: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-brand-pot/80 focus:border-brand-mint outline-none text-sm bg-white"
                                            >
                                                <option value="CPF">CPF</option>
                                                <option value="CNPJ">CNPJ</option>
                                                <option value="EMAIL">E-mail</option>
                                                <option value="TELEFONE">Telefone</option>
                                                <option value="ALEATORIA">Chave Aleatória</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-brown-dark mb-1">Chave PIX *</label>
                                            <input
                                                type="text"
                                                placeholder="Insira sua chave PIX"
                                                required
                                                value={bankForm.pixKey}
                                                onChange={(e) => setBankForm({ ...bankForm, pixKey: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-brand-pot/80 focus:border-brand-mint outline-none text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid md:grid-cols-2 gap-6 pt-2 border-t border-brand-pot/30">
                                        <div>
                                            <label className="block text-xs font-bold text-brown-dark mb-1">CNPJ da PJ Médica (Opcional)</label>
                                            <input
                                                type="text"
                                                placeholder="Ex: 00.000.000/0001-00"
                                                value={bankForm.cnpj}
                                                onChange={(e) => setBankForm({ ...bankForm, cnpj: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-brand-pot/80 focus:border-brand-mint outline-none text-sm"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-brown-dark mb-1">Razão Social (se PJ)</label>
                                            <input
                                                type="text"
                                                placeholder="Ex: Clínica Geriátrica Silva Ltda"
                                                value={bankForm.corporateName}
                                                onChange={(e) => setBankForm({ ...bankForm, corporateName: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-xl border border-brand-pot/80 focus:border-brand-mint outline-none text-sm"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-2">
                                        <button
                                            type="submit"
                                            disabled={savingFinancial}
                                            className="px-6 py-3 bg-brand-mint hover:bg-brand-mint/80 text-brown-dark font-bold text-sm rounded-xl transition-all flex items-center gap-2 shadow-sm disabled:opacity-70"
                                        >
                                            {savingFinancial ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" /> Salvando...
                                                </>
                                            ) : (
                                                'Salvar Dados Financeiros'
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}
                    </div>
                </div>

                {/* Barra Inferior de Submissão */}
                {dossier.dossierStatus !== 'APPROVED' && dossier.dossierStatus !== 'UNDER_REVIEW' && (
                    <div className="bg-white rounded-3xl p-6 border border-brand-pot/40 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div>
                            <h4 className="font-bold text-brown-dark text-base">Pronto para submeter seu Dossiê?</h4>
                            <p className="text-xs text-brown">
                                Certifique-se de ter anexado os 7 documentos obrigatórios e preenchido os dados bancários.
                            </p>
                        </div>

                        <button
                            type="button"
                            onClick={handleSubmitDossier}
                            disabled={!dossier.canSubmit || submitting}
                            className={`px-8 py-4 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                                dossier.canSubmit && !submitting
                                    ? 'bg-brand-mint hover:bg-brand-mint/80 text-brown-dark shadow-md hover:scale-[1.02]'
                                    : 'bg-gray-200 text-gray-500 cursor-not-allowed opacity-70'
                            }`}
                        >
                            {submitting ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" /> Submetendo...
                                </>
                            ) : (
                                <>
                                    Submeter Dossiê para Auditoria <ChevronRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                )}

            </div>

            <FeedbackModal
                isOpen={feedback.isOpen}
                type={feedback.type}
                title={feedback.title}
                message={feedback.message}
                onConfirm={() => setFeedback({ ...feedback, isOpen: false })}
            />
            </main>
            
            <Footer />
        </div>
    );
}
