import {Link} from 'react-router-dom';
import {HeartPulse, ShieldCheck, ArrowRight} from 'lucide-react';

export function CadastroEscolha() {
    return (
        <div className="w-full animate-fade-in">
            <div className="text-center md:text-left mb-8">
                <h2 className="text-3xl font-bold text-brown-dark mb-2">Crie sua conta</h2>
                <p className="text-brown">Para começarmos, por favor, selecione o seu perfil abaixo.</p>
            </div>

            {/* Opções de Perfil */}
            <div className="space-y-4">

                {/* Cartão do Paciente */}
                <Link
                    to="/cadastro-paciente"
                    className="group block p-6 rounded-2xl border-2 border-brand-pot/50 hover:border-brand-orange bg-white hover:bg-brand-orange/5 transition-all focus:outline-none focus:ring-4 focus:ring-brand-orange/30"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-14 h-14 rounded-full bg-brand-orange/10 flex items-center justify-center text-brand-orange group-hover:scale-110 transition-transform">
                                <HeartPulse size={28}/>
                            </div>
                            <div className="text-left">
                                <h3 className="text-lg font-bold text-brown-dark">Sou Paciente / Cuidador</h3>
                                <p className="text-sm text-brown">Quero agendar teleconsultas</p>
                            </div>
                        </div>
                        {/* A setinha só aparece quando passa o mouse (Hover) */}
                        <ArrowRight
                            className="text-brand-orange opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0"
                            size={24}/>
                    </div>
                </Link>

                {/* Cartão do Médico */}
                <Link
                    to="/cadastro-medico"
                    className="group block p-6 rounded-2xl border-2 border-brand-pot/50 hover:border-brand-mint bg-white hover:bg-brand-mint/10 transition-all focus:outline-none focus:ring-4 focus:ring-brand-mint/50"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div
                                className="w-14 h-14 rounded-full bg-brand-mint/20 flex items-center justify-center text-brown-dark group-hover:scale-110 transition-transform">
                                <ShieldCheck size={28}/>
                            </div>
                            <div className="text-left">
                                <h3 className="text-lg font-bold text-brown-dark">Sou Médico Geriatra</h3>
                                <p className="text-sm text-brown">Quero atender na plataforma</p>
                            </div>
                        </div>
                        <ArrowRight
                            className="text-brown-dark opacity-0 group-hover:opacity-100 transition-opacity -translate-x-4 group-hover:translate-x-0"
                            size={24}/>
                    </div>
                </Link>

            </div>

            {/* Rodapé */}
            <div className="mt-8 text-center border-t border-brand-pot/30 pt-6">
                <p className="text-brown">
                    Já tem uma conta?{' '}
                    <Link to="/login"
                          className="font-bold text-brand-orange hover:underline focus:outline-none focus:ring-2 focus:ring-brand-orange rounded">
                        Faça login
                    </Link>
                </p>
            </div>
        </div>
    );
}