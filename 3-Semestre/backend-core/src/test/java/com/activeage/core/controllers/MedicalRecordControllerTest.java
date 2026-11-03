package com.activeage.core.controllers;

import com.activeage.core.dtos.MedicalRecordRequest;
import com.activeage.core.dtos.MedicalRecordResponse;
import com.activeage.core.exceptions.GlobalExceptionHandler;
import com.activeage.core.services.MedicalRecordService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class MedicalRecordControllerTest {

    @Mock
    private MedicalRecordService medicalRecordService;

    @InjectMocks
    private MedicalRecordController medicalRecordController;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(medicalRecordController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn("medico@teste.com");
        when(auth.getName()).thenReturn("medico@teste.com");

        SecurityContext secCtx = mock(SecurityContext.class);
        when(secCtx.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(secCtx);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("GET /api/medical-records/appointment/{id} - Deve retornar prontuário com HTTP 200")
    void shouldReturnMedicalRecord() throws Exception {
        MedicalRecordResponse resp = MedicalRecordResponse.builder()
                .id("rec-1")
                .appointmentId("apt-1")
                .doctorName("Dr. Turing")
                .build();

        when(medicalRecordService.getOrInitRecord("medico@teste.com", "apt-1")).thenReturn(resp);

        mockMvc.perform(get("/api/medical-records/appointment/apt-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("rec-1"))
                .andExpect(jsonPath("$.doctorName").value("Dr. Turing"));
    }

    @Test
    @DisplayName("GET /api/medical-records/appointment/{id} - Deve retornar 204 NoContent se registro for nulo")
    void shouldReturnNoContentWhenNull() throws Exception {
        when(medicalRecordService.getOrInitRecord("medico@teste.com", "apt-none")).thenReturn(null);

        mockMvc.perform(get("/api/medical-records/appointment/apt-none"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("POST /api/medical-records - Deve salvar rascunho com sucesso")
    void shouldSaveDraft() throws Exception {
        MedicalRecordRequest req = MedicalRecordRequest.builder()
                .appointmentId("apt-1")
                .chiefComplaint("Dor articular")
                .build();

        MedicalRecordResponse resp = MedicalRecordResponse.builder()
                .id("rec-1")
                .appointmentId("apt-1")
                .chiefComplaint("Dor articular")
                .build();

        when(medicalRecordService.saveDraft(eq("medico@teste.com"), any(MedicalRecordRequest.class)))
                .thenReturn(resp);

        mockMvc.perform(post("/api/medical-records")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.chiefComplaint").value("Dor articular"));
    }

    @Test
    @DisplayName("POST /api/medical-records/{id}/finalize - Deve finalizar prontuário e assinar digitalmente")
    void shouldFinalizeMedicalRecord() throws Exception {
        MedicalRecordResponse resp = MedicalRecordResponse.builder()
                .id("rec-1")
                .status("FINALIZED")
                .hashSignature("sha256-hash-xyz")
                .build();

        when(medicalRecordService.finalizeRecord("medico@teste.com", "rec-1")).thenReturn(resp);

        mockMvc.perform(post("/api/medical-records/rec-1/finalize"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("FINALIZED"))
                .andExpect(jsonPath("$.hashSignature").value("sha256-hash-xyz"));
    }

    @Test
    @DisplayName("Deve retornar 400 Bad Request se usuário não estiver autenticado ao chamar endpoint")
    void shouldReturnBadRequestWhenUserNotAuthenticated() throws Exception {
        SecurityContextHolder.clearContext();

        mockMvc.perform(get("/api/medical-records/appointment/apt-1"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Usuário não autenticado."));
    }
}
