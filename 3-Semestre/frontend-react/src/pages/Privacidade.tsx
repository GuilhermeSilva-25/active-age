export function Privacidade() {
  return (
    <main className="flex-grow bg-brand-pot/5">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-brown-dark mb-4">Política de Privacidade</h1>
        <p className="mb-12 text-brown font-medium">Conformidade com a LGPD e Resolução CFM nº 2.314/2022 — Última atualização: Outubro de 2026</p>
        
        <div className="prose prose-lg prose-headings:text-brown-dark prose-p:text-brown max-w-none">
          
          <h2 className="text-2xl font-bold text-brand-mint mt-8 mb-4">1. Introdução (Seu Consentimento)</h2>
          <p className="mb-6 leading-relaxed">
            Bem-vindo à Active Age. Esta Política de Privacidade também funciona como seu <strong>Termo de Consentimento Livre e Esclarecido (TCLE)</strong> para o uso da plataforma de telessaúde. Ao criar uma conta e aceitar estes termos, você (Paciente/Cuidador ou Médico Geriatra) declara que leu, compreendeu e concorda expressamente com a coleta, uso e tratamento dos seus dados pessoais e dados sensíveis de saúde, conforme descrito abaixo e em estrita conformidade com a <strong>Lei Geral de Proteção de Dados (LGPD, Lei nº 13.709/2018)</strong> e a <strong>Resolução CFM nº 2.314/2022</strong>.
          </p>

          <h2 className="text-2xl font-bold text-brand-mint mt-8 mb-4">2. Quais Dados Coletamos?</h2>
          <p className="mb-4 leading-relaxed">Coletamos diferentes tipos de dados para operar a plataforma e fornecer os serviços com máxima segurança:</p>
          
          <h3 className="text-xl font-bold text-brown-dark mt-4 mb-2">2.1. Dados Pessoais de Cadastro (Todos os Usuários)</h3>
          <p className="mb-4 leading-relaxed">Nome completo, e-mail, telefone celular/WhatsApp e senha de acesso (fortemente criptografada com algoritmo BCrypt).</p>
          
          <h3 className="text-xl font-bold text-brown-dark mt-4 mb-2">2.2. Dados Pessoais (Paciente/Cuidador)</h3>
          <p className="mb-4 leading-relaxed">Data de nascimento (maioridade obrigatória de 18+ anos ou representação legal), CPF, dados para faturamento de consultas e informações voluntárias no agendamento.</p>
          
          <h3 className="text-xl font-bold text-brown-dark mt-4 mb-2">2.3. Dados Profissionais e Dossiê de Credenciamento (Médico Geriatra)</h3>
          <p className="mb-4 leading-relaxed">
            Para assegurar a idoneidade profissional e cumprir os preceitos éticos e legais do Conselho Federal de Medicina (CFM), exigimos a submissão de um <strong>Dossiê de Credenciamento</strong> organizado em quatro pilares obrigatórios antes de qualquer atendimento:
          </p>
          <ul className="mb-4 space-y-2 list-disc list-inside text-brown">
            <li><strong>1. Habilitação Profissional e Identificação:</strong> Cópia legível da Carteira do CRM (frente e verso com número e UF nítidos), Diploma de Graduação em Medicina reconhecido pelo MEC (frente e verso), Registro de Qualificação de Especialista (RQE, mandatório para atuação e divulgação em Geriatria ou especialidades afins), Documento de Identidade Oficial com foto (CNH, RG ou Passaporte) e CPF.</li>
            <li><strong>2. Regularidade Ética e Legal:</strong> Certidão de Regularidade Ético-Profissional emitida gratuitamente pelo site do Conselho Regional de Medicina (CRM) do respectivo estado, comprovando inscrição ativa e ausência de interdições cautelares ou penalidades éticas.</li>
            <li><strong>3. Requisitos Técnicos para Telemedicina:</strong> Comprovante de posse e validade de Certificado Digital padrão ICP-Brasil (tipo A1 ou A3), mandatório nos termos da Resolução CFM nº 2.314/2022 para assinatura digital qualificada de prontuários, laudos, atestados e prescrições médicas; e Termo/Comprovante de Ciência e Notificação de atuação em telemedicina registrado no portal do CRM de origem.</li>
            <li><strong>4. Dados Cadastrais e Financeiros:</strong> Comprovante de endereço atualizado para cadastro e fins fiscais, dados bancários (ou chave PIX) vinculados ao CPF do próprio médico ou ao CNPJ de sua Pessoa Jurídica médica para o repasse de honorários de consultas, e Cartão CNPJ (caso opte por prestação de serviços via PJ médica).</li>
          </ul>
          
          <h3 className="text-xl font-bold text-brown-dark mt-4 mb-2">2.4. Dados Sensíveis de Saúde</h3>
          <p className="mb-6 leading-relaxed">
            A Active Age <strong>não grava o conteúdo em áudio ou vídeo das teleconsultas</strong>. O fluxo multimídia trafega protegido com criptografia de ponta a ponta. No entanto, a plataforma oferece um <strong>Prontuário Eletrônico</strong> e um <strong>Cofre Digital de Documentos</strong>. Portanto, armazenamos de forma estritamente segura e sigilosa as anotações clínicas, evoluções, receitas, atestados e pedidos de exames gerados pelo médico, garantindo sua disponibilidade contínua para o paciente.
          </p>

          <h2 className="text-2xl font-bold text-brand-mint mt-8 mb-4">3. Como Usamos Seus Dados?</h2>
          <ul className="mb-6 space-y-2 list-disc list-inside">
            <li><strong>Operação da Plataforma:</strong> Criar contas, autenticar acessos de forma segura e processar pagamentos.</li>
            <li><strong>Auditoria e Validação Médica:</strong> O Dossiê de Credenciamento é utilizado exclusivamente por auditores credenciados para validação prévia junto aos órgãos competentes (CFM, MEC e Receita Federal).</li>
            <li><strong>Facilitação do Cuidado:</strong> Compartilhar dados clínicos estritamente necessários entre o médico e o paciente durante a teleconsulta.</li>
            <li><strong>Prontuário e Prescrição:</strong> Armazenar prontuários com integridade imutável e emitir documentos médicos digitais nos termos das normas do CFM.</li>
            <li><strong>Comunicação e Alertas:</strong> Notificar pacientes e médicos sobre agendamentos, confirmações de consulta e atualizações de status.</li>
          </ul>

          <h2 className="text-2xl font-bold text-brand-mint mt-8 mb-4">4. Com Quem Compartilhamos Seus Dados?</h2>
          <p className="mb-6 leading-relaxed">
            A sua privacidade é um valor inegociável. O compartilhamento de dados é minimizado e controlado:
            <br/><br/>
            • <strong>Dados de Saúde do Paciente:</strong> São acessíveis <strong>exclusivamente pelo médico assistente</strong> selecionado para a consulta e pelo próprio paciente/cuidador.
            <br/>
            • <strong>Dados Públicos do Médico:</strong> Nome completo, número do CRM, UF, RQE, biografia e horários disponíveis na vitrine são públicos para os pacientes da plataforma.
            <br/>
            • <strong>Dossiê Confidencial do Médico:</strong> Documentos pessoais (diplomas, CRM, certidões, comprovantes de endereço e dados bancários) <strong>não são públicos</strong> em hipótese alguma. Ficam restritos aos Auditores de Conformidade da Active Age (perfil de Administrador) e ao próprio médico titular.
            <br/><br/>
            <strong>A Active Age nunca comercializará ou transferirá dados pessoais, cadastrais ou de saúde para terceiros para fins de marketing ou publicidade.</strong>
          </p>

          <h2 className="text-2xl font-bold text-brand-mint mt-8 mb-4">5. Segurança e Proteção dos Dados Médicos</h2>
          <p className="mb-6 leading-relaxed">
            Adotamos medidas técnicas, criptográficas e organizacionais rígidas para assegurar a inviolabilidade dos dados:
          </p>
          <ul className="mb-6 space-y-2 list-disc list-inside text-brown">
            <li><strong>Armazenamento Seguro e Isolado:</strong> Os documentos do Dossiê do Médico e prontuários de saúde são armazenados em repositório privado, com bloqueio absoluto de acesso público direto via URL estática.</li>
            <li><strong>Controle de Acesso Perimetral:</strong> Qualquer requisição a arquivos ou dados médicos exige autenticação em sessão segura ativa e privilégio correspondente ou titularidade do documento.</li>
            <li><strong>Trilha de Auditoria Imutável (Audit Trail):</strong> Cada visualização, download ou alteração de status documental gera um registro permanente na trilha de auditoria e conformidade, gravando a identidade do usuário, endereço IP e carimbo de data/hora (timestamp).</li>
            <li><strong>Criptografia em Trânsito e em Repouso:</strong> Todas as conexões utilizam protocolo HTTPS com TLS moderno. Senhas utilizam BCrypt com salt dinâmico, e os dados bancários contam com proteção restrita.</li>
          </ul>

          <h2 className="text-2xl font-bold text-brand-mint mt-8 mb-4">6. Seus Direitos (LGPD) e Prazos do CFM</h2>
          <p className="mb-6 leading-relaxed">
            Como titular dos dados, você tem o direito de acessar suas informações na plataforma, retificar dados inconsistentes e revogar consentimentos. 
            <br/><br/>
            <strong>Atenção Regulatória:</strong> A exclusão de contas puramente cadastrais pode ser solicitada a qualquer momento. No entanto, prontuários clínicos e registros de atos médicos eletrônicos estão sujeitos ao prazo de guarda legal obrigatório de 20 (vinte) anos, conforme estipulado pela Lei Federal nº 13.787/2018 e resoluções do CFM, não sendo passíveis de exclusão física antes do cumprimento do prazo legal.
          </p>

          <h2 className="text-2xl font-bold text-brand-mint mt-8 mb-4">7. Contato (Encarregado de Proteção de Dados - DPO)</h2>
          <p className="mb-6 leading-relaxed">
            Para exercer seus direitos de titular, reportar incidentes de segurança ou esclarecer qualquer ponto desta Política, entre em contato com nosso Encarregado de Proteção de Dados (DPO): <a href="mailto:privacidade@activeage.com.br" className="text-brand-mint font-bold hover:underline">privacidade@activeage.com.br</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
