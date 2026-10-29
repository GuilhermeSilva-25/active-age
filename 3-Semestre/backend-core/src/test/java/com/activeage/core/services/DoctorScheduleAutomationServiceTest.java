package com.activeage.core.services;

import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.enums.SlotStatus;
import com.activeage.core.domain.models.DoctorScheduleSlot;
import com.activeage.core.domain.models.User;
import com.activeage.core.repositories.DoctorScheduleSlotRepository;
import com.activeage.core.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalDateTime;
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

    @InjectMocks
    private DoctorScheduleAutomationService automationService;

    private User testDoctor;

    @BeforeEach
    void setUp() {
        testDoctor = new User();
        testDoctor.setId("doc-teste-123");
        testDoctor.setEmail("medico@teste.com");
        testDoctor.setFullName("Dr. Marcos Silveira (Médico Teste)");
        testDoctor.setRole(Role.ROLE_MEDICO);
    }

    @Test
    @DisplayName("Deve gerar 14 horários livres para hoje e amanhã quando não existirem slots prévios")
    void ensureTestDoctorSchedule_createsSlotsForTodayAndTomorrowWhenNoneExist() {
        when(userRepository.findByEmail("medico@teste.com")).thenReturn(Optional.of(testDoctor));
        when(doctorScheduleSlotRepository.existsByDoctorIdAndStartDateTime(eq("doc-teste-123"), any(LocalDateTime.class)))
                .thenReturn(false);

        automationService.ensureTestDoctorSchedule();

        // 7 turnos por dia * 2 dias = 14 slots
        verify(doctorScheduleSlotRepository, times(14)).save(any(DoctorScheduleSlot.class));
        verify(doctorScheduleSlotRepository).deleteByDoctorIdAndStatusAndStartDateTimeBefore(
                eq("doc-teste-123"), eq(SlotStatus.LIVRE), any(LocalDateTime.class)
        );
    }

    @Test
    @DisplayName("Não deve duplicar slots quando todos já existirem")
    void ensureTestDoctorSchedule_doesNotDuplicateExistingSlots() {
        when(userRepository.findByEmail("medico@teste.com")).thenReturn(Optional.of(testDoctor));
        when(doctorScheduleSlotRepository.existsByDoctorIdAndStartDateTime(eq("doc-teste-123"), any(LocalDateTime.class)))
                .thenReturn(true);

        automationService.ensureTestDoctorSchedule();

        verify(doctorScheduleSlotRepository, never()).save(any(DoctorScheduleSlot.class));
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
    }

    @Test
    @DisplayName("Rotina agendada bi-diária deve invocar a sincronização da grade")
    void runBiDailyScheduleSync_invokesSynchronization() {
        when(userRepository.findByEmail("medico@teste.com")).thenReturn(Optional.of(testDoctor));

        automationService.runBiDailyScheduleSync();

        verify(doctorScheduleSlotRepository).deleteByDoctorIdAndStatusAndStartDateTimeBefore(
                eq("doc-teste-123"), eq(SlotStatus.LIVRE), any(LocalDateTime.class)
        );
    }
}
