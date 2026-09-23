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
  
  const lineWidth = currentStep === 1 ? 'w-0' : currentStep === 2 ? 'w-1/2' : 'w-full';

  return (
    <div 
      className="flex items-center justify-between mb-8 relative"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={3}
      aria-valuenow={currentStep}
      aria-label={ariaLabel}
    >
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-brand-pot/30 -z-10" aria-hidden="true"></div>
      <div className={`absolute left-0 top-1/2 -translate-y-1/2 h-1 transition-all duration-500 -z-10 ${activeColors.line} ${lineWidth}`} aria-hidden="true"></div>
      
      {[1, 2, 3].map((item) => {
        const isCompleted = currentStep > item;
        const isActive = currentStep >= item;
        const isCurrent = currentStep === item;

        return (
          <div 
            key={item} 
            className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border-2 transition-colors ${
              isActive ? `${activeColors.bg} ${activeColors.border} ${activeColors.text}` : 'bg-white border-brand-pot text-brown-light'
            }`}
            aria-current={isCurrent ? 'step' : undefined}
          >
            {/* Texto exclusivo para Leitores de Tela */}
            <span className="sr-only">
              {isCurrent ? `Etapa atual: Passo ${item}` : isCompleted ? `Passo ${item} concluído` : `Passo ${item} pendente`}
            </span>
            {/* Elemento visual ignorado pelos leitores para evitar redundância */}
            <span aria-hidden="true">
              {isCompleted ? <CheckCircle2 size={16} /> : item}
            </span>
          </div>
        );
      })}
    </div>
  );
}

