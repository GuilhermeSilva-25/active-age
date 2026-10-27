import { Link } from 'react-router-dom';
import { HeartPulse, Stethoscope, LayoutDashboard } from 'lucide-react';
import { useAuthUser } from '../../hooks/useAuthUser';

export function CTA() {
  const { user, isAuthenticated, dashboardPath } = useAuthUser();

  return (
    <section className="py-20 relative overflow-hidden bg-brand-pot/30 border-t border-brand-pot/50">
      
      {/* Suaves esferas de fundo para tirar a agressividade e dar um tom de calma/saúde */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-brand-mint/20 rounded-full blur-3xl opacity-60 translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-blue/10 rounded-full blur-3xl opacity-60 -translate-x-1/2 translate-y-1/2"></div>

      <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-brown-dark mb-6 leading-tight">
          Pronto para transformar sua experiência com a saúde?
        </h2>
        <p className="text-lg md:text-xl text-brown mb-10 max-w-2xl mx-auto">
          Junte-se a centenas de famílias e profissionais que confiam no Active Age para um acompanhamento geriátrico de excelência.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
          {isAuthenticated ? (
            <>
              <Link to={dashboardPath} className="btn-primary w-full sm:w-auto text-lg">
                <LayoutDashboard size={24} />
                {user?.role === 'ROLE_MEDICO'
                  ? 'Acessar Meu Consultório'
                  : user?.role === 'ROLE_ADMIN'
                  ? 'Painel Administrativo'
                  : 'Acessar Meu Painel'}
              </Link>
              {user?.role === 'ROLE_PACIENTE' && (
                <Link to="/paciente/dashboard" className="btn-secondary w-full sm:w-auto text-lg">
                  <HeartPulse size={24} />
                  Minhas Consultas
                </Link>
              )}
              {user?.role === 'ROLE_MEDICO' && (
                <Link to="/medico/credenciamento" className="btn-secondary w-full sm:w-auto text-lg">
                  <Stethoscope size={24} />
                  Dossiê de Credenciamento
                </Link>
              )}
            </>
          ) : (
            <>
              <Link to="/cadastro-paciente" className="btn-primary w-full sm:w-auto text-lg">
                <HeartPulse size={24} />
                Encontrar um Médico
              </Link>
              <Link to="/cadastro-medico" className="btn-secondary w-full sm:w-auto text-lg">
                <Stethoscope size={24} />
                Sou Médico
              </Link>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
