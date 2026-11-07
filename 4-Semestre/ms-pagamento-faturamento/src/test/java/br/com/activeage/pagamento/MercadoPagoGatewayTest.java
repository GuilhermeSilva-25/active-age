package br.com.activeage.pagamento;

import br.com.activeage.pagamento.model.entity.Pagamento;
import br.com.activeage.pagamento.model.enums.MetodoPagamento;
import br.com.activeage.pagamento.model.enums.StatusPagamento;
import br.com.activeage.pagamento.model.enums.TipoPagamento;
import br.com.activeage.pagamento.service.gateway.IMercadoPagoGateway;
import br.com.activeage.pagamento.service.gateway.impl.MercadoPagoGatewayImpl;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.math.BigDecimal;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class MercadoPagoGatewayTest {

    private MercadoPagoGatewayImpl gateway;

    @BeforeEach
    void setUp() {
        gateway = new MercadoPagoGatewayImpl();
        ReflectionTestUtils.setField(gateway, "accessToken", "TEST-TOKEN-123");
    }

    @Test
    @DisplayName("PCE: Deve gerar cobrança Pix válida no modo simulado/offline")
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
    @DisplayName("PCE: Deve processar resposta real da API do Mercado Pago quando configurado token de produção/sandbox")
    @SuppressWarnings("unchecked")
    void shouldProcessLiveMercadoPagoResponse() throws Exception {
        HttpClient mockClient = mock(HttpClient.class);
        HttpResponse<String> mockResponse = mock(HttpResponse.class);

        String mpJson = """
                {
                  "id": 1354957263,
                  "status": "pending",
                  "point_of_interaction": {
                    "transaction_data": {
                      "qr_code": "00020126580014br.gov.bcb.pix0136testemercadopago",
                      "qr_code_base64": "iVBORw0KGgoAAA"
                    }
                  }
                }
                """;

        when(mockResponse.statusCode()).thenReturn(201);
        when(mockResponse.body()).thenReturn(mpJson);
        when(mockClient.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class)))
                .thenReturn(mockResponse);

        MercadoPagoGatewayImpl liveGateway = new MercadoPagoGatewayImpl(new ObjectMapper(), mockClient);
        ReflectionTestUtils.setField(liveGateway, "accessToken", "TEST-0000000000000000-000000-00000000000000000000000000000000-000000000");

        Pagamento pagamento = Pagamento.builder()
                .referenciaId("APPT-200")
                .pagadorNome("Maria da Silva")
                .pagadorCpfCnpj("123.456.789-00")
                .pagadorId("maria@gmail.com")
                .valorTotal(BigDecimal.valueOf(250.00))
                .tipo(TipoPagamento.CONSULTA_TELEMEDICINA)
                .metodo(MetodoPagamento.PIX)
                .build();

        IMercadoPagoGateway.MercadoPagoPixResponse response = liveGateway.gerarCobrancaPix(pagamento);

        assertNotNull(response);
        assertEquals("1354957263", response.mpPaymentId());
        assertEquals("00020126580014br.gov.bcb.pix0136testemercadopago", response.qrCodePix());
        assertEquals("data:image/png;base64,iVBORw0KGgoAAA", response.qrCodeBase64());
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
    @DisplayName("PCE: Deve criar preferência no Mercado Pago quando token oficial configurado")
    @SuppressWarnings("unchecked")
    void shouldCreatePreferenceLive() throws Exception {
        HttpClient mockClient = mock(HttpClient.class);
        HttpResponse<String> mockResponse = mock(HttpResponse.class);

        when(mockResponse.statusCode()).thenReturn(201);
        when(mockResponse.body()).thenReturn("{\"id\": \"PREF-REAL-12345\"}");
        when(mockClient.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class)))
                .thenReturn(mockResponse);

        MercadoPagoGatewayImpl liveGateway = new MercadoPagoGatewayImpl(new ObjectMapper(), mockClient);
        ReflectionTestUtils.setField(liveGateway, "accessToken", "TEST-0000000000000000-000000-00000000000000000000000000000000-000000000");

        Pagamento pagamento = Pagamento.builder()
                .referenciaId("DOC-1")
                .valorTotal(BigDecimal.valueOf(149.90))
                .tipo(TipoPagamento.ASSINATURA_SAAS_MEDICO)
                .build();

        String prefId = liveGateway.criarPreferenciaCartao(pagamento);
        assertEquals("PREF-REAL-12345", prefId);
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
    @DisplayName("PCE: Deve consultar status e estornar via API oficial quando token real e ID numérico")
    @SuppressWarnings("unchecked")
    void shouldQueryStatusAndRefundLive() throws Exception {
        HttpClient mockClient = mock(HttpClient.class);
        HttpResponse<String> mockResponse = mock(HttpResponse.class);

        when(mockResponse.statusCode()).thenReturn(200);
        when(mockResponse.body()).thenReturn("{\"status\": \"approved\"}");
        when(mockClient.send(any(HttpRequest.class), any(HttpResponse.BodyHandler.class)))
                .thenReturn(mockResponse);

        MercadoPagoGatewayImpl liveGateway = new MercadoPagoGatewayImpl(new ObjectMapper(), mockClient);
        ReflectionTestUtils.setField(liveGateway, "accessToken", "TEST-0000000000000000-000000-00000000000000000000000000000000-000000000");

        String status = liveGateway.consultarStatusTransacao("1354957263");
        assertEquals("approved", status);

        boolean refund = liveGateway.estornarTransacao("1354957263");
        assertTrue(refund);
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
