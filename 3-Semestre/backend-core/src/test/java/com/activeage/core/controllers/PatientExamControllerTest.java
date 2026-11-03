package com.activeage.core.controllers;

import com.activeage.core.domain.enums.ExamCategory;
import com.activeage.core.domain.models.PatientExam;
import com.activeage.core.dtos.responses.PatientExamResponse;
import com.activeage.core.exceptions.GlobalExceptionHandler;
import com.activeage.core.services.PatientExamService;
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
import org.springframework.core.io.ByteArrayResource;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class PatientExamControllerTest {

    @Mock
    private PatientExamService patientExamService;

    @InjectMocks
    private PatientExamController patientExamController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(patientExamController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        Authentication auth = mock(Authentication.class);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn("paciente@teste.com");
        when(auth.getName()).thenReturn("paciente@teste.com");

        SecurityContext secCtx = mock(SecurityContext.class);
        when(secCtx.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(secCtx);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("POST /api/patient/exams - Deve fazer upload de exame com sucesso")
    void shouldUploadExam() throws Exception {
        MockMultipartFile file = new MockMultipartFile("file", "hemograma.pdf", "application/pdf", "PDF_DATA".getBytes());

        PatientExamResponse resp = PatientExamResponse.builder()
                .id("exam-1")
                .title("Hemograma Completo")
                .category(ExamCategory.LABORATORIAL)
                .build();

        when(patientExamService.uploadExam(eq("paciente@teste.com"), any(), eq("Hemograma Completo"), eq(ExamCategory.LABORATORIAL), any(LocalDate.class), any()))
                .thenReturn(resp);

        mockMvc.perform(multipart("/api/patient/exams")
                        .file(file)
                        .param("title", "Hemograma Completo")
                        .param("category", "LABORATORIAL")
                        .param("examDate", "2026-10-15")
                        .param("notes", "Jejum de 12 horas"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("exam-1"))
                .andExpect(jsonPath("$.title").value("Hemograma Completo"));
    }

    @Test
    @DisplayName("GET /api/patient/exams - Deve listar exames do paciente")
    void shouldGetPatientExams() throws Exception {
        PatientExamResponse resp = PatientExamResponse.builder().id("exam-1").title("Raio X").build();
        when(patientExamService.getPatientExams("paciente@teste.com", ExamCategory.IMAGEM))
                .thenReturn(List.of(resp));

        mockMvc.perform(get("/api/patient/exams").param("category", "IMAGEM"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Raio X"));
    }

    @Test
    @DisplayName("GET /api/patient/exams/{id}/download - Deve baixar arquivo do exame")
    void shouldDownloadExam() throws Exception {
        PatientExam exam = new PatientExam();
        exam.setId("exam-1");
        exam.setOriginalFileName("laudo.pdf");
        exam.setContentType("application/pdf");

        ByteArrayResource resource = new ByteArrayResource("CONTEUDO_PDF".getBytes());
        PatientExamService.ExamDownloadData downloadData = new PatientExamService.ExamDownloadData(resource, exam);

        when(patientExamService.getExamForDownload("paciente@teste.com", "exam-1")).thenReturn(downloadData);

        mockMvc.perform(get("/api/patient/exams/exam-1/download"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "inline; filename=\"laudo.pdf\""))
                .andExpect(content().bytes("CONTEUDO_PDF".getBytes()));
    }

    @Test
    @DisplayName("DELETE /api/patient/exams/{id} - Deve remover exame com sucesso")
    void shouldDeleteExam() throws Exception {
        doNothing().when(patientExamService).deleteExam("paciente@teste.com", "exam-1");

        mockMvc.perform(delete("/api/patient/exams/exam-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Exame removido com sucesso do seu cofre de saúde."));
    }
}
