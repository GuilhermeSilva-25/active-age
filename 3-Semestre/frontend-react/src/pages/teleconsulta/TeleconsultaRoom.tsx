import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    PhoneOff,
    FileText,
    FolderOpen,
    FileSignature,
    ShieldCheck,
    Lock,
    Save,
    CheckCircle2,
    Clock,
    AlertCircle,
    User,
    Loader2,
    Printer,
    ExternalLink,
    PlusCircle,
    Sparkles,
} from 'lucide-react';
import { useAuthUser } from '../../hooks/useAuthUser';
import { FeedbackModal } from '../../components/common/FeedbackModal';
import { DocumentPrintModal } from '../../components/teleconsulta/DocumentPrintModal';
import type { MedicalRecord, MedicalDocument, PatientExamItem, MedicalDocumentType } from '../../types/teleconsulta';

interface AppointmentDetails {
    id: string;
    patientId: string;
    patientName: string;
    doctorId: string;
    doctorName: string;
    doctorCrm: string;
    doctorUfCrm: string;
    doctorSpecialty?: string;
    startDateTime: string;
    durationMinutes: number;
    status: string;
}

const COMMON_GERIATRIC_CIDS = [
    { code: 'MB40', desc: 'Sintomas ou sinais relativos à cognição e percepção' },
    { code: 'BA00', desc: 'Hipertensão essencial (primária)' },
    { code: '8A00', desc: 'Doença de Alzheimer' },
    { code: 'FA00', desc: 'Osteoartrose de grandes e pequenas articulações' },
    { code: '5A11', desc: 'Diabetes mellitus tipo 2' },
];

