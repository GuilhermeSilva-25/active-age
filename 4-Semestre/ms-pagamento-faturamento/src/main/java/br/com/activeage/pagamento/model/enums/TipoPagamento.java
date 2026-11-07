package br.com.activeage.pagamento.model.enums;

/**
 * Classificação da modalidade de cobrança no ecossistema Active Age (SOA / Thomas Erl).
 */
public enum TipoPagamento {
    /**
     * Pagamento da consulta de telemedicina pelo paciente com Split Direto 100% para o médico (CFM Res. nº 2.314/2022).
     */
    CONSULTA_TELEMEDICINA,

    /**
     * Assinatura mensal SaaS paga pelo médico à Active Age pelo uso do consultório virtual.
     */
    ASSINATURA_SAAS_MEDICO
}
