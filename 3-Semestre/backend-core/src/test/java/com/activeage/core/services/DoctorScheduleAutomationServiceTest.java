package com.activeage.core.services;

import com.activeage.core.domain.enums.AppointmentStatus;
import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.enums.SlotStatus;
import com.activeage.core.domain.models.Appointment;
import com.activeage.core.domain.models.DoctorScheduleSlot;
import com.activeage.core.domain.models.User;
import com.activeage.core.repositories.AppointmentRepository;
import com.activeage.core.repositories.DoctorScheduleSlotRepository;
import com.activeage.core.repositories.PatientExamRepository;
import com.activeage.core.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DoctorScheduleAutomationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private DoctorScheduleSlotRepository doctorScheduleSlotRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private PatientExamRepository patientExamRepository;

    @Mock
    private GridFsTemplate gridFsTemplate;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private DoctorScheduleAutomationService automationService;

    private User testDoctor;
    private User testPatient;

    @BeforeEach
    void setUp() {
        testDoctor = new User();
        testDoctor.setId("doc-teste-123");
        testDoctor.setEmail("medico@teste.com");
        testDoctor.setFullName("Dr. Marcos Silveira (Médico Teste)");
        testDoctor.setCrm("123456");
        testDoctor.setUfCrm("SP");
        testDoctor.setRole(Role.ROLE_MEDICO);

        testPatient = new User();
        testPatient.setId("pac-teste-456");
        testPatient.setEmail("paciente@teste.com");
        testPatient.setFullName("Dona Maria de Lourdes Silva (Paciente Teste)");
        testPatient.setRole(Role.ROLE_PACIENTE);
    }

    @Test
    @DisplayName("Deve gerar 14 horários livres e criar consulta para hoje quando não existirem dados prévios")
    void ensureTestDoctorSchedule_createsSlotsAndAppointmentForTodayWhenNoneExist() {
        when(userRepository.findByEmail("medico@teste.com")).thenReturn(Optional.of(testDoctor));
        when(userRepository.findByEmail("paciente@teste.com")).thenReturn(Optional.of(testPatient));
        when(patientExamRepository.countByPatientId("pac-teste-456")).thenReturn(2L);

        when(doctorScheduleSlotRepository.existsByDoctorIdAndStartDateTime(eq("doc-teste-123"), any(LocalDateTime.class)))
                .thenReturn(false);

        when(appointmentRepository.findByDoctorIdAndStatusAndStartDateTimeBetweenOrderByStartDateTimeAsc(
                eq("doc-teste-123"), eq(AppointmentStatus.AGENDADA), any(LocalDateTime.class), any(LocalDateTime.class)
        )).thenReturn(Collections.emptyList());

        when(doctorScheduleSlotRepository.findByDoctorIdAndStartDateTime(eq("doc-teste-123"), any(LocalDateTime.class)))
                .thenReturn(Optional.empty());

        when(doctorScheduleSlotRepository.save(any(DoctorScheduleSlot.class))).thenAnswer(invocation -> invocation.getArgument(0));

        automationService.ensureTestDoctorSchedule();

        // 14 turnos livres gerados + 1 slot gerado/atualizado para a consulta de hoje
        verify(doctorScheduleSlotRepository, atLeast(14)).save(any(DoctorScheduleSlot.class));
        verify(appointmentRepository, times(1)).save(any(Appointment.class));
        verify(doctorScheduleSlotRepository).deleteByDoctorIdAndStatusAndStartDateTimeBefore(
                eq("doc-teste-123"), eq(SlotStatus.LIVRE), any(LocalDateTime.class)
        );
    }

    @Test
    @DisplayName("Não deve duplicar consulta quando o médico já possuir atendimento hoje")
    void ensureTestDoctorSchedule_doesNotDuplicateExistingAppointment() {
        when(userRepository.findByEmail("medico@teste.com")).thenReturn(Optional.of(testDoctor));
        when(userRepository.findByEmail("paciente@teste.com")).thenReturn(Optional.of(testPatient));
        when(patientExamRepository.countByPatientId("pac-teste-456")).thenReturn(2L);

        when(doctorScheduleSlotRepository.existsByDoctorIdAndStartDateTime(eq("doc-teste-123"), any(LocalDateTime.class)))
                .thenReturn(true);

        Appointment existingAppointment = Appointment.builder()
                .id("appt-1")
                .doctorId("doc-teste-123")
                .patientId("pac-teste-456")
                .status(AppointmentStatus.AGENDADA)
                .build();

        when(appointmentRepository.findByDoctorIdAndStatusAndStartDateTimeBetweenOrderByStartDateTimeAsc(
                eq("doc-teste-123"), eq(AppointmentStatus.AGENDADA), any(LocalDateTime.class), any(LocalDateTime.class)
        )).thenReturn(List.of(existingAppointment));

        automationService.ensureTestDoctorSchedule();

        verify(appointmentRepository, never()).save(any(Appointment.class));
        verify(doctorScheduleSlotRepository).deleteByDoctorIdAndStatusAndStartDateTimeBefore(
                eq("doc-teste-123"), eq(SlotStatus.LIVRE), any(LocalDateTime.class)
        );
    }

    @Test
    @DisplayName("Deve abortar graciosamente se o médico de teste não for encontrado no banco")
    void ensureTestDoctorSchedule_warnsWhenDoctorNotFound() {
        when(userRepository.findByEmail("medico@teste.com")).thenReturn(Optional.empty());

        automationService.ensureTestDoctorSchedule();

        verify(doctorScheduleSlotRepository, never()).existsByDoctorIdAndStartDateTime(anyString(), any());
        verify(doctorScheduleSlotRepository, never()).save(any());
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Rotina agendada contínua deve invocar a sincronização da grade")
    void runContinuousScheduleSync_invokesSynchronization() {
        when(userRepository.findByEmail("medico@teste.com")).thenReturn(Optional.of(testDoctor));
        when(userRepository.findByEmail("paciente@teste.com")).thenReturn(Optional.of(testPatient));
        when(patientExamRepository.countByPatientId("pac-teste-456")).thenReturn(2L);

        Appointment existingAppointment = Appointment.builder()
                .id("appt-1")
                .doctorId("doc-teste-123")
                .patientId("pac-teste-456")
                .status(AppointmentStatus.AGENDADA)
                .build();

        when(appointmentRepository.findByDoctorIdAndStatusAndStartDateTimeBetweenOrderByStartDateTimeAsc(
                eq("doc-teste-123"), eq(AppointmentStatus.AGENDADA), any(LocalDateTime.class), any(LocalDateTime.class)
        )).thenReturn(List.of(existingAppointment));

        automationService.runContinuousScheduleSync();

        verify(doctorScheduleSlotRepository).deleteByDoctorIdAndStatusAndStartDateTimeBefore(
                eq("doc-teste-123"), eq(SlotStatus.LIVRE), any(LocalDateTime.class)
        );
    }
}