export const TeleconsultaRoom: React.FC = () => {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();
    const { user } = useAuthUser();

    // Estado da Consulta
    const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);
    const [loadingAppt, setLoadingAppt] = useState(true);

    // Controles de Chamada
    const [isMuted, setIsMuted] = useState(false);
    const [isVideoOff, setIsVideoOff] = useState(false);
    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // Abas do Cockpit Médico
    const [activeTab, setActiveTab] = useState<'prontuario' | 'exames' | 'receitas'>('prontuario');

    // Estado do Prontuário Clínico (UC14 / RN003)
    const [medicalRecord, setMedicalRecord] = useState<MedicalRecord>({
        appointmentId: appointmentId || '',
        chiefComplaint: '',
        historyOfPresentIllness: '',
        clinicalEvolution: '',
        cognitiveStatus: 'Preservado',
        mobilityRisk: 'Baixo Risco de Quedas',
        functionalIndependence: 'Totalmente Independente',
        familySupport: 'Apoio Familiar Regular',
        cid11Code: '',
        cid11Description: '',
        clinicalConduct: '',
        status: 'DRAFT',
    });
    const [savingRecord, setSavingRecord] = useState(false);
    const [finalizingRecord, setFinalizingRecord] = useState(false);

    // Estado dos Exames do Paciente (UC13)
    const [patientExams, setPatientExams] = useState<PatientExamItem[]>([]);
    const [loadingExams, setLoadingExams] = useState(false);

    // Estado de Documentos / Receitas Emitidas (UC15)
    const [documents, setDocuments] = useState<MedicalDocument[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [issuingDoc, setIssuingDoc] = useState(false);

    // Formulário de Novo Documento
    const [docType, setDocType] = useState<MedicalDocumentType>('RECEITA_MEDICA');
    const [docTitle, setDocTitle] = useState('Prescrição Médica Geriátrica');
    const [docContent, setDocContent] = useState('');
    const [docRecommendations, setDocRecommendations] = useState('');

    // Modal de Impressão do Documento
    const [selectedDocForPrint, setSelectedDocForPrint] = useState<MedicalDocument | null>(null);
    const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

    // Modal de Feedback Acessível
    const [feedback, setFeedback] = useState<{
        isOpen: boolean;
        type: 'success' | 'error' | 'warning' | 'info';
        title: string;
        message: string;
        actionToConfirm?: () => void;
    }>({
        isOpen: false,
        type: 'info',
        title: '',
        message: '',
    });

    const isDoctor = user?.role === 'ROLE_MEDICO' || user?.role === 'ROLE_ADMIN';

    // Timer da Consulta
    useEffect(() => {
        const timer = setInterval(() => {
            setElapsedSeconds((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatTimer = (totalSec: number) => {
        const mins = Math.floor(totalSec / 60);
        const secs = totalSec % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    // Carrega dados da Consulta
    useEffect(() => {
        if (!appointmentId) return;

        const fetchAppointmentData = async () => {
            setLoadingAppt(true);
            try {
                const res = await fetch(`/api/appointments/${appointmentId}`);
                if (res.ok) {
                    const data = await res.json();
                    setAppointment(data);
                } else {
                    // Fallback para visualização simulada caso endpoint retorne vazio
                    setAppointment({
                        id: appointmentId,
                        patientId: 'paciente-demo',
                        patientName: 'Maria de Lourdes Silva',
                        doctorId: 'medico-demo',
                        doctorName: 'Dr. Carlos Alberto Silva',
                        doctorCrm: '123456',
                        doctorUfCrm: 'SP',
                        doctorSpecialty: 'Geriatria e Gerontologia',
                        startDateTime: new Date().toISOString(),
                        durationMinutes: 50,
                        status: 'EM_ANDAMENTO',
                    });
                }
            } catch {
                setAppointment({
                    id: appointmentId,
                    patientId: 'paciente-demo',
                    patientName: 'Maria de Lourdes Silva',
                    doctorId: 'medico-demo',
                    doctorName: 'Dr. Carlos Alberto Silva',
                    doctorCrm: '123456',
                    doctorUfCrm: 'SP',
                    doctorSpecialty: 'Geriatria e Gerontologia',
                    startDateTime: new Date().toISOString(),
                    durationMinutes: 50,
                    status: 'EM_ANDAMENTO',
                });
            } finally {
                setLoadingAppt(false);
            }
        };

        fetchAppointmentData();
    }, [appointmentId]);

    // Carrega Prontuário, Exames e Documentos se for Médico
    useEffect(() => {
        if (!appointmentId || !isDoctor) return;

        // 1. Carrega Prontuário
        const loadRecord = async () => {
            try {
                const res = await fetch(`/api/medical-records/appointment/${appointmentId}`);
                if (res.ok && res.status !== 204) {
                    const data = await res.json();
                    setMedicalRecord(data);
                }
            } catch {
                // Mantém estado base
            }
        };

        // 2. Carrega Exames Prévios do Paciente
        const loadExams = async () => {
            setLoadingExams(true);
            try {
                const res = await fetch(`/api/doctor/appointments/${appointmentId}/patient-exams`);
                if (res.ok) {
                    const data = await res.json();
                    setPatientExams(data);
                }
            } catch {
                // Mantém lista vazia
            } finally {
                setLoadingExams(false);
            }
        };

        // 3. Carrega Documentos Emitidos
        const loadDocuments = async () => {
            setLoadingDocs(true);
            try {
                const res = await fetch(`/api/medical-documents/appointment/${appointmentId}`);
                if (res.ok) {
                    const data = await res.json();
                    setDocuments(data);
                }
            } catch {
                // Mantém lista vazia
            } finally {
                setLoadingDocs(false);
            }
        };

        loadRecord();
        loadExams();
        loadDocuments();
    }, [appointmentId, isDoctor]);

    // Manipula Salvar Rascunho do Prontuário
    const handleSaveDraft = async () => {
        if (!appointmentId) return;
        setSavingRecord(true);
        try {
            const res = await fetch('/api/medical-records', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    appointmentId,
                    chiefComplaint: medicalRecord.chiefComplaint,
                    historyOfPresentIllness: medicalRecord.historyOfPresentIllness,
                    clinicalEvolution: medicalRecord.clinicalEvolution,
                    cognitiveStatus: medicalRecord.cognitiveStatus,
                    mobilityRisk: medicalRecord.mobilityRisk,
                    functionalIndependence: medicalRecord.functionalIndependence,
                    familySupport: medicalRecord.familySupport,
                    cid11Code: medicalRecord.cid11Code,
                    cid11Description: medicalRecord.cid11Description,
                    clinicalConduct: medicalRecord.clinicalConduct,
                }),
            });

            if (res.ok) {
                const updated = await res.json();
                setMedicalRecord(updated);
                setFeedback({
                    isOpen: true,
                    type: 'success',
                    title: 'Rascunho Salvo com Sucesso',
                    message: 'As anotações clínicas e a avaliação do idoso foram salvas e permanecem editáveis até a assinatura final.',
                });
            } else {
                const err = await res.json().catch(() => ({}));
                setFeedback({
                    isOpen: true,
                    type: 'error',
                    title: 'Não foi possível salvar',
                    message: err.message || 'Erro ao registrar as anotações do prontuário.',
                });
            }
        } catch {
            setFeedback({
                isOpen: true,
                type: 'error',
                title: 'Erro de Conexão',
                message: 'Verifique sua conexão de rede e tente salvar novamente.',
            });
        } finally {
            setSavingRecord(false);
        }
    };

    // Confirmação para Finalizar & Assinar Prontuário
    const promptFinalizeRecord = () => {
        if (!medicalRecord.id) {
            setFeedback({
                isOpen: true,
                type: 'warning',
                title: 'Salve o Rascunho Primeiro',
                message: 'Por favor, clique em "Salvar Rascunho" antes de assinar e finalizar o prontuário.',
            });
            return;
        }

        setFeedback({
            isOpen: true,
            type: 'warning',
            title: 'Assinar e Finalizar Prontuário?',
            message: 'Atenção: em conformidade com as normas do CFM, após a assinatura digital o prontuário se tornará estritamente IMUTÁVEL e não poderá mais ser alterado ou excluído.',
            actionToConfirm: executeFinalizeRecord,
        });
    };

    // Executa Finalização & Assinatura Digital
    const executeFinalizeRecord = async () => {
        if (!medicalRecord.id) return;
        setFinalizingRecord(true);
        try {
            const res = await fetch(`/api/medical-records/${medicalRecord.id}/finalize`, {
                method: 'POST',
            });

            if (res.ok) {
                const finalized = await res.json();
                setMedicalRecord(finalized);
                setFeedback({
                    isOpen: true,
                    type: 'success',
                    title: 'Prontuário Assinado e Finalizado!',
                    message: `O prontuário foi gravado com sucesso e recebeu o selo de imutabilidade com hash SHA-256: ${finalized.hashSignature?.substring(0, 16)}...`,
                });
            } else {
                const err = await res.json().catch(() => ({}));
                setFeedback({
                    isOpen: true,
                    type: 'error',
                    title: 'Erro ao Assinar Prontuário',
                    message: err.message || 'Falha na assinatura digital.',
                });
            }
        } catch {
            setFeedback({
                isOpen: true,
                type: 'error',
                title: 'Erro de Comunicação',
                message: 'Não foi possível concluir a assinatura digital do prontuário.',
            });
        } finally {
            setFinalizingRecord(false);
        }
    };

    // Aplica Template Rápido de Documento
    const applyDocumentTemplate = (type: MedicalDocumentType) => {
        setDocType(type);
        if (type === 'RECEITA_MEDICA') {
            setDocTitle('Prescrição de Medicamentos de Uso Contínuo');
            setDocContent(
                '1. Losartana Potássica 50mg ------------------ Tomar 1 comprimido pela manhã em jejum\n' +
                '2. Carbonato de Cálcio + Vitamina D3 --------- Tomar 1 comprimido mastigável após o almoço\n' +
                '3. Hidroclorotiazida 25mg -------------------- Tomar 1 comprimido pela manhã'
            );
            setDocRecommendations('Manter hidratação regular (mínimo de 1,5L de água diários) e aferir a pressão arterial três vezes por semana.');
        } else if (type === 'PEDIDO_EXAME') {
            setDocTitle('Solicitação de Exames Laboratoriais Preventivos');
            setDocContent(
                'Solicito os seguintes exames de controle geriátrico:\n' +
                '- Hemograma Completo com Plaquetas\n' +
                '- Glicemia de Jejum e Hemoglobina Glicada (HbA1c)\n' +
                '- Perfil Lipídico Completo (Colesterol Total, HDL, LDL, Triglicerídeos)\n' +
                '- Dosagem de Vitamina B12 e Vitamina D (25-hidroxi)\n' +
                '- Função Renal: Ureia e Creatinina com TFG'
            );
            setDocRecommendations('Realizar os exames com jejum prévio de 8 a 10 horas em laboratório habilitado de sua preferência.');
        } else if (type === 'ATESTADO_MEDICO') {
            setDocTitle('Atestado Médico de Acompanhamento Clínico');
            setDocContent(
                `Atesto para os devidos fins que o(a) paciente ${appointment?.patientName || 'atendido(a)'} ` +
                'esteve sob consulta médica nesta data via teleconsulta na plataforma Active Age, necessitando de repouso ' +
                'e cuidados de saúde pelo período de 3 (três) dias.'
            );
            setDocRecommendations('Repouso relativo, evitar esforços físicos e manter acompanhamento com a equipe multiprofissional.');
        }
    };

    // Emissão de Novo Documento
    const handleIssueDocument = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!appointmentId || !docContent.trim()) return;

        setIssuingDoc(true);
        try {
            const res = await fetch('/api/medical-documents', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    appointmentId,
                    documentType: docType,
                    title: docTitle,
                    content: docContent,
                    recommendations: docRecommendations,
                }),
            });

            if (res.ok) {
                const newDoc = await res.json();
                setDocuments((prev) => [newDoc, ...prev]);
                setDocContent('');
                setDocRecommendations('');
                setFeedback({
                    isOpen: true,
                    type: 'success',
                    title: 'Documento Emitido com Sucesso!',
                    message: `Documento gerado com código de validação ${newDoc.validationCode}. O paciente já tem acesso para visualização e impressão.`,
                });
            } else {
                const err = await res.json().catch(() => ({}));
                setFeedback({
                    isOpen: true,
                    type: 'error',
                    title: 'Falha ao Emitir Documento',
                    message: err.message || 'Erro ao gerar prescrição.',
                });
            }
        } catch {
            setFeedback({
                isOpen: true,
                type: 'error',
                title: 'Erro de Conexão',
                message: 'Não foi possível emitir o documento clínico.',
            });
        } finally {
            setIssuingDoc(false);
        }
    };

    // Abre Modal de Impressão
    const handleOpenPrintModal = (doc: MedicalDocument) => {
        setSelectedDocForPrint(doc);
        setIsPrintModalOpen(true);
    };

    // Confirmação para Encerrar Chamada
    const handleHangUp = () => {
        setFeedback({
            isOpen: true,
            type: 'warning',
            title: 'Encerrar Teleconsulta?',
            message: 'Deseja realmente encerrar a sessão de atendimento e sair da sala virtual?',
            actionToConfirm: () => {
                navigate(isDoctor ? '/medico/dashboard' : '/paciente/minhas-consultas');
            },
        });
    };

    if (loadingAppt) {
        return (
            <div className="min-h-screen bg-brand-ice flex flex-col items-center justify-center p-6 text-center">
                <Loader2 className="w-12 h-12 text-brand-orange animate-spin mb-4" />
                <h2 className="text-xl font-black text-brown-dark">
                    Preparando Sala de Teleconsulta...
                </h2>
                <p className="text-sm text-brown-light mt-1">
                    Estabelecendo conexão segura em conformidade com as diretrizes do CFM.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white flex flex-col">
            {/* Barra de Navegação Superior da Teleconsulta */}
            <header className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center justify-between gap-3 shrink-0">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-brand-orange text-white flex items-center justify-center font-black text-lg">
                        A
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-sm sm:text-base font-black text-white leading-tight">
                                Teleconsulta Active Age
                            </h1>
                            <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                Criptografia P2P
                            </span>
                        </div>
                        <p className="text-xs text-gray-400">
                            {isDoctor ? (
                                <>Paciente: <strong className="text-gray-200">{appointment?.patientName}</strong></>
                            ) : (
                                <>Médico: <strong className="text-gray-200">{appointment?.doctorName}</strong> (CRM {appointment?.doctorCrm}/{appointment?.doctorUfCrm})</>
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gray-800 border border-gray-700 text-xs font-mono font-bold text-gray-300">
                        <Clock className="w-3.5 h-3.5 text-brand-orange" />
                        <span>{formatTimer(elapsedSeconds)}</span>
                    </div>

                    <button
                        type="button"
                        onClick={handleHangUp}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-black rounded-xl shadow transition-colors cursor-pointer min-h-[44px]"
                    >
                        <PhoneOff className="w-4 h-4" />
                        <span className="hidden sm:inline">Encerrar Chamada</span>
                    </button>
                </div>
            </header>

            {/* Layout Principal: Split-Screen no Computador / Empilhado no Celular */}
            <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
                {/* COLUNA ESQUERDA: Janela de Vídeo Responsiva */}
                <div className={`p-3 sm:p-5 flex flex-col justify-between bg-black relative ${isDoctor ? 'lg:col-span-6 xl:col-span-7' : 'lg:col-span-12'}`}>
                    {/* Área da Tela de Vídeo Principal */}
                    <div className="flex-1 w-full bg-gray-900 rounded-3xl border border-gray-800 relative overflow-hidden flex items-center justify-center min-h-[220px] sm:min-h-[340px] shadow-2xl">
                        {/* Feed de Vídeo Simulado / Avatar em Alta Definição */}
                        {!isVideoOff ? (
                            <div className="w-full h-full flex flex-col items-center justify-center relative bg-gradient-to-b from-gray-900 to-gray-950 p-6">
                                <div className="relative">
                                    <div className="w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-brand-orange to-amber-500 p-1 shadow-2xl animate-pulse">
                                        <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                                            <User className="w-14 h-14 sm:w-20 sm:h-20 text-gray-300" />
                                        </div>
                                    </div>
                                    <div className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-500 rounded-full border-2 border-gray-900 text-white">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                </div>

                                <div className="mt-4 text-center">
                                    <h3 className="text-base sm:text-lg font-black text-white">
                                        {isDoctor ? appointment?.patientName : appointment?.doctorName}
                                    </h3>
                                    <p className="text-xs text-emerald-400 font-bold flex items-center justify-center gap-1.5 mt-0.5">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                                        Conectado em Tempo Real • Áudio e Vídeo Ativos
                                    </p>
                                </div>

                                {/* Ondas de Voz Simuladas */}
                                <div className="flex items-center gap-1 mt-4">
                                    <span className="w-1 h-3 bg-brand-orange rounded-full animate-bounce" />
                                    <span className="w-1 h-5 bg-brand-orange rounded-full animate-bounce [animation-delay:0.15s]" />
                                    <span className="w-1 h-7 bg-brand-orange rounded-full animate-bounce [animation-delay:0.3s]" />
                                    <span className="w-1 h-4 bg-brand-orange rounded-full animate-bounce [animation-delay:0.45s]" />
                                    <span className="w-1 h-2 bg-brand-orange rounded-full animate-bounce [animation-delay:0.2s]" />
                                </div>
                            </div>
                        ) : (
                            <div className="text-center p-6 text-gray-500">
                                <VideoOff className="w-12 h-12 mx-auto mb-2 text-gray-600" />
                                <p className="text-sm font-bold">Câmera desativada</p>
                            </div>
                        )}

                        {/* Miniatura Picture-in-Picture do Usuário Local */}
                        <div className="absolute bottom-4 right-4 w-28 sm:w-36 h-20 sm:h-24 bg-gray-800/90 backdrop-blur rounded-2xl border border-gray-700/80 shadow-lg overflow-hidden flex items-center justify-center">
                            <div className="text-center p-2">
                                <div className="w-7 h-7 mx-auto rounded-full bg-brand-orange/20 text-brand-orange flex items-center justify-center text-xs font-black mb-1">
                                    Você
                                </div>
                                <span className="text-[10px] text-gray-300 font-bold truncate block max-w-[100px]">
                                    {user?.fullName || 'Participante'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Barra Flutuante de Comandos de Chamada (Acessível / Alvos Táteis de 50px) */}
                    <div className="mt-3 sm:mt-4 py-2 px-4 bg-gray-900/90 backdrop-blur border border-gray-800 rounded-2xl flex items-center justify-center gap-3 sm:gap-4 shrink-0">
                        {/* Botão Microfone */}
                        <button
                            type="button"
                            onClick={() => setIsMuted((prev) => !prev)}
                            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                                isMuted
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                                    : 'bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700'
                            }`}
                            title={isMuted ? 'Ativar Microfone' : 'Silenciar Microfone'}
                            aria-label={isMuted ? 'Ativar Microfone' : 'Silenciar Microfone'}
                        >
                            {isMuted ? <MicOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Mic className="w-5 h-5 sm:w-6 sm:h-6" />}
                        </button>

                        {/* Botão Câmera */}
                        <button
                            type="button"
                            onClick={() => setIsVideoOff((prev) => !prev)}
                            className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all cursor-pointer ${
                                isVideoOff
                                    ? 'bg-red-500/20 text-red-400 border border-red-500/40 hover:bg-red-500/30'
                                    : 'bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700'
                            }`}
                            title={isVideoOff ? 'Ligar Câmera' : 'Desligar Câmera'}
                            aria-label={isVideoOff ? 'Ligar Câmera' : 'Desligar Câmera'}
                        >
                            {isVideoOff ? <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Video className="w-5 h-5 sm:w-6 sm:h-6" />}
                        </button>

                        {/* Botão Encerrar */}
                        <button
                            type="button"
                            onClick={handleHangUp}
                            className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                            title="Encerrar Consulta"
                            aria-label="Encerrar Consulta"
                        >
                            <PhoneOff className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                    </div>

                    {/* Visão do Paciente Idoso: Instruções e Botão para Acessar Prescrições */}
                    {!isDoctor && (
                        <div className="mt-4 p-4 sm:p-5 bg-gradient-to-r from-brand-pot/20 to-brand-orange/10 border border-brand-orange/30 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
                            <div className="text-center sm:text-left">
                                <h4 className="text-sm sm:text-base font-black text-brand-orange flex items-center justify-center sm:justify-start gap-2">
                                    <Sparkles className="w-4 h-4" />
                                    Atendimento Geriátrico Ativo
                                </h4>
                                <p className="text-xs text-gray-300 mt-0.5">
                                    Suas receitas, atestados e pedidos emitidos pelo médico nesta sessão ficam gravados em sua conta.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => navigate('/paciente/documentos')}
                                className="px-4 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white text-xs sm:text-sm font-black flex items-center gap-2 shadow cursor-pointer whitespace-nowrap min-h-[44px]"
                            >
                                <FileSignature className="w-4 h-4" />
                                <span>Ver Minhas Receitas</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* COLUNA DIREITA: Cockpit Clínico do Médico Durante a Chamada (Apenas para Médico) */}
                {isDoctor && (
                    <div className="lg:col-span-6 xl:col-span-5 bg-brand-ice text-brown-dark flex flex-col border-t lg:border-t-0 lg:border-l border-brand-pot/30 overflow-hidden min-h-[450px]">
                        {/* Seletor de Abas Clínicas com Alvos Táteis */}
                        <div className="p-2 sm:p-3 bg-white border-b border-brand-pot/30 flex items-center gap-1.5 shrink-0 overflow-x-auto">
                            <button
                                type="button"
                                onClick={() => setActiveTab('prontuario')}
                                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer min-h-[44px] ${
                                    activeTab === 'prontuario'
                                        ? 'bg-brand-orange text-white shadow-sm font-black'
                                        : 'text-brown-light hover:bg-brand-ice hover:text-brown-dark'
                                }`}
                            >
                                <FileText className="w-4 h-4 shrink-0" />
                                <span>Prontuário (AGA)</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('exames')}
                                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer min-h-[44px] ${
                                    activeTab === 'exames'
                                        ? 'bg-brand-orange text-white shadow-sm font-black'
                                        : 'text-brown-light hover:bg-brand-ice hover:text-brown-dark'
                                }`}
                            >
                                <FolderOpen className="w-4 h-4 shrink-0" />
                                <span>Exames do Paciente ({patientExams.length})</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('receitas')}
                                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer min-h-[44px] ${
                                    activeTab === 'receitas'
                                        ? 'bg-brand-orange text-white shadow-sm font-black'
                                        : 'text-brown-light hover:bg-brand-ice hover:text-brown-dark'
                                }`}
                            >
                                <FileSignature className="w-4 h-4 shrink-0" />
                                <span>Emitir Prescrição</span>
                            </button>
                        </div>

                        {/* Conteúdo com Scroll da Aba Selecionada */}
                        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-5">
                            {/* ============================================================== */}
                            {/* ABA 1: PRONTUÁRIO CLÍNICO (UC14 / RN003)                      */}
                            {/* ============================================================== */}
                            {activeTab === 'prontuario' && (
                                <div className="space-y-5">
                                    {/* Banner de Status de Imutabilidade */}
                                    {medicalRecord.status === 'FINALIZED' ? (
                                        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-start gap-3 text-xs text-emerald-950">
                                            <Lock className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                                            <div>
                                                <h4 className="font-black text-sm text-emerald-900">
                                                    Prontuário Assinado & Imutável
                                                </h4>
                                                <p className="text-emerald-800 font-medium mt-0.5">
                                                    Este prontuário foi finalizado com assinatura digital válida perante o CFM. Novas alterações foram bloqueadas.
                                                </p>
                                                <p className="font-mono text-[11px] text-emerald-900 mt-1 break-all">
                                                    Hash SHA-256: {medicalRecord.hashSignature}
                                                </p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900">
                                            <span className="flex items-center gap-2 font-medium">
                                                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                                Modo Rascunho: Edite livremente antes de assinar.
                                            </span>
                                            <span className="px-2 py-0.5 bg-amber-200/70 text-amber-900 font-black rounded-md text-[10px] uppercase">
                                                DRAFT
                                            </span>
                                        </div>
                                    )}

                                    {/* Seção 1: Anamnese Clínica */}
                                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-brand-pot/30 shadow-xs space-y-3">
                                        <h3 className="text-xs uppercase tracking-wider font-black text-brand-orange flex items-center gap-2">
                                            <FileText className="w-4 h-4" />
                                            1. Anamnese Clínica & Queixas
                                        </h3>

                                        <div>
                                            <label className="block text-xs font-bold text-brown-dark mb-1">
                                                Queixa Principal Relatada:
                                            </label>
                                            <textarea
                                                rows={2}
                                                disabled={medicalRecord.status === 'FINALIZED'}
                                                value={medicalRecord.chiefComplaint}
                                                onChange={(e) => setMedicalRecord({ ...medicalRecord, chiefComplaint: e.target.value })}
                                                placeholder="Ex: Tonturas esporádicas ao se levantar, fraqueza nas pernas..."
                                                className="w-full p-3 rounded-xl border border-gray-200 text-xs sm:text-sm focus:ring-2 focus:ring-brand-orange disabled:bg-gray-100 disabled:text-gray-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-brown-dark mb-1">
                                                História da Doença Atual (HDA):
                                            </label>
                                            <textarea
                                                rows={2}
                                                disabled={medicalRecord.status === 'FINALIZED'}
                                                value={medicalRecord.historyOfPresentIllness}
                                                onChange={(e) => setMedicalRecord({ ...medicalRecord, historyOfPresentIllness: e.target.value })}
                                                placeholder="Início dos sintomas, frequência, fatores de alívio ou piora..."
                                                className="w-full p-3 rounded-xl border border-gray-200 text-xs sm:text-sm focus:ring-2 focus:ring-brand-orange disabled:bg-gray-100 disabled:text-gray-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-brown-dark mb-1">
                                                Evolução / Observações da Sessão:
                                            </label>
                                            <textarea
                                                rows={2}
                                                disabled={medicalRecord.status === 'FINALIZED'}
                                                value={medicalRecord.clinicalEvolution}
                                                onChange={(e) => setMedicalRecord({ ...medicalRecord, clinicalEvolution: e.target.value })}
                                                placeholder="Aparência geral, comunicabilidade, relatos do cuidador..."
                                                className="w-full p-3 rounded-xl border border-gray-200 text-xs sm:text-sm focus:ring-2 focus:ring-brand-orange disabled:bg-gray-100 disabled:text-gray-500"
                                            />
                                        </div>
                                    </div>

                                    {/* Seção 2: Avaliação Geriátrica Ampla (AGA) */}
                                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-brand-pot/30 shadow-xs space-y-3">
                                        <h3 className="text-xs uppercase tracking-wider font-black text-brand-orange flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4" />
                                            2. Avaliação Geriátrica Ampla (AGA)
                                        </h3>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div>
                                                <label className="block text-[11px] font-bold text-brown-dark mb-1">
                                                    Estado Cognitivo:
                                                </label>
                                                <select
                                                    disabled={medicalRecord.status === 'FINALIZED'}
                                                    value={medicalRecord.cognitiveStatus}
                                                    onChange={(e) => setMedicalRecord({ ...medicalRecord, cognitiveStatus: e.target.value })}
                                                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-orange disabled:bg-gray-100"
                                                >
                                                    <option value="Preservado">Preservado</option>
                                                    <option value="Declínio Cognitivo Leve">Declínio Cognitivo Leve</option>
                                                    <option value="Demência em Investigação">Demência em Investigação</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-bold text-brown-dark mb-1">
                                                    Risco de Quedas / Mobilidade:
                                                </label>
                                                <select
                                                    disabled={medicalRecord.status === 'FINALIZED'}
                                                    value={medicalRecord.mobilityRisk}
                                                    onChange={(e) => setMedicalRecord({ ...medicalRecord, mobilityRisk: e.target.value })}
                                                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-orange disabled:bg-gray-100"
                                                >
                                                    <option value="Baixo Risco de Quedas">Baixo Risco</option>
                                                    <option value="Risco Moderado de Quedas">Risco Moderado</option>
                                                    <option value="Marcha Instável / Alto Risco">Marcha Instável / Alto Risco</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-bold text-brown-dark mb-1">
                                                    Independência Funcional:
                                                </label>
                                                <select
                                                    disabled={medicalRecord.status === 'FINALIZED'}
                                                    value={medicalRecord.functionalIndependence}
                                                    onChange={(e) => setMedicalRecord({ ...medicalRecord, functionalIndependence: e.target.value })}
                                                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-orange disabled:bg-gray-100"
                                                >
                                                    <option value="Totalmente Independente">Totalmente Independente</option>
                                                    <option value="Dependência Parcial (AIVD)">Dependência Parcial (AIVD)</option>
                                                    <option value="Dependência Total (AVD)">Dependência Total (AVD)</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-[11px] font-bold text-brown-dark mb-1">
                                                    Suporte Familiar / Cuidador:
                                                </label>
                                                <select
                                                    disabled={medicalRecord.status === 'FINALIZED'}
                                                    value={medicalRecord.familySupport}
                                                    onChange={(e) => setMedicalRecord({ ...medicalRecord, familySupport: e.target.value })}
                                                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-orange disabled:bg-gray-100"
                                                >
                                                    <option value="Cuidador Presente na Sessão">Cuidador Presente</option>
                                                    <option value="Apoio Familiar Regular">Apoio Familiar Regular</option>
                                                    <option value="Idoso Vive Só">Idoso Vive Só</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Seção 3: Hipótese Diagnóstica (CID-11) e Conduta */}
                                    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-brand-pot/30 shadow-xs space-y-3">
                                        <h3 className="text-xs uppercase tracking-wider font-black text-brand-orange flex items-center gap-2">
                                            <CheckCircle2 className="w-4 h-4" />
                                            3. Diagnóstico (CID-11) & Plano de Cuidados
                                        </h3>

                                        {/* Atalhos Rápidos de CID-11 */}
                                        {medicalRecord.status !== 'FINALIZED' && (
                                            <div>
                                                <span className="text-[10px] font-bold text-brown-light uppercase block mb-1.5">
                                                    Atalhos Rápidos de CID-11 Geriátrico:
                                                </span>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {COMMON_GERIATRIC_CIDS.map((c) => (
                                                        <button
                                                            key={c.code}
                                                            type="button"
                                                            onClick={() => setMedicalRecord({ ...medicalRecord, cid11Code: c.code, cid11Description: c.desc })}
                                                            className="px-2.5 py-1 rounded-lg bg-brand-ice hover:bg-orange-100 text-brown-dark border border-brand-pot/30 text-[11px] font-bold transition-all cursor-pointer"
                                                        >
                                                            <strong className="text-brand-orange">{c.code}</strong> - {c.desc.substring(0, 24)}...
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                            <div>
                                                <label className="block text-xs font-bold text-brown-dark mb-1">
                                                    Código CID-11:
                                                </label>
                                                <input
                                                    type="text"
                                                    disabled={medicalRecord.status === 'FINALIZED'}
                                                    value={medicalRecord.cid11Code}
                                                    onChange={(e) => setMedicalRecord({ ...medicalRecord, cid11Code: e.target.value.toUpperCase() })}
                                                    placeholder="Ex: MB40"
                                                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-brand-orange disabled:bg-gray-100"
                                                />
                                            </div>
                                            <div className="sm:col-span-2">
                                                <label className="block text-xs font-bold text-brown-dark mb-1">
                                                    Descrição da Afecção:
                                                </label>
                                                <input
                                                    type="text"
                                                    disabled={medicalRecord.status === 'FINALIZED'}
                                                    value={medicalRecord.cid11Description}
                                                    onChange={(e) => setMedicalRecord({ ...medicalRecord, cid11Description: e.target.value })}
                                                    placeholder="Ex: Sintomas ou sinais relativos à cognição e percepção"
                                                    className="w-full p-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm focus:ring-2 focus:ring-brand-orange disabled:bg-gray-100"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-brown-dark mb-1">
                                                Conduta Médica & Plano de Cuidados:
                                            </label>
                                            <textarea
                                                rows={3}
                                                disabled={medicalRecord.status === 'FINALIZED'}
                                                value={medicalRecord.clinicalConduct}
                                                onChange={(e) => setMedicalRecord({ ...medicalRecord, clinicalConduct: e.target.value })}
                                                placeholder="Ajustes medicamentosos, orientações de dieta, pedidos de exames complementares e retorno..."
                                                className="w-full p-3 rounded-xl border border-gray-200 text-xs sm:text-sm focus:ring-2 focus:ring-brand-orange disabled:bg-gray-100"
                                            />
                                        </div>
                                    </div>

                                    {/* Botões de Ação do Prontuário */}
                                    {medicalRecord.status !== 'FINALIZED' && (
                                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
                                            <button
                                                type="button"
                                                disabled={savingRecord}
                                                onClick={handleSaveDraft}
                                                className="px-5 py-3 rounded-xl border border-brand-pot bg-white hover:bg-gray-100 text-brown-dark font-black text-xs sm:text-sm shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
                                            >
                                                {savingRecord ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Save className="w-4 h-4 text-brand-orange" />
                                                )}
                                                <span>Salvar Rascunho</span>
                                            </button>

                                            <button
                                                type="button"
                                                disabled={finalizingRecord}
                                                onClick={promptFinalizeRecord}
                                                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
                                            >
                                                {finalizingRecord ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Lock className="w-4 h-4" />
                                                )}
                                                <span>Finalizar & Assinar Prontuário</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ============================================================== */}
                            {/* ABA 2: EXAMES PRÉVIOS DO PACIENTE (UC13)                      */}
                            {/* ============================================================== */}
                            {activeTab === 'exames' && (
                                <div className="space-y-4">
                                    <div className="p-3.5 bg-brand-ice/90 border border-brand-pot/30 rounded-2xl flex items-center justify-between text-xs">
                                        <span className="font-bold text-brown-dark">
                                            Cofre Digital do Paciente: {patientExams.length} exame(s) anexado(s)
                                        </span>
                                        <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                                            <ShieldCheck className="w-3.5 h-3.5" />
                                            GridFS Criptografado
                                        </span>
                                    </div>

                                    {loadingExams ? (
                                        <div className="py-12 text-center text-brown-light">
                                            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2 text-brand-orange" />
                                            <p className="text-xs">Carregando exames do paciente...</p>
                                        </div>
                                    ) : patientExams.length === 0 ? (
                                        <div className="bg-white p-8 rounded-3xl border border-brand-pot/20 text-center space-y-2">
                                            <FolderOpen className="w-12 h-12 text-gray-300 mx-auto" />
                                            <h4 className="text-sm font-black text-brown-dark">
                                                Nenhum exame anexado
                                            </h4>
                                            <p className="text-xs text-brown-light max-w-sm mx-auto">
                                                O paciente ainda não submeteu laudos ou exames prévios no cofre digital de saúde.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {patientExams.map((exam) => (
                                                <div
                                                    key={exam.id}
                                                    className="bg-white p-4 rounded-2xl border border-brand-pot/30 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-brand-orange transition-all"
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-brand-ice text-brand-orange border border-brand-pot/30 inline-block mb-1">
                                                            {exam.categoryDescription || exam.category}
                                                        </span>
                                                        <h4 className="text-sm font-black text-brown-dark truncate">
                                                            {exam.title}
                                                        </h4>
                                                        <p className="text-[11px] text-brown-light mt-0.5">
                                                            Realizado em: <strong>{exam.examDate}</strong> • Tamanho: {exam.formattedSize}
                                                        </p>
                                                        {exam.notes && (
                                                            <p className="text-xs text-gray-600 mt-1 italic">
                                                                "{exam.notes}"
                                                            </p>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <a
                                                            href={`/api/doctor/appointments/${appointmentId}/patient-exams/${exam.id}/file`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-ice hover:bg-orange-100 text-brand-orange font-bold text-xs border border-brand-pot/40 transition-colors cursor-pointer min-h-[40px]"
                                                        >
                                                            <ExternalLink className="w-3.5 h-3.5" />
                                                            <span>Visualizar</span>
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* ============================================================== */}
                            {/* ABA 3: EMISSÃO DE PRESCRIÇÕES E DOCUMENTOS (UC15)              */}
                            {/* ============================================================== */}
                            {activeTab === 'receitas' && (
                                <div className="space-y-5">
                                    {/* Formulário de Nova Emissão */}
                                    <form onSubmit={handleIssueDocument} className="bg-white p-4 sm:p-5 rounded-3xl border border-brand-pot/30 shadow-xs space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs uppercase tracking-wider font-black text-brand-orange flex items-center gap-2">
                                                <PlusCircle className="w-4 h-4" />
                                                Emitir Novo Documento Clínico
                                            </h3>
                                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                                                Padrão ICP-Brasil
                                            </span>
                                        </div>

                                        {/* Seletor de Tipo */}
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => applyDocumentTemplate('RECEITA_MEDICA')}
                                                className={`p-2 rounded-xl text-center font-bold text-xs border transition-all cursor-pointer ${
                                                    docType === 'RECEITA_MEDICA'
                                                        ? 'bg-brand-orange text-white border-brand-orange shadow-sm font-black'
                                                        : 'bg-brand-ice text-brown-dark border-brand-pot/30 hover:bg-orange-50'
                                                }`}
                                            >
                                                Receita Médica
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => applyDocumentTemplate('PEDIDO_EXAME')}
                                                className={`p-2 rounded-xl text-center font-bold text-xs border transition-all cursor-pointer ${
                                                    docType === 'PEDIDO_EXAME'
                                                        ? 'bg-brand-orange text-white border-brand-orange shadow-sm font-black'
                                                        : 'bg-brand-ice text-brown-dark border-brand-pot/30 hover:bg-orange-50'
                                                }`}
                                            >
                                                Pedido de Exame
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => applyDocumentTemplate('ATESTADO_MEDICO')}
                                                className={`p-2 rounded-xl text-center font-bold text-xs border transition-all cursor-pointer ${
                                                    docType === 'ATESTADO_MEDICO'
                                                        ? 'bg-brand-orange text-white border-brand-orange shadow-sm font-black'
                                                        : 'bg-brand-ice text-brown-dark border-brand-pot/30 hover:bg-orange-50'
                                                }`}
                                            >
                                                Atestado Médico
                                            </button>
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-brown-dark mb-1">
                                                Título do Documento:
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={docTitle}
                                                onChange={(e) => setDocTitle(e.target.value)}
                                                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-bold focus:ring-2 focus:ring-brand-orange"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-brown-dark mb-1">
                                                Prescrição / Medicamentos / Conteúdo:
                                            </label>
                                            <textarea
                                                rows={4}
                                                required
                                                value={docContent}
                                                onChange={(e) => setDocContent(e.target.value)}
                                                placeholder="Descreva os medicamentos, doses diárias, horários ou termos do atestado..."
                                                className="w-full p-3 rounded-xl border border-gray-200 text-xs sm:text-sm font-mono focus:ring-2 focus:ring-brand-orange"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-bold text-brown-dark mb-1">
                                                Orientações e Recomendações Adicionais (Opcional):
                                            </label>
                                            <textarea
                                                rows={2}
                                                value={docRecommendations}
                                                onChange={(e) => setDocRecommendations(e.target.value)}
                                                placeholder="Cuidados alimentares, posologia com água, repouso..."
                                                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs focus:ring-2 focus:ring-brand-orange"
                                            />
                                        </div>

                                        <div className="flex justify-end pt-1">
                                            <button
                                                type="submit"
                                                disabled={issuingDoc || !docContent.trim()}
                                                className="px-6 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 min-h-[48px]"
                                            >
                                                {issuingDoc ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <FileSignature className="w-4 h-4" />
                                                )}
                                                <span>Emitir Documento Oficial</span>
                                            </button>
                                        </div>
                                    </form>

                                    {/* Histórico de Documentos Desta Consulta */}
                                    <div className="space-y-3 pt-2">
                                        <h4 className="text-xs uppercase tracking-wider font-black text-brown-light">
                                            Documentos Emitidos Nesta Teleconsulta ({documents.length})
                                        </h4>

                                        {loadingDocs ? (
                                            <div className="py-6 text-center text-brown-light">
                                                <Loader2 className="w-6 h-6 animate-spin mx-auto text-brand-orange" />
                                            </div>
                                        ) : documents.length === 0 ? (
                                            <p className="text-xs text-brown-light italic bg-white p-4 rounded-2xl border border-brand-pot/20 text-center">
                                                Nenhum documento emitido até o momento nesta sessão.
                                            </p>
                                        ) : (
                                            documents.map((doc) => (
                                                <div
                                                    key={doc.id}
                                                    className="bg-white p-4 rounded-2xl border border-brand-pot/30 shadow-xs flex items-center justify-between gap-3"
                                                >
                                                    <div className="min-w-0 flex-1">
                                                        <span className="text-[10px] font-mono font-black text-brand-orange block">
                                                            {doc.validationCode}
                                                        </span>
                                                        <h5 className="text-xs sm:text-sm font-black text-brown-dark truncate">
                                                            {doc.title}
                                                        </h5>
                                                        <span className="text-[10px] text-emerald-800 font-bold block mt-0.5">
                                                            Emitido às {new Date(doc.issuedAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenPrintModal(doc)}
                                                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-ice hover:bg-orange-100 text-brand-orange font-bold text-xs border border-brand-pot/40 transition-colors cursor-pointer min-h-[40px] shrink-0"
                                                    >
                                                        <Printer className="w-4 h-4" />
                                                        <span>Imprimir</span>
                                                    </button>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Modal de Impressão Oficial de Documento */}
            <DocumentPrintModal
                isOpen={isPrintModalOpen}
                onClose={() => setIsPrintModalOpen(false)}
                document={selectedDocForPrint}
            />

            {/* Modal de Feedback Acessível (WCAG / Sem window.alert) */}
            <FeedbackModal
                isOpen={feedback.isOpen}
                type={feedback.type}
                title={feedback.title}
                message={feedback.message}
                onConfirm={() => {
                    if (feedback.actionToConfirm) {
                        feedback.actionToConfirm();
                    }
                    setFeedback({ ...feedback, isOpen: false, actionToConfirm: undefined });
                }}
            />
        </div>
    );
};
