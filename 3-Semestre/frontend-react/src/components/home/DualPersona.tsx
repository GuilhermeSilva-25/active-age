import { ShieldCheck, Video, FileText, Bell, CreditCard, FolderHeart } from 'lucide-react';

export function DualPersona() {
  return (
    <section id="para-quem" className="pt-10 pb-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-brown-dark mb-4">Feito para cuidar. Criado para facilitar.</h2>
          <p className="text-xl text-brown max-w-2xl mx-auto">
            O Active Age une a necessidade de um acompanhamento geriátrico contínuo com a tecnologia certa para cada perfil.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-10">
          
          {/* Card Paciente */}
          <div className="bg-brand-pot/30 p-10 rounded-2xl border border-brand-pot shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-2xl font-bold text-brown-dark mb-6 border-b-2 border-brand-orange pb-4 inline-block">Para Pacientes e Cuidadores</h3>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <Video className="text-brand-orange" size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-brown-dark mb-1">Teleconsulta Sem Instalar Nada</h4>
                  <p className="text-brown text-lg">Acesse a sala de vídeo direto pelo navegador, sem complicações. Letras grandes e botões visíveis.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <FolderHeart className="text-brand-orange" size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-brown-dark mb-1">Documentação Sempre à Mão</h4>
                  <p className="text-brown text-lg">Nunca mais perca um papel. Suas receitas, atestados, relatórios médicos e exames ficam salvos permanentemente no seu perfil.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <Bell className="text-brand-orange" size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-brown-dark mb-1">Lembretes Inteligentes</h4>
                  <p className="text-brown text-lg">O sistema cuida da sua agenda. Você e seus familiares são avisados automaticamente sobre a proximidade da consulta.</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Card Médico */}
          <div className="bg-brand-blue/10 p-10 rounded-2xl border border-brand-blue/30 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-2xl font-bold text-brown-dark mb-6 border-b-2 border-brand-mint pb-4 inline-block">Para Médicos Geriatras</h3>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <ShieldCheck className="text-brand-mint" size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-brown-dark mb-1">Consultório Virtual Seguro</h4>
                  <p className="text-brown text-lg">Seu ambiente exclusivo de atendimento online. Agendas dinâmicas integradas que organizam sua disponibilidade em tempo real.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <FileText className="text-brand-mint" size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-brown-dark mb-1">Prontuário Ético Eletrônico</h4>
                  <p className="text-brown text-lg">Registre a evolução clínica na própria videochamada. Emita receitas, atestados e pedidos de exames com assinatura digital padrão CFM.</p>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="shrink-0 mt-1">
                  <CreditCard className="text-brand-mint" size={28} />
                </div>
                <div>
                  <h4 className="text-xl font-bold text-brown-dark mb-1">Faturamento Protegido</h4>
                  <p className="text-brown text-lg">Mais previsibilidade financeira para o seu negócio. O repasse da consulta é processado e assegurado no momento do agendamento.</p>
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>
    </section>
  );
}
