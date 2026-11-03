package com.activeage.core.controllers;

import com.activeage.core.domain.models.PatientExam;
import com.activeage.core.dtos.responses.PatientExamResponse;
import com.activeage.core.exceptions.GlobalExceptionHandler;
import com.activeage.core.services.DoctorConsultationService;
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
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class DoctorConsultationControllerTest {

    @Mock
    private DoctorConsultationService doctorConsultationService;

    @InjectMocks
    private DoctorConsultationController doctorConsultationController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(doctorConsultationController)
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
    @DisplayName("GET /api/doctor/appointments/{id}/patient-exams - Deve listar exames do paciente na consulta")
    void shouldGetPatientExams() throws Exception {
        PatientExamResponse resp = PatientExamResponse.builder().id("exam-1").title("Ressonância").build();

        when(doctorConsultationService.getPatientExamsForAppointment("medico@activeage.com", "apt-1"))
                .thenReturn(List.of(resp));

        mockMvc.perform(get("/api/doctor/appointments/apt-1/patient-exams"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].title").value("Ressonância"));
    }

    @Test
    @DisplayName("GET /api/doctor/appointments/{id}/patient-exams/{examId}/file - Deve retornar arquivo para visualização")
    void shouldGetPatientExamFile() throws Exception {
        PatientExam exam = new PatientExam();
        exam.setId("exam-1");
        exam.setOriginalFileName("ressonancia.pdf");
        exam.setContentType("application/pdf");

        ByteArrayResource resource = new ByteArrayResource("PDF_CONTENT".getBytes());
        PatientExamService.ExamDownloadData downloadData = new PatientExamService.ExamDownloadData(resource, exam);

        when(doctorConsultationService.getPatientExamFileForAppointment("medico@activeage.com", "apt-1", "exam-1"))
                .thenReturn(downloadData);

        mockMvc.perform(get("/api/doctor/appointments/apt-1/patient-exams/exam-1/file"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition", "inline; filename=\"ressonancia.pdf\""))
                .andExpect(content().bytes("PDF_CONTENT".getBytes()));
    }
}
