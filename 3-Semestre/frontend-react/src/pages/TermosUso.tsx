import { Navbar } from '../components/home/Navbar';
import { Footer } from '../components/home/Footer';

export function TermosUso() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />
      <main className="flex-grow bg-brand-pot/5">
        <div className="max-w-4xl mx-auto px-4 py-20">
          <h1 className="text-4xl font-bold text-brown-dark mb-4">Termos de Uso</h1>
          <p className="mb-12 text-brown font-medium">Última atualização: Setembro de 2026</p>
          
          <div className="prose prose-lg prose-headings:text-brown-dark prose-p:text-brown max-w-none">
            <h2 className="text-2xl font-bold text-brand-orange mt-8 mb-4">1. Aceitação dos Termos</h2>
            <p className="mb-6 leading-relaxed">
              Ao acessar ou usar a plataforma Active Age ("Plataforma"), você concorda em cumprir e estar vinculado a estes Termos de Uso ("Termos"). Se você não concorda com qualquer parte destes Termos, não deverá utilizar a Plataforma.
            </p>

            <h2 className="text-2xl font-bold text-brand-orange mt-8 mb-4">2. Serviços Oferecidos</h2>
            <p className="mb-6 leading-relaxed">
              A Active Age é uma plataforma tecnológica que conecta pacientes (e seus cuidadores) a médicos geriatras. O sistema fornece toda a infraestrutura para telemedicina, mas <strong>não somos uma clínica médica nem prestamos serviços de emergência</strong>.
              <br/><br/>
              <strong>Para Pacientes/Cuidadores:</strong> Busca de especialistas validados, agendamento de consultas, pagamentos seguros, realização de videochamadas e um cofre digital vitalício para o histórico de receitas, exames e atestados.
              <br/><br/>
              <strong>Para Médicos Geriatras:</strong> Consultório virtual com gestão automática de agenda, prontuário ético eletrônico integrado à tela de vídeo, emissão de prescrições com assinatura digital (padrão CFM) e garantia de recebimento (zero inadimplência).
            </p>

            <h2 className="text-2xl font-bold text-brand-orange mt-8 mb-4">3. Cadastro e Contas de Usuário</h2>
            <h3 className="text-xl font-bold text-brown-dark mt-4 mb-2">3.1. Elegibilidade</h3>
            <p className="mb-6 leading-relaxed">
              Para utilizar a Plataforma, você deve ter no mínimo 18 anos de idade ou ser um cuidador legalmente responsável pelo paciente idoso. Médicos devem possuir registro ativo em seu respectivo Conselho Regional de Medicina (CRM). Todo cadastro médico passa por uma validação humana rigorosa antes da liberação do uso do sistema.
            </p>
            <h3 className="text-xl font-bold text-brown-dark mt-4 mb-2">3.2. Assinatura Médica</h3>
            <p className="mb-6 leading-relaxed">
              Após a validação do CRM, o médico recebe 15 dias de teste totalmente gratuitos. Após esse período, o acesso contínuo ao consultório virtual estará condicionado à adesão de um plano de assinatura da plataforma.
            </p>

            <h2 className="text-2xl font-bold text-brand-orange mt-8 mb-4">4. Teleconsultas</h2>
            <h3 className="text-xl font-bold text-brown-dark mt-4 mb-2">4.1. Responsabilidades do Médico</h3>
            <p className="mb-6 leading-relaxed">
              Os médicos são os únicos responsáveis pela qualidade do atendimento, pelas decisões clínicas, precisão dos diagnósticos, emissão de receitas e pelo cumprimento de todas as regulamentações éticas do CFM durante o uso da plataforma.
            </p>
            <h3 className="text-xl font-bold text-brown-dark mt-4 mb-2">4.2. Responsabilidades do Paciente</h3>
            <p className="mb-6 leading-relaxed">
              Os pacientes (ou cuidadores) são responsáveis por fornecer informações de saúde completas e verdadeiras ao médico, além de garantir uma conexão de internet estável e um ambiente silencioso para a teleconsulta.
            </p>
            <h3 className="text-xl font-bold text-brown-dark mt-4 mb-2">4.3. Cancelamento e Remarcação</h3>
            <p className="mb-6 leading-relaxed">
              Para assegurar a agenda dos profissionais contra inadimplência, as consultas são cobradas no ato do agendamento. Cancelamentos realizados pelo paciente com menos de 24 horas de antecedência não terão reembolso integral da taxa da consulta, conforme políticas detalhadas no fluxo de agendamento.
            </p>

            <h2 className="text-2xl font-bold text-brand-orange mt-8 mb-4">5. Privacidade e Dados Pessoais</h2>
            <p className="mb-6 leading-relaxed">
              A proteção do sigilo médico e dos seus dados é nossa prioridade absoluta. A coleta, uso, criptografia (E2EE) e guarda dos seus dados pessoais e de saúde são regidos pela nossa <a href="/privacidade" className="text-brand-orange font-bold hover:underline">Política de Privacidade (LGPD)</a>. Ao aceitar estes Termos, você também concorda com ela.
            </p>

            <h2 className="text-2xl font-bold text-brand-orange mt-8 mb-4">6. Conduta do Usuário</h2>
            <p className="mb-6 leading-relaxed">
              Você concorda em usar a Plataforma de forma ética e em conformidade com as leis aplicáveis. É expressamente proibido publicar conteúdo ilegal ou ofensivo, violar direitos de terceiros, tentar fraudar o sistema de pagamentos ou gravar as videochamadas sem o consentimento formal de ambas as partes.
            </p>

            <h2 className="text-2xl font-bold text-brand-orange mt-8 mb-4">7. Limitação de Responsabilidade</h2>
            <p className="mb-6 leading-relaxed">
              A Active Age fornece a tecnologia e facilita o encontro, mas <strong>não se responsabiliza sob nenhuma hipótese por danos resultantes de imperícia, imprudência ou negligência médica</strong>, uma vez que a relação médico-paciente é estabelecida diretamente entre as partes.
            </p>

            <h2 className="text-2xl font-bold text-brand-orange mt-8 mb-4">8. Modificações dos Termos</h2>
            <p className="mb-6 leading-relaxed">
              A Active Age reserva-se o direito de modificar estes Termos a qualquer momento para refletir atualizações no sistema ou na legislação. Notificaremos os usuários sobre alterações significativas. O uso continuado após a notificação constitui aceitação dos novos Termos.
            </p>

            <h2 className="text-2xl font-bold text-brand-orange mt-8 mb-4">9. Disposições Gerais</h2>
            <p className="mb-6 leading-relaxed">
              Estes Termos são regidos pelas leis da República Federativa do Brasil. Fica eleito o foro da comarca da sede da Active Age para dirimir quaisquer disputas judiciais, renunciando a qualquer outro.
            </p>

            <h2 className="text-2xl font-bold text-brand-orange mt-8 mb-4">10. Contato</h2>
            <p className="mb-6 leading-relaxed">
              Para dúvidas sobre estes Termos de Uso, entre em contato conosco através do e-mail: <a href="mailto:contato@activeage.com.br" className="text-brand-orange font-bold hover:underline">contato@activeage.com.br</a>.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

