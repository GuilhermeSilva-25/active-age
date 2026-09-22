import {Outlet, Link} from 'react-router-dom';
import {ChevronLeft} from 'lucide-react';
import logoImg from '../assets/logo-active-age.png';

export function AuthLayout() {
    return (
        <div className="min-h-screen bg-brand-pot/10 flex flex-col md:flex-row font-sans">

            {/* Lado Esquerdo - Branding (Escondido no celular, visível no PC) */}
            <div
                className="hidden md:flex md:w-1/2 bg-gradient-to-br from-brown-dark to-brand-orange p-12 flex-col justify-between relative overflow-hidden">
                {/* Camada de vidro escurecida sutil */}
                <div className="absolute inset-0 bg-black/10 z-0"></div>

                <div className="relative z-10">
                    <Link to="/">
                        {/* O "brightness-0 invert" deixa a nossa logo 100% branca para contrastar com o fundo escuro */}
                        <img src={logoImg} alt="Active Age Logo" className="h-16 brightness-0 invert"/>
                    </Link>
                </div>

                <div className="relative z-10 text-white">
                    <h1 className="text-4xl lg:text-5xl font-bold mb-6 leading-tight">O cuidado que você merece, com a
                        tecnologia que você confia.</h1>
                    <p className="text-lg opacity-90 max-w-md">Plataforma segura, em conformidade com o CFM e acessível
                        para todas as idades.</p>
                </div>
            </div>

            {/* Lado Direito - Onde os Formulários vão aparecer */}
            <div
                className="flex-1 w-full md:w-1/2 flex flex-col bg-white px-6 py-8 sm:px-12 md:px-16 md:py-12 relative overflow-y-auto shadow-[-10px_0_30px_rgba(0,0,0,0.05)]">

                <Link to="/"
                      className="inline-flex items-center text-brown-light hover:text-brand-orange mb-8 w-fit transition-colors font-medium">
                    <ChevronLeft size={20} className="mr-1"/>
                    Voltar para a Home
                </Link>

                {/* O <Outlet /> é o "buraco" onde o React Router vai injetar o Login ou Cadastro */}
                <div className="flex-grow flex flex-col justify-center max-w-md w-full mx-auto">
                    <Outlet/>
                </div>

            </div>
        </div>
    );
}