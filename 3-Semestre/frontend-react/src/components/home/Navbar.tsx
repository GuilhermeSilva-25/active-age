import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import logoImg from '../../assets/logo-active-age.png';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="w-full bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/">
              <img src={logoImg} alt="Active Age Logo" className="h-14 sm:h-16 w-auto object-contain" />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="/#beneficios" className="text-brown hover:text-brand-orange transition-colors font-medium">Benefícios</a>
            <a href="/#como-funciona" className="text-brown hover:text-brand-orange transition-colors font-medium">Como Funciona</a>
            
            <div className="flex items-center space-x-4 border-l-2 border-brand-pot pl-8 ml-4">
              <Link to="/login" className="text-brown-dark font-semibold hover:text-brand-orange transition-colors">
                Entrar
              </Link>
              <Link to="/cadastro" className="btn-primary">
                Criar Conta
              </Link>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-brown-dark hover:text-brand-orange p-2 focus:outline-none"
              aria-label="Abrir menu principal"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 shadow-lg absolute w-full left-0 transition-all">
          <div className="px-4 pt-2 pb-6 space-y-2 flex flex-col">
            <a href="/#beneficios" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 text-brown hover:bg-brand-pot/20 rounded-md font-medium">Benefícios</a>
            <a href="/#como-funciona" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 text-brown hover:bg-brand-pot/20 rounded-md font-medium">Como Funciona</a>
            <div className="border-t border-brand-pot/50 my-2"></div>
            <Link to="/login" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 text-brown-dark font-semibold hover:bg-brand-pot/20 rounded-md">Entrar</Link>
            <Link to="/cadastro" onClick={() => setIsMenuOpen(false)} className="block px-3 py-3 text-center btn-primary w-full mt-4">Criar Conta</Link>
          </div>
        </div>
      )}
    </nav>
  );
}
