import { Link } from 'react-router-dom';
import { HeartPulse, Stethoscope } from 'lucide-react';
import heroImg from '../../assets/hero-image.png';

export function Hero() {
  return (
    <div className="relative bg-gradient-to-br from-brand-pot via-white to-brand-pot/30 overflow-hidden">
      {/* Esfera Principal no Canto Inferior Esquerdo */}
      {/* Esferas de Gradiente */}
      <div className="absolute top-0 right-0 w-[500px] md:w-[600px] h-[500px] md:h-[600px] bg-gradient-to-bl from-brand-mint/30 to-brand-blue/20 rounded-full blur-3xl opacity-70 translate-x-1/4 -translate-y-1/4"></div>
      <div className="absolute bottom-0 left-0 w-[600px] md:w-[800px] h-[600px] md:h-[800px] bg-gradient-to-tr from-brand-mint/40 via-brand-blue/20 to-brand-orange/10 rounded-full blur-3xl opacity-90 -translate-x-1/4 translate-y-1/4"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="py-12 md:py-16 lg:py-20 grid md:grid-cols-2 gap-12 items-center">
          
          {/* Text Content */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <span className="inline-block py-1 px-3 rounded-full bg-white text-brand-orange font-bold text-sm mb-6 border border-brand-orange/20 shadow-sm relative z-10">
              Especialistas em Geriatria
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brown-dark leading-tight mb-6 relative z-10">
              Cuidado especializado no conforto do seu lar.
            </h1>
            <p className="text-lg md:text-xl text-brown mb-8 leading-relaxed max-w-lg relative z-10">
              Conectamos pacientes idosos aos melhores geriatras através de uma plataforma segura, simples e sem burocracia.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 relative z-10 w-full sm:w-auto justify-center md:justify-start">
              <Link to="/cadastro-paciente" className="btn-primary w-full sm:w-auto text-lg">
                <HeartPulse size={24} />
                Encontrar um Médico
              </Link>
              <Link to="/cadastro-medico" className="btn-secondary w-full sm:w-auto text-lg">
                <Stethoscope size={24} />
                Sou Médico
              </Link>
            </div>
            <p className="mt-6 md:mt-4 text-sm text-brown-light relative z-10 font-medium">
              * Cadastro gratuito. Pacientes pagam apenas pelas consultas e médicos ganham 15 dias de teste grátis.
            </p>
          </div>

          {/* Image/Visual Content */}
          <div className="flex justify-center relative">
            <img 
              src={heroImg} 
              alt="Idosos sorrindo e sendo bem cuidados" 
              className="relative z-10 w-full max-w-xl lg:max-w-2xl rounded-2xl shadow-2xl object-cover border-4 border-white/60"
            />
          </div>

        </div>
      </div>
    </div>
  );
}
