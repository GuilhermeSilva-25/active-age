import React, { useEffect, useRef } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, Loader2 } from 'lucide-react';

export type FeedbackModalType = 'success' | 'error' | 'warning' | 'info';

export interface FeedbackModalProps {
  isOpen: boolean;
  type?: FeedbackModalType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  showCancelButton?: boolean;
  isLoading?: boolean;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  type = 'info',
  title,
  message,
  confirmText = 'Entendido',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
  showCancelButton = false,
  isLoading = false,
}) => {
  const confirmButtonRef = useRef<HTMLButtonElement>(null);

  const isBusy = isLoading || 
    confirmText?.toLowerCase().includes('excluindo') || 
    confirmText?.toLowerCase().includes('salvando') || 
    confirmText?.toLowerCase().includes('carregando');

  useEffect(() => {
    if (isOpen) {
      // Foco automático no botão de confirmação para acessibilidade por teclado
      confirmButtonRef.current?.focus();

      // Fechar modal ao pressionar tecla Escape
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          if (showCancelButton && onCancel) {
            onCancel();
          } else {
            onConfirm();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onConfirm, onCancel, showCancelButton]);

  if (!isOpen) return null;

  const typeConfig = {
    success: {
      icon: <CheckCircle2 className="w-12 h-12 text-emerald-600" aria-hidden="true" />,
      bgIcon: 'bg-emerald-50 border-emerald-200',
      btnClass: 'bg-brand-orange hover:bg-orange-600 text-white',
    },
    error: {
      icon: <AlertCircle className="w-12 h-12 text-red-600" aria-hidden="true" />,
      bgIcon: 'bg-red-50 border-red-200',
      btnClass: 'bg-red-600 hover:bg-red-700 text-white',
    },
    warning: {
      icon: <AlertTriangle className="w-12 h-12 text-amber-600" aria-hidden="true" />,
      bgIcon: 'bg-amber-50 border-amber-200',
      btnClass: 'bg-brand-orange hover:bg-orange-600 text-white',
    },
    info: {
      icon: <Info className="w-12 h-12 text-sky-600" aria-hidden="true" />,
      bgIcon: 'bg-sky-50 border-sky-200',
      btnClass: 'bg-brand-orange hover:bg-orange-600 text-white',
    },
  }[type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="feedback-modal-title"
      aria-describedby="feedback-modal-description"
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl border-2 border-brand-pot/40 text-center transform transition-all animate-in zoom-in-95 duration-200">
        {/* Botão de Fechar opcional no topo */}
        {showCancelButton && onCancel && (
          <button
            type="button"
            disabled={isBusy}
            onClick={onCancel}
            aria-label="Fechar modal"
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-brown-dark rounded-full hover:bg-gray-100 transition-colors focus:ring-2 focus:ring-brand-orange outline-none disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Ícone Descritivo em Destaque */}
        <div className="flex justify-center mb-5">
          <div
            className={`w-20 h-20 rounded-2xl border-2 flex items-center justify-center shadow-sm ${typeConfig.bgIcon}`}
          >
            {typeConfig.icon}
          </div>
        </div>

        {/* Título Acessível */}
        <h3
          id="feedback-modal-title"
          className="text-2xl md:text-3xl font-extrabold text-brown-dark mb-3 tracking-tight"
        >
          {title}
        </h3>

        {/* Descrição / Mensagem */}
        <p
          id="feedback-modal-description"
          className="text-base md:text-lg text-brown-dark/80 leading-relaxed mb-8 font-medium"
        >
          {message}
        </p>

        {/* Botões de Ação com Alvos Táteis Ampliados para Idosos (min-h: 48px) */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
          {showCancelButton && onCancel && (
            <button
              type="button"
              disabled={isBusy}
              onClick={onCancel}
              className="w-full sm:w-auto flex-1 min-h-[50px] px-6 py-3 rounded-xl border-2 border-brand-pot text-brown-dark font-bold hover:bg-gray-50 focus:ring-4 focus:ring-gray-200 outline-none transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {cancelText}
            </button>
          )}

          <button
            ref={confirmButtonRef}
            type="button"
            disabled={isBusy}
            onClick={onConfirm}
            className={`w-full sm:w-auto flex-1 min-h-[50px] px-6 py-3 rounded-xl font-bold shadow-md hover:shadow-lg focus:ring-4 focus:ring-orange-200 outline-none transition-all transform hover:-translate-y-0.5 inline-flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none ${typeConfig.btnClass}`}
          >
            {isBusy && (
              <Loader2 className="w-5 h-5 animate-spin shrink-0 text-white" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
