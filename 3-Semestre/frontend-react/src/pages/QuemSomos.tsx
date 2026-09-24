import { ShieldCheck, Users, Target, Eye, Heart, MonitorSmartphone, Lock, Award, Lightbulb } from 'lucide-react';

export function QuemSomos() {
  return (
    <main className="flex-grow relative overflow-hidden bg-white">
      {/* Esferas de background */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-orange/10 rounded-full blur-3xl opacity-50 -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute top-1/2 right-0 w-[400px] h-[400px] bg-brand-mint/10 rounded-full blur-3xl opacity-60 translate-x-1/2 -translate-y-1/2"></div>

      <div className="max-w-5xl mx-auto px-4 py-20 relative z-10">
        
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-brown-dark mb-6">Nossa História</h1>
          <p className="text-xl text-brown leading-relaxed max-w-4xl mx-auto text-left md:text-center">
            A Active Age nasceu da percepção de uma necessidade crescente por atendimento médico especializado e acessível para a população idosa. Observamos que a distância, a mobilidade reduzida e a dificuldade de locomoção muitas vezes se tornam barreiras cruciais para que os idosos recebam a atenção geriátrica que merecem. 
            <br /><br />
            Fundada em 2025, nossa plataforma foi idealizada exatamente para romper essas barreiras. Utilizamos a tecnologia como uma ponte segura entre a experiência dos geriatras e o conforto do lar dos pacientes. Acreditamos que o envelhecimento deve ser vivido com qualidade, dignidade e muito acesso à saúde. Por isso, desenvolvemos uma interface acolhedora, pensada não só para o médico, mas para ser utilizada sem medo por idosos e seus cuidadores.
          </p>
        </div>

        {/* Missão e Visão */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">
          <div className="bg-brand-pot/10 p-10 rounded-3xl border border-brand-pot/50 shadow-sm">
            <div className="w-14 h-14 bg-brand-orange/20 rounded-2xl flex items-center justify-center text-brand-orange mb-6">
              <Target size={28} />
            </div>
            <h2 className="text-3xl font-bold text-brown-dark mb-4">Nossa Missão</h2>
            <p className="text-brown text-lg leading-relaxed">
              Promover a saúde e o bem-estar da população idosa, facilitando o acesso a teleconsultas com geriatras rigorosamente qualificados, através de uma plataforma inovadora, segura e altamente humanizada.
            </p>
          </div>
          
          <div className="bg-brand-blue/5 p-10 rounded-3xl border border-brand-blue/20 shadow-sm">
            <div className="w-14 h-14 bg-brand-mint/30 rounded-2xl flex items-center justify-center text-brown-dark mb-6">
              <Eye size={28} />
            </div>
            <h2 className="text-3xl font-bold text-brown-dark mb-4">Nossa Visão</h2>
            <p className="text-brown text-lg leading-relaxed">
              Ser a principal referência em telessaúde geriátrica no Brasil, reconhecida pela excelência no atendimento, pela inovação tecnológica e pelo impacto positivo inegável na qualidade de vida das famílias.
            </p>
          </div>
        </div>

        {/* Valores */}
        <div className="mb-24">
          <h2 className="text-3xl md:text-4xl font-bold text-brown-dark mb-10 text-center">Nossos Valores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <Heart className="text-brand-orange mb-4" size={32} />
              <h3 className="font-bold text-brown-dark text-xl mb-2">Humanização</h3>
              <p className="text-brown">A tecnologia existe apenas a serviço do cuidado, da escuta ativa e da empatia.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <MonitorSmartphone className="text-brand-orange mb-4" size={32} />
              <h3 className="font-bold text-brown-dark text-xl mb-2">Acessibilidade</h3>
              <p className="text-brown">Design sem atritos. Saúde de qualidade com letras grandes e ao alcance de todos.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center">
              <Lock className="text-brand-orange mb-4" size={32} />
              <h3 className="font-bold text-brown-dark text-xl mb-2">Segurança</h3>
              <p className="text-brown">Proteção integral de prontuários (LGPD) e validação estrita de CRM médico.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center md:col-span-1 md:col-start-1 lg:col-start-auto">
              <Award className="text-brand-orange mb-4" size={32} />
              <h3 className="font-bold text-brown-dark text-xl mb-2">Excelência</h3>
              <p className="text-brown">Busca incansável pela melhoria da experiência de ponta a ponta na plataforma.</p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex flex-col items-center text-center md:col-span-1">
              <Lightbulb className="text-brand-orange mb-4" size={32} />
              <h3 className="font-bold text-brown-dark text-xl mb-2">Inovação</h3>
              <p className="text-brown">Soluções digitais criativas para desafios reais do envelhecimento brasileiro.</p>
            </div>
          </div>
        </div>

        {/* O Propósito na Prática */}
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-brown-dark mb-10 text-center">O Propósito na Prática</h2>
          <div className="space-y-8">
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-brand-pot/50 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-8 items-start">
              <div className="p-4 bg-brand-orange/10 rounded-2xl shrink-0">
                <Users className="text-brand-orange" size={36} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-brown-dark mb-3">Para as Famílias</h3>
                <p className="text-brown text-lg leading-relaxed">
                  Eliminamos as barreiras geográficas e logísticas, conectando filhos e cuidadores aos melhores geriatras do país com poucos cliques, garantindo que o paciente seja avaliado no local onde se sente mais seguro: em casa.
                </p>
              </div>
            </div>
            
            <div className="bg-white p-10 rounded-3xl shadow-sm border border-brand-pot/50 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-8 items-start">
              <div className="p-4 bg-brand-mint/20 rounded-2xl shrink-0">
                <ShieldCheck className="text-brown-dark" size={36} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-brown-dark mb-3">Para os Profissionais</h3>
                <p className="text-brown text-lg leading-relaxed">
                  Mais que um sistema de agendamento, entregamos um ecossistema ético construído sob as diretrizes do CFM. Permitimos que geriatras rentabilizem seu tempo online sem abrir mão do controle clínico e do faturamento garantido.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}

