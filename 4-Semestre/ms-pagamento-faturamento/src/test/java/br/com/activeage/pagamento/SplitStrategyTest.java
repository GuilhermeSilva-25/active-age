package br.com.activeage.pagamento;

import br.com.activeage.pagamento.model.enums.TipoPagamento;
import br.com.activeage.pagamento.service.strategy.AssinaturaSaaSStrategy;
import br.com.activeage.pagamento.service.strategy.IEstrategiaSplit;
import br.com.activeage.pagamento.service.strategy.SplitDiretoConsultaStrategy;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;

import static org.junit.jupiter.api.Assertions.*;

class SplitStrategyTest {

    private final SplitDiretoConsultaStrategy consultaStrategy = new SplitDiretoConsultaStrategy();
    private final AssinaturaSaaSStrategy saasStrategy = new AssinaturaSaaSStrategy();

    @Test
    @DisplayName("PCE: SplitDiretoConsulta deve repassar 100% ao médico e taxa zero à plataforma (Res. CFM 2.314/2022)")
    void shouldCalculateConsultaSplitCorrectly() {
        assertEquals(TipoPagamento.CONSULTA_TELEMEDICINA, consultaStrategy.getTipo());

        BigDecimal valorConsulta = BigDecimal.valueOf(250.00);
        IEstrategiaSplit.SplitResult result = consultaStrategy.calcularSplit(valorConsulta);

        assertEquals(BigDecimal.valueOf(250.00), result.valorBeneficiario());
        assertEquals(BigDecimal.ZERO, result.taxaPlataforma());
    }

    @Test
    @DisplayName("AVL: SplitDiretoConsulta deve rejeitar valor zero ou negativo")
    void shouldRejectZeroOrNegativeConsultaFee() {
        assertThrows(IllegalArgumentException.class, () -> consultaStrategy.calcularSplit(BigDecimal.ZERO));
        assertThrows(IllegalArgumentException.class, () -> consultaStrategy.calcularSplit(BigDecimal.valueOf(-10.0)));
        assertThrows(IllegalArgumentException.class, () -> consultaStrategy.calcularSplit(null));
    }

    @Test
    @DisplayName("PCE: AssinaturaSaaS deve creditar 100% para a plataforma Active Age")
    void shouldCalculateSaasSplitCorrectly() {
        assertEquals(TipoPagamento.ASSINATURA_SAAS_MEDICO, saasStrategy.getTipo());

        BigDecimal valorMensalidade = BigDecimal.valueOf(149.90);
        IEstrategiaSplit.SplitResult result = saasStrategy.calcularSplit(valorMensalidade);

        assertEquals(BigDecimal.valueOf(149.90), result.valorBeneficiario());
        assertEquals(BigDecimal.valueOf(149.90), result.taxaPlataforma());
    }

    @Test
    @DisplayName("AVL: AssinaturaSaaS deve rejeitar valor zero ou negativo")
    void shouldRejectZeroOrNegativeSaasFee() {
        assertThrows(IllegalArgumentException.class, () -> saasStrategy.calcularSplit(BigDecimal.ZERO));
        assertThrows(IllegalArgumentException.class, () -> saasStrategy.calcularSplit(BigDecimal.valueOf(-5.0)));
    }
}
