export function ComoFunciona() {
  return (
    <section id="como-funciona" className="py-20 bg-white border-t border-brand-pot/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <span className="inline-block py-1 px-3 rounded-full bg-brand-mint/20 text-brown-dark font-bold text-sm mb-4 border border-brand-mint/50 shadow-sm">
            Passo a Passo
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-brown-dark mb-4">Como funciona a jornada?</h2>
          <p className="text-xl text-brown max-w-2xl mx-auto">
            Processos desenhados para não ter curva de aprendizado. É só acessar e usar.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-16">
          
          {/* Timeline Paciente */}
          <div>
            <h3 className="text-2xl font-bold text-brand-orange mb-8 flex items-center gap-3">
              <span className="bg-brand-orange/10 p-2 rounded-lg">Para o Paciente</span>
            </h3>
            
            {/* Removidas as linhas do meio, deixando apenas o empilhamento limpo (space-y-8) */}
            <div className="space-y-8">
              
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">1</div>
                <div className="bg-brand-pot/10 p-6 rounded-xl border border-brand-pot/50 w-full hover:-translate-y-1 transition-transform shadow-sm">
                  <h4 className="text-lg font-bold text-brown-dark mb-2">Busque o Especialista</h4>
                  <p className="text-brown">Filtre por geriatras validados. Veja a agenda do médico em tempo real, sem precisar ligar para a clínica.</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">2</div>
                <div className="bg-brand-pot/10 p-6 rounded-xl border border-brand-pot/50 w-full hover:-translate-y-1 transition-transform shadow-sm">
                  <h4 className="text-lg font-bold text-brown-dark mb-2">Agende e Pague</h4>
                  <p className="text-brown">Selecione o horário e realize o pagamento seguro. O link exclusivo da sala de vídeo é gerado na hora.</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-brand-orange text-white flex items-center justify-center font-bold text-lg shadow-md shrink-0">3</div>
                <div className="bg-brand-pot/10 p-6 rounded-xl border border-brand-pot/50 w-full hover:-translate-y-1 transition-transform shadow-sm">
                  <h4 className="text-lg font-bold text-brown-dark mb-2">Consulte e Baixe Documentos</h4>
                  <p className="text-brown">Abra a sala de vídeo no navegador. Ao final, você terá acesso fácil a receitas, atestados, relatórios e pedidos de exames no seu painel.</p>
                </div>
              </div>

            </div>
          </div>

          {/* Timeline Médico */}
          <div>
            <h3 className="text-2xl font-bold text-brand-mint mb-8 flex items-center gap-3">
              <span className="bg-brand-mint/20 p-2 rounded-lg text-brown-dark">Para o Médico</span>
            </h3>
            
            <div className="space-y-8">
              
              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-brand-mint text-brown-dark flex items-center justify-center font-bold text-lg shadow-md shrink-0">1</div>
                <div className="bg-brand-blue/5 p-6 rounded-xl border border-brand-blue/20 w-full hover:-translate-y-1 transition-transform shadow-sm">
                  <h4 className="text-lg font-bold text-brown-dark mb-2">Valide seu CRM (15 Dias Grátis)</h4>
                  <p className="text-brown">Cadastre-se na plataforma. Após a nossa equipe validar suas credenciais médicas, você ganha 15 dias de teste totalmente gratuitos no consultório virtual.</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-brand-mint text-brown-dark flex items-center justify-center font-bold text-lg shadow-md shrink-0">2</div>
                <div className="bg-brand-blue/5 p-6 rounded-xl border border-brand-blue/20 w-full hover:-translate-y-1 transition-transform shadow-sm">
                  <h4 className="text-lg font-bold text-brown-dark mb-2">Abra a Vitrine de Horários</h4>
                  <p className="text-brown">Defina em quais dias e horários deseja atender. Conte com um gerenciamento inteligente que atualiza sua disponibilidade automaticamente a cada nova consulta reservada.</p>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-12 h-12 rounded-full bg-brand-mint text-brown-dark flex items-center justify-center font-bold text-lg shadow-md shrink-0">3</div>
                <div className="bg-brand-blue/5 p-6 rounded-xl border border-brand-blue/20 w-full hover:-translate-y-1 transition-transform shadow-sm">
                  <h4 className="text-lg font-bold text-brown-dark mb-2">Prontuário Ético e Assinatura Digital</h4>
                  <p className="text-brown">Durante a videochamada, visualize exames e emita prescrições, atestados ou relatórios digitais na mesma tela. Tudo assinado e com validade CFM.</p>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}

