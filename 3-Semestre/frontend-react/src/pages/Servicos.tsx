import { Navbar } from '../components/home/Navbar';
import { Footer } from '../components/home/Footer';
import { ShieldCheck, Video } from 'lucide-react';

export function Servicos() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow">
        <div className="max-w-6xl mx-auto px-4 py-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brown-dark mb-6 text-center">Nossos Serviços</h1>
          <p className="text-xl text-brown mb-16 text-center max-w-3xl mx-auto">
            Uma plataforma desenhada de ponta a ponta para resolver as necessidades específicas da especialidade de geriatria.
          </p>
          
          <div className="grid md:grid-cols-2 gap-12">
            {/* Paciente */}
            <div className="bg-white p-10 rounded-3xl border border-brand-orange/30 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-orange/10 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              <div className="w-16 h-16 bg-brand-orange rounded-2xl flex items-center justify-center text-white mb-8 shadow-md">
                <Video size={32} />
              </div>
              <h2 className="text-3xl font-bold text-brown-dark mb-8">Plataforma do Paciente</h2>
              <ul className="space-y-6">
                <li className="flex gap-4 items-start">
                  <div className="w-2 h-2 mt-2.5 rounded-full bg-brand-orange shrink-0"></div>
                  <p className="text-brown text-lg"><strong>Teleconsultas Simplificadas:</strong> Salas de vídeo exclusivas acessadas diretamente pelo navegador.</p>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="w-2 h-2 mt-2.5 rounded-full bg-brand-orange shrink-0"></div>
                  <p className="text-brown text-lg"><strong>Busca Inteligente:</strong> Filtre médicos geriatras rigorosamente validados pelo nosso sistema.</p>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="w-2 h-2 mt-2.5 rounded-full bg-brand-orange shrink-0"></div>
                  <p className="text-brown text-lg"><strong>Cofre de Documentos:</strong> Armazenamento vitalício e seguro de receitas, exames e relatórios.</p>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="w-2 h-2 mt-2.5 rounded-full bg-brand-orange shrink-0"></div>
                  <p className="text-brown text-lg"><strong>Alertas Familiares:</strong> Lembretes de consultas via mensagens para pacientes e cuidadores associados.</p>
                </li>
              </ul>
            </div>

            {/* Médico */}
            <div className="bg-white p-10 rounded-3xl border border-brand-mint/50 shadow-sm relative overflow-hidden group hover:shadow-lg transition-all">
              <div className="absolute top-0 right-0 w-32 h-32 bg-brand-mint/20 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
              <div className="w-16 h-16 bg-brand-mint rounded-2xl flex items-center justify-center text-brown-dark mb-8 shadow-md">
                <ShieldCheck size={32} />
              </div>
              <h2 className="text-3xl font-bold text-brown-dark mb-8">Consultório Virtual</h2>
              <ul className="space-y-6">
                <li className="flex gap-4 items-start">
                  <div className="w-2 h-2 mt-2.5 rounded-full bg-brand-mint shrink-0"></div>
                  <p className="text-brown text-lg"><strong>Agenda Automática:</strong> Gerenciamento inteligente de horários sem risco de choques ou duplo agendamento.</p>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="w-2 h-2 mt-2.5 rounded-full bg-brand-mint shrink-0"></div>
                  <p className="text-brown text-lg"><strong>Prontuário Ético:</strong> Preenchimento da evolução clínica de forma integrada à tela da videochamada.</p>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="w-2 h-2 mt-2.5 rounded-full bg-brand-mint shrink-0"></div>
                  <p className="text-brown text-lg"><strong>Assinatura Padrão CFM:</strong> Emissão de receitas e atestados 100% digitais com validade legal em todo o território nacional.</p>
                </li>
                <li className="flex gap-4 items-start">
                  <div className="w-2 h-2 mt-2.5 rounded-full bg-brand-mint shrink-0"></div>
                  <p className="text-brown text-lg"><strong>Faturamento Garantido:</strong> Cobrança antecipada no agendamento, protegendo sua agenda contra inadimplência e faltas.</p>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

