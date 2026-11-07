package br.com.activeage.pagamento;

import br.com.activeage.pagamento.controller.AssinaturaController;
import br.com.activeage.pagamento.controller.WebhookController;
import br.com.activeage.pagamento.exception.GlobalExceptionHandler;
import br.com.activeage.pagamento.model.dto.AssinaturaResponse;
import br.com.activeage.pagamento.model.dto.WebhookEventDto;
import br.com.activeage.pagamento.model.enums.StatusAssinatura;
import br.com.activeage.pagamento.service.IAssinaturaService;
import br.com.activeage.pagamento.service.IPagamentoService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class WebhookAndAssinaturaControllerTest {

    @Mock
    private IPagamentoService pagamentoService;

    @Mock
    private IAssinaturaService assinaturaService;

    @InjectMocks
    private WebhookController webhookController;

    @InjectMocks
    private AssinaturaController assinaturaController;

    private MockMvc webhookMockMvc;
    private MockMvc assinaturaMockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        webhookMockMvc = MockMvcBuilders.standaloneSetup(webhookController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        assinaturaMockMvc = MockMvcBuilders.standaloneSetup(assinaturaController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("PCE: Webhook deve receber notificação do Mercado Pago e retornar 200 OK")
    void shouldReceiveWebhookSuccessfully() throws Exception {
        WebhookEventDto event = WebhookEventDto.builder()
                .action("payment.created")
                .data(Map.of("id", "MP-100"))
                .build();

        webhookMockMvc.perform(post("/api/v1/webhooks/mercadopago")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(event)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("RECEIVED"));

        verify(pagamentoService).processarWebhook(any(WebhookEventDto.class));
    }

    @Test
    @DisplayName("PCE: Deve consultar assinatura do médico e retornar 200 OK com dados")
    void shouldFindAssinaturaByDoctor() throws Exception {
        AssinaturaResponse response = AssinaturaResponse.builder()
                .id(1L)
                .doctorId("DOC-1")
                .status(StatusAssinatura.ATIVA)
                .valorMensal(BigDecimal.valueOf(149.90))
                .build();

        when(assinaturaService.buscarPorMedico("DOC-1")).thenReturn(response);

        assinaturaMockMvc.perform(get("/api/v1/assinaturas/medico/DOC-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.status").value("ATIVA"));
    }

    @Test
    @DisplayName("TFS: Deve cancelar assinatura do médico com sucesso")
    void shouldCancelAssinatura() throws Exception {
        AssinaturaResponse response = AssinaturaResponse.builder()
                .id(1L)
                .doctorId("DOC-1")
                .status(StatusAssinatura.CANCELADA)
                .build();

        when(assinaturaService.cancelarAssinatura("DOC-1")).thenReturn(response);

        assinaturaMockMvc.perform(post("/api/v1/assinaturas/medico/DOC-1/cancelar"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.status").value("CANCELADA"));
    }
}
