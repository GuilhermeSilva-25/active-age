import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';
import logoImg from '../../assets/logo-active-age.png';

export function Footer() {
  return (
    <footer className="bg-white border-t border-brand-pot/50 pt-16 pb-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Grid Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8 mb-10">
          
          {/* Logo e Tagline */}
          <div className="lg:col-span-4 lg:pr-8">
            <Link to="/" className="inline-block mb-6">
              <img src={logoImg} alt="Active Age Logo" className="h-16 md:h-20 w-auto object-contain" />
            </Link>
            <p className="text-brown mb-6">
              A plataforma que conecta geriatras de excelência a pacientes idosos, unindo cuidado contínuo e tecnologia segura.
            </p>
          </div>

          {/* Links Institucionais */}
          <div className="lg:col-span-2">
            <h4 className="text-lg font-bold text-brown-dark mb-6">Institucional</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/quem-somos" className="text-brown hover:text-brand-orange transition-colors font-medium">
                  Quem Somos
                </Link>
              </li>
              <li>
                <Link to="/servicos" className="text-brown hover:text-brand-orange transition-colors font-medium">
                  Serviços
                </Link>
              </li>
            </ul>
          </div>

          {/* Links de Transparência */}
          <div className="lg:col-span-3">
            <h4 className="text-lg font-bold text-brown-dark mb-6">Transparência</h4>
            <ul className="space-y-4">
              <li>
                <Link to="/termos" className="text-brown hover:text-brand-orange transition-colors font-medium">
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link to="/privacidade" className="text-brown hover:text-brand-orange transition-colors font-medium">
                  Política de Privacidade
                </Link>
              </li>
            </ul>
          </div>

          {/* Dados de Contato */}
          <div className="lg:col-span-3">
            <h4 className="text-lg font-bold text-brown-dark mb-6">Contato</h4>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Phone className="text-brand-orange shrink-0 mt-1" size={20} />
                <a href="tel:+551140028922" className="text-brown hover:text-brand-orange transition-colors font-medium">
                  (11) 9999-9999
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Mail className="text-brand-orange shrink-0 mt-1" size={20} />
                <a href="mailto:contato@activeage.com.br" className="text-brown hover:text-brand-orange transition-colors font-medium">
                  contato@activeage.com.br
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="text-brand-orange shrink-0 mt-1" size={20} />
                <span className="text-brown font-medium leading-relaxed">
                  Fatec Luigi Papaiz<br />Diadema, SP
                </span>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Copyright Area */}
        <div className="pt-8 border-t border-brand-pot/50 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
          <p className="text-brown font-medium">
            &copy; 2026 Active Age. Todos os direitos reservados.
          </p>
          <p className="text-sm text-brown-light font-medium">
            Plataforma em conformidade com a LGPD e resoluções de Telessaúde do CFM.
          </p>
        </div>

      </div>
    </footer>
  );
}

