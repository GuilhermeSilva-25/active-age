import { ShieldCheck, HeartPulse, FileText } from 'lucide-react';

export function Beneficios() {
  return (
    <section id="beneficios" className="py-20 bg-brand-pot/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-brown-dark mb-4">Por que escolher o Active Age?</h2>
          <p className="text-xl text-brown max-w-2xl mx-auto">
            Desenhamos cada detalhe pensando na segurança médica e na facilidade de uso para todas as idades.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-pot hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 bg-brand-orange/10 rounded-xl flex items-center justify-center mb-6">
              <ShieldCheck className="text-brand-orange" size={32} />
            </div>
            <h3 className="text-xl font-bold text-brown-dark mb-3">Segurança Total (LGPD)</h3>
            <p className="text-brown">Seus dados de saúde são protegidos com criptografia de ponta. Apenas você e seu médico têm acesso ao seu histórico e receitas.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-pot hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 bg-brand-mint/20 rounded-xl flex items-center justify-center mb-6">
              <HeartPulse className="text-brand-mint" size={32} />
            </div>
            <h3 className="text-xl font-bold text-brown-dark mb-3">Acessibilidade Garantida</h3>
            <p className="text-brown">Adeus às letras miúdas. Nossa interface possui alto contraste e fontes grandes, dando autonomia total para o idoso utilizar o sistema sozinho.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-brand-pot hover:-translate-y-1 transition-transform">
            <div className="w-14 h-14 bg-brand-blue/20 rounded-xl flex items-center justify-center mb-6">
              <FileText className="text-brand-blue" size={32} />
            </div>
            <h3 className="text-xl font-bold text-brown-dark mb-3">Histórico Centralizado</h3>
            <p className="text-brown">Pare de carregar pastas pesadas para a clínica. Faça upload de exames antigos e tenha todas as suas prescrições salvas num único lugar.</p>
          </div>

        </div>

      </div>
    </section>
  );
}

