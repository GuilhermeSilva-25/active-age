import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
    FileHeart,
    ArrowLeft,
    UploadCloud,
    FileText,
    Calendar,
    Eye,
    Trash2,
    ShieldCheck,
    Loader2,
    Activity,
    Image as ImageIcon,
    HeartPulse,
    FolderOpen
} from 'lucide-react';
import logoImg from '../../assets/logo-active-age.png';
import { Footer } from '../../components/home/Footer';
import { FeedbackModal } from '../../components/common/FeedbackModal';
import { UploadExamModal } from '../../components/paciente/UploadExamModal';
import type { FeedbackModalType } from '../../components/common/FeedbackModal';

interface PatientExamItem {
    id: string;
    patientId: string;
    title: string;
    category: 'LABORATORIAL' | 'IMAGEM' | 'CARDIOLOGICO' | 'OUTROS';
    categoryDescription: string;
    examDate: string;
    notes?: string;
    originalFileName: string;
    contentType: string;
    sizeBytes: number;
    formattedSize: string;
    uploadedAt: string;
}

const CATEGORIAS_FILTRO = [
    { key: '', label: 'Todos os Exames' },
    { key: 'LABORATORIAL', label: 'Laboratoriais' },
    { key: 'IMAGEM', label: 'Imagens' },
    { key: 'CARDIOLOGICO', label: 'Cardiológicos' },
    { key: 'OUTROS', label: 'Outros' },
];

