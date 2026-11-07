package br.com.activeage.pagamento.model.enums;

/**
 * Situação do ciclo de vida transacional do pagamento.
 */
public enum StatusPagamento {
    PENDENTE,
    PROCESSANDO,
    APROVADO,
    RECUSADO,
    ESTORNADO,
    EXPIRADO,
    PENDENTE_CONTINGENCIA
}
