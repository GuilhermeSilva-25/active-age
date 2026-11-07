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
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
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
@MockitoSettings(strictness = Strictness.LENIENT)
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
        testPatient.setFullName("Maria de Lourdes Silva");
        testPatient.setRole(Role.ROLE_PACIENTE);
        testPatient.setAvatarUrl(DoctorScheduleAutomationService.TEST_PATIENT_AVATAR_URL);
    }

    @Test
    @DisplayName("Deve gerar grade ampla e criar consultas ativas para hoje e amanhã quando não existirem dados prévios")
    void ensureTestDoctorSchedule_createsSlotsAndAppointmentForTodayAndTomorrowWhenNoneExist() {
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
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> invocation.getArgument(0));

        automationService.ensureTestDoctorSchedule();

        // Grade ampla gerada (28 turnos livres) + slots para as consultas de hoje e amanhã
        verify(doctorScheduleSlotRepository, atLeast(28)).save(any(DoctorScheduleSlot.class));
        // Duas consultas criadas: uma para hoje e uma para amanhã
        verify(appointmentRepository, times(2)).save(any(Appointment.class));
        verify(doctorScheduleSlotRepository).deleteByDoctorIdAndStatusAndStartDateTimeBefore(
                eq("doc-teste-123"), eq(SlotStatus.LIVRE), any(LocalDateTime.class)
        );
    }

    @Test
    @DisplayName("Não deve duplicar consultas quando o médico já possuir atendimentos futuros válidos hoje e amanhã")
    void ensureTestDoctorSchedule_doesNotDuplicateExistingFutureAppointments() {
        when(userRepository.findByEmail("medico@teste.com")).thenReturn(Optional.of(testDoctor));
        when(userRepository.findByEmail("paciente@teste.com")).thenReturn(Optional.of(testPatient));
        when(patientExamRepository.countByPatientId("pac-teste-456")).thenReturn(2L);

        when(doctorScheduleSlotRepository.existsByDoctorIdAndStartDateTime(eq("doc-teste-123"), any(LocalDateTime.class)))
                .thenReturn(true);

        Appointment futureTodayAppt = Appointment.builder()
                .id("appt-today")
                .doctorId("doc-teste-123")
                .patientId("pac-teste-456")
                .startDateTime(LocalDateTime.now().plusHours(2))
                .status(AppointmentStatus.AGENDADA)
                .build();

        Appointment futureTomorrowAppt = Appointment.builder()
                .id("appt-tomorrow")
                .doctorId("doc-teste-123")
                .patientId("pac-teste-456")
                .startDateTime(LocalDateTime.now().plusDays(1).plusHours(2))
                .status(AppointmentStatus.AGENDADA)
                .build();

        when(appointmentRepository.findByDoctorIdAndStatusAndStartDateTimeBetweenOrderByStartDateTimeAsc(
                eq("doc-teste-123"), eq(AppointmentStatus.AGENDADA), any(LocalDateTime.class), any(LocalDateTime.class)
        )).thenReturn(List.of(futureTodayAppt), List.of(futureTomorrowAppt));

        automationService.ensureTestDoctorSchedule();

        verify(appointmentRepository, never()).save(any(Appointment.class));
        verify(doctorScheduleSlotRepository).deleteByDoctorIdAndStatusAndStartDateTimeBefore(
                eq("doc-teste-123"), eq(SlotStatus.LIVRE), any(LocalDateTime.class)
        );
    }

    @Test
    @DisplayName("Deve readequar consulta de hoje quando seu horário já tiver ficado no passado")
    void ensureTestDoctorSchedule_readjustsPastAppointmentForToday() {
        when(userRepository.findByEmail("medico@teste.com")).thenReturn(Optional.of(testDoctor));
        when(userRepository.findByEmail("paciente@teste.com")).thenReturn(Optional.of(testPatient));
        when(patientExamRepository.countByPatientId("pac-teste-456")).thenReturn(2L);

        when(doctorScheduleSlotRepository.existsByDoctorIdAndStartDateTime(eq("doc-teste-123"), any(LocalDateTime.class)))
                .thenReturn(true);

        // Consulta de hoje que já ficou no passado
        Appointment pastTodayAppt = Appointment.builder()
                .id("appt-past")
                .slotId("slot-past")
                .doctorId("doc-teste-123")
                .patientId("pac-teste-456")
                .startDateTime(LocalDateTime.now().minusHours(3))
                .status(AppointmentStatus.AGENDADA)
                .build();

        Appointment futureTomorrowAppt = Appointment.builder()
                .id("appt-tomorrow")
                .doctorId("doc-teste-123")
                .patientId("pac-teste-456")
                .startDateTime(LocalDateTime.now().plusDays(1).plusHours(2))
                .status(AppointmentStatus.AGENDADA)
                .build();

        when(appointmentRepository.findByDoctorIdAndStatusAndStartDateTimeBetweenOrderByStartDateTimeAsc(
                eq("doc-teste-123"), eq(AppointmentStatus.AGENDADA), any(LocalDateTime.class), any(LocalDateTime.class)
        )).thenReturn(List.of(pastTodayAppt), List.of(futureTomorrowAppt));

        DoctorScheduleSlot pastSlot = DoctorScheduleSlot.builder()
                .id("slot-past")
                .doctorId("doc-teste-123")
                .startDateTime(LocalDateTime.now().minusHours(3))
                .status(SlotStatus.OCUPADO)
                .build();

        when(doctorScheduleSlotRepository.findById("slot-past")).thenReturn(Optional.of(pastSlot));

        automationService.ensureTestDoctorSchedule();

        // Deve salvar a consulta readequada de hoje
        verify(appointmentRepository, times(1)).save(pastTodayAppt);
        assertTrue(pastTodayAppt.getStartDateTime().isAfter(LocalDateTime.now().minusMinutes(1)));
        verify(doctorScheduleSlotRepository).save(pastSlot);
    }

    @Test
    @DisplayName("Deve atribuir foto de perfil para paciente de teste existente sem avatar")
    void ensureTestDoctorSchedule_assignsAvatarUrlToExistingPatientWithoutAvatar() {
        testPatient.setAvatarUrl(null);
        when(userRepository.findByEmail("medico@teste.com")).thenReturn(Optional.of(testDoctor));
        when(userRepository.findByEmail("paciente@teste.com")).thenReturn(Optional.of(testPatient));
        when(patientExamRepository.countByPatientId("pac-teste-456")).thenReturn(2L);

        when(doctorScheduleSlotRepository.existsByDoctorIdAndStartDateTime(eq("doc-teste-123"), any(LocalDateTime.class)))
                .thenReturn(true);

        Appointment futureTodayAppt = Appointment.builder()
                .id("appt-today")
                .doctorId("doc-teste-123")
                .patientId("pac-teste-456")
                .startDateTime(LocalDateTime.now().plusHours(2))
                .status(AppointmentStatus.AGENDADA)
                .build();

        Appointment futureTomorrowAppt = Appointment.builder()
                .id("appt-tomorrow")
                .doctorId("doc-teste-123")
                .patientId("pac-teste-456")
                .startDateTime(LocalDateTime.now().plusDays(1).plusHours(2))
                .status(AppointmentStatus.AGENDADA)
                .build();

        when(appointmentRepository.findByDoctorIdAndStatusAndStartDateTimeBetweenOrderByStartDateTimeAsc(
                eq("doc-teste-123"), eq(AppointmentStatus.AGENDADA), any(LocalDateTime.class), any(LocalDateTime.class)
        )).thenReturn(List.of(futureTodayAppt), List.of(futureTomorrowAppt));

        automationService.ensureTestDoctorSchedule();

        assertEquals(DoctorScheduleAutomationService.TEST_PATIENT_AVATAR_URL, testPatient.getAvatarUrl());
        verify(userRepository).save(testPatient);
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

        Appointment futureTodayAppt = Appointment.builder()
                .id("appt-today")
                .doctorId("doc-teste-123")
                .patientId("pac-teste-456")
                .startDateTime(LocalDateTime.now().plusHours(2))
                .status(AppointmentStatus.AGENDADA)
                .build();

        Appointment futureTomorrowAppt = Appointment.builder()
                .id("appt-tomorrow")
                .doctorId("doc-teste-123")
                .patientId("pac-teste-456")
                .startDateTime(LocalDateTime.now().plusDays(1).plusHours(2))
                .status(AppointmentStatus.AGENDADA)
                .build();

        when(appointmentRepository.findByDoctorIdAndStatusAndStartDateTimeBetweenOrderByStartDateTimeAsc(
                eq("doc-teste-123"), eq(AppointmentStatus.AGENDADA), any(LocalDateTime.class), any(LocalDateTime.class)
        )).thenReturn(List.of(futureTodayAppt), List.of(futureTomorrowAppt));

        automationService.runContinuousScheduleSync();

        verify(doctorScheduleSlotRepository).deleteByDoctorIdAndStatusAndStartDateTimeBefore(
                eq("doc-teste-123"), eq(SlotStatus.LIVRE), any(LocalDateTime.class)
        );
    }

    @Test
    @DisplayName("Não deve recriar consulta de hoje quando já existir uma consulta com status REALIZADA (SPEC-13)")
    void ensureTestDoctorSchedule_doesNotRecreateWhenAppointmentAlreadyCompletedToday() {
        when(userRepository.findByEmail("medico@teste.com")).thenReturn(Optional.of(testDoctor));
        when(userRepository.findByEmail("paciente@teste.com")).thenReturn(Optional.of(testPatient));
        when(patientExamRepository.countByPatientId("pac-teste-456")).thenReturn(2L);

        when(doctorScheduleSlotRepository.existsByDoctorIdAndStartDateTime(eq("doc-teste-123"), any(LocalDateTime.class)))
                .thenReturn(true);

        Appointment completedTodayAppt = Appointment.builder()
                .id("appt-completed-today")
                .doctorId("doc-teste-123")
                .patientId("pac-teste-456")
                .startDateTime(LocalDateTime.now().minusHours(1))
                .status(AppointmentStatus.REALIZADA)
                .build();

        when(appointmentRepository.findByDoctorIdAndStatusAndStartDateTimeBetweenOrderByStartDateTimeAsc(
                eq("doc-teste-123"), eq(AppointmentStatus.REALIZADA), any(LocalDateTime.class), any(LocalDateTime.class)
        )).thenReturn(List.of(completedTodayAppt));

        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(doctorScheduleSlotRepository.save(any(DoctorScheduleSlot.class))).thenAnswer(invocation -> invocation.getArgument(0));

        automationService.ensureTestDoctorSchedule();

        // Não deve salvar nova consulta para hoje
        verify(appointmentRepository, never()).save(argThat(appt -> 
                appt.getStatus() == AppointmentStatus.AGENDADA && 
                appt.getStartDateTime().toLocalDate().equals(LocalDateTime.now().toLocalDate())
        ));
    }


    @Test
    @DisplayName("Deve atualizar a foto de perfil da Dona Maria caso possua a foto antiga do peixe")
    void ensureTestPatient_updatesAvatarWhenOldPhotoPresent() {
        testPatient.setAvatarUrl("https://images.unsplash.com/photo-1581579438747-1dc8d17bbce4?w=400");
        when(userRepository.findByEmail("medico@teste.com")).thenReturn(Optional.of(testDoctor));
        when(userRepository.findByEmail("paciente@teste.com")).thenReturn(Optional.of(testPatient));
        when(patientExamRepository.countByPatientId("pac-teste-456")).thenReturn(2L);
        when(doctorScheduleSlotRepository.existsByDoctorIdAndStartDateTime(eq("doc-teste-123"), any(LocalDateTime.class))).thenReturn(true);
        when(userRepository.save(any(User.class))).thenAnswer(i -> i.getArgument(0));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(i -> i.getArgument(0));
        when(doctorScheduleSlotRepository.save(any(DoctorScheduleSlot.class))).thenAnswer(i -> i.getArgument(0));

        automationService.ensureTestDoctorSchedule();

        assertEquals(DoctorScheduleAutomationService.TEST_PATIENT_AVATAR_URL, testPatient.getAvatarUrl());
        verify(userRepository).save(testPatient);
    }
}
