package com.activeage.core.services;

import com.activeage.core.domain.enums.ExamCategory;
import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.models.Appointment;
import com.activeage.core.domain.models.PatientExam;
import com.activeage.core.domain.models.User;
import com.activeage.core.dtos.responses.PatientExamResponse;
import com.activeage.core.repositories.AppointmentRepository;
import com.activeage.core.repositories.PatientExamRepository;
import com.activeage.core.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DoctorConsultationServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private PatientExamRepository patientExamRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private FileStorageService fileStorageService;

    @InjectMocks
    private DoctorConsultationService doctorConsultationService;

    private User doctor;
    private Appointment appointment;
    private PatientExam exam;

    @BeforeEach
    void setUp() {
        doctor = new User();
        doctor.setId("doc-1");
        doctor.setEmail("medico@teste.com");
        doctor.setRole(Role.ROLE_MEDICO);

        appointment = Appointment.builder()
                .id("appt-1")
                .doctorId("doc-1")
                .patientId("pac-1")
                .build();

        exam = PatientExam.builder()
                .id("exam-1")
                .patientId("pac-1")
                .title("Hemograma Completo")
                .category(ExamCategory.LABORATORIAL)
                .examDate(LocalDate.now().minusDays(2))
                .storedFileName("stored_hemo.pdf")
                .originalFileName("hemo.pdf")
                .contentType("application/pdf")
                .sizeBytes(2048L)
                .uploadedAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Deve listar exames do paciente vinculado à consulta")
    void getPatientExamsForAppointment_success() {
        when(userRepository.findByEmail("medico@teste.com")).thenReturn(Optional.of(doctor));
        when(appointmentRepository.findById("appt-1")).thenReturn(Optional.of(appointment));
        when(patientExamRepository.findByPatientIdOrderByExamDateDesc("pac-1")).thenReturn(List.of(exam));

        List<PatientExamResponse> list = doctorConsultationService.getPatientExamsForAppointment("medico@teste.com", "appt-1");

        assertEquals(1, list.size());
        assertEquals("Hemograma Completo", list.get(0).getTitle());
    }

    @Test
    @DisplayName("Deve permitir acesso do administrador aos exames da consulta")
    void getPatientExamsForAppointment_adminAccess() {
        User admin = new User();
        admin.setId("admin-99");
        admin.setEmail("admin@teste.com");
        admin.setRole(Role.ROLE_ADMIN);

        when(userRepository.findByEmail("admin@teste.com")).thenReturn(Optional.of(admin));
        when(appointmentRepository.findById("appt-1")).thenReturn(Optional.of(appointment));
        when(patientExamRepository.findByPatientIdOrderByExamDateDesc("pac-1")).thenReturn(List.of(exam));

        List<PatientExamResponse> list = doctorConsultationService.getPatientExamsForAppointment("admin@teste.com", "appt-1");

        assertEquals(1, list.size());
    }

    @Test
    @DisplayName("Deve negar acesso aos exames se o médico não for o assistente da consulta")
    void getPatientExamsForAppointment_deniedForOtherDoctor() {
        User otherDoctor = new User();
        otherDoctor.setId("doc-outro");
        otherDoctor.setEmail("outro@teste.com");
        otherDoctor.setRole(Role.ROLE_MEDICO);

        when(userRepository.findByEmail("outro@teste.com")).thenReturn(Optional.of(otherDoctor));
        when(appointmentRepository.findById("appt-1")).thenReturn(Optional.of(appointment));

        assertThrows(IllegalArgumentException.class, () ->
                doctorConsultationService.getPatientExamsForAppointment("outro@teste.com", "appt-1"));
    }

    @Test
    @DisplayName("Deve carregar binário do exame do paciente para a consulta")
    void getPatientExamFileForAppointment_success() {
        when(userRepository.findByEmail("medico@teste.com")).thenReturn(Optional.of(doctor));
        when(appointmentRepository.findById("appt-1")).thenReturn(Optional.of(appointment));
        when(patientExamRepository.findByIdAndPatientId("exam-1", "pac-1")).thenReturn(Optional.of(exam));
        Resource mockRes = new ByteArrayResource(new byte[]{1, 2, 3});
        when(fileStorageService.loadPatientExamResource("stored_hemo.pdf")).thenReturn(mockRes);

        PatientExamService.ExamDownloadData data = doctorConsultationService.getPatientExamFileForAppointment(
                "medico@teste.com", "appt-1", "exam-1");

        assertNotNull(data);
        assertEquals("stored_hemo.pdf", data.exam().getStoredFileName());
    }
}
