package br.com.activeage.pagamento;

import br.com.activeage.pagamento.controller.PagamentoController;
import br.com.activeage.pagamento.exception.GlobalExceptionHandler;
import br.com.activeage.pagamento.model.dto.PagamentoAssinaturaRequest;
import br.com.activeage.pagamento.model.dto.PagamentoConsultaRequest;
import br.com.activeage.pagamento.model.dto.PagamentoResponse;
import br.com.activeage.pagamento.model.enums.MetodoPagamento;
import br.com.activeage.pagamento.model.enums.StatusPagamento;
import br.com.activeage.pagamento.model.enums.TipoPagamento;
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
import java.time.LocalDateTime;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class PagamentoControllerTest {

    @Mock
    private IPagamentoService pagamentoService;

    @InjectMocks
    private PagamentoController pagamentoController;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(pagamentoController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("PCE: Deve criar cobrança Pix de consulta com split direto retornando 201 Created")
    void shouldCreateConsultaPaymentSuccessfully() throws Exception {
        PagamentoConsultaRequest request = PagamentoConsultaRequest.builder()
                .appointmentId("APPT-100")
                .patientId("PAT-1")
                .patientNome("Dona Maria de Lourdes")
                .patientCpf("123.456.789-00")
                .doctorId("DOC-1")
                .doctorNome("Dr. Alan Turing")
                .valor(BigDecimal.valueOf(250.00))
                .metodo(MetodoPagamento.PIX)
                .build();

        PagamentoResponse response = PagamentoResponse.builder()
                .id(1L)
                .tipo(TipoPagamento.CONSULTA_TELEMEDICINA)
                .referenciaId("APPT-100")
                .status(StatusPagamento.PENDENTE)
                .metodo(MetodoPagamento.PIX)
                .valorTotal(BigDecimal.valueOf(250.00))
                .valorBeneficiario(BigDecimal.valueOf(250.00))
                .taxaPlataforma(BigDecimal.ZERO)
                .qrCodePix("00020126580014br.gov.bcb.pix0136...")
                .dataCriacao(LocalDateTime.now())
                .build();

        when(pagamentoService.criarPagamentoConsulta(any(PagamentoConsultaRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/pagamentos/consulta")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.valorTotal").value(250.0))
                .andExpect(jsonPath("$.data.taxaPlataforma").value(0.0));
    }

    @Test
    @DisplayName("AVL: Deve retornar 400 Bad Request ao tentar criar consulta com valor zero ou negativo")
    void shouldFailWhenValorIsZeroOrNegative() throws Exception {
        PagamentoConsultaRequest request = PagamentoConsultaRequest.builder()
                .appointmentId("APPT-100")
                .patientId("PAT-1")
                .patientNome("Dona Maria")
                .patientCpf("123.456.789-00")
                .doctorId("DOC-1")
                .doctorNome("Dr. Alan")
                .valor(BigDecimal.ZERO)
                .metodo(MetodoPagamento.PIX)
                .build();

        mockMvc.perform(post("/api/v1/pagamentos/consulta")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value("ERROR"));
    }

    @Test
    @DisplayName("PCE: Deve criar cobrança de assinatura SaaS mensal retornando 201 Created")
    void shouldCreateAssinaturaPaymentSuccessfully() throws Exception {
        PagamentoAssinaturaRequest request = PagamentoAssinaturaRequest.builder()
                .doctorId("DOC-1")
                .doctorNome("Dr. Marcos Silveira")
                .doctorEmail("medico@teste.com")
                .doctorCpfCnpj("12.345.678/0001-90")
                .valor(BigDecimal.valueOf(149.90))
                .metodo(MetodoPagamento.PIX)
                .build();

        PagamentoResponse response = PagamentoResponse.builder()
                .id(2L)
                .tipo(TipoPagamento.ASSINATURA_SAAS_MEDICO)
                .referenciaId("DOC-1")
                .status(StatusPagamento.PENDENTE)
                .valorTotal(BigDecimal.valueOf(149.90))
                .valorBeneficiario(BigDecimal.valueOf(149.90))
                .taxaPlataforma(BigDecimal.valueOf(149.90))
                .build();

        when(pagamentoService.criarPagamentoAssinatura(any(PagamentoAssinaturaRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/pagamentos/assinatura")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.id").value(2));
    }

    @Test
    @DisplayName("PCE: Deve buscar pagamento existente por ID com 200 OK")
    void shouldFindPaymentById() throws Exception {
        PagamentoResponse response = PagamentoResponse.builder()
                .id(10L)
                .tipo(TipoPagamento.CONSULTA_TELEMEDICINA)
                .status(StatusPagamento.APROVADO)
                .valorTotal(BigDecimal.valueOf(250.00))
                .build();

        when(pagamentoService.buscarPorId(10L)).thenReturn(response);

        mockMvc.perform(get("/api/v1/pagamentos/10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.id").value(10));
    }

    @Test
    @DisplayName("PCE: Deve buscar pagamento vinculado à consulta por appointmentId com 200 OK")
    void shouldFindPaymentByAppointmentId() throws Exception {
        PagamentoResponse response = PagamentoResponse.builder()
                .id(10L)
                .referenciaId("APPT-100")
                .status(StatusPagamento.APROVADO)
                .build();

        when(pagamentoService.buscarPorConsulta("APPT-100")).thenReturn(response);

        mockMvc.perform(get("/api/v1/pagamentos/consulta/APPT-100"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.referenciaId").value("APPT-100"));
    }

    @Test
    @DisplayName("PCE: Deve estornar pagamento aprovado com 200 OK")
    void shouldRefundPaymentSuccessfully() throws Exception {
        PagamentoResponse response = PagamentoResponse.builder()
                .id(10L)
                .status(StatusPagamento.ESTORNADO)
                .build();

        when(pagamentoService.estornarPagamento(10L)).thenReturn(response);

        mockMvc.perform(post("/api/v1/pagamentos/10/estorno"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data.status").value("ESTORNADO"));
    }

    @Test
    @DisplayName("PCE: Deve buscar extrato do médico com 200 OK")
    void shouldFindPaymentsByDoctor() throws Exception {
        PagamentoResponse response = PagamentoResponse.builder()
                .id(1L)
                .beneficiarioId("DOC-1")
                .valorTotal(BigDecimal.valueOf(250.00))
                .build();

        when(pagamentoService.buscarPorBeneficiario("DOC-1")).thenReturn(java.util.List.of(response));

        mockMvc.perform(get("/api/v1/pagamentos/medico/DOC-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data[0].id").value(1));
    }

    @Test
    @DisplayName("PCE: Deve buscar histórico do paciente com 200 OK")
    void shouldFindPaymentsByPatient() throws Exception {
        PagamentoResponse response = PagamentoResponse.builder()
                .id(2L)
                .pagadorNome("Maria")
                .valorTotal(BigDecimal.valueOf(250.00))
                .build();

        when(pagamentoService.buscarPorPagador("PAT-1")).thenReturn(java.util.List.of(response));

        mockMvc.perform(get("/api/v1/pagamentos/paciente/PAT-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"))
                .andExpect(jsonPath("$.data[0].id").value(2));
    }
}
