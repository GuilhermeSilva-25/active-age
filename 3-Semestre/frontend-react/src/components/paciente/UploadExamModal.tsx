import React, { useState, useEffect, useRef } from 'react';
import {
    X,
    UploadCloud,
    FileText,
    Calendar,
    Tag,
    AlertCircle,
    Loader2,
    CheckCircle2
} from 'lucide-react';

interface UploadExamModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function UploadExamModal({ isOpen, onClose, onSuccess }: UploadExamModalProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [file, setFile] = useState<File | null>(null);
    const [title, setTitle] = useState('');
    const [category, setCategory] = useState<'LABORATORIAL' | 'IMAGEM' | 'CARDIOLOGICO' | 'OUTROS'>('LABORATORIAL');
    const [examDate, setExamDate] = useState('');
    const [notes, setNotes] = useState('');

    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    // Preenche a data máxima com a data de hoje
    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !loading) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, loading, onClose]);

    useEffect(() => {
        if (isOpen) {
            setFile(null);
            setTitle('');
            setCategory('LABORATORIAL');
            setExamDate(today);
            setNotes('');
            setErrorMessage('');
        }
    }, [isOpen, today]);

    if (!isOpen) return null;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.size > 10 * 1024 * 1024) {
                setErrorMessage('O arquivo excede o limite máximo de 10 MB.');
                return;
            }
            setErrorMessage('');
            setFile(selectedFile);
            if (!title) {
                const nameWithoutExt = selectedFile.name.substring(0, selectedFile.name.lastIndexOf('.')) || selectedFile.name;
                setTitle(nameWithoutExt);
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage('');

        if (!file) {
            setErrorMessage('Por favor, selecione um arquivo de exame em formato PDF ou imagem.');
            return;
        }

        if (!title.trim() || title.trim().length < 3) {
            setErrorMessage('O título do exame deve conter pelo menos 3 caracteres.');
            return;
        }

        if (!examDate) {
            setErrorMessage('Informe a data em que o exame foi realizado.');
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', title.trim());
            formData.append('category', category);
            formData.append('examDate', examDate);
            if (notes.trim()) {
                formData.append('notes', notes.trim());
            }

            const response = await fetch('/api/patient/exams', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                onSuccess();
                onClose();
            } else {
                const errorData = await response.json();
                setErrorMessage(errorData.message || 'Falha ao enviar o exame. Verifique os dados e tente novamente.');
            }
        } catch (err) {
            console.error('Erro no upload do exame:', err);
            setErrorMessage('Ocorreu um erro de comunicação com o servidor. Tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        const kb = bytes / 1024;
        if (kb < 1024) return kb.toFixed(1) + ' KB';
        return (kb / 1024).toFixed(1) + ' MB';
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-exam-title"
        >
            <div
                className="bg-white w-full max-w-xl rounded-2xl sm:rounded-3xl shadow-2xl border border-brand-pot/40 overflow-hidden flex flex-col max-h-[92vh] animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header do Modal */}
                <div className="bg-gradient-to-r from-blue-50 via-indigo-50/50 to-white p-5 sm:p-6 border-b border-brand-pot/30 flex items-center justify-between">
                    <div>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 block">
                            Cofre Digital de Saúde
                        </span>
                        <h2 id="modal-exam-title" className="text-xl sm:text-2xl font-black text-brown-dark">
                            Enviar Novo Exame ou Laudo
                        </h2>
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="p-2 rounded-xl text-brown-dark/60 hover:text-brown-dark hover:bg-black/5 transition-colors cursor-pointer disabled:opacity-50"
                        title="Fechar modal (Esc)"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Formulário de Envio */}
                <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-4 flex-1">
                    {/* Alerta de Erro */}
                    {errorMessage && (
                        <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-semibold flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                            <span>{errorMessage}</span>
                        </div>
                    )}

                    {/* Área de Seleção de Arquivo */}
                    <div>
                        <label className="text-xs sm:text-sm font-bold text-brown-dark block mb-1.5">
                            Arquivo do Exame ou Laudo (PDF, JPG, PNG ou WEBP até 10MB) *
                        </label>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept=".pdf, .jpg, .jpeg, .png, .webp"
                            className="hidden"
                        />

                        {file ? (
                            <div className="p-4 rounded-xl border-2 border-emerald-300 bg-emerald-50/50 flex items-center justify-between gap-3">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-xs sm:text-sm font-bold text-brown-dark truncate">
                                            {file.name}
                                        </p>
                                        <p className="text-[11px] text-brown-light font-medium">
                                            {formatFileSize(file.size)} • Pronto para salvar
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-3 py-1.5 rounded-lg border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold transition-colors cursor-pointer shrink-0"
                                >
                                    Alterar
                                </button>
                            </div>
                        ) : (
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                role="button"
                                tabIndex={0}
                                className="p-6 rounded-2xl border-2 border-dashed border-brand-pot/70 hover:border-brand-orange bg-gray-50/60 hover:bg-orange-50/30 text-center transition-all cursor-pointer space-y-2 group"
                            >
                                <div className="w-12 h-12 rounded-xl bg-brand-orange/10 text-brand-orange flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
                                    <UploadCloud className="w-6 h-6" />
                                </div>
                                <p className="text-xs sm:text-sm font-bold text-brown-dark">
                                    Clique aqui para selecionar o arquivo do seu aparelho
                                </p>
                                <p className="text-[11px] text-brown-light">
                                    Suporta laudos laboratoriais escaneados ou fotos de exames
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Título do Exame */}
                    <div>
                        <label className="text-xs sm:text-sm font-bold text-brown-dark block mb-1">
                            Título ou Nome do Exame *
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Ex: Hemograma Completo e Glicemia em Jejum"
                            maxLength={100}
                            required
                            className="w-full px-3.5 py-2.5 rounded-xl border border-brand-pot/60 text-brown-dark text-xs sm:text-sm font-medium focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none"
                        />
                    </div>

                    {/* Grid com Categoria e Data de Realização */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                        {/* Categoria Clínica */}
                        <div>
                            <label className="text-xs sm:text-sm font-bold text-brown-dark block mb-1">
                                Categoria do Exame *
                            </label>
                            <div className="relative flex items-center">
                                <Tag className="w-4 h-4 text-brand-orange absolute left-3 pointer-events-none" />
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as any)}
                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-brand-pot/60 text-brown-dark text-xs sm:text-sm font-bold bg-white focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none cursor-pointer"
                                >
                                    <option value="LABORATORIAL">Laboratorial (Sangue/Urina)</option>
                                    <option value="IMAGEM">Imagem (Raio-X/Tomografia/RM)</option>
                                    <option value="CARDIOLOGICO">Cardiológico (ECG/Holter/MAPA)</option>
                                    <option value="OUTROS">Outros Documentos / Laudos</option>
                                </select>
                            </div>
                        </div>

                        {/* Data de Realização */}
                        <div>
                            <label className="text-xs sm:text-sm font-bold text-brown-dark block mb-1">
                                Data do Exame *
                            </label>
                            <div className="relative flex items-center">
                                <Calendar className="w-4 h-4 text-brand-orange absolute left-3 pointer-events-none" />
                                <input
                                    type="date"
                                    value={examDate}
                                    onChange={(e) => setExamDate(e.target.value)}
                                    max={today}
                                    required
                                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-brand-pot/60 text-brown-dark text-xs sm:text-sm font-medium bg-white focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Observações Opcionais */}
                    <div>
                        <label className="text-xs sm:text-sm font-bold text-brown-dark block mb-1">
                            Anotações ou Observações (Opcional)
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Ex: Exame feito antes de iniciar a medicação para pressão; jejum de 12 horas."
                            maxLength={500}
                            rows={3}
                            className="w-full px-3.5 py-2.5 rounded-xl border border-brand-pot/60 text-brown-dark text-xs sm:text-sm font-medium focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 outline-none resize-none"
                        />
                        <span className="text-[11px] text-brown-light block text-right">
                            {notes.length}/500 caracteres
                        </span>
                    </div>

                    {/* Nota de Sigilo CFM / LGPD */}
                    <div className="p-3 bg-blue-50/70 rounded-xl border border-blue-200/60 text-[11px] sm:text-xs text-blue-900 leading-snug">
                        <strong>Proteção de Dados Médicos (LGPD Art. 11):</strong> Seus laudos ficam armazenados de forma criptografada e serão compartilhados exclusivamente com seus médicos geriatras durante as consultas.
                    </div>
                </form>

                {/* Rodapé do Modal com Ações */}
                <div className="p-4 sm:p-5 bg-gray-50 border-t border-brand-pot/30 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={loading}
                        className="px-4 sm:px-5 py-2.5 rounded-xl border border-brand-pot bg-white hover:bg-gray-100 text-brown-dark font-bold text-xs sm:text-sm transition-colors cursor-pointer disabled:opacity-50"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading || !file || !title.trim()}
                        className="px-5 sm:px-6 py-2.5 rounded-xl bg-brand-orange hover:bg-brand-orange/90 text-white font-bold text-xs sm:text-sm shadow-md hover:shadow-lg transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Salvando no Cofre...</span>
                            </>
                        ) : (
                            <>
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Salvar no Cofre</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
