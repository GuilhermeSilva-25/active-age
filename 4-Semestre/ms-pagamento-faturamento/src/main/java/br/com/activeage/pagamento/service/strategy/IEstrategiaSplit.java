package br.com.activeage.pagamento.service.strategy;

import br.com.activeage.pagamento.model.enums.TipoPagamento;

import java.math.BigDecimal;

/**
 * Interface de Estratégia de Split (Padrão OCP - Open/Closed Principle).
 * Permite plugar novas formas de partilha ou precificação sem modificar a classe principal de serviço.
 */
public interface IEstrategiaSplit {

    TipoPagamento getTipo();

    SplitResult calcularSplit(BigDecimal valorTotal);

    /**
     * Resultado da divisão de valores entre o beneficiário e a taxa da plataforma.
     *
     * @param valorBeneficiario Valor creditado para o médico ou recebedor final
     * @param taxaPlataforma   Valor retido pela Active Age (estritamente 0 na teleconsulta - Res. CFM 2.314/2022)
     */
    record SplitResult(BigDecimal valorBeneficiario, BigDecimal taxaPlataforma) {}
}
