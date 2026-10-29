package com.activeage.core.services;

import com.activeage.core.domain.enums.AppointmentStatus;
import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.enums.SlotStatus;
import com.activeage.core.domain.models.Appointment;
import com.activeage.core.domain.models.DoctorScheduleSlot;
import com.activeage.core.domain.models.User;
import com.activeage.core.dtos.requests.CreateAppointmentRequest;
import com.activeage.core.dtos.responses.AppointmentResponse;
import com.activeage.core.repositories.AppointmentRepository;
import com.activeage.core.repositories.DoctorScheduleSlotRepository;
import com.activeage.core.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceTest {

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private DoctorScheduleSlotRepository scheduleSlotRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AppointmentService appointmentService;

    private User patient;
    private User doctor;
    private DoctorScheduleSlot freeSlot;

    @BeforeEach
    void setUp() {
        patient = new User();
        patient.setId("patient_001");
        patient.setFullName("Antônio Carlos da Silva");
        patient.setEmail("antonio.silva@activeage.com");
        patient.setPhone("(11) 98765-4321");
        patient.setRole(Role.ROLE_PACIENTE);

        doctor = new User();
        doctor.setId("doctor_001");
        doctor.setFullName("Dr. Alan Turing");
        doctor.setEmail("alan.turing@activeage.com");
        doctor.setCrm("191200");
        doctor.setUfCrm("SP");
        doctor.setClinicalFocus(java.util.List.of("Memória e Demências"));
        doctor.setConsultationFee(BigDecimal.valueOf(350.00));
        doctor.setRole(Role.ROLE_MEDICO);

        freeSlot = DoctorScheduleSlot.builder()
                .id("slot_001")
                .doctorId("doctor_001")
                .startDateTime(LocalDateTime.now().plusDays(3).withHour(10).withMinute(0))
                .endDateTime(LocalDateTime.now().plusDays(3).withHour(10).withMinute(50))
                .durationMinutes(50)
                .status(SlotStatus.LIVRE)
                .build();
    }

    @Test
    @DisplayName("Deve agendar consulta com sucesso em slot livre e marcar slot como OCUPADO (RN001)")
    void createAppointment_Success() {
        CreateAppointmentRequest request = CreateAppointmentRequest.builder()
                .slotId("slot_001")
                .patientNotes("Ajuste de medicamentos para pressão e memória")
                .build();

        when(userRepository.findByEmail("antonio.silva@activeage.com")).thenReturn(Optional.of(patient));
        when(scheduleSlotRepository.findById("slot_001")).thenReturn(Optional.of(freeSlot));
        when(userRepository.findById("doctor_001")).thenReturn(Optional.of(doctor));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> {
            Appointment a = invocation.getArgument(0);
            a.setId("app_123");
            return a;
        });

        AppointmentResponse response = appointmentService.createAppointment("antonio.silva@activeage.com", request);

        assertNotNull(response);
        assertEquals("app_123", response.getId());
        assertEquals("patient_001", response.getPatientId());
        assertEquals("doctor_001", response.getDoctorId());
        assertEquals("Dr. Alan Turing", response.getDoctorName());
        assertEquals(AppointmentStatus.AGENDADA, response.getStatus());
        assertEquals(BigDecimal.valueOf(350.00), response.getConsultationFee());

        // Valida que o slot foi bloqueado atomicamente para OCUPADO
        assertEquals(SlotStatus.OCUPADO, freeSlot.getStatus());
        assertEquals("patient_001", freeSlot.getPatientId());
        assertEquals("app_123", freeSlot.getAppointmentId());
        verify(scheduleSlotRepository, times(1)).save(freeSlot);
    }

    @Test
    @DisplayName("Deve impedir agendamento em slot que já está OCUPADO evitando double-booking (RN001)")
    void createAppointment_SlotAlreadyOccupied_ThrowsIllegalStateException() {
        freeSlot.setStatus(SlotStatus.OCUPADO);
        freeSlot.setPatientId("outro_paciente");

        CreateAppointmentRequest request = CreateAppointmentRequest.builder()
                .slotId("slot_001")
                .build();

        when(userRepository.findByEmail("antonio.silva@activeage.com")).thenReturn(Optional.of(patient));
        when(scheduleSlotRepository.findById("slot_001")).thenReturn(Optional.of(freeSlot));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                appointmentService.createAppointment("antonio.silva@activeage.com", request));

        assertTrue(ex.getMessage().contains("não está mais disponível"));
        verify(appointmentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve cancelar consulta com sucesso quando faltarem mais de 24h e reciclar o slot para LIVRE (RN002)")
    void cancelAppointment_MoreThan24Hours_Success() {
        Appointment appointment = Appointment.builder()
                .id("app_123")
                .patientId("patient_001")
                .doctorId("doctor_001")
                .slotId("slot_001")
                .startDateTime(LocalDateTime.now().plusDays(2)) // 48h no futuro
                .status(AppointmentStatus.AGENDADA)
                .build();

        freeSlot.setStatus(SlotStatus.OCUPADO);
        freeSlot.setPatientId("patient_001");
        freeSlot.setAppointmentId("app_123");

        when(userRepository.findByEmail("antonio.silva@activeage.com")).thenReturn(Optional.of(patient));
        when(appointmentRepository.findById("app_123")).thenReturn(Optional.of(appointment));
        when(appointmentRepository.save(any(Appointment.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(scheduleSlotRepository.findById("slot_001")).thenReturn(Optional.of(freeSlot));

        AppointmentResponse response = appointmentService.cancelAppointment("antonio.silva@activeage.com", "app_123", "Imprevisto pessoal");

        assertNotNull(response);
        assertEquals(AppointmentStatus.CANCELADA_PELO_PACIENTE, response.getStatus());

        // Valida que o slot foi reciclado de volta para LIVRE
        assertEquals(SlotStatus.LIVRE, freeSlot.getStatus());
        assertNull(freeSlot.getPatientId());
        assertNull(freeSlot.getAppointmentId());
        verify(scheduleSlotRepository, times(1)).save(freeSlot);
    }

    @Test
    @DisplayName("Deve rejeitar cancelamento quando faltarem menos de 24h para a consulta (RN002)")
    void cancelAppointment_LessThan24Hours_ThrowsIllegalStateException() {
        Appointment appointment = Appointment.builder()
                .id("app_123")
                .patientId("patient_001")
                .doctorId("doctor_001")
                .slotId("slot_001")
                .startDateTime(LocalDateTime.now().plusHours(4)) // Apenas 4 horas no futuro
                .status(AppointmentStatus.AGENDADA)
                .build();

        when(userRepository.findByEmail("antonio.silva@activeage.com")).thenReturn(Optional.of(patient));
        when(appointmentRepository.findById("app_123")).thenReturn(Optional.of(appointment));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                appointmentService.cancelAppointment("antonio.silva@activeage.com", "app_123", "Cancelamento em cima da hora"));

        assertTrue(ex.getMessage().contains("menos de 24 horas"));
        assertEquals(AppointmentStatus.AGENDADA, appointment.getStatus());
        verify(appointmentRepository, never()).save(appointment);
    }
}
