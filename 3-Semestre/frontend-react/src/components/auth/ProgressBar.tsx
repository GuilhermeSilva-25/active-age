import { CheckCircle2 } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  theme: 'orange' | 'mint';
  ariaLabel: string;
}

export function ProgressBar({ currentStep, theme, ariaLabel }: ProgressBarProps) {
  const themeConfig = {
    orange: {
      bg: 'bg-brand-orange',
      border: 'border-brand-orange',
      text: 'text-white',
      line: 'bg-brand-orange',
    },
    mint: {
      bg: 'bg-brand-mint',
      border: 'border-brand-mint',
      text: 'text-brown-dark',
      line: 'bg-brand-mint',
    }
  };

  const activeColors = themeConfig[theme];

  return (
    <div 
      className="relative flex items-center justify-between mb-8"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={3}
      aria-valuenow={currentStep}
      aria-label={ariaLabel}
    >
      {/* Linha de Conexão de Fundo (Trilho Base) */}
      <div 
        className="absolute left-4 right-4 top-1/2 -translate-y-1/2 h-1 bg-[#D9CAB8] z-0 rounded-full" 
        aria-hidden="true"
      />

      {/* Linha de Conexão Ativa Conectando as Etapas Concluídas */}
      {currentStep > 1 && (
        <div 
          className={`absolute left-4 top-1/2 -translate-y-1/2 h-1 transition-all duration-500 z-0 rounded-full ${activeColors.line} ${
            currentStep === 2 ? 'right-1/2' : 'right-4'
          }`}
          aria-hidden="true"
        />
      )}
      
      {[1, 2, 3].map((item) => {
        const isCompleted = currentStep > item;
        const isActive = currentStep >= item;
        const isCurrent = currentStep === item;

        return (
          <div 
            key={item} 
            className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center font-bold border-2 transition-all shadow-xs ${
              isActive 
                ? `${activeColors.bg} ${activeColors.border} ${activeColors.text}` 
                : 'bg-white border-[#D9CAB8] text-brown-light'
            }`}
            aria-current={isCurrent ? 'step' : undefined}
          >
            {/* Texto exclusivo para Leitores de Tela */}
            <span className="sr-only">
              {isCurrent ? `Etapa atual: Passo ${item}` : isCompleted ? `Passo ${item} concluído` : `Passo ${item} pendente`}
            </span>
            {/* Elemento visual ignorado pelos leitores para evitar redundância */}
            <span aria-hidden="true">
              {isCompleted ? <CheckCircle2 size={18} /> : item}
            </span>
          </div>
        );
      })}
    </div>
  );
}
