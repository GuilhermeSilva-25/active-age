package com.activeage.core.controllers;

import com.activeage.core.domain.enums.AppointmentStatus;
import com.activeage.core.dtos.requests.CreateAppointmentRequest;
import com.activeage.core.dtos.responses.AppointmentResponse;
import com.activeage.core.dtos.responses.DoctorDashboardStatsResponse;
import com.activeage.core.exceptions.GlobalExceptionHandler;
import com.activeage.core.services.AppointmentService;
import com.activeage.core.services.DoctorScheduleService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class AppointmentControllerTest {

    @Mock
    private AppointmentService appointmentService;

    @Mock
    private DoctorScheduleService doctorScheduleService;

    @InjectMocks
    private AppointmentController appointmentController;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(appointmentController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("paciente@teste.com");
        SecurityContext secCtx = mock(SecurityContext.class);
        when(secCtx.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(secCtx);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("POST /api/patient/appointments - Deve criar agendamento e retornar 201 Created")
    void shouldCreateAppointment() throws Exception {
        CreateAppointmentRequest req = CreateAppointmentRequest.builder()
                .slotId("slot-123")
                .patientNotes("Dores na lombar")
                .build();

        AppointmentResponse resp = AppointmentResponse.builder()
                .id("apt-123")
                .doctorName("Dr. Alan Turing")
                .patientName("Dona Maria")
                .status(AppointmentStatus.AGENDADA)
                .startDateTime(LocalDateTime.now().plusDays(1))
                .build();

        when(appointmentService.createAppointment(eq("paciente@teste.com"), any(CreateAppointmentRequest.class)))
                .thenReturn(resp);

        mockMvc.perform(post("/api/patient/appointments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("apt-123"))
                .andExpect(jsonPath("$.doctorName").value("Dr. Alan Turing"));
    }

    @Test
    @DisplayName("GET /api/patient/appointments - Deve listar consultas do paciente autenticado")
    void shouldListPatientAppointments() throws Exception {
        AppointmentResponse resp = AppointmentResponse.builder()
                .id("apt-1")
                .status(AppointmentStatus.AGENDADA)
                .build();

        when(appointmentService.listPatientAppointments("paciente@teste.com")).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/patient/appointments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value("apt-1"));
    }

    @Test
    @DisplayName("GET /api/patient/appointments/next - Deve retornar 200 quando existir próxima consulta")
    void shouldReturnNextAppointmentWhenExists() throws Exception {
        AppointmentResponse resp = AppointmentResponse.builder()
                .id("apt-next")
                .status(AppointmentStatus.AGENDADA)
                .build();

        when(appointmentService.getNextPatientAppointment("paciente@teste.com")).thenReturn(Optional.of(resp));

        mockMvc.perform(get("/api/patient/appointments/next"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("apt-next"));
    }

    @Test
    @DisplayName("GET /api/patient/appointments/next - Deve retornar 204 NoContent quando não houver próxima consulta")
    void shouldReturnNoContentWhenNoNextAppointment() throws Exception {
        when(appointmentService.getNextPatientAppointment("paciente@teste.com")).thenReturn(Optional.empty());

        mockMvc.perform(get("/api/patient/appointments/next"))
                .andExpect(status().isNoContent());
    }

    @Test
    @DisplayName("PATCH /api/patient/appointments/{id}/cancel - Deve cancelar consulta")
    void shouldCancelAppointment() throws Exception {
        AppointmentResponse resp = AppointmentResponse.builder()
                .id("apt-cancel")
                .status(AppointmentStatus.CANCELADA_PELO_PACIENTE)
                .build();

        when(appointmentService.cancelAppointment(eq("paciente@teste.com"), eq("apt-cancel"), any()))
                .thenReturn(resp);

        mockMvc.perform(patch("/api/patient/appointments/apt-cancel/cancel")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(Map.of("reason", "Imprevisto"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("CANCELADA_PELO_PACIENTE"));
    }

    @Test
    @DisplayName("GET /api/doctor/stats - Deve retornar métricas consolidadas do médico")
    void shouldReturnDoctorStats() throws Exception {
        DoctorDashboardStatsResponse stats = DoctorDashboardStatsResponse.builder()
                .todayAppointments(3)
                .totalPatients(12)
                .totalAppointments(40)
                .freeSlots(8)
                .trialDaysRemaining(15)
                .build();

        when(doctorScheduleService.getDoctorDashboardStats("paciente@teste.com")).thenReturn(stats);

        mockMvc.perform(get("/api/doctor/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.todayAppointments").value(3))
                .andExpect(jsonPath("$.freeSlots").value(8));
    }

    @Test
    @DisplayName("GET /api/doctor/appointments - Deve listar histórico do médico")
    void shouldListDoctorAppointments() throws Exception {
        AppointmentResponse resp = AppointmentResponse.builder().id("doc-apt-1").build();
        when(appointmentService.listDoctorAppointments("paciente@teste.com")).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/doctor/appointments"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("doc-apt-1"));
    }

    @Test
    @DisplayName("GET /api/doctor/appointments/today - Deve listar consultas de hoje do médico")
    void shouldListDoctorTodayAppointments() throws Exception {
        AppointmentResponse resp = AppointmentResponse.builder().id("doc-today-1").build();
        when(appointmentService.listDoctorTodayAppointments("paciente@teste.com")).thenReturn(List.of(resp));

        mockMvc.perform(get("/api/doctor/appointments/today"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value("doc-today-1"));
    }

    @Test
    @DisplayName("GET /api/appointments/{id} - Deve retornar detalhes da consulta por ID")
    void shouldGetAppointmentById() throws Exception {
        AppointmentResponse resp = AppointmentResponse.builder().id("apt-spec").build();
        when(appointmentService.getAppointmentById("paciente@teste.com", "apt-spec")).thenReturn(resp);

        mockMvc.perform(get("/api/appointments/apt-spec"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("apt-spec"));
    }
}
