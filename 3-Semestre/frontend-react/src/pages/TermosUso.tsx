export function TermosUso() {
  return (
    <main className="flex-grow bg-brand-pot/5">
      <div className="max-w-4xl mx-auto px-4 py-20">
        <h1 className="text-4xl font-bold text-brown-dark mb-4">Termos de Uso</h1>
        <p className="mb-12 text-brown font-medium">Conformidade com as Resoluções CFM nº 2.314/2022 e 2.336/2023 — Última atualização: Outubro de 2026</p>
        
        <div className="prose prose-lg prose-headings:text-brown-dark prose-p:text-brown max-w-none">
          <h2 className="text-2xl font-bold text-brand-orange mt-8 mb-4">1. Aceitação dos Termos</h2>
          <p className="mb-6 leading-relaxed">
            Ao acessar ou usar a plataforma Active Age ("Plataforma"), você concorda em cumprir e estar vinculado a estes Termos de Uso ("Termos"). Se você não concorda com qualquer parte destes Termos, não deverá utilizar a Plataforma.
          </p>

          <h2 className="text-2xl font-bold text-brand-orange mt-8 mb-4">2. Serviços Oferecidos</h2>
          <p className="mb-6 leading-relaxed">
            A Active Age é uma plataforma tecnológica de telessaúde geriátrica integral que conecta pacientes idosos (e seus cuidadores familiares) a médicos geriatras habilitados. A plataforma fornece a infraestrutura de comunicação e licenciamento de consultório virtual, mas <strong>não é uma instituição hospitalar nem presta serviços de emergência médica</strong>.
            <br/><br/>
            <strong>Para Pacientes/Cuidadores:</strong> Catálogo de busca neutro e informativo de especialistas com credenciais auditadas, agendamento de consultas com gestão de horários, realização de videochamadas seguras e cofre digital vitalício para exames, receitas e atestados.
            <br/><br/>
            <strong>Para Médicos Geriatras:</strong> Consultório virtual sob modelo SaaS com gestão automatizada de agenda, prontuário eletrônico certificado integrado à videochamada, emissão de prescrições e atestados com assinatura digital qualificada (ICP-Brasil / CFM) e liquidação direta de honorários através de arranjo de pagamento regulado (Split Direto).
          </p>

          <h2 className="text-2xl font-bold text-brand-orange mt-8 mb-4">3. Cadastro e Elegibilidade</h2>
          
          <h3 className="text-xl font-bold text-brown-dark mt-4 mb-2">3.1. Elegibilidade, Dossiê de Credenciamento e Neutralidade de Busca</h3>
          <p className="mb-6 leading-relaxed">
            Para utilizar a Plataforma como Paciente ou Cuidador, o usuário deve ter no mínimo 18 anos completos ou ser o representante legal do idoso.
            <br/><br/>
            O cadastro de Médicos Geriatras opera sob um rigoroso processo de homologação profissional. O preenchimento do formulário inicial constitui um <strong>pré-cadastro</strong>, o qual <strong>não confere autorização imediata para disponibilização de horários ou realização de teleconsultas</strong>. Para que o perfil médico seja homologado e o consultório virtual liberado, o profissional deve submeter para auditoria o seu <strong>Dossiê de Credenciamento</strong> composto por:
          </p>
          <ul className="mb-6 space-y-2 list-disc list-inside text-brown">
            <li><strong>Habilitação Profissional e Identificação:</strong> Cópia da Carteira do CRM (frente e verso com número e UF nítidos), Diploma de Graduação em Medicina reconhecido pelo MEC (frente e verso), Registro de Qualificação de Especialista (RQE, mandatório para identificação como especialista em Geriatria), Documento de Identidade com foto (CNH, RG ou Passaporte) e CPF.</li>
            <li><strong>Regularidade Ética e Legal:</strong> Certidão de Regularidade Ético-Profissional emitida pelo CRM estadual competente, demonstrando situação cadastral ativa e ausência de penalidades éticas ou interdições vigentes.</li>
            <li><strong>Requisitos Técnicos de Telemedicina (Res. CFM nº 2.314/2022):</strong> Comprovante de Certificado Digital padrão ICP-Brasil (A1 ou A3) indispensável para assinatura eletrônica de prescrições e prontuários; e Termo/Comprovante de Notificação e Cadastro de atuação em telemedicina no portal do CRM de origem.</li>
            <li><strong>Dados Cadastrais e Financeiros:</strong> Comprovante de endereço, dados bancários/chave PIX em nome do próprio médico (ou de sua Pessoa Jurídica médica) para recebimento via split direto e, opcionalmente, Cartão CNPJ.</li>
          </ul>
          <p className="mb-6 leading-relaxed">
            Em estrito cumprimento à <strong>Resolução CFM nº 2.336/2023</strong> (Publicidade Médica), a busca de especialistas na plataforma atua exclusivamente como catálogo informativo e neutro. É terminantemente vedada a comercialização de posicionamento patrocinado ou leilão de destaque, bem como a exibição pública de rankings de estrelas ou notas que mercantilizem a medicina. A ordenação fundamenta-se puramente em parâmetros objetivos (especialidade registrada, RQE, localização geográfica, disponibilidade de agenda e valor da consulta).
          </p>

          <h3 className="text-xl font-bold text-brown-dark mt-4 mb-2">3.2. Período de Avaliação (15 Dias Grátis) e Assinatura SaaS</h3>
          <p className="mb-6 leading-relaxed">
            Uma vez aprovado todo o Dossiê de Credenciamento pela auditoria da Active Age, o médico geriatra terá direito a um período de 15 (quinze) dias de teste totalmente gratuitos no consultório virtual. Findo esse período, a continuidade da disponibilização de vitrine de horários e atendimento estará vinculada à adesão a um plano de assinatura mensal fixa da plataforma pelo licenciamento do software (SaaS).
          </p>

          <h2 className="text-2xl font-bold text-brand-orange mt-8 mb-4">4. Teleconsultas e Regulação Médica</h2>
          <h3 className="text-xl font-bold text-brown-dark mt-4 mb-2">4.1. Responsabilidades Éticas do Médico (Resolução CFM nº 2.314/2022)</h3>
          <p className="mb-6 leading-relaxed">
            O médico é o único e soberano responsável pelas condutas clínicas, diagnósticos, evolução do prontuário eletrônico e emissão de receituários médicos. O profissional compromete-se a:
            <br/><br/>
            • Manter ativo e regular seu registro no respectivo CRM durante toda a sua permanência na plataforma;
            <br/>
            • Utilizar seu Certificado Digital ICP-Brasil individual em todas as prescrições, atestados e documentos clínicos emitidos via plataforma;
            <br/>
            • Avaliar a autonomia e segurança do idoso no ambiente domiciliar, recomendando atendimento presencial sempre que a condição clínica assim exigir;
            <br/>
            • Não divulgar título de especialista em Geriatria sem o devido registro RQE homologado no CRM.
          </p>
          <h3 className="text-xl font-bold text-brown-dark mt-4 mb-2">4.2. Responsabilidades do Paciente e Cuidador</h3>
          <p className="mb-6 leading-relaxed">
            O paciente ou seu cuidador compromete-se a prestar informações clínicas e histórico de medicamentos verídicos, comparecer pontualmente à sala de vídeo e manter uma conexão de internet estável e privativa durante o ato médico.
          </p>
          <h3 className="text-xl font-bold text-brown-dark mt-4 mb-2">4.3. Política de Cancelamento e Rollback da Agenda</h3>
          <p className="mb-6 leading-relaxed">
            Para proteger os médicos contra a ociosidade da agenda, as consultas são quitadas no momento do agendamento. Cancelamentos solicitados pelo paciente com antecedência mínima de 24 (vinte e quatro) horas ensejam o cancelamento com restituição e liberação automática do horário na vitrine (*rollback*). Cancelamentos com prazo inferior a 24 horas não conferem direito a reembolso, salvo exceções de força maior devidamente analisadas.
          </p>

          <h3 className="text-xl font-bold text-brown-dark mt-4 mb-2">4.4. Fluxo Financeiro, Split de Pagamento Direto e Vedação da Dicotomia</h3>
          <p className="mb-6 leading-relaxed">
            Em obediência ao Código de Ética Médica e às normas do Conselho Federal de Medicina que vedam a dicotomia (divisão de honorários médicos ou cobrança de comissões percentuais sobre o ato clínico):
            <br/><br/>
            • O pagamento das consultas ocorre através de gateway regulado pelo Banco Central com tecnologia de <strong>Split de Pagamento Direto</strong> na captura;
            <br/>
            • O valor integral dos honorários médicos liquida diretamente na subconta/domicílio bancário do profissional ou de sua PJ médica, deduzido estritamente da taxa administrativa fixa de processamento e infraestrutura de TI da plataforma;
            <br/>
            • O dinheiro da consulta <strong>jamais transita pela conta bancária corporativa do Active Age</strong>, garantindo segregação patrimonial e mitigando riscos de bitributação;
            <br/>
            • O médico é o único responsável pela emissão de Nota Fiscal de Serviços Médicos (NFS-e) ao paciente sobre o valor de seus honorários. A Active Age emite Nota Fiscal de Serviços de Tecnologia referente ao licenciamento do software e serviços de processamento eletrônico de dados.
          </p>

          <h2 className="text-2xl font-bold text-brand-orange mt-8 mb-4">5. Segurança e Sigilo dos Documentos do Médico</h2>
          <p className="mb-6 leading-relaxed">
            A Active Age compromete-se a resguardar a total confidencialidade do Dossiê de Credenciamento do médico. Todos os documentos comprobatórios enviados são armazenados em repositório criptografado, inacessíveis publicamente e auditados sob registro em trilha de conformidade, conforme detalhado em nossa <a href="/privacidade" className="text-brand-orange font-bold hover:underline">Política de Privacidade (LGPD)</a>.
          </p>

          <h2 className="text-2xl font-bold text-brand-orange mt-8 mb-4">6. Conduta Proibida</h2>
          <p className="mb-6 leading-relaxed">
            É expressamente vedado aos usuários: tentar burlar sistemas de controle e segurança, violar o sigilo profissional médico, gravar imagens ou áudios da teleconsulta sem consentimento expresso e mútuo por escrito, ou submeter documentos falsos ou adulterados (sujeito às sanções éticas do CFM e criminais do Código Penal Brasileiro).
          </p>

          <h2 className="text-2xl font-bold text-brand-orange mt-8 mb-4">7. Limitação de Responsabilidade</h2>
          <p className="mb-6 leading-relaxed">
            A Active Age disponibiliza a infraestrutura de intermediação e comunicação técnica em conformidade com as normas vigentes, mas <strong>não responde pelos atos privativos da medicina praticados pelos profissionais</strong>, os quais respondem civil, penal e eticamente por seus pareceres e condutas perante os Conselhos Regionais de Medicina.
          </p>

          <h2 className="text-2xl font-bold text-brand-orange mt-8 mb-4">8. Foro e Legislação Aplicável</h2>
          <p className="mb-6 leading-relaxed">
            Estes Termos são regidos exclusivamente pela legislação da República Federativa do Brasil, em consonância com as resoluções do Conselho Federal de Medicina (CFM) e a Lei Geral de Proteção de Dados (LGPD). Fica eleito o Foro da Comarca de Diadema, Estado de São Paulo, para dirimir quaisquer litígios oriundos do presente termo.
          </p>

          <h2 className="text-2xl font-bold text-brand-orange mt-8 mb-4">9. Canal de Atendimento</h2>
          <p className="mb-6 leading-relaxed">
            Para dúvidas institucionais ou suporte regulatório, entre em contato através do e-mail: <a href="mailto:contato@activeage.com.br" className="text-brand-orange font-bold hover:underline">contato@activeage.com.br</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
