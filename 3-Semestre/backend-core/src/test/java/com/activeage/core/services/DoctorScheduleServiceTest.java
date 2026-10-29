package com.activeage.core.services;

import com.activeage.core.domain.enums.DoctorDossierStatus;
import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.enums.SlotStatus;
import com.activeage.core.domain.models.DoctorScheduleSlot;
import com.activeage.core.domain.models.User;
import com.activeage.core.dtos.requests.CreateBatchSlotsRequest;
import com.activeage.core.dtos.requests.CreateSlotRequest;
import com.activeage.core.dtos.responses.DoctorScheduleSlotResponse;
import com.activeage.core.repositories.DoctorScheduleSlotRepository;
import com.activeage.core.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DoctorScheduleServiceTest {

    @Mock
    private DoctorScheduleSlotRepository scheduleSlotRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private DoctorScheduleService scheduleService;

    private User approvedDoctor;
    private User pendingDoctor;

    @BeforeEach
    void setUp() {
        approvedDoctor = new User();
        approvedDoctor.setId("doctor_123");
        approvedDoctor.setFullName("Dra. Ada Lovelace");
        approvedDoctor.setEmail("ada.lovelace@activeage.com");
        approvedDoctor.setRole(Role.ROLE_MEDICO);
        approvedDoctor.setDossierStatus(DoctorDossierStatus.APPROVED);

        pendingDoctor = new User();
        pendingDoctor.setId("doctor_456");
        pendingDoctor.setFullName("Dr. Pendente");
        pendingDoctor.setEmail("pendente@activeage.com");
        pendingDoctor.setRole(Role.ROLE_MEDICO);
        pendingDoctor.setDossierStatus(DoctorDossierStatus.UNDER_REVIEW);
    }

    @Test
    @DisplayName("Deve criar slot avulso com sucesso quando médico for homologado e horário futuro")
    void createSlot_Success() {
        LocalDateTime futureStart = LocalDateTime.now().plusDays(2).withHour(10).withMinute(0);
        CreateSlotRequest request = CreateSlotRequest.builder()
                .startDateTime(futureStart)
                .durationMinutes(50)
                .notes("Consulta de Rotina")
                .build();

        when(userRepository.findByEmail("ada.lovelace@activeage.com")).thenReturn(Optional.of(approvedDoctor));
        when(scheduleSlotRepository.existsByDoctorIdAndStartDateTime("doctor_123", futureStart)).thenReturn(false);
        when(scheduleSlotRepository.save(any(DoctorScheduleSlot.class))).thenAnswer(invocation -> {
            DoctorScheduleSlot s = invocation.getArgument(0);
            s.setId("slot_1");
            return s;
        });

        DoctorScheduleSlotResponse response = scheduleService.createSlot("ada.lovelace@activeage.com", request);

        assertNotNull(response);
        assertEquals("slot_1", response.getId());
        assertEquals("doctor_123", response.getDoctorId());
        assertEquals(SlotStatus.LIVRE, response.getStatus());
        assertEquals(50, response.getDurationMinutes());
        verify(scheduleSlotRepository, times(1)).save(any(DoctorScheduleSlot.class));
    }

    @Test
    @DisplayName("Deve rejeitar criação de slot quando médico não possuir Dossiê Aprovado (RN008)")
    void createSlot_NotApproved_ThrowsSecurityException() {
        LocalDateTime futureStart = LocalDateTime.now().plusDays(2).withHour(10).withMinute(0);
        CreateSlotRequest request = CreateSlotRequest.builder()
                .startDateTime(futureStart)
                .build();

        when(userRepository.findByEmail("pendente@activeage.com")).thenReturn(Optional.of(pendingDoctor));

        SecurityException ex = assertThrows(SecurityException.class, () ->
                scheduleService.createSlot("pendente@activeage.com", request));

        assertTrue(ex.getMessage().contains("homologação do Dossiê"));
        verify(scheduleSlotRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve rejeitar criação de slot duplicado no mesmo horário para o mesmo médico")
    void createSlot_Conflict_ThrowsIllegalArgumentException() {
        LocalDateTime futureStart = LocalDateTime.now().plusDays(2).withHour(10).withMinute(0);
        CreateSlotRequest request = CreateSlotRequest.builder()
                .startDateTime(futureStart)
                .build();

        when(userRepository.findByEmail("ada.lovelace@activeage.com")).thenReturn(Optional.of(approvedDoctor));
        when(scheduleSlotRepository.existsByDoctorIdAndStartDateTime("doctor_123", futureStart)).thenReturn(true);

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () ->
                scheduleService.createSlot("ada.lovelace@activeage.com", request));

        assertTrue(ex.getMessage().contains("já possui um horário disponibilizado"));
        verify(scheduleSlotRepository, never()).save(any());
    }

    @Test
    @DisplayName("Deve gerar grade em lote com múltiplos slots para um turno matutino")
    void createBatchSlots_Success() {
        LocalDate tomorrow = LocalDate.now().plusDays(3);
        CreateBatchSlotsRequest request = CreateBatchSlotsRequest.builder()
                .date(tomorrow)
                .startTime(LocalTime.of(8, 0))
                .endTime(LocalTime.of(12, 0))
                .durationMinutes(50)
                .breakMinutes(10)
                .notes("Turno da Manhã")
                .build();

        when(userRepository.findByEmail("ada.lovelace@activeage.com")).thenReturn(Optional.of(approvedDoctor));
        when(scheduleSlotRepository.existsByDoctorIdAndStartDateTime(eq("doctor_123"), any())).thenReturn(false);
        when(scheduleSlotRepository.saveAll(anyList())).thenAnswer(invocation -> invocation.getArgument(0));

        List<DoctorScheduleSlotResponse> responses = scheduleService.createBatchSlots("ada.lovelace@activeage.com", request);

        assertNotNull(responses);
        assertEquals(4, responses.size(), "Das 08:00 às 12:00 com 50m + 10m de pausa devem ser gerados 4 slots.");
        assertEquals(SlotStatus.LIVRE, responses.get(0).getStatus());
    }

    @Test
    @DisplayName("Deve proibir a exclusão de slot que já possui status OCUPADO por consulta")
    void deleteSlot_Occupied_ThrowsIllegalStateException() {
        DoctorScheduleSlot occupiedSlot = DoctorScheduleSlot.builder()
                .id("slot_occupied")
                .doctorId("doctor_123")
                .status(SlotStatus.OCUPADO)
                .appointmentId("app_999")
                .build();

        when(userRepository.findByEmail("ada.lovelace@activeage.com")).thenReturn(Optional.of(approvedDoctor));
        when(scheduleSlotRepository.findById("slot_occupied")).thenReturn(Optional.of(occupiedSlot));

        IllegalStateException ex = assertThrows(IllegalStateException.class, () ->
                scheduleService.deleteSlot("ada.lovelace@activeage.com", "slot_occupied"));

        assertTrue(ex.getMessage().contains("não podem ser excluídos diretamente"));
        verify(scheduleSlotRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Deve alternar com sucesso status de slot de LIVRE para BLOQUEADO")
    void toggleBlockSlot_Success() {
        DoctorScheduleSlot freeSlot = DoctorScheduleSlot.builder()
                .id("slot_free")
                .doctorId("doctor_123")
                .status(SlotStatus.LIVRE)
                .build();

        when(userRepository.findByEmail("ada.lovelace@activeage.com")).thenReturn(Optional.of(approvedDoctor));
        when(scheduleSlotRepository.findById("slot_free")).thenReturn(Optional.of(freeSlot));
        when(scheduleSlotRepository.save(any(DoctorScheduleSlot.class))).thenAnswer(invocation -> invocation.getArgument(0));

        DoctorScheduleSlotResponse response = scheduleService.toggleBlockSlot("ada.lovelace@activeage.com", "slot_free");

        assertNotNull(response);
        assertEquals(SlotStatus.BLOQUEADO, response.getStatus());
        verify(scheduleSlotRepository, times(1)).save(any(DoctorScheduleSlot.class));
    }
}
