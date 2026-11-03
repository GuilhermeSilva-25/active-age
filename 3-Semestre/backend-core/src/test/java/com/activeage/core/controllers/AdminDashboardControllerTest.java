package com.activeage.core.controllers;

import com.activeage.core.domain.enums.AppointmentStatus;
import com.activeage.core.domain.enums.DoctorDossierStatus;
import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.enums.SlotStatus;
import com.activeage.core.exceptions.GlobalExceptionHandler;
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
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AdminDashboardControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private AppointmentRepository appointmentRepository;

    @Mock
    private DoctorScheduleSlotRepository doctorScheduleSlotRepository;

    @InjectMocks
    private AdminDashboardController adminDashboardController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminDashboardController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /api/admin/stats - Deve retornar indicadores operacionais agregados com HTTP 200")
    void shouldReturnPlatformStats() throws Exception {
        when(userRepository.countByRole(Role.ROLE_PACIENTE)).thenReturn(100L);
        when(userRepository.countByRoleAndDossierStatus(Role.ROLE_MEDICO, DoctorDossierStatus.APPROVED)).thenReturn(15L);
        when(userRepository.countByRoleAndDossierStatus(Role.ROLE_MEDICO, DoctorDossierStatus.UNDER_REVIEW)).thenReturn(3L);

        when(appointmentRepository.count()).thenReturn(250L);
        when(appointmentRepository.countByStatus(AppointmentStatus.AGENDADA)).thenReturn(40L);
        when(appointmentRepository.countByStatus(AppointmentStatus.REALIZADA)).thenReturn(190L);
        when(appointmentRepository.countByStatusIn(List.of(AppointmentStatus.CANCELADA_PELO_PACIENTE, AppointmentStatus.CANCELADA_PELO_MEDICO)))
                .thenReturn(20L);

        when(doctorScheduleSlotRepository.countByStatus(SlotStatus.LIVRE)).thenReturn(60L);

        mockMvc.perform(get("/api/admin/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalPatients").value(100))
                .andExpect(jsonPath("$.totalApprovedDoctors").value(15))
                .andExpect(jsonPath("$.pendingDoctorsQueue").value(3))
                .andExpect(jsonPath("$.totalAppointments").value(250))
                .andExpect(jsonPath("$.scheduledAppointments").value(40))
                .andExpect(jsonPath("$.completedAppointments").value(190))
                .andExpect(jsonPath("$.cancelledAppointments").value(20))
                .andExpect(jsonPath("$.availableScheduleSlots").value(60));
    }
}
