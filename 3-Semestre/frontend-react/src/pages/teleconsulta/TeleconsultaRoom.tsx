import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    CheckCircle2,
    Mic,
    MicOff,
    Video,
    VideoOff,
    FileText,
    FolderOpen,
    FileSignature,
    ShieldCheck,
    Lock,
    Save,
    Clock,
    AlertCircle,
    User,
    Loader2,
    Printer,
    ExternalLink,
    PlusCircle,
    LogOut,
    Maximize2,
    Minimize2,
} from 'lucide-react';
import { useAuthUser } from '../../hooks/useAuthUser';
import { useWebRTC } from '../../hooks/useWebRTC';
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

export const TeleconsultaRoom: React.FC = () => {
    const { appointmentId } = useParams<{ appointmentId: string }>();
    const navigate = useNavigate();
    const { user } = useAuthUser();

    // Estado da Consulta
    const [appointment, setAppointment] = useState<AppointmentDetails | null>(null);

    // Gerenciamento de Tela Inteira (Fullscreen API)
    const videoContainerRef = useRef<HTMLDivElement | null>(null);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const toggleFullscreen = useCallback(async () => {
        try {
            if (!document.fullscreenElement && !(document as any).webkitFullscreenElement) {
                if (videoContainerRef.current) {
                    if (videoContainerRef.current.requestFullscreen) {
                        await videoContainerRef.current.requestFullscreen();
                    } else if ((videoContainerRef.current as any).webkitRequestFullscreen) {
                        await (videoContainerRef.current as any).webkitRequestFullscreen();
                    }
                }
            } else {
                if (document.exitFullscreen) {
                    await document.exitFullscreen();
                } else if ((document as any).webkitExitFullscreen) {
                    await (document as any).webkitExitFullscreen();
                }
            }
        } catch (err) {
            console.error('Falha ao alternar tela inteira:', err);
        }
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!(document.fullscreenElement || (document as any).webkitFullscreenElement));
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        };
    }, []);
    const [loadingAppt, setLoadingAppt] = useState(true);

    const isDoctor = user?.role === 'ROLE_MEDICO' || user?.role === 'ROLE_ADMIN';
    const isCallActive = !loadingAppt && !!appointment && appointment.status !== 'REALIZADA';

    // Cliente WebRTC Nativo e Gerenciamento de Mídia (SPEC-16.3)
    const {
        remoteStream,
        connectionStatus,
        isMuted,
        isVideoOff,
        peerMuted,
        peerVideoOff,
        peerName,
        errorMessage: rtcError,
        retryMedia,
        toggleAudio,
        toggleVideo,
        leaveRoom,
        localVideoRef,
        remoteVideoRef,
    } = useWebRTC({
        appointmentId: appointmentId || '',
        userId: user?.id || user?.email || '',
        userRole: user?.role || 'ROLE_PACIENTE',
        userName: user?.fullName || (isDoctor ? 'Médico' : 'Paciente'),
        enabled: isCallActive,
    });

    const [elapsedSeconds, setElapsedSeconds] = useState(0);

    // Abas do Cockpit Médico
    const [activeTab, setActiveTab] = useState<'prontuario' | 'exames' | 'receitas'>('prontuario');
    const [patientTab, setPatientTab] = useState<'documentos' | 'orientacoes'>('documentos');

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

    // Estado de Documentos / Receitas Emitidas (UC15 / SPEC-12B)
    const [documents, setDocuments] = useState<MedicalDocument[]>([]);
    const [loadingDocs, setLoadingDocs] = useState(false);
    const [issuingDoc, setIssuingDoc] = useState(false);

    // Formulário de Novo Documento (sem texto mockado)
    const [docType, setDocType] = useState<MedicalDocumentType>('RECEITA_MEDICA');
    const [docTitle, setDocTitle] = useState('Prescrição de Medicamentos');
    const [docContent, setDocContent] = useState('');
    const [docRecommendations, setDocRecommendations] = useState('');

    // Modal de Impressão do Documento (P&B Clean)
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

    // Notificação amigável de erro de WebRTC/mídia com suporte a Retry (SPEC-16.4)
    useEffect(() => {
        if (rtcError) {
            setFeedback({
                isOpen: true,
                type: 'warning',
                title: 'Permissão de Câmera / Microfone',
                message: rtcError,
                actionToConfirm: () => {
                    retryMedia();
                },
            });
        }
    }, [rtcError, retryMedia]);

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

    // Sincronização e Polling de Documentos para Paciente e Médico (SPEC-12B)
    useEffect(() => {
        if (!appointmentId) return;

        const fetchDocuments = async () => {
            try {
                const res = await fetch(`/api/medical-documents/appointment/${appointmentId}`);
                if (res.ok) {
                    const data = await res.json();
                    setDocuments(data);
                }
            } catch {
                // Silencioso no polling
            }
        };

        setLoadingDocs(true);
        fetchDocuments().finally(() => setLoadingDocs(false));

        // Polling a cada 4 segundos para refletir novas receitas na tela do idoso
        const interval = setInterval(fetchDocuments, 4000);
        return () => clearInterval(interval);
    }, [appointmentId]);

    // Carrega Prontuário e Exames se for Médico
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

        loadRecord();
        loadExams();
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
                    clinicalEvolution: medicalRecord.clinicalEvolution || medicalRecord.clinicalConduct,
                    cognitiveStatus: medicalRecord.cognitiveStatus,
                    mobilityRisk: medicalRecord.mobilityRisk,
                    functionalIndependence: medicalRecord.functionalIndependence,
                    familySupport: medicalRecord.familySupport,
                    cid11Code: medicalRecord.cid11Code,
                    cid11Description: medicalRecord.cid11Description,
                    clinicalConduct: medicalRecord.clinicalConduct || medicalRecord.clinicalEvolution,
                }),
            });

            if (res.ok) {
                const updated = await res.json();
                setMedicalRecord(updated);
                setFeedback({
                    isOpen: true,
                    type: 'success',
                    title: 'Rascunho Salvo com Sucesso',
                    message: 'O relatório clínico da consulta foi registrado e permanece editável até a assinatura final.',
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

    // Confirmação para Finalizar & Assinar Prontuário (Encerra oficialmente a consulta)
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
            title: 'Finalizar Consulta e Assinar Prontuário?',
            message: 'Atenção: ao finalizar e assinar digitalmente este prontuário, a teleconsulta será oficialmente marcada como REALIZADA e o documento se tornará estritamente IMUTÁVEL perante as normas do CFM.',
            actionToConfirm: executeFinalizeRecord,
        });
    };

    // Executa Finalização & Assinatura Digital do Prontuário
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
                if (appointment) {
                    setAppointment({ ...appointment, status: 'REALIZADA' });
                }
                setFeedback({
                    isOpen: true,
                    type: 'success',
                    title: 'Teleconsulta Finalizada com Sucesso!',
                    message: `O prontuário foi assinado digitalmente com hash SHA-256: ${finalized.hashSignature?.substring(0, 16)}... e a consulta foi oficialmente concluída no sistema.`,
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

    // Aplica Template Limpo de Documento (Sem texto mockado / SPEC-12B)
    const applyDocumentTemplate = (type: MedicalDocumentType) => {
        setDocType(type);
        setDocContent('');
        setDocRecommendations('');

        if (type === 'RECEITA_MEDICA') {
            setDocTitle('Prescrição de Medicamentos');
        } else if (type === 'PEDIDO_EXAME') {
            setDocTitle('Solicitação de Exames Complementares');
        } else if (type === 'ATESTADO_MEDICO') {
            setDocTitle('Atestado Médico Geriátrico');
        }
    };

    // Emissão de Novo Documento Oficial
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
                    message: `O documento "${newDoc.title}" foi assinado digitalmente e já está visível para o paciente nesta sessão com o código de validação ${newDoc.validationCode}.`,
                });
            } else {
                const err = await res.json().catch(() => ({}));
                setFeedback({
                    isOpen: true,
                    type: 'error',
                    title: 'Não foi possível emitir',
                    message: err.message || 'Erro ao gerar o documento médico.',
                });
            }
        } catch {
            setFeedback({
                isOpen: true,
                type: 'error',
                title: 'Erro de Conexão',
                message: 'Falha ao conectar com o servidor para emitir a prescrição.',
            });
        } finally {
            setIssuingDoc(false);
        }
    };

    // Abertura do Modal de Impressão
    const handleOpenPrintModal = (doc: MedicalDocument) => {
        setSelectedDocForPrint(doc);
        setIsPrintModalOpen(true);
    };

    // Saída Segura do Paciente (Volta ao dashboard sem encerrar a teleconsulta)
    const handlePatientLeave = () => {
        setFeedback({
            isOpen: true,
            type: 'info',
            title: 'Sair da Sala Virtual?',
            message: 'Você voltará ao seu painel principal, mas sua chamada continuará ativa e você poderá retornar quando desejar.',
            actionToConfirm: () => {
                leaveRoom();
                navigate('/paciente/dashboard');
            },
        });
    };

    // Saída do Médico
    const handleDoctorLeave = () => {
        if (medicalRecord.status === 'FINALIZED') {
            leaveRoom();
            navigate('/medico/dashboard');
            return;
        }

        setFeedback({
            isOpen: true,
            type: 'warning',
            title: 'Sair da Sala sem Finalizar?',
            message: 'A consulta permanecerá em andamento até que o prontuário seja finalizado e assinado digitalmente. Deseja retornar ao seu painel?',
            actionToConfirm: () => {
                leaveRoom();
                navigate('/medico/dashboard');
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


    // Visão de Teleconsulta Concluída / Dar Baixa na Chamada (SPEC-13)
    if (appointment?.status === 'REALIZADA') {
        return (
            <div className="min-h-screen bg-brand-ice flex flex-col justify-between text-brown-dark font-sans">
                {/* Header Simples */}
                <header className="bg-white border-b border-brand-pot/30 px-4 sm:px-8 py-4 flex items-center justify-between sticky top-0 z-30 shadow-xs">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-brand-orange text-white flex items-center justify-center font-black text-lg">
                            A
                        </div>
                        <div>
                            <h1 className="text-base sm:text-lg font-black text-brown-dark">
                                Teleconsulta Active Age
                            </h1>
                            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Atendimento Concluído & Prontuário Assinado
                            </span>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => navigate(isDoctor ? '/medico/dashboard' : '/paciente/dashboard')}
                        className="flex items-center gap-2 px-4 py-2 bg-white hover:bg-brand-ice text-brown-dark text-xs sm:text-sm font-bold rounded-xl border border-brand-pot/40 transition-colors cursor-pointer min-h-[44px]"
                    >
                        <LogOut className="w-4 h-4 text-brand-orange" />
                        <span>Voltar ao Meu Painel</span>
                    </button>
                </header>

                <main className="max-w-4xl mx-auto p-4 sm:p-8 flex-1 w-full space-y-6">
                    {/* Card de Conclusão */}
                    <div className="bg-white rounded-3xl border border-brand-pot/30 p-6 sm:p-8 shadow-xs text-center space-y-3">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                            <ShieldCheck className="w-8 h-8 text-emerald-700" />
                        </div>
                        <h2 className="text-xl sm:text-2xl font-black text-brown-dark">
                            Teleconsulta Finalizada com Sucesso
                        </h2>
                        <p className="text-xs sm:text-sm text-brown-light max-w-xl mx-auto leading-relaxed">
                            Este atendimento clínico foi concluído e o prontuário arquivado com assinatura digital indelével em conformidade com as diretrizes do Conselho Federal de Medicina.
                        </p>

                        <div className="pt-4 border-t border-brand-pot/20 grid grid-cols-1 sm:grid-cols-2 gap-3 text-left max-w-md mx-auto text-xs bg-brand-ice/60 p-4 rounded-2xl">
                            <div>
                                <span className="text-brown-light uppercase font-bold text-[10px] block">Paciente:</span>
                                <span className="font-black text-brown-dark">{appointment.patientName}</span>
                            </div>
                            <div>
                                <span className="text-brown-light uppercase font-bold text-[10px] block">Médico:</span>
                                <span className="font-bold text-brown-dark">Dr(a). {appointment.doctorName} (CRM {appointment.doctorCrm}/{appointment.doctorUfCrm})</span>
                            </div>
                        </div>
                    </div>

                    {/* Documentos Emitidos */}
                    <div className="bg-white rounded-3xl border border-brand-pot/30 p-6 sm:p-8 shadow-xs space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-brand-pot/20">
                            <h3 className="text-sm font-black text-brand-orange uppercase tracking-wider flex items-center gap-2">
                                <FileSignature className="w-4 h-4" />
                                Documentos Emitidos Nesta Sessão ({documents.length})
                            </h3>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                                Padrão ICP-Brasil
                            </span>
                        </div>

                        {documents.length === 0 ? (
                            <p className="text-xs text-brown-light italic text-center py-4">
                                Nenhum documento (receita, pedido de exame ou atestado) foi emitido nesta sessão.
                            </p>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {documents.map((doc) => (
                                    <div
                                        key={doc.id}
                                        className="p-4 rounded-2xl border border-brand-pot/30 bg-brand-ice/50 hover:border-brand-orange transition-all flex items-center justify-between gap-3 shadow-xs"
                                    >
                                        <div className="min-w-0">
                                            <span className="text-[10px] font-black uppercase text-brand-orange block">
                                                {doc.documentType === 'RECEITA_MEDICA' ? 'Receita Médica' : doc.documentType === 'PEDIDO_EXAME' ? 'Pedido de Exame' : 'Atestado'}
                                            </span>
                                            <h4 className="text-xs sm:text-sm font-bold text-brown-dark truncate">
                                                {doc.title}
                                            </h4>
                                            <p className="text-[11px] text-brown-light font-mono mt-0.5">
                                                {doc.validationCode}
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => handleOpenPrintModal(doc)}
                                            className="px-3.5 py-2 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer min-h-[40px]"
                                        >
                                            <Printer className="w-3.5 h-3.5" />
                                            <span>Imprimir</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Se for Médico: Visualização do Prontuário Finalizado */}
                    {isDoctor && (
                        <div className="bg-white rounded-3xl border border-brand-pot/30 p-6 sm:p-8 shadow-xs space-y-4">
                            <div className="flex items-center justify-between pb-3 border-b border-brand-pot/20">
                                <h3 className="text-sm font-black text-brand-orange uppercase tracking-wider flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Prontuário Médico Arquivado
                                </h3>
                                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded flex items-center gap-1">
                                    <Lock className="w-3 h-3" /> Imutável perante CFM
                                </span>
                            </div>

                            <div className="bg-brand-ice/50 p-5 rounded-2xl border border-brand-pot/20 text-xs sm:text-sm text-brown-dark leading-relaxed whitespace-pre-line">
                                {medicalRecord.clinicalConduct || medicalRecord.clinicalEvolution || medicalRecord.chiefComplaint || 'Relatório finalizado pelo médico.'}
                            </div>

                            {medicalRecord.hashSignature && (
                                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] font-mono text-emerald-950 break-all">
                                    <strong>Hash SHA-256: </strong>{medicalRecord.hashSignature}
                                </div>
                            )}
                        </div>
                    )}
                </main>

                <DocumentPrintModal
                    isOpen={isPrintModalOpen}
                    onClose={() => setIsPrintModalOpen(false)}
                    document={selectedDocForPrint}
                />
            </div>
        );
    }

    return (
        <div className="h-screen max-h-screen overflow-hidden bg-gray-950 text-white flex flex-col">
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

                    {/* Botão de Saída Segura Diferenciado por Perfil (SPEC-12B) */}
                    {isDoctor ? (
                        <button
                            type="button"
                            onClick={handleDoctorLeave}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs sm:text-sm font-bold rounded-xl border border-gray-700 transition-colors cursor-pointer min-h-[44px]"
                        >
                            <LogOut className="w-4 h-4 text-brand-orange" />
                            <span className="hidden sm:inline">Sair da Sala</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handlePatientLeave}
                            className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-200 text-xs sm:text-sm font-bold rounded-xl border border-gray-700 transition-colors cursor-pointer min-h-[44px]"
                        >
                            <LogOut className="w-4 h-4 text-brand-orange" />
                            <span className="hidden sm:inline">Sair da Sala</span>
                        </button>
                    )}
                </div>
            </header>

            {/* Layout Principal: Split-Screen no Computador / Empilhado no Celular */}
            <main className="flex-1 h-[calc(100vh-3.5rem)] max-h-[calc(100vh-3.5rem)] grid grid-cols-1 lg:grid-cols-12 overflow-hidden min-h-0">
                {/* COLUNA ESQUERDA: Janela de Vídeo Responsiva (Tanto Médico quanto Paciente) */}
                <div className={`p-2 sm:p-3 lg:p-4 flex flex-col ${
                    isDoctor
                        ? 'lg:col-span-5 xl:col-span-5 h-full min-h-0 justify-center items-center overflow-hidden'
                        : 'lg:col-span-7 xl:col-span-7 h-full min-h-0 justify-center items-center overflow-hidden'
                } bg-black relative min-h-0`}>
                    <div className="w-full h-full min-h-0 flex flex-col justify-center items-center">
                    {/* Área da Tela de Vídeo Principal */}
                    <div
                        ref={videoContainerRef}
                        className="w-full h-full max-h-[calc(100vh-5.5rem)] relative overflow-hidden flex items-center justify-center shadow-2xl bg-gray-900 border border-gray-800 rounded-3xl min-h-0"
                    >
                        {/* Feed de Vídeo Remoto Real */}
                        <video
                            ref={remoteVideoRef}
                            autoPlay
                            playsInline
                            className={`absolute inset-0 w-full h-full ${isFullscreen ? 'object-contain' : 'object-cover'} rounded-3xl transition-opacity duration-300 ${
                                remoteStream && !peerVideoOff ? 'opacity-100' : 'opacity-0 pointer-events-none'
                            }`}
                        />

                        {/* Fallback quando o par estiver sem câmera ou aguardando */}
                        {(!remoteStream || peerVideoOff) && (
                            <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 to-gray-950 p-6">
                                <div className="relative">
                                    <div className={`w-24 h-24 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-brand-orange to-amber-500 p-1 shadow-2xl ${
                                        connectionStatus === 'connected' ? '' : 'animate-pulse'
                                    }`}>
                                        <div className="w-full h-full rounded-full bg-gray-900 flex items-center justify-center overflow-hidden">
                                            <User className="w-14 h-14 sm:w-20 sm:h-20 text-gray-300" />
                                        </div>
                                    </div>
                                    {connectionStatus === 'connected' && (
                                        <div className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-500 rounded-full border-2 border-gray-900 text-white shadow">
                                            <ShieldCheck className="w-4 h-4" />
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 text-center max-w-sm">
                                    <h3 className="text-base sm:text-lg font-black text-white">
                                        {peerName || (isDoctor ? appointment?.patientName : appointment?.doctorName)}
                                    </h3>

                                    {connectionStatus === 'connected' && peerVideoOff && (
                                        <p className="text-xs text-amber-400 font-bold flex items-center justify-center gap-1.5 mt-1">
                                            <VideoOff className="w-3.5 h-3.5" />
                                            Participante desativou a câmera temporariamente
                                        </p>
                                    )}

                                    {connectionStatus === 'waiting' && (
                                        <p className="text-xs text-amber-400 font-bold flex items-center justify-center gap-1.5 mt-1">
                                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                                            Aguardando entrada na sala de teleconsulta...
                                        </p>
                                    )}

                                    {connectionStatus === 'reconnecting' && (
                                        <p className="text-xs text-red-400 font-bold flex items-center justify-center gap-1.5 mt-1">
                                            <AlertCircle className="w-3.5 h-3.5 animate-spin" />
                                            Oscilação de rede detectada. Reconectando...
                                        </p>
                                    )}

                                    {connectionStatus === 'acquiring' && (
                                        <p className="text-xs text-blue-400 font-bold flex items-center justify-center gap-1.5 mt-1">
                                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                            Inicializando câmera e microfone...
                                        </p>
                                    )}

                                    {connectionStatus === 'error' && (
                                        <div className="mt-3">
                                            <p className="text-xs text-red-400 font-bold mb-2">
                                                Falha temporária ao inicializar a mídia.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={retryMedia}
                                                className="px-4 py-2 bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold rounded-xl transition-all shadow-md cursor-pointer inline-flex items-center gap-1.5"
                                            >
                                                <Loader2 className="w-3.5 h-3.5" />
                                                Tentar Reconectar Câmera
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Barra Superior de Status e Alertas dentro da Janela de Vídeo (Evita sobreposição no mobile) */}
                        <div className="absolute top-2.5 sm:top-3 inset-x-2.5 sm:inset-x-3 z-10 flex flex-wrap items-center justify-between gap-1.5 pointer-events-none">
                            {/* Alerta de Microfone Silenciado (Lado Esquerdo) */}
                            <div className="pointer-events-auto">
                                {peerMuted && connectionStatus === 'connected' && (
                                    <div className="flex items-center gap-1 sm:gap-1.5 bg-red-950/90 border border-red-500/50 text-red-200 text-[10px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-full backdrop-blur-md shadow-md">
                                        <MicOff className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400 shrink-0" />
                                        <span className="truncate max-w-[140px] sm:max-w-none">Microfone silenciado</span>
                                    </div>
                                )}
                            </div>

                            {/* Badge de Status de Conexão (Lado Direito) */}
                            <div className="pointer-events-auto ml-auto">
                                {connectionStatus === 'connected' && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 backdrop-blur-md shadow-md">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
                                        P2P Criptografado
                                    </span>
                                )}
                                {connectionStatus === 'waiting' && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-amber-950/90 text-amber-300 border border-amber-500/50 backdrop-blur-md shadow-md">
                                        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping shrink-0" />
                                        Aguardando
                                    </span>
                                )}
                                {connectionStatus === 'reconnecting' && (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold bg-red-950/90 text-red-300 border border-red-500/50 backdrop-blur-md shadow-md">
                                        <AlertCircle className="w-3 h-3 text-red-400 animate-spin shrink-0" />
                                        Reconectando...
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Miniatura Picture-in-Picture do Feed Local (Posicionada acima dos controles) */}
                        <div className="absolute bottom-20 right-3 sm:bottom-22 sm:right-4 w-28 sm:w-40 h-20 sm:h-28 bg-gray-900/95 backdrop-blur-xs rounded-2xl border border-gray-700/80 shadow-2xl overflow-hidden flex items-center justify-center z-20">
                            <video
                                ref={localVideoRef}
                                autoPlay
                                playsInline
                                muted
                                className={`w-full h-full object-cover scale-x-[-1] rounded-2xl ${
                                    !isVideoOff ? 'block' : 'hidden'
                                }`}
                            />
                            {isVideoOff && (
                                <div className="text-center p-2">
                                    <VideoOff className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 mx-auto mb-1" />
                                    <span className="text-[10px] text-gray-400 font-bold block">
                                        Câmera Desligada
                                    </span>
                                </div>
                            )}
                            <div className="absolute bottom-1.5 left-2 right-2 flex items-center justify-between text-[10px] font-bold text-white bg-black/70 px-2 py-0.5 rounded-md backdrop-blur-xs">
                                <span className="truncate">Você</span>
                                {isMuted && <MicOff className="w-3 h-3 text-red-400 shrink-0" />}
                            </div>
                        </div>

                        {/* Barra Integrada de Comandos de Chamada (Fixada no Rodapé da Janela de Vídeo) */}
                        <div className="absolute bottom-3 sm:bottom-4 inset-x-0 flex items-center justify-center z-30 pointer-events-auto px-2">
                            <div className="py-2 px-3 sm:px-4 bg-gray-950/85 backdrop-blur-md border border-gray-700/70 rounded-2xl flex items-center justify-center gap-2.5 sm:gap-4 shadow-2xl">
                                {/* Botão Microfone */}
                                <button
                                    type="button"
                                    onClick={toggleAudio}
                                    className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                                        isMuted
                                            ? 'bg-red-500/30 text-red-400 border border-red-500/50 hover:bg-red-500/40'
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
                                    onClick={toggleVideo}
                                    className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
                                        isVideoOff
                                            ? 'bg-red-500/30 text-red-400 border border-red-500/50 hover:bg-red-500/40'
                                            : 'bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700'
                                    }`}
                                    title={isVideoOff ? 'Ligar Câmera' : 'Desligar Câmera'}
                                    aria-label={isVideoOff ? 'Ligar Câmera' : 'Desligar Câmera'}
                                >
                                    {isVideoOff ? <VideoOff className="w-5 h-5 sm:w-6 sm:h-6" /> : <Video className="w-5 h-5 sm:w-6 sm:h-6" />}
                                </button>

                                {/* Botão Tela Inteira (Fullscreen - Mobile e Desktop) */}
                                <button
                                    type="button"
                                    onClick={toggleFullscreen}
                                    className={`w-11 h-11 sm:w-13 sm:h-13 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${
                                        isFullscreen
                                            ? 'bg-brand-orange text-white border-brand-orange shadow-md'
                                            : 'bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700'
                                    }`}
                                    title={isFullscreen ? 'Sair da Tela Inteira' : 'Tela Inteira (Expandir Vídeo)'}
                                    aria-label={isFullscreen ? 'Sair da Tela Inteira' : 'Tela Inteira'}
                                >
                                    {isFullscreen ? <Minimize2 className="w-5 h-5 sm:w-6 sm:h-6" /> : <Maximize2 className="w-5 h-5 sm:w-6 sm:h-6" />}
                                </button>

                                {/* Botão Sair da Sala */}
                                {isDoctor ? (
                                    <button
                                        type="button"
                                        onClick={handleDoctorLeave}
                                        className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-red-600 hover:bg-red-500 text-white border border-red-500/60 flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                                        title="Sair da Sala"
                                        aria-label="Sair da Sala"
                                    >
                                        <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </button>
                                ) : (
                                    <button
                                        type="button"
                                        onClick={handlePatientLeave}
                                        className="w-11 h-11 sm:w-13 sm:h-13 rounded-xl bg-red-600 hover:bg-red-500 text-white border border-red-500/60 flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
                                        title="Sair da Sala (Você pode retornar quando desejar)"
                                        aria-label="Sair da Sala"
                                    >
                                        <LogOut className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    </div>
                </div>

                {/* COLUNA DIREITA: Cockpit Clínico do Médico Durante a Chamada */}
                {isDoctor && (
                    <div className="lg:col-span-7 xl:col-span-7 bg-brand-ice text-brown-dark flex flex-col border-t lg:border-t-0 lg:border-l border-brand-pot/30 overflow-hidden h-full min-h-0">
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
                                <span>Prontuário da Consulta</span>
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
                            {/* ABA 1: CARD ÚNICO DE PRONTUÁRIO CLÍNICO (SPEC-12B / UC14)       */}
                            {/* ============================================================== */}
                            {activeTab === 'prontuario' && (
                                <div className="bg-white rounded-3xl border border-brand-pot/30 p-5 sm:p-6 shadow-xs space-y-5">
                                    {/* Cabeçalho do Card Único com Dados do Paciente */}
                                    <div className="border-b border-brand-pot/30 pb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                        <div>
                                            <span className="text-[10px] font-black uppercase tracking-wider text-brand-orange block">
                                                Prontuário Ético Eletrônico
                                            </span>
                                            <h3 className="text-base sm:text-lg font-black text-brown-dark">
                                                {appointment?.patientName || 'Paciente'}
                                            </h3>
                                            <p className="text-xs text-brown-light mt-0.5">
                                                Dr(a). {appointment?.doctorName} • CRM {appointment?.doctorCrm}/{appointment?.doctorUfCrm}
                                            </p>
                                        </div>

                                        <div className="self-start sm:self-auto">
                                            {medicalRecord.status === 'FINALIZED' ? (
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-bold">
                                                    <Lock className="w-3.5 h-3.5 text-emerald-700" />
                                                    <span>Finalizado & Assinado</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-100 text-amber-900 border border-amber-300 text-xs font-bold">
                                                    <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                                                    <span>Rascunho Ativo</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    

                                    {/* Espaço Único Amplo de Relatório Clínico da Consulta */}
                                    <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                            <label className="text-xs font-black text-brown-dark uppercase tracking-wider flex items-center gap-1.5">
                                                <FileText className="w-4 h-4 text-brand-orange" />
                                                Relatório da Consulta & Evolução Médica
                                            </label>
                                            <span className="text-[11px] text-brown-light italic">
                                                {medicalRecord.status === 'FINALIZED' ? 'Documento Bloqueado' : 'Campo editável pelo médico'}
                                            </span>
                                        </div>
                                        <textarea
                                            rows={14}
                                            disabled={medicalRecord.status === 'FINALIZED'}
                                            value={medicalRecord.clinicalConduct || medicalRecord.clinicalEvolution || ''}
                                            onChange={(e) => {
                                                setMedicalRecord({
                                                    ...medicalRecord,
                                                    clinicalConduct: e.target.value,
                                                    clinicalEvolution: e.target.value,
                                                });
                                            }}
                                            placeholder={`1. Anamnese & Queixas Principais:\n   (Descreva os sintomas relatados pelo paciente ou cuidador familiar)\n\n2. Avaliação Clínica & Estado Geral:\n   (Aspectos cognitivos, mobilidade, comunicabilidade e suporte social)\n\n3. Diagnóstico / CID-11:\n   (Hipóteses diagnósticas ou impressão clínica)\n\n4. Conduta Terapêutica & Plano de Cuidado:\n   (Orientações gerais, ajustes de medicamentos e data sugerida para retorno)`}
                                            className="w-full p-4 rounded-2xl border border-gray-200 text-xs sm:text-sm leading-relaxed font-sans focus:ring-2 focus:ring-brand-orange focus:border-brand-orange disabled:bg-gray-100 disabled:text-gray-500 shadow-inner"
                                        />
                                    </div>

                                    

                                    {/* Exibição do Hash de Integridade se Finalizado */}
                                    {medicalRecord.status === 'FINALIZED' && (
                                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-2xl text-[11px] font-mono text-gray-700 break-all">
                                            <strong>Selo de Integridade CFM (SHA-256): </strong>
                                            {medicalRecord.hashSignature}
                                        </div>
                                    )}

                                    {/* Botões de Ação do Card Único */}
                                    {medicalRecord.status !== 'FINALIZED' && (
                                        <div className="pt-2 border-t border-brand-pot/20 flex flex-col sm:flex-row items-center justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={handleSaveDraft}
                                                disabled={savingRecord}
                                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-brand-pot/40 hover:bg-brand-ice text-brown-dark font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
                                            >
                                                {savingRecord ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                                <span>Salvar Rascunho</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={promptFinalizeRecord}
                                                disabled={finalizingRecord}
                                                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
                                            >
                                                {finalizingRecord ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
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
                            {/* ABA 3: EMISSÃO DE PRESCRIÇÕES E DOCUMENTOS (UC15 / SPEC-12B)   */}
                            {/* ============================================================== */}
                            {activeTab === 'receitas' && (
                                <div className="space-y-5">
                                    {/* Formulário de Nova Emissão Limpo */}
                                    <form onSubmit={handleIssueDocument} className="bg-white p-4 sm:p-5 rounded-3xl border border-brand-pot/30 shadow-xs space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-xs uppercase tracking-wider font-black text-brand-orange flex items-center gap-2">
                                                <PlusCircle className="w-4 h-4" />
                                                Emitir Novo Documento Clínico
                                            </h3>
                                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                                                Padrão ICP-Brasil / Gov.br
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
                                                rows={5}
                                                required
                                                value={docContent}
                                                onChange={(e) => setDocContent(e.target.value)}
                                                placeholder={
                                                    docType === 'RECEITA_MEDICA'
                                                        ? '1. [Nome do Medicamento e Dosagem] - Tomar 1 comprimido pela manhã\n2. [Nome do Medicamento e Dosagem] - Tomar 1 cápsula à noite'
                                                        : docType === 'PEDIDO_EXAME'
                                                        ? 'Solicito os seguintes exames:\n- Hemograma Completo\n- Glicemia de Jejum e HbA1c\n- Perfil Lipídico Completo'
                                                        : `Atesto para os devidos fins que o(a) paciente ${appointment?.patientName || ''} esteve sob atendimento médico nesta data...`
                                                }
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
                                                placeholder={
                                                    docType === 'RECEITA_MEDICA'
                                                        ? 'Ex: Manter boa hidratação ao longo do dia e ingerir medicamentos após refeições...'
                                                        : docType === 'PEDIDO_EXAME'
                                                        ? 'Ex: Jejum de 8 a 10 horas em laboratório habilitado...'
                                                        : 'Ex: Repouso relativo de 3 dias e hidratação regular...'
                                                }
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
                                                            Emitido às {new Date(doc.issuedAt || doc.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
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

                {/* COLUNA DIREITA: Painel Clínico e Prescrições do Paciente (Duas Colunas) */}
                {!isDoctor && (
                    <div className="lg:col-span-5 xl:col-span-5 bg-brand-ice text-brown-dark flex flex-col border-t lg:border-t-0 lg:border-l border-brand-pot/30 overflow-hidden h-full min-h-0">
                        {/* Seletor de Abas Acessíveis do Paciente */}
                        <div className="p-2 sm:p-3 bg-white border-b border-brand-pot/30 flex items-center gap-1.5 shrink-0 overflow-x-auto">
                            <button
                                type="button"
                                onClick={() => setPatientTab('documentos')}
                                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer min-h-[44px] ${
                                    patientTab === 'documentos'
                                        ? 'bg-brand-orange text-white shadow-sm font-black'
                                        : 'text-brown-light hover:bg-brand-ice hover:text-brown-dark'
                                }`}
                            >
                                <FileSignature className="w-4 h-4 shrink-0" />
                                <span>Receitas & Prescrições ({documents.length})</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setPatientTab('orientacoes')}
                                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap cursor-pointer min-h-[44px] ${
                                    patientTab === 'orientacoes'
                                        ? 'bg-brand-orange text-white shadow-sm font-black'
                                        : 'text-brown-light hover:bg-brand-ice hover:text-brown-dark'
                                }`}
                            >
                                <FileText className="w-4 h-4 shrink-0" />
                                <span>Dados da Consulta</span>
                            </button>
                        </div>

                        {/* Conteúdo da Aba do Paciente com Scroll Interno */}
                        <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4">
                            {patientTab === 'documentos' && (
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between pb-2 border-b border-brand-pot/20">
                                        <div className="flex items-center gap-2">
                                            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-xs font-black uppercase text-brand-pot tracking-wider">
                                                Prescrições em Tempo Real
                                            </span>
                                        </div>
                                        <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-md">
                                            {documents.length} disponível(is)
                                        </span>
                                    </div>

                                    {loadingDocs && documents.length === 0 ? (
                                        <div className="py-12 text-center text-brown-light">
                                            <Loader2 className="w-7 h-7 animate-spin mx-auto text-brand-orange" />
                                            <p className="text-xs font-bold mt-2">Buscando documentos...</p>
                                        </div>
                                    ) : documents.length === 0 ? (
                                        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-dashed border-brand-pot/40 text-center space-y-2.5 shadow-xs">
                                            <FileText className="w-12 h-12 text-brand-pot/40 mx-auto" />
                                            <h5 className="text-sm sm:text-base font-black text-brown-dark">
                                                Nenhum documento emitido até o momento
                                            </h5>
                                            <p className="text-xs text-brown-light leading-relaxed max-w-md mx-auto">
                                                Assim que o médico emitir uma receita, atestado ou pedido de exame durante a chamada, ele aparecerá aqui instantaneamente com botão direto para visualização e impressão em modelo oficial.
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {documents.map((doc) => (
                                                <div
                                                    key={doc.id}
                                                    className="bg-white p-4 rounded-2xl border border-brand-pot/30 hover:border-brand-orange/60 transition-all flex items-center justify-between gap-3 shadow-xs"
                                                >
                                                    <div className="min-w-0">
                                                        <span className="text-[10px] font-black uppercase text-brand-orange block">
                                                            {doc.documentType === 'RECEITA_MEDICA' ? 'Receita Médica' : doc.documentType === 'PEDIDO_EXAME' ? 'Pedido de Exame' : 'Atestado'}
                                                        </span>
                                                        <h5 className="text-xs sm:text-sm font-black text-brown-dark truncate">
                                                            {doc.title}
                                                        </h5>
                                                        <p className="text-[11px] text-brown-light font-mono mt-0.5">
                                                            Código: {doc.validationCode}
                                                        </p>
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={() => handleOpenPrintModal(doc)}
                                                        className="px-3.5 py-2 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer min-h-[40px] shadow-xs"
                                                    >
                                                        <Printer className="w-3.5 h-3.5" />
                                                        <span>Imprimir</span>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            {patientTab === 'orientacoes' && (
                                <div className="space-y-4">
                                    {/* Card de Informações Médicas */}
                                    <div className="bg-white p-5 rounded-3xl border border-brand-pot/30 shadow-xs space-y-3">
                                        <h5 className="text-xs font-black uppercase text-brand-orange tracking-wider flex items-center gap-2">
                                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                            Médico Especialista
                                        </h5>
                                        <div className="flex items-center gap-3 pt-1">
                                            <div className="w-12 h-12 rounded-full bg-orange-100 text-brand-orange flex items-center justify-center font-black text-lg shrink-0">
                                                <User className="w-6 h-6" />
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="text-sm font-black text-brown-dark truncate">
                                                    {appointment?.doctorName}
                                                </h4>
                                                <p className="text-xs text-brown-light">
                                                    CRM {appointment?.doctorCrm}/{appointment?.doctorUfCrm} • {appointment?.doctorSpecialty || 'Geriatria & Longevidade'}
                                                </p>
                                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded mt-1 border border-emerald-200">
                                                    Telemedicina Homologada Res. CFM 2.314/2022
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Card de Orientações da Consulta */}
                                    <div className="bg-white p-5 rounded-3xl border border-brand-pot/30 shadow-xs space-y-3">
                                        <h5 className="text-xs font-black uppercase text-brand-pot tracking-wider flex items-center gap-2">
                                            <Clock className="w-4 h-4 text-brand-orange" />
                                            Orientações para o Idoso e Cuidador
                                        </h5>
                                        <ul className="text-xs text-brown-light space-y-2.5">
                                            <li className="flex items-start gap-2">
                                                <span className="text-brand-orange font-bold text-sm leading-none">•</span>
                                                <span>Fale com tranquilidade e posicione a câmera na altura dos olhos.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-brand-orange font-bold text-sm leading-none">•</span>
                                                <span>Tenha sua lista ou caixas de remédios em uso por perto para conferência.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-brand-orange font-bold text-sm leading-none">•</span>
                                                <span>Todas as receitas emitidas nesta sala são válidas em qualquer farmácia do Brasil.</span>
                                            </li>
                                            <li className="flex items-start gap-2">
                                                <span className="text-brand-orange font-bold text-sm leading-none">•</span>
                                                <span>Esta teleconsulta conta com criptografia P2P e sigilo absoluto perante o CFM.</span>
                                            </li>
                                        </ul>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>

            {/* Modal de Impressão Oficial de Documento em Preto e Branco */}
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
