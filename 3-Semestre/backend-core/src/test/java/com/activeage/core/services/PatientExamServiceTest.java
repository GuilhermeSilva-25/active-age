package com.activeage.core.services;

import com.activeage.core.domain.enums.ExamCategory;
import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.models.PatientExam;
import com.activeage.core.domain.models.User;
import com.activeage.core.dtos.responses.PatientExamResponse;
import com.activeage.core.repositories.PatientExamRepository;
import com.activeage.core.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PatientExamServiceTest {

    @Mock
    private PatientExamRepository patientExamRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private PatientExamService patientExamService;

    private User patient;
    private MockMultipartFile mockFile;

    @BeforeEach
    void setUp() {
        patient = new User();
        patient.setId("patient-123");
        patient.setEmail("paciente@activeage.com");
        patient.setFullName("Maria da Silva");
        patient.setRole(Role.ROLE_PACIENTE);
        patient.setActive(true);

        mockFile = new MockMultipartFile(
                "file",
                "hemograma.pdf",
                "application/pdf",
                "conteudo do laudo em pdf".getBytes()
        );
    }

    @Test
    @DisplayName("Deve realizar upload de exame no GridFS e salvar metadados com sucesso")
    void testUploadExamSuccess() {
        when(userRepository.findByEmail("paciente@activeage.com")).thenReturn(Optional.of(patient));
        when(fileStorageService.storePatientExam(eq("patient-123"), any())).thenReturn("exam_patient-123_uuid.pdf");

        PatientExam savedExam = PatientExam.builder()
                .id("exam-1")
                .patientId("patient-123")
                .title("Hemograma Completo")
                .category(ExamCategory.LABORATORIAL)
                .examDate(LocalDate.of(2026, 5, 10))
                .notes("Jejum de 12 horas")
                .storedFileName("exam_patient-123_uuid.pdf")
                .originalFileName("hemograma.pdf")
                .contentType("application/pdf")
                .sizeBytes(1024)
                .uploadedAt(LocalDateTime.now())
                .build();

        when(patientExamRepository.save(any(PatientExam.class))).thenReturn(savedExam);

        PatientExamResponse response = patientExamService.uploadExam(
                "paciente@activeage.com",
                mockFile,
                "Hemograma Completo",
                ExamCategory.LABORATORIAL,
                LocalDate.of(2026, 5, 10),
                "Jejum de 12 horas"
        );

        assertNotNull(response);
        assertEquals("exam-1", response.getId());
        assertEquals("Hemograma Completo", response.getTitle());
        assertEquals(ExamCategory.LABORATORIAL, response.getCategory());
        verify(fileStorageService, times(1)).storePatientExam(eq("patient-123"), any());
        verify(patientExamRepository, times(1)).save(any(PatientExam.class));
    }

    @Test
    @DisplayName("Deve rejeitar exame com data de realização futura")
    void testUploadExamThrowsWhenDateInFuture() {
        when(userRepository.findByEmail("paciente@activeage.com")).thenReturn(Optional.of(patient));

        LocalDate futureDate = LocalDate.now().plusDays(5);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                patientExamService.uploadExam(
                        "paciente@activeage.com",
                        mockFile,
                        "Ressonância Magnética",
                        ExamCategory.IMAGEM,
                        futureDate,
                        null
                )
        );

        assertTrue(ex.getMessage().contains("não pode ser uma data futura"));
        verifyNoInteractions(fileStorageService);
    }

    @Test
    @DisplayName("Deve listar exames prévios do paciente ordenados por data")
    void testGetPatientExams() {
        when(userRepository.findByEmail("paciente@activeage.com")).thenReturn(Optional.of(patient));

        PatientExam exam1 = PatientExam.builder()
                .id("exam-1")
                .patientId("patient-123")
                .title("Ecocardiograma")
                .category(ExamCategory.CARDIOLOGICO)
                .examDate(LocalDate.of(2026, 6, 1))
                .sizeBytes(2048)
                .build();

        when(patientExamRepository.findByPatientIdOrderByExamDateDesc("patient-123"))
                .thenReturn(List.of(exam1));

        List<PatientExamResponse> list = patientExamService.getPatientExams("paciente@activeage.com", null);

        assertEquals(1, list.size());
        assertEquals("Ecocardiograma", list.get(0).getTitle());
    }

    @Test
    @DisplayName("Deve excluir exame e remover binário do GridFS")
    void testDeleteExam() {
        when(userRepository.findByEmail("paciente@activeage.com")).thenReturn(Optional.of(patient));

        PatientExam exam = PatientExam.builder()
                .id("exam-1")
                .patientId("patient-123")
                .storedFileName("exam_patient-123_uuid.pdf")
                .build();

        when(patientExamRepository.findByIdAndPatientId("exam-1", "patient-123"))
                .thenReturn(Optional.of(exam));

        patientExamService.deleteExam("paciente@activeage.com", "exam-1");

        verify(fileStorageService, times(1)).deletePatientExam("exam_patient-123_uuid.pdf");
        verify(patientExamRepository, times(1)).delete(exam);
    }
}
