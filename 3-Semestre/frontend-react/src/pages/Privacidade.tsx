export function Privacidade() {
  return (
    <main className="flex-grow bg-brand-pot/5">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-brown-dark mb-4">Política de Privacidade</h1>
        <p className="mb-12 text-brown font-medium">Conformidade com a LGPD — Última atualização: Setembro de 2026</p>
        
        <div className="prose prose-lg prose-headings:text-brown-dark prose-p:text-brown max-w-none">
          
          <h2 className="text-2xl font-bold text-brand-mint mt-8 mb-4">1. Introdução (Seu Consentimento)</h2>
          <p className="mb-6 leading-relaxed">
            Bem-vindo à Active Age. Esta Política de Privacidade também funciona como seu <strong>Termo de Consentimento Livre e Esclarecido (TCLE)</strong> para o uso da plataforma de telessaúde. Ao criar uma conta e aceitar estes termos, você (Paciente/Cuidador ou Médico Geriatra) declara que leu, compreendeu e concorda expressamente com a coleta, uso e tratamento dos seus dados pessoais e dados sensíveis de saúde, conforme descrito abaixo e em estrita conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018)</strong>.
          </p>

          <h2 className="text-2xl font-bold text-brand-mint mt-8 mb-4">2. Quais Dados Coletamos?</h2>
          <p className="mb-4 leading-relaxed">Coletamos diferentes tipos de dados para operar a plataforma e fornecer os serviços com máxima segurança:</p>
          
          <h3 className="text-xl font-bold text-brown-dark mt-4 mb-2">2.1. Dados Pessoais de Cadastro (Todos os Usuários)</h3>
          <p className="mb-4 leading-relaxed">Nome completo, e-mail, telefone e senha (fortemente criptografada).</p>
          
          <h3 className="text-xl font-bold text-brown-dark mt-4 mb-2">2.2. Dados Pessoais (Paciente/Cuidador)</h3>
          <p className="mb-4 leading-relaxed">Data de nascimento, CPF, dados de pagamento e informações fornecidas voluntariamente (como observações no momento do agendamento).</p>
          
          <h3 className="text-xl font-bold text-brown-dark mt-4 mb-2">2.3. Dados Profissionais (Médico Geriatra)</h3>
          <p className="mb-4 leading-relaxed">Número do CRM ativo, cópia de documentos de identidade profissional (para validação humana), biografia, especialidades e horários de disponibilidade.</p>
          
          <h3 className="text-xl font-bold text-brown-dark mt-4 mb-2">2.4. Dados Sensíveis de Saúde</h3>
          <p className="mb-6 leading-relaxed">
            A Active Age <strong>não grava as videochamadas</strong>. O vídeo e o áudio da teleconsulta são protegidos. No entanto, a plataforma oferece um <strong>Prontuário Eletrônico</strong> e um <strong>Cofre de Documentos</strong>. Portanto, armazenamos de forma segura as anotações clínicas, receitas, atestados e pedidos de exames gerados pelo médico, para que fiquem disponíveis vitaliciamente no painel do paciente.
          </p>

          <h2 className="text-2xl font-bold text-brand-mint mt-8 mb-4">3. Como Usamos Seus Dados?</h2>
          <ul className="mb-6 space-y-2 list-disc list-inside">
            <li><strong>Operar a Plataforma:</strong> Criar sua conta, processar pagamentos e autenticar seu login.</li>
            <li><strong>Verificar Médicos:</strong> Usamos os documentos do médico para realizar a auditoria do CRM, garantindo a segurança de todos.</li>
            <li><strong>Facilitar o Agendamento:</strong> Compartilhar os dados necessários entre médico e paciente para que a consulta ocorra.</li>
            <li><strong>Prontuário e Prescrição:</strong> Armazenar e disponibilizar os documentos médicos gerados no atendimento (receitas com validade CFM).</li>
            <li><strong>Comunicação:</strong> Enviar lembretes e notificações automáticas via e-mail ou WhatsApp sobre agendamentos.</li>
          </ul>

          <h2 className="text-2xl font-bold text-brand-mint mt-8 mb-4">4. Com Quem Compartilhamos Seus Dados?</h2>
          <p className="mb-6 leading-relaxed">
            A sua privacidade é a nossa prioridade. O compartilhamento de dados é restrito:
            <br/><br/>
            • Seus dados sensíveis de paciente são compartilhados <strong>apenas com o médico</strong> que você escolheu agendar.
            <br/>
            • Seus dados públicos de médico (biografia, CRM, agenda) são compartilhados com os visitantes da plataforma.
            <br/>
            • Seus documentos de verificação de CRM são acessíveis apenas pelos Auditores da Active Age.
            <br/><br/>
            <strong>A Active Age nunca venderá ou compartilhará seus dados pessoais ou de saúde com terceiros para fins de marketing publicitário.</strong>
          </p>

          <h2 className="text-2xl font-bold text-brand-mint mt-8 mb-4">5. Segurança dos Dados</h2>
          <p className="mb-6 leading-relaxed">
            Levamos a segurança tecnológica a sério. Todas as comunicações com a plataforma são criptografadas (HTTPS). A videochamada utiliza um canal com criptografia de ponta a ponta (E2EE) para proteger a confidencialidade absoluta da consulta. Senhas e bancos de dados de prontuários utilizam criptografia robusta de nível bancário.
          </p>

          <h2 className="text-2xl font-bold text-brand-mint mt-8 mb-4">6. Seus Direitos (LGPD)</h2>
          <p className="mb-6 leading-relaxed">
            Como titular dos dados, você tem o direito de acessar seu histórico (através da página "Meu Perfil"), corrigir dados desatualizados e revogar seu consentimento. <strong>Atenção:</strong> A exclusão de dados puramente cadastrais pode ser solicitada a qualquer momento; contudo, documentos que compõem o <em>Prontuário Médico Eletrônico</em> possuem prazos legais de retenção obrigatória estipulados pelo Conselho Federal de Medicina (CFM), os quais a plataforma deve respeitar antes de realizar a exclusão física dos servidores.
          </p>

          <h2 className="text-2xl font-bold text-brand-mint mt-8 mb-4">7. Contato (Encarregado de Dados - DPO)</h2>
          <p className="mb-6 leading-relaxed">
            Para exercer seus direitos, relatar incidentes ou tirar dúvidas sobre privacidade, entre em contato com nosso Encarregado de Proteção de Dados (DPO) através do e-mail: <a href="mailto:privacidade@activeage.com.br" className="text-brand-mint font-bold hover:underline">privacidade@activeage.com.br</a>.
          </p>
        </div>
      </div>
    </main>
  );
}

