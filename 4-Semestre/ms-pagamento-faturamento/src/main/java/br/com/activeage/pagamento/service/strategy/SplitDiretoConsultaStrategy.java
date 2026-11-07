package br.com.activeage.pagamento.service.strategy;

import br.com.activeage.pagamento.model.enums.TipoPagamento;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Estratégia de Split Direto da Consulta Médica (Resolução CFM nº 2.314/2022).
 * Vedação absoluta à dicotomia: 100% do valor da consulta vai para o médico (taxa da plataforma = R$ 0,00).
 */
@Component
public class SplitDiretoConsultaStrategy implements IEstrategiaSplit {

    @Override
    public TipoPagamento getTipo() {
        return TipoPagamento.CONSULTA_TELEMEDICINA;
    }

    @Override
    public SplitResult calcularSplit(BigDecimal valorTotal) {
        if (valorTotal == null || valorTotal.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Valor da consulta deve ser positivo.");
        }
        // 100% do valor para o médico, R$ 0,00 para a Active Age
        return new SplitResult(valorTotal, BigDecimal.ZERO);
    }
}
