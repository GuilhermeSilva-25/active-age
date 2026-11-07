package br.com.activeage.pagamento;

import br.com.activeage.pagamento.model.entity.Pagamento;
import br.com.activeage.pagamento.model.enums.MetodoPagamento;
import br.com.activeage.pagamento.model.enums.StatusPagamento;
import br.com.activeage.pagamento.model.enums.TipoPagamento;
import br.com.activeage.pagamento.service.gateway.IMercadoPagoGateway;
import br.com.activeage.pagamento.service.gateway.impl.MercadoPagoGatewayImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class MercadoPagoGatewayTest {

    private MercadoPagoGatewayImpl gateway;

    @BeforeEach
    void setUp() {
        gateway = new MercadoPagoGatewayImpl();
        ReflectionTestUtils.setField(gateway, "accessToken", "TEST-TOKEN-123");
    }

    @Test
    @DisplayName("PCE: Deve gerar cobrança Pix válida no gateway")
    void shouldGeneratePixPayment() {
        Pagamento pagamento = Pagamento.builder()
                .referenciaId("APPT-100")
                .pagadorNome("Dona Maria de Lourdes")
                .valorTotal(BigDecimal.valueOf(250.00))
                .tipo(TipoPagamento.CONSULTA_TELEMEDICINA)
                .metodo(MetodoPagamento.PIX)
                .status(StatusPagamento.PENDENTE)
                .dataCriacao(LocalDateTime.now())
                .build();

        IMercadoPagoGateway.MercadoPagoPixResponse response = gateway.gerarCobrancaPix(pagamento);

        assertNotNull(response);
        assertTrue(response.mpPaymentId().startsWith("MP-"));
        assertTrue(response.qrCodePix().startsWith("00020126580014br.gov.bcb.pix0136"));
        assertTrue(response.qrCodeBase64().startsWith("data:image/svg+xml;base64,"));
    }

    @Test
    @DisplayName("PCE: Deve gerar preferência de cartão de crédito no gateway")
    void shouldCreateCreditCardPreference() {
        Pagamento pagamento = Pagamento.builder()
                .referenciaId("DOC-1")
                .pagadorNome("Dr. Marcos Silveira")
                .valorTotal(BigDecimal.valueOf(149.90))
                .tipo(TipoPagamento.ASSINATURA_SAAS_MEDICO)
                .metodo(MetodoPagamento.CARTAO_CREDITO)
                .build();

        String preferenceId = gateway.criarPreferenciaCartao(pagamento);

        assertNotNull(preferenceId);
        assertTrue(preferenceId.startsWith("PREF-"));
    }

    @Test
    @DisplayName("TFS: Deve consultar status e solicitar estorno no gateway")
    void shouldCheckStatusAndRefund() {
        String status = gateway.consultarStatusTransacao("MP-12345");
        assertEquals("approved", status);

        boolean refundSuccess = gateway.estornarTransacao("MP-12345");
        assertTrue(refundSuccess);
    }

    @Test
    @DisplayName("TFS: Deve acionar método de contingência/fallback quando disjuntor abre")
    void shouldTriggerFallbackMethods() {
        Pagamento pagamento = Pagamento.builder()
                .referenciaId("APPT-100")
                .valorTotal(BigDecimal.valueOf(250.00))
                .build();

        IMercadoPagoGateway.MercadoPagoPixResponse fallbackPix =
                gateway.fallbackGerarCobrancaPix(pagamento, new RuntimeException("Gateway Timeout"));

        assertNotNull(fallbackPix);
        assertTrue(fallbackPix.mpPaymentId().startsWith("CONTINGENCIA-"));
        assertEquals("PIX_CONTINGENCIA_AGUARDANDO_GATEWAY", fallbackPix.qrCodePix());
        assertNull(fallbackPix.qrCodeBase64());

        String fallbackCard = gateway.fallbackCriarPreferenciaCartao(pagamento, new RuntimeException("Connection refused"));
        assertEquals("CONTINGENCIA-PREF", fallbackCard);
    }
}
