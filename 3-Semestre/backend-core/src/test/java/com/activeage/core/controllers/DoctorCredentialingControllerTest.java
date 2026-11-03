package com.activeage.core.controllers;

import com.activeage.core.domain.enums.DoctorDossierStatus;
import com.activeage.core.domain.enums.DocumentType;
import com.activeage.core.domain.models.DoctorDocumentInfo;
import com.activeage.core.domain.models.DoctorFinancialInfo;
import com.activeage.core.dtos.requests.DoctorFinancialInfoRequest;
import com.activeage.core.dtos.responses.DoctorDossierStatusResponse;
import com.activeage.core.exceptions.GlobalExceptionHandler;
import com.activeage.core.services.DoctorCredentialingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.core.MethodParameter;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class DoctorCredentialingControllerTest {

    @Mock
    private DoctorCredentialingService credentialingService;

    @InjectMocks
    private DoctorCredentialingController doctorCredentialingController;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        HandlerMethodArgumentResolver authPrincipalResolver = new HandlerMethodArgumentResolver() {
            @Override
            public boolean supportsParameter(MethodParameter parameter) {
                return parameter.hasParameterAnnotation(AuthenticationPrincipal.class);
            }

            @Override
            public Object resolveArgument(MethodParameter parameter, ModelAndViewContainer mavContainer,
                                          NativeWebRequest webRequest, WebDataBinderFactory binderFactory) {
                return "medico@activeage.com";
            }
        };

        mockMvc = MockMvcBuilders.standaloneSetup(doctorCredentialingController)
                .setCustomArgumentResolvers(authPrincipalResolver)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /api/doctor/dossier/status - Deve retornar status do dossiê do médico")
    void shouldGetStatus() throws Exception {
        DoctorDossierStatusResponse resp = DoctorDossierStatusResponse.builder()
                .dossierStatus(DoctorDossierStatus.PENDING_DOCS)
                .build();

        when(credentialingService.getStatus("medico@activeage.com")).thenReturn(resp);

        mockMvc.perform(get("/api/doctor/dossier/status"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dossierStatus").value("PENDING_DOCS"));
    }

    @Test
    @DisplayName("POST /api/doctor/documents/upload - Deve realizar upload de documento")
    void shouldUploadDocument() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "crm.pdf", "application/pdf", "DADOS".getBytes());
        DoctorDocumentInfo info = new DoctorDocumentInfo();
        info.setOriginalFileName("crm.pdf");

        when(credentialingService.uploadDocument(eq("medico@activeage.com"), eq(DocumentType.CRM_CARD), any(), any()))
                .thenReturn(info);

        mockMvc.perform(multipart("/api/doctor/documents/upload")
                        .file(file)
                        .param("documentType", "CRM_CARD"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.originalFileName").value("crm.pdf"));
    }

    @Test
    @DisplayName("POST /api/doctor/financial-info - Deve salvar dados bancários")
    void shouldUpdateFinancialInfo() throws Exception {
        DoctorFinancialInfoRequest req = new DoctorFinancialInfoRequest(
                "Banco do Brasil", "1234", "56789-0", "CORRENTE", "chave-pix@email.com", "EMAIL", null, null
        );

        DoctorFinancialInfo res = new DoctorFinancialInfo();
        res.setBankName("Banco do Brasil");

        when(credentialingService.updateFinancialInfo(eq("medico@activeage.com"), any(DoctorFinancialInfoRequest.class), any()))
                .thenReturn(res);

        mockMvc.perform(post("/api/doctor/financial-info")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bankName").value("Banco do Brasil"));
    }

    @Test
    @DisplayName("POST /api/doctor/dossier/submit - Deve submeter dossiê para análise")
    void shouldSubmitDossier() throws Exception {
        DoctorDossierStatusResponse resp = DoctorDossierStatusResponse.builder()
                .dossierStatus(DoctorDossierStatus.UNDER_REVIEW)
                .build();

        when(credentialingService.submitDossier(eq("medico@activeage.com"), any()))
                .thenReturn(resp);

        mockMvc.perform(post("/api/doctor/dossier/submit"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dossierStatus").value("UNDER_REVIEW"));
    }

    @Test
    @DisplayName("GET /api/doctor/documents/{docType} - Deve visualizar próprio documento")
    void shouldGetOwnDocument() throws Exception {
        ByteArrayResource resource = new ByteArrayResource("PDF_CONTENT".getBytes());
        DoctorDocumentInfo info = new DoctorDocumentInfo();
        info.setOriginalFileName("meu_crm.pdf");
        info.setContentType("application/pdf");

        when(credentialingService.getDoctorOwnDocument("medico@activeage.com", DocumentType.CRM_CARD))
                .thenReturn(resource);
        when(credentialingService.getDoctorDocumentInfo("medico@activeage.com", DocumentType.CRM_CARD))
                .thenReturn(info);

        mockMvc.perform(get("/api/doctor/documents/CRM_CARD"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "inline; filename=\"meu_crm.pdf\""))
                .andExpect(content().bytes("PDF_CONTENT".getBytes()));
    }
}