export function MeusExames() {
    const navigate = useNavigate();

    const [exams, setExams] = useState<PatientExamItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string>('');

    // Modal de Upload
    const [isUploadOpen, setIsUploadOpen] = useState(false);

    // Modal de Confirmação de Exclusão
    const [examToDelete, setExamToDelete] = useState<PatientExamItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Modal de Feedback Acessível
    const [feedback, setFeedback] = useState<{
        isOpen: boolean;
        type: FeedbackModalType;
        title: string;
        message: string;
    }>({
        isOpen: false,
        type: 'info',
        title: '',
        message: '',
    });

    const loadExams = async () => {
        try {
            setLoading(true);
            const query = selectedCategory ? `?category=${selectedCategory}` : '';
            const response = await fetch(`/api/patient/exams${query}`);
            if (response.ok) {
                const data: PatientExamItem[] = await response.json();
                setExams(data);
            } else if (response.status === 401) {
                navigate('/login');
            } else {
                console.error('Falha ao carregar lista de exames');
            }
        } catch (err) {
            console.error('Erro na requisição de exames:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadExams();
    }, [selectedCategory]);

    const handleConfirmDelete = async () => {
        if (!examToDelete) return;

        try {
            setIsDeleting(true);
            const response = await fetch(`/api/patient/exams/${examToDelete.id}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setExams((prev) => prev.filter((item) => item.id !== examToDelete.id));
                setExamToDelete(null);
                setFeedback({
                    isOpen: true,
                    type: 'success',
                    title: 'Exame Removido',
                    message: 'O exame foi removido permanentemente do seu cofre de saúde com sucesso.',
                });
            } else {
                setFeedback({
                    isOpen: true,
                    type: 'error',
                    title: 'Falha na Exclusão',
                    message: 'Não foi possível excluir o exame neste momento. Tente novamente mais tarde.',
                });
            }
        } catch (err) {
            console.error('Erro ao excluir exame:', err);
            setFeedback({
                isOpen: true,
                type: 'error',
                title: 'Erro de Comunicação',
                message: 'Ocorreu um erro ao comunicar com o servidor.',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'LABORATORIAL':
                return <Activity className="w-5 h-5 text-emerald-600" />;
            case 'IMAGEM':
                return <ImageIcon className="w-5 h-5 text-blue-600" />;
            case 'CARDIOLOGICO':
                return <HeartPulse className="w-5 h-5 text-red-600" />;
            case 'OUTROS':
            default:
                return <FileText className="w-5 h-5 text-amber-600" />;
        }
    };

    const getCategoryBadgeClass = (category: string) => {
        switch (category) {
            case 'LABORATORIAL':
                return 'bg-emerald-50 text-emerald-800 border-emerald-200';
            case 'IMAGEM':
                return 'bg-blue-50 text-blue-800 border-blue-200';
            case 'CARDIOLOGICO':
                return 'bg-red-50 text-red-800 border-red-200';
            case 'OUTROS':
            default:
                return 'bg-amber-50 text-amber-800 border-amber-200';
        }
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        try {
            const parts = dateStr.split('-');
            if (parts.length === 3) {
                return `${parts[2]}/${parts[1]}/${parts[0]}`;
            }
            return new Date(dateStr).toLocaleDateString('pt-BR');
        } catch {
            return dateStr;
        }
    };

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-brown-dark font-sans flex flex-col justify-between">
            {/* Header com Navegação */}
            <header className="bg-white border-b border-brand-pot/40 sticky top-0 z-40 shadow-xs">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-24 flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-6">
                        <Link to="/paciente/dashboard" className="flex items-center gap-2 group" title="Ir para o Dashboard">
                            <img
                                src={logoImg}
                                alt="Active Age"
                                className="h-10 sm:h-14 md:h-16 w-auto object-contain transition-transform group-hover:scale-105"
                            />
                        </Link>

                        <div className="h-8 w-px bg-brand-pot/40 hidden sm:block" />

                        <div className="hidden sm:block">
                            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block">
                                Cofre Digital de Saúde • Prontuário Ético
                            </span>
                            <h1 className="text-base sm:text-lg font-black text-brown-dark">
                                Meus Exames e Laudos Prévios
                            </h1>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate('/paciente/dashboard')}
                        className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl border border-brand-pot bg-white hover:bg-brand-pot/20 text-brown-dark text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 text-brand-orange" />
                        <span>Voltar ao Dashboard</span>
                    </button>
                </div>
            </header>

            {/* Conteúdo Principal */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 sm:mt-8 mb-16 flex-grow w-full space-y-6 sm:space-y-8">
                {/* Banner de Apresentação do Cofre */}
                <div className="bg-gradient-to-r from-blue-50 via-white to-indigo-50 rounded-2xl sm:rounded-3xl p-5 sm:p-8 border border-blue-200/60 shadow-sm relative overflow-hidden">
                    <div className="max-w-3xl space-y-3">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100/70 text-blue-800 text-xs sm:text-sm font-bold">
                            <ShieldCheck className="w-4 h-4 text-blue-700" />
                            Cofre Criptografado • LGPD Art. 11
                        </span>
                        <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-brown-dark tracking-tight">
                            Seus exames organizados e protegidos em um só lugar.
                        </h2>
                        <p className="text-brown-light text-sm sm:text-base md:text-lg leading-relaxed">
                            Anexe laudos de sangue, imagens e relatórios médicos antigos. Seus médicos geriatras terão acesso aos documentos para planejar e enriquecer o seu atendimento.
                        </p>
                    </div>

                    {/* Botão de Ação Rápida */}
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setIsUploadOpen(true)}
                            className="px-5 sm:px-6 py-3.5 rounded-2xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black text-sm sm:text-base shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer"
                        >
                            <UploadCloud className="w-5 h-5" />
                            <span>Enviar Novo Exame ou Laudo</span>
                        </button>
                    </div>
                </div>

                {/* Filtros por Categoria Clínica */}
                <div className="bg-white rounded-2xl p-4 sm:p-5 border border-brand-pot/40 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                        <FolderOpen className="w-5 h-5 text-brand-orange" />
                        <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-brown-dark">
                            Categorias Clínicas:
                        </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        {CATEGORIAS_FILTRO.map((cat) => {
                            const isSelected = selectedCategory === cat.key;
                            return (
                                <button
                                    key={cat.key}
                                    type="button"
                                    onClick={() => setSelectedCategory(cat.key)}
                                    className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-2xs cursor-pointer ${
                                        isSelected
                                            ? 'bg-blue-700 text-white ring-2 ring-blue-700/30 scale-102'
                                            : 'bg-white border border-brand-pot/50 text-brown-dark hover:bg-blue-50/50'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Contador de Resultados */}
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-brown-light px-1">
                    <span>
                        {loading ? (
                            'Consultando seu cofre de exames...'
                        ) : (
                            <>
                                Mostrando <strong className="text-brown-dark">{exams.length}</strong>{' '}
                                {exams.length === 1 ? 'documento clínico salvo' : 'documentos clínicos salvos'}
                            </>
                        )}
                    </span>
                    <span className="text-[11px] uppercase tracking-wider text-blue-700 hidden sm:inline">
                        Resolução CFM nº 2.314/2022 • Prontuário Integrado
                    </span>
                </div>

                {/* Grid de Cards de Exames */}
                {loading ? (
                    <div className="py-20 flex flex-col items-center justify-center text-brown-light space-y-3">
                        <Loader2 className="w-10 h-10 text-brand-orange animate-spin" />
                        <p className="text-sm sm:text-base font-bold">Carregando exames do cofre seguro...</p>
                    </div>
                ) : exams.length === 0 ? (
                    /* Empty State */
                    <div className="bg-white rounded-3xl p-8 sm:p-12 border-2 border-dashed border-brand-pot/60 text-center space-y-4 max-w-xl mx-auto shadow-xs">
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
                            <FileHeart className="w-8 h-8" />
                        </div>
                        <h3 className="text-xl sm:text-2xl font-black text-brown-dark">
                            Nenhum exame encontrado no cofre
                        </h3>
                        <p className="text-brown-light text-sm sm:text-base leading-relaxed">
                            {selectedCategory
                                ? 'Nenhum exame cadastrado nesta categoria. Experimente selecionar "Todos os Exames" ou enviar um novo laudo.'
                                : 'Você ainda não enviou nenhum laudo ou exame antigo. Ter seus exames prévios aqui agiliza o diagnóstico do médico.'}
                        </p>
                        <button
                            type="button"
                            onClick={() => setIsUploadOpen(true)}
                            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-brand-orange text-white font-bold text-sm shadow-md hover:bg-brand-orange/90 transition-all cursor-pointer"
                        >
                            <UploadCloud className="w-4 h-4" />
                            Enviar Primeiro Exame
                        </button>
                    </div>
                ) : (
                    /* Grid de Exames */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                        {exams.map((exam) => (
                            <div
                                key={exam.id}
                                className="bg-white rounded-2xl sm:rounded-3xl border border-brand-pot/50 hover:border-blue-400 shadow-xs hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                            >
                                <div className="p-5 sm:p-6 space-y-3.5">
                                    {/* Cabeçalho do Card */}
                                    <div className="flex items-start gap-3.5">
                                        <div className="w-12 h-12 rounded-xl bg-gray-50 border border-brand-pot/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                                            {getCategoryIcon(exam.category)}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <span
                                                className={`inline-block px-2.5 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wider mb-1 ${getCategoryBadgeClass(
                                                    exam.category
                                                )}`}
                                            >
                                                {exam.categoryDescription}
                                            </span>
                                            <h4 className="text-base sm:text-lg font-black text-brown-dark truncate" title={exam.title}>
                                                {exam.title}
                                            </h4>
                                        </div>
                                    </div>

                                    {/* Metadados: Data de Realização e Envio */}
                                    <div className="space-y-1.5 text-xs text-brown-light font-medium pt-1 border-t border-brand-pot/30">
                                        <div className="flex items-center justify-between">
                                            <span className="flex items-center gap-1">
                                                <Calendar className="w-3.5 h-3.5 text-brand-orange" />
                                                Data do Exame:
                                            </span>
                                            <strong className="text-brown-dark">{formatDate(exam.examDate)}</strong>
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <span>Arquivo:</span>
                                            <span className="font-semibold text-brown-dark truncate max-w-[170px]" title={exam.originalFileName}>
                                                {exam.originalFileName} ({exam.formattedSize})
                                            </span>
                                        </div>
                                    </div>

                                    {/* Observações Clínicas do Paciente */}
                                    {exam.notes && (
                                        <p className="text-xs text-brown-dark bg-gray-50/80 p-2.5 rounded-xl border border-gray-100 line-clamp-2 leading-relaxed">
                                            <strong>Nota:</strong> {exam.notes}
                                        </p>
                                    )}
                                </div>

                                {/* Rodapé com Ações */}
                                <div className="p-3.5 sm:p-4 bg-gray-50/80 border-t border-brand-pot/30 flex items-center justify-between gap-2">
                                    <a
                                        href={`/api/patient/exams/${exam.id}/download`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex-1 py-2 px-3 rounded-xl bg-blue-700 hover:bg-blue-800 text-white font-bold text-xs sm:text-sm text-center inline-flex items-center justify-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                                        title="Visualizar laudo em nova aba"
                                    >
                                        <Eye className="w-4 h-4" />
                                        <span>Visualizar Laudo</span>
                                    </a>

                                    <button
                                        type="button"
                                        onClick={() => setExamToDelete(exam)}
                                        className="p-2 rounded-xl text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 transition-colors cursor-pointer"
                                        title="Excluir exame"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>

            {/* Modal de Upload de Exame */}
            <UploadExamModal
                isOpen={isUploadOpen}
                onClose={() => setIsUploadOpen(false)}
                onSuccess={() => {
                    loadExams();
                    setFeedback({
                        isOpen: true,
                        type: 'success',
                        title: 'Exame Anexado com Sucesso!',
                        message: 'Seu exame já está protegido no seu cofre de saúde e pronto para consulta do seu médico.',
                    });
                }}
            />

            {/* Modal de Confirmação de Exclusão */}
            {examToDelete && (
                <FeedbackModal
                    isOpen={true}
                    type="warning"
                    title="Excluir Exame do Cofre?"
                    message={`Tem certeza de que deseja remover permanentemente o exame "${examToDelete.title}"? Esta ação não pode ser desfeita.`}
                    confirmText={isDeleting ? 'Excluindo...' : 'Sim, Excluir'}
                    cancelText="Cancelar"
                    showCancelButton={true}
                    isLoading={isDeleting}
                    onConfirm={handleConfirmDelete}
                    onCancel={() => setExamToDelete(null)}
                />
            )}

            {/* Modal de Feedback Geral */}
            <FeedbackModal
                isOpen={feedback.isOpen}
                type={feedback.type}
                title={feedback.title}
                message={feedback.message}
                onConfirm={() => setFeedback((prev) => ({ ...prev, isOpen: false }))}
            />

            <Footer />
        </div>
    );
}
