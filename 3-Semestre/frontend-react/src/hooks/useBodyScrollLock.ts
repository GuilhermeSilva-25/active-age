import { useEffect } from 'react';

/**
 * Trava o scroll da página (document.body) enquanto o modal estiver aberto,
 * evitando o efeito de "fundo rolando" (scroll bleed) sob o backdrop opaco.
 * Restaura o overflow original imediatamente ao fechar ou desmontar.
 */
export function useBodyScrollLock(isLocked: boolean) {
  useEffect(() => {
    if (!isLocked) return;

    const originalOverflow = document.body.style.overflow;
    const originalPaddingRight = document.body.style.paddingRight;

    // Calcula a largura da barra de rolagem para evitar layout shift horizontal
    const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollBarWidth > 0) {
      document.body.style.paddingRight = `${scrollBarWidth}px`;
    }

    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
      document.body.style.paddingRight = originalPaddingRight;
    };
  }, [isLocked]);
}
