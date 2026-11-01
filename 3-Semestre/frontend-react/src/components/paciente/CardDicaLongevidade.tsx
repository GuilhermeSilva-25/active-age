import React, { useState, useEffect } from 'react';
import {
    Droplets,
    Dumbbell,
    Brain,
    ShieldCheck,
    Pill,
    Moon,
    Apple,
    HeartHandshake,
    Eye,
    Activity,
    Syringe,
    Smile,
    RefreshCw,
    BookOpenCheck,
    Sparkles
} from 'lucide-react';
import { type DicaLongevidade, obterDicaAleatoria } from '../../data/dicasLongevidade';

const ICON_MAP: Record<DicaLongevidade['icone'], React.ComponentType<{ className?: string }>> = {
    droplets: Droplets,
    dumbbell: Dumbbell,
    brain: Brain,
    shield: ShieldCheck,
    pill: Pill,
    moon: Moon,
    apple: Apple,
    heart: HeartHandshake,
    eye: Eye,
    activity: Activity,
    syringe: Syringe,
    smile: Smile,
};

export const CardDicaLongevidade: React.FC = () => {
    const [dica, setDica] = useState<DicaLongevidade>(() => obterDicaAleatoria());
    const [isRotating, setIsRotating] = useState(false);

    // Garante sorteio aleatório a cada montagem/visita
    useEffect(() => {
        setDica(obterDicaAleatoria());
    }, []);

    const handleProximaDica = () => {
        setIsRotating(true);
        const proxima = obterDicaAleatoria(dica.id);
        setDica(proxima);
        setTimeout(() => setIsRotating(false), 350);
    };

    const IconComponent = ICON_MAP[dica.icone] || Sparkles;

    return (
        <section
            aria-label="Dica de Longevidade Ativa e Saúde Geriátrica"
            className="bg-gradient-to-br from-amber-50/90 via-orange-50/70 to-amber-100/40 rounded-2xl sm:rounded-3xl p-5 sm:p-7 border-2 border-amber-200/90 shadow-sm transition-all hover:shadow-md"
        >
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                {/* Lado Esquerdo: Ícone e Conteúdo */}
                <div className="flex items-start gap-3.5 sm:gap-4.5 flex-1">
                    {/* Ícone Semântico */}
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                        <IconComponent className="w-6 h-6 sm:w-7 sm:h-7" />
                    </div>

                    <div className="space-y-1.5 flex-1">
                        {/* Tag de Categoria */}
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-amber-200/70 text-amber-900 text-[11px] sm:text-xs font-black uppercase tracking-wider">
                                <Sparkles className="w-3 h-3 text-amber-800" />
                                {dica.tema}
                            </span>
                            <span className="text-[11px] text-brown-light font-semibold">
                                • Longevidade Ativa & Saúde Preventiva
                            </span>
                        </div>

                        {/* Título da Orientação */}
                        <h3 className="text-base sm:text-xl font-black text-brown-dark tracking-tight leading-snug pt-0.5">
                            {dica.titulo}
                        </h3>

                        {/* Texto Explicativo e Fisiológico */}
                        <p className="text-brown-dark/90 text-xs sm:text-sm leading-relaxed pt-0.5 font-medium">
                            {dica.descricao}
                        </p>

                        {/* Selo de Evidência Médica */}
                        <div className="pt-2 flex items-center gap-1.5 text-[11px] sm:text-xs font-bold text-amber-900/90 bg-amber-100/60 rounded-xl px-3 py-1.5 border border-amber-300/50 w-fit">
                            <BookOpenCheck className="w-4 h-4 text-amber-800 shrink-0" />
                            <span>
                                <strong>Evidência Científica:</strong> {dica.fonteCientifica}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Lado Direito: Botão Acessível de Rotação sob Demanda */}
                <div className="self-end md:self-start shrink-0 pt-1 md:pt-0">
                    <button
                        type="button"
                        onClick={handleProximaDica}
                        aria-label="Exibir outra dica de saúde geriátrica"
                        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-amber-100/80 active:bg-amber-200 text-amber-900 border border-amber-300 text-xs sm:text-sm font-black transition-all shadow-xs hover:shadow-sm cursor-pointer min-h-[44px]"
                    >
                        <RefreshCw
                            className={`w-4 h-4 text-amber-700 transition-transform duration-300 ${
                                isRotating ? 'rotate-180' : ''
                            }`}
                        />
                        <span>Ver outra dica</span>
                    </button>
                </div>
            </div>
        </section>
    );
};
