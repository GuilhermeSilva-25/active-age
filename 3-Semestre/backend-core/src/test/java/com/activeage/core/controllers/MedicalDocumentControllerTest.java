package com.activeage.core.controllers;

import com.activeage.core.dtos.CreateMedicalDocumentRequest;
import com.activeage.core.dtos.DocumentValidationResponse;
import com.activeage.core.dtos.MedicalDocumentResponse;
import com.activeage.core.exceptions.GlobalExceptionHandler;
import com.activeage.core.services.MedicalDocumentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class MedicalDocumentControllerTest {

    @Mock
    private MedicalDocumentService medicalDocumentService;

    @InjectMocks
    private MedicalDocumentController medicalDocumentController;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(medicalDocumentController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn("medico@activeage.com");
        when(auth.getName()).thenReturn("medico@activeage.com");

        SecurityContext secCtx = mock(SecurityContext.class);
        when(secCtx.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(secCtx);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("POST /api/medical-documents - Deve emitir novo documento médico com código ICP-Brasil")
    void shouldCreateMedicalDocument() throws Exception {
        CreateMedicalDocumentRequest req = CreateMedicalDocumentRequest.builder()
                .appointmentId("apt-1")
                .documentType("RECEITA_MEDICA")
                .title("Prescrição Farmacológica")
                .content("Losartana 50mg 1x ao dia")
                .build();

        MedicalDocumentResponse resp = MedicalDocumentResponse.builder()
                .id("doc-1")
                .validationCode("AA-2026-ABCDEF")
                .title("Prescrição Farmacológica")
                .build();

        when(medicalDocumentService.createDocument(eq("medico@activeage.com"), any(CreateMedicalDocumentRequest.class)))
                .thenReturn(resp);

        mockMvc.perform(post("/api/medical-documents")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("doc-1"))
                .andExpect(jsonPath("$.validationCode").value("AA-2026-ABCDEF"));
    }

    @Test
    @DisplayName("GET /api/medical-documents/appointment/{id} - Deve listar documentos da consulta")
    void shouldGetDocumentsByAppointment() throws Exception {
        MedicalDocumentResponse resp = MedicalDocumentResponse.builder()
                .id("doc-1")
                .validationCode("AA-2026-112233")
                .build();

        when(medicalDocumentService.getDocumentsByAppointment("medico@activeage.com", "apt-1"))
                .thenReturn(List.of(resp));

        mockMvc.perform(get("/api/medical-documents/appointment/apt-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].validationCode").value("AA-2026-112233"));
    }

    @Test
    @DisplayName("GET /api/medical-documents/my-documents - Deve listar documentos do paciente logado")
    void shouldGetMyDocuments() throws Exception {
        MedicalDocumentResponse resp = MedicalDocumentResponse.builder()
                .id("doc-2")
                .title("Atestado Médico")
                .build();

        when(medicalDocumentService.getPatientDocuments("medico@activeage.com"))
                .thenReturn(List.of(resp));

        mockMvc.perform(get("/api/medical-documents/my-documents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Atestado Médico"));
    }

    @Test
    @DisplayName("GET /api/medical-documents/validate/{code} - Validação pública do documento")
    void shouldValidateDocumentPublicly() throws Exception {
        DocumentValidationResponse resp = DocumentValidationResponse.builder()
                .valid(true)
                .validationCode("AA-2026-XYZ")
                .doctorName("Dr. Alan Turing")
                .build();

        when(medicalDocumentService.validateDocument("AA-2026-XYZ")).thenReturn(resp);

        mockMvc.perform(get("/api/medical-documents/validate/AA-2026-XYZ"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.valid").value(true))
                .andExpect(jsonPath("$.doctorName").value("Dr. Alan Turing"));
    }
}
