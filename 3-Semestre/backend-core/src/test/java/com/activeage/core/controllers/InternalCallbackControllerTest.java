package com.activeage.core.controllers;

import com.activeage.core.domain.enums.AppointmentStatus;
import com.activeage.core.domain.enums.DoctorSubscriptionStatus;
import com.activeage.core.domain.models.User;
import com.activeage.core.dtos.responses.AppointmentResponse;
import com.activeage.core.exceptions.GlobalExceptionHandler;
import com.activeage.core.repositories.UserRepository;
import com.activeage.core.services.AppointmentService;
import com.activeage.core.services.AuditService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class InternalCallbackControllerTest {

    @Mock
    private AppointmentService appointmentService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private InternalCallbackController controller;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(controller)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("PCE: Deve confirmar pagamento de consulta via callback interno com 200 OK")
    void shouldConfirmPaymentViaInternalCallback() throws Exception {
        AppointmentResponse res = AppointmentResponse.builder()
                .id("APPT-100")
                .status(AppointmentStatus.AGENDADA)
                .build();

        when(appointmentService.confirmPayment("APPT-100")).thenReturn(res);

        mockMvc.perform(patch("/api/internal/appointments/APPT-100/confirm-payment"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("APPT-100"))
                .andExpect(jsonPath("$.status").value("AGENDADA"));

        verify(appointmentService).confirmPayment("APPT-100");
    }

    @Test
    @DisplayName("PCE: Deve cancelar consulta por expiração de pagamento com 200 OK")
    void shouldCancelExpiredPaymentViaInternalCallback() throws Exception {
        AppointmentResponse res = AppointmentResponse.builder()
                .id("APPT-100")
                .status(AppointmentStatus.CANCELADA_FALTA_PAGAMENTO)
                .build();

        when(appointmentService.cancelExpiredPayment("APPT-100")).thenReturn(res);

        mockMvc.perform(patch("/api/internal/appointments/APPT-100/cancel-expired"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("APPT-100"))
                .andExpect(jsonPath("$.status").value("CANCELADA_FALTA_PAGAMENTO"));

        verify(appointmentService).cancelExpiredPayment("APPT-100");
    }

    @Test
    @DisplayName("PCE: Deve ativar assinatura SaaS do médico com 200 OK")
    void shouldActivateDoctorSubscriptionViaInternalCallback() throws Exception {
        User doc = new User();
        doc.setId("DOC-1");
        doc.setEmail("medico@teste.com");

        when(userRepository.findById("DOC-1")).thenReturn(Optional.of(doc));
        when(userRepository.save(any(User.class))).thenAnswer(inv -> inv.getArgument(0));

        mockMvc.perform(patch("/api/internal/doctors/DOC-1/activate-subscription"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("ACTIVE"))
                .andExpect(jsonPath("$.doctorId").value("DOC-1"));

        verify(userRepository).save(doc);
    }
}
