package com.activeage.core.controllers;

import com.activeage.core.domain.enums.DoctorDossierStatus;
import com.activeage.core.domain.enums.DocumentType;
import com.activeage.core.domain.models.DoctorDocumentInfo;
import com.activeage.core.dtos.requests.DoctorReviewRequest;
import com.activeage.core.dtos.responses.AdminDoctorItemResponse;
import com.activeage.core.dtos.responses.DoctorDossierStatusResponse;
import com.activeage.core.exceptions.GlobalExceptionHandler;
import com.activeage.core.services.AdminCredentialingService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.MethodParameter;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.bind.support.WebDataBinderFactory;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.method.support.HandlerMethodArgumentResolver;
import org.springframework.web.method.support.ModelAndViewContainer;

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AdminCredentialingControllerTest {

    @Mock
    private AdminCredentialingService adminCredentialingService;

    @InjectMocks
    private AdminCredentialingController adminCredentialingController;

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
                return "admin@activeage.com";
            }
        };

        mockMvc = MockMvcBuilders.standaloneSetup(adminCredentialingController)
                .setCustomArgumentResolvers(authPrincipalResolver)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /api/admin/doctors/pending - Deve listar fila de credenciamento")
    void shouldGetQueue() throws Exception {
        AdminDoctorItemResponse doc = AdminDoctorItemResponse.builder()
                .id("doc-1")
                .fullName("Dr. Margaret")
                .dossierStatus(DoctorDossierStatus.UNDER_REVIEW)
                .build();

        when(adminCredentialingService.getDoctorsQueue(DoctorDossierStatus.UNDER_REVIEW))
                .thenReturn(List.of(doc));

        mockMvc.perform(get("/api/admin/doctors/pending")
                        .param("status", "UNDER_REVIEW"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].fullName").value("Dr. Margaret"));
    }

    @Test
    @DisplayName("GET /api/admin/doctors/{id}/dossier - Deve retornar dossiê para auditoria")
    void shouldGetDossier() throws Exception {
        DoctorDossierStatusResponse dossier = DoctorDossierStatusResponse.builder()
                .dossierStatus(DoctorDossierStatus.UNDER_REVIEW)
                .build();

        when(adminCredentialingService.getDoctorDossier(eq("doc-1"), eq("admin@activeage.com"), anyString()))
                .thenReturn(dossier);

        mockMvc.perform(get("/api/admin/doctors/doc-1/dossier")
                        .header("X-Forwarded-For", "10.0.0.1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dossierStatus").value("UNDER_REVIEW"));
    }

    @Test
    @DisplayName("GET /api/admin/doctors/{id}/documents/{docType} - Deve retornar arquivo de documento")
    void shouldGetDocument() throws Exception {
        ByteArrayResource resource = new ByteArrayResource("PDF_DOC".getBytes());
        DoctorDocumentInfo info = new DoctorDocumentInfo();
        info.setOriginalFileName("crm.pdf");
        info.setContentType("application/pdf");

        when(adminCredentialingService.getDoctorDocumentResource(eq("doc-1"), eq(DocumentType.CRM_CARD), eq("admin@activeage.com"), anyString()))
                .thenReturn(resource);
        when(adminCredentialingService.getDoctorDocumentInfo("doc-1", DocumentType.CRM_CARD))
                .thenReturn(info);

        mockMvc.perform(get("/api/admin/doctors/doc-1/documents/CRM_CARD"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "inline; filename=\"crm.pdf\""))
                .andExpect(content().bytes("PDF_DOC".getBytes()));
    }

    @Test
    @DisplayName("POST /api/admin/doctors/{id}/review - Deve avaliar e registrar parecer")
    void shouldReviewDoctor() throws Exception {
        DoctorReviewRequest req = new DoctorReviewRequest();
        req.setAction("APPROVE");

        DoctorDossierStatusResponse res = DoctorDossierStatusResponse.builder()
                .dossierStatus(DoctorDossierStatus.APPROVED)
                .build();

        when(adminCredentialingService.reviewDoctor(eq("doc-1"), any(DoctorReviewRequest.class), eq("admin@activeage.com"), anyString()))
                .thenReturn(res);

        mockMvc.perform(post("/api/admin/doctors/doc-1/review")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.dossierStatus").value("APPROVED"));
    }
}
