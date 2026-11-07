package br.com.activeage.pagamento;

import br.com.activeage.pagamento.exception.PagamentoException;
import br.com.activeage.pagamento.model.dto.PagamentoAssinaturaRequest;
import br.com.activeage.pagamento.model.dto.PagamentoConsultaRequest;
import br.com.activeage.pagamento.model.dto.PagamentoResponse;
import br.com.activeage.pagamento.model.dto.WebhookEventDto;
import br.com.activeage.pagamento.model.entity.Pagamento;
import br.com.activeage.pagamento.model.enums.MetodoPagamento;
import br.com.activeage.pagamento.model.enums.StatusPagamento;
import br.com.activeage.pagamento.model.enums.TipoPagamento;
import br.com.activeage.pagamento.repository.IPagamentoRepository;
import br.com.activeage.pagamento.service.IAssinaturaService;
import br.com.activeage.pagamento.service.gateway.IMercadoPagoGateway;
import br.com.activeage.pagamento.service.impl.PagamentoServiceImpl;
import br.com.activeage.pagamento.service.strategy.AssinaturaSaaSStrategy;
import br.com.activeage.pagamento.service.strategy.IEstrategiaSplit;
import br.com.activeage.pagamento.service.strategy.SplitDiretoConsultaStrategy;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PagamentoServiceTest {

    @Mock
    private IPagamentoRepository pagamentoRepository;

    @Mock
    private IMercadoPagoGateway mercadoPagoGateway;

    @Mock
    private IAssinaturaService assinaturaService;

    private PagamentoServiceImpl pagamentoService;

    @BeforeEach
    void setUp() {
        List<IEstrategiaSplit> strategies = List.of(
                new SplitDiretoConsultaStrategy(),
                new AssinaturaSaaSStrategy()
        );
        pagamentoService = new PagamentoServiceImpl(
                pagamentoRepository,
                mercadoPagoGateway,
                assinaturaService,
                strategies
        );
    }

    @Test
    @DisplayName("TFS: Deve criar pagamento Pix de consulta com split direto 100% médico")
    void shouldCreateConsultaPixPaymentWithDirectSplit() {
        PagamentoConsultaRequest request = PagamentoConsultaRequest.builder()
                .appointmentId("APPT-1")
                .patientId("PAT-1")
                .patientNome("Dona Maria")
                .patientCpf("111.222.333-44")
                .doctorId("DOC-1")
                .doctorNome("Dr. Turing")
                .valor(BigDecimal.valueOf(250.00))
                .metodo(MetodoPagamento.PIX)
                .build();

        when(pagamentoRepository.findByReferenciaIdAndTipo("APPT-1", TipoPagamento.CONSULTA_TELEMEDICINA))
                .thenReturn(Optional.empty());

        when(mercadoPagoGateway.gerarCobrancaPix(any(Pagamento.class)))
                .thenReturn(new IMercadoPagoGateway.MercadoPagoPixResponse(
                        "MP-999", "00020126580014...", "data:image/svg+xml;base64,..."
                ));

        when(pagamentoRepository.save(any(Pagamento.class))).thenAnswer(inv -> {
            Pagamento p = inv.getArgument(0);
            p.setId(1L);
            return p;
        });

        PagamentoResponse response = pagamentoService.criarPagamentoConsulta(request);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals(TipoPagamento.CONSULTA_TELEMEDICINA, response.getTipo());
        assertEquals(BigDecimal.valueOf(250.00), response.getValorTotal());
        assertEquals(BigDecimal.valueOf(250.00), response.getValorBeneficiario());
        assertEquals(BigDecimal.ZERO, response.getTaxaPlataforma());
        assertEquals(StatusPagamento.PENDENTE, response.getStatus());
        assertEquals("MP-999", response.getMpPaymentId());
        assertNotNull(response.getQrCodePix());

        verify(pagamentoRepository).save(any(Pagamento.class));
    }

    @Test
    @DisplayName("TFS: Deve impedir cobrança duplicada se a consulta já tiver pagamento aprovado")
    void shouldThrowConflictWhenConsultaAlreadyPaid() {
        PagamentoConsultaRequest request = PagamentoConsultaRequest.builder()
                .appointmentId("APPT-1")
                .patientId("PAT-1")
                .patientNome("Dona Maria")
                .patientCpf("111.222.333-44")
                .doctorId("DOC-1")
                .doctorNome("Dr. Turing")
                .valor(BigDecimal.valueOf(250.00))
                .metodo(MetodoPagamento.PIX)
                .build();

        Pagamento jaAprovado = Pagamento.builder()
                .id(1L)
                .status(StatusPagamento.APROVADO)
                .build();

        when(pagamentoRepository.findByReferenciaIdAndTipo("APPT-1", TipoPagamento.CONSULTA_TELEMEDICINA))
                .thenReturn(Optional.of(jaAprovado));

        assertThrows(PagamentoException.class, () -> pagamentoService.criarPagamentoConsulta(request));
    }

    @Test
    @DisplayName("TFS: Deve criar cobrança de assinatura SaaS creditando 100% para a plataforma")
    void shouldCreateAssinaturaSaaSPayment() {
        PagamentoAssinaturaRequest request = PagamentoAssinaturaRequest.builder()
                .doctorId("DOC-1")
                .doctorNome("Dr. Marcos")
                .doctorEmail("marcos@activeage.com")
                .doctorCpfCnpj("111.222.333-44")
                .valor(BigDecimal.valueOf(149.90))
                .metodo(MetodoPagamento.PIX)
                .build();

        when(mercadoPagoGateway.gerarCobrancaPix(any(Pagamento.class)))
                .thenReturn(new IMercadoPagoGateway.MercadoPagoPixResponse(
                        "MP-SAAS-100", "000201...", "base64..."
                ));

        when(pagamentoRepository.save(any(Pagamento.class))).thenAnswer(inv -> {
            Pagamento p = inv.getArgument(0);
            p.setId(2L);
            return p;
        });

        PagamentoResponse response = pagamentoService.criarPagamentoAssinatura(request);

        assertNotNull(response);
        assertEquals(TipoPagamento.ASSINATURA_SAAS_MEDICO, response.getTipo());
        assertEquals("ACTIVE_AGE_PLATAFORMA", response.getBeneficiarioId());
        assertEquals(BigDecimal.valueOf(149.90), response.getValorTotal());
        assertEquals(BigDecimal.valueOf(149.90), response.getTaxaPlataforma());
    }

    @Test
    @DisplayName("TFS: Deve processar Webhook e aprovar pagamento pendente")
    void shouldProcessWebhookAndApprovePayment() {
        Pagamento pendente = Pagamento.builder()
                .id(10L)
                .mpPaymentId("MP-12345")
                .referenciaId("APPT-100")
                .tipo(TipoPagamento.CONSULTA_TELEMEDICINA)
                .status(StatusPagamento.PENDENTE)
                .build();

        when(pagamentoRepository.findByMpPaymentId("MP-12345")).thenReturn(Optional.of(pendente));

        WebhookEventDto event = WebhookEventDto.builder()
                .action("payment.updated")
                .data(Map.of("id", "MP-12345"))
                .build();

        pagamentoService.processarWebhook(event);

        assertEquals(StatusPagamento.APROVADO, pendente.getStatus());
        assertNotNull(pendente.getDataConfirmacao());
        verify(pagamentoRepository).save(pendente);
    }

    @Test
    @DisplayName("TFS: Deve estornar pagamento aprovado com sucesso")
    void shouldRefundApprovedPayment() {
        Pagamento aprovado = Pagamento.builder()
                .id(10L)
                .mpPaymentId("MP-12345")
                .status(StatusPagamento.APROVADO)
                .build();

        when(pagamentoRepository.findById(10L)).thenReturn(Optional.of(aprovado));
        when(mercadoPagoGateway.estornarTransacao("MP-12345")).thenReturn(true);
        when(pagamentoRepository.save(any(Pagamento.class))).thenAnswer(inv -> inv.getArgument(0));

        PagamentoResponse res = pagamentoService.estornarPagamento(10L);

        assertEquals(StatusPagamento.ESTORNADO, res.getStatus());
        verify(mercadoPagoGateway).estornarTransacao("MP-12345");
    }

    @Test
    @DisplayName("TFS: Deve criar cobrança via Checkout Pro do Mercado Pago com init_point")
    void shouldCreateCheckoutProPayment() {
        PagamentoConsultaRequest request = PagamentoConsultaRequest.builder()
                .appointmentId("APPT-2")
                .patientId("PAT-2")
                .patientNome("Dona Maria")
                .patientCpf("11144477735")
                .doctorId("DOC-1")
                .doctorNome("Dr. Turing")
                .valor(BigDecimal.valueOf(250.00))
                .metodo(MetodoPagamento.MERCADO_PAGO_CHECKOUT)
                .build();

        when(pagamentoRepository.findByReferenciaIdAndTipo("APPT-2", TipoPagamento.CONSULTA_TELEMEDICINA))
                .thenReturn(Optional.empty());

        when(mercadoPagoGateway.criarPreferenciaCheckoutPro(any(Pagamento.class)))
                .thenReturn(new IMercadoPagoGateway.MercadoPagoPreferenciaResponse(
                        "PREF-123", "https://mercadopago.com.br/checkout/123", "https://sandbox.mercadopago.com.br/checkout/123"
                ));

        when(pagamentoRepository.save(any(Pagamento.class))).thenAnswer(inv -> {
            Pagamento p = inv.getArgument(0);
            p.setId(20L);
            return p;
        });

        PagamentoResponse response = pagamentoService.criarPagamentoConsulta(request);

        assertNotNull(response);
        assertEquals("PREF-123", response.getMpPreferenceId());
        assertEquals("https://sandbox.mercadopago.com.br/checkout/123", response.getMpSandboxInitPoint());
        assertEquals(MetodoPagamento.MERCADO_PAGO_CHECKOUT, response.getMetodo());
    }

    @Test
    @DisplayName("TFS: Deve listar histórico por pagador e por beneficiário")
    void shouldFindPaymentsByPagadorAndBeneficiario() {
        Pagamento p1 = Pagamento.builder()
                .id(1L)
                .pagadorId("PAT-1")
                .beneficiarioId("DOC-1")
                .dataCriacao(LocalDateTime.now())
                .valorTotal(BigDecimal.valueOf(250.00))
                .build();

        when(pagamentoRepository.findByPagadorId("PAT-1")).thenReturn(List.of(p1));
        when(pagamentoRepository.findByBeneficiarioId("DOC-1")).thenReturn(List.of(p1));

        List<PagamentoResponse> porPagador = pagamentoService.buscarPorPagador("PAT-1");
        List<PagamentoResponse> porBeneficiario = pagamentoService.buscarPorBeneficiario("DOC-1");

        assertEquals(1, porPagador.size());
        assertEquals(1, porBeneficiario.size());
    }
}
