import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Componente utilitário que monitora as mudanças de rota no React Router.
 * A cada transição de página (ex: clique em links no rodapé ou navbar),
 * força o scroll para o topo absoluto da janela (x: 0, y: 0),
 * corrigindo o comportamento padrão de SPAs onde a posição de rolagem
 * inferior é retida na nova rota.
 */
export function ScrollToTop() {
    const { pathname } = useLocation();

    useEffect(() => {
        window.scrollTo({
            top: 0,
            left: 0,
            behavior: 'instant' as ScrollBehavior,
        });
    }, [pathname]);

    return null;
}
