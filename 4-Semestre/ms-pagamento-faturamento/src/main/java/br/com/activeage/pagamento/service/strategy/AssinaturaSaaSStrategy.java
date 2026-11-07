package br.com.activeage.pagamento.service.strategy;

import br.com.activeage.pagamento.model.enums.TipoPagamento;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * Estratégia de Cobrança da Assinatura SaaS de Consultório Virtual.
 * Receita direta e legítima de software da plataforma Active Age: 100% creditado à plataforma.
 */
@Component
public class AssinaturaSaaSStrategy implements IEstrategiaSplit {

    @Override
    public TipoPagamento getTipo() {
        return TipoPagamento.ASSINATURA_SAAS_MEDICO;
    }

    @Override
    public SplitResult calcularSplit(BigDecimal valorTotal) {
        if (valorTotal == null || valorTotal.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Valor da assinatura mensal deve ser positivo.");
        }
        // 100% creditado para a Active Age
        return new SplitResult(valorTotal, valorTotal);
    }
}
