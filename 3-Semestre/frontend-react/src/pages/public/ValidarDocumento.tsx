import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ShieldCheck,
    Search,
    CheckCircle2,
    XCircle,
    Loader2,
    ArrowLeft,
    Calendar,
    User,
} from 'lucide-react';
import type { DocumentValidation } from '../../types/teleconsulta';

export const ValidarDocumento: React.FC = () => {
    const { code } = useParams<{ code?: string }>();
    const navigate = useNavigate();

    const [inputCode, setInputCode] = useState(code || '');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<DocumentValidation | null>(null);

    const performValidation = async (codeToValidate: string) => {
        if (!codeToValidate.trim()) return;

        setLoading(true);
        setResult(null);
        try {
            const res = await fetch(`/api/medical-documents/validate/${encodeURIComponent(codeToValidate.trim())}`);
            if (res.ok) {
                const data = await res.json();
                setResult(data);
            } else {
                setResult({
                    valid: false,
                    validationCode: codeToValidate,
                    message: 'Falha ao validar o código informado junto à base de dados do CFM.',
                });
            }
        } catch {
            setResult({
                valid: false,
                validationCode: codeToValidate,
                message: 'Erro de conexão com o serviço de validação digital.',
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (code) {
            setInputCode(code);
            performValidation(code);
        }
    }, [code]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        performValidation(inputCode);
    };

    const formatDate = (isoStr?: string) => {
        if (!isoStr) return '';
        try {
            const date = new Date(isoStr);
            return date.toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
            });
        } catch {
            return isoStr;
        }
    };

    return (
        <div className="min-h-screen bg-brand-ice py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Botão Voltar */}
                <div>
                    <button
                        type="button"
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-brown-light hover:text-brown-dark transition-colors mb-2 cursor-pointer"
                    >
                        <ArrowLeft className="w-4 h-4 text-brand-orange" />
                        <span>Voltar para a Página Inicial</span>
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-brand-orange text-white flex items-center justify-center font-black shadow-sm">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-xl sm:text-2xl font-black text-brown-dark">
                                Validador de Documentos Médicos
                            </h1>
                            <p className="text-xs text-brown-light">
                                Conferência pública de receitas, pedidos de exames e atestados digitais
                            </p>
                        </div>
                    </div>
                </div>

                {/* Formulário de Busca por Código */}
                <form
                    onSubmit={handleSubmit}
                    className="bg-white p-5 sm:p-6 rounded-3xl border border-brand-pot/30 shadow-xs space-y-4"
                >
                    <label className="block text-xs font-bold text-brown-dark uppercase tracking-wide">
                        Digite o Código Verificador do Documento:
                    </label>

                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                required
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                                placeholder="Ex: AA-2026-XXXXXX"
                                className="w-full px-4 py-3 rounded-xl border border-gray-300 font-mono text-sm sm:text-base font-bold text-brown-dark focus:ring-2 focus:ring-brand-orange uppercase placeholder:normal-case"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || !inputCode.trim()}
                            className="px-6 py-3 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[48px]"
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Search className="w-4 h-4" />
                            )}
                            <span>Conferir Autenticidade</span>
                        </button>
                    </div>

                    <p className="text-[11px] text-brown-light leading-relaxed">
                        O código alfanumérico localiza-se no rodapé da receita ou atestado emitido via teleconsulta, em conformidade com as Resoluções CFM nº 2.314/2022 e 2.299/2021.
                    </p>
                </form>

                {/* Resultado da Validação */}
                {result && (
                    <div className="animate-in fade-in duration-300">
                        {result.valid ? (
                            <div className="bg-white rounded-3xl border-2 border-emerald-500 shadow-lg overflow-hidden">
                                <div className="p-5 sm:p-6 bg-emerald-50/90 border-b border-emerald-200 flex items-start gap-3.5">
                                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
                                        <CheckCircle2 className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <span className="px-2.5 py-0.5 rounded text-[10px] uppercase font-black bg-emerald-200/80 text-emerald-950 inline-block mb-1">
                                            Documento Autêntico & Verificado
                                        </span>
                                        <h3 className="text-base sm:text-lg font-black text-emerald-950">
                                            {result.title}
                                        </h3>
                                        <p className="text-xs text-emerald-800 font-medium mt-0.5">
                                            {result.message}
                                        </p>
                                    </div>
                                </div>

                                <div className="p-6 space-y-4 text-xs sm:text-sm text-brown-dark">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="bg-brand-ice/60 p-3.5 rounded-2xl border border-brand-pot/20">
                                            <span className="text-brown-light text-[10px] font-bold uppercase block">
                                                Médico Emitente:
                                            </span>
                                            <p className="font-black text-brown-dark flex items-center gap-1.5 mt-0.5">
                                                <User className="w-3.5 h-3.5 text-brand-orange" />
                                                {result.doctorName}
                                            </p>
                                            <p className="text-xs text-brown-light font-bold">
                                                CRM {result.doctorCrm}/{result.doctorUfCrm}
                                            </p>
                                        </div>

                                        <div className="bg-brand-ice/60 p-3.5 rounded-2xl border border-brand-pot/20">
                                            <span className="text-brown-light text-[10px] font-bold uppercase block">
                                                Paciente Beneficiário:
                                            </span>
                                            <p className="font-black text-brown-dark mt-0.5">
                                                {result.patientName}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-brand-pot/20 text-xs">
                                        <div className="flex items-center gap-1.5 text-brown-light">
                                            <Calendar className="w-3.5 h-3.5 text-brand-orange" />
                                            <span>Emitido em: <strong>{formatDate(result.issuedAt)}</strong></span>
                                        </div>

                                        <div className="font-mono text-xs font-black text-brand-orange">
                                            Código: {result.validationCode}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-white p-6 rounded-3xl border-2 border-red-300 shadow-md flex items-start gap-3.5">
                                <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                                    <XCircle className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-base font-black text-red-900">
                                        Documento Não Encontrado
                                    </h3>
                                    <p className="text-xs sm:text-sm text-red-800 font-medium mt-1">
                                        {result.message}
                                    </p>
                                    <p className="text-xs text-brown-light mt-2">
                                        Por favor, verifique se o código foi digitado corretamente, incluindo os hífens (ex: <strong>AA-2026-XXXXXX</strong>).
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
