package com.activeage.core.controllers;

import com.activeage.core.domain.enums.SlotStatus;
import com.activeage.core.dtos.requests.CreateBatchSlotsRequest;
import com.activeage.core.dtos.requests.CreateSlotRequest;
import com.activeage.core.dtos.responses.DoctorDashboardStatsResponse;
import com.activeage.core.dtos.responses.DoctorScheduleSlotResponse;
import com.activeage.core.dtos.responses.DoctorScheduleSummaryResponse;
import com.activeage.core.exceptions.GlobalExceptionHandler;
import com.activeage.core.services.DoctorScheduleService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
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

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class DoctorScheduleControllerTest {

    @Mock
    private DoctorScheduleService doctorScheduleService;

    @InjectMocks
    private DoctorScheduleController doctorScheduleController;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(doctorScheduleController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        Authentication auth = mock(Authentication.class);
        when(auth.getName()).thenReturn("medico@activeage.com");
        SecurityContext secCtx = mock(SecurityContext.class);
        when(secCtx.getAuthentication()).thenReturn(auth);
        SecurityContextHolder.setContext(secCtx);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    @DisplayName("GET /api/doctor/schedule - Deve listar slots do médico")
    void shouldListDoctorSlots() throws Exception {
        DoctorScheduleSlotResponse slot = DoctorScheduleSlotResponse.builder()
                .id("slot-1")
                .status(SlotStatus.LIVRE)
                .build();

        when(doctorScheduleService.listDoctorSlots(eq("medico@activeage.com"), any(), any()))
                .thenReturn(List.of(slot));

        mockMvc.perform(get("/api/doctor/schedule"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value("slot-1"));
    }

    @Test
    @DisplayName("POST /api/doctor/schedule/slot - Deve criar slot individual")
    void shouldCreateSlot() throws Exception {
        CreateSlotRequest req = CreateSlotRequest.builder()
                .startDateTime(LocalDateTime.now().plusDays(2).withHour(10).withMinute(0))
                .durationMinutes(50)
                .notes("Atendimento presencial/remoto")
                .build();

        DoctorScheduleSlotResponse res = DoctorScheduleSlotResponse.builder()
                .id("slot-1")
                .status(SlotStatus.LIVRE)
                .build();

        when(doctorScheduleService.createSlot(eq("medico@activeage.com"), any(CreateSlotRequest.class)))
                .thenReturn(res);

        mockMvc.perform(post("/api/doctor/schedule/slot")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value("slot-1"));
    }

    @Test
    @DisplayName("POST /api/doctor/schedule/batch - Deve gerar slots em lote")
    void shouldCreateBatchSlots() throws Exception {
        CreateBatchSlotsRequest req = CreateBatchSlotsRequest.builder()
                .date(LocalDate.now().plusDays(2))
                .startTime(LocalTime.of(8, 0))
                .endTime(LocalTime.of(12, 0))
                .durationMinutes(50)
                .breakMinutes(10)
                .build();

        DoctorScheduleSlotResponse res = DoctorScheduleSlotResponse.builder().id("slot-batch-1").build();

        when(doctorScheduleService.createBatchSlots(eq("medico@activeage.com"), any(CreateBatchSlotsRequest.class)))
                .thenReturn(List.of(res));

        mockMvc.perform(post("/api/doctor/schedule/batch")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @DisplayName("DELETE /api/doctor/schedule/slot/{id} - Deve excluir slot")
    void shouldDeleteSlot() throws Exception {
        doNothing().when(doctorScheduleService).deleteSlot("medico@activeage.com", "slot-1");

        mockMvc.perform(delete("/api/doctor/schedule/slot/slot-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Horário removido com sucesso da sua agenda."));
    }

    @Test
    @DisplayName("PATCH /api/doctor/schedule/slot/{id}/toggle-block - Deve alternar bloqueio")
    void shouldToggleBlockSlot() throws Exception {
        DoctorScheduleSlotResponse res = DoctorScheduleSlotResponse.builder()
                .id("slot-1")
                .status(SlotStatus.BLOQUEADO)
                .build();

        when(doctorScheduleService.toggleBlockSlot("medico@activeage.com", "slot-1")).thenReturn(res);

        mockMvc.perform(patch("/api/doctor/schedule/slot/slot-1/toggle-block"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("BLOQUEADO"));
    }

    @Test
    @DisplayName("GET /api/doctor/schedule/stats - Deve retornar métricas consolidadas")
    void shouldGetStats() throws Exception {
        DoctorDashboardStatsResponse stats = DoctorDashboardStatsResponse.builder()
                .freeSlots(5)
                .build();

        when(doctorScheduleService.getDoctorDashboardStats("medico@activeage.com")).thenReturn(stats);

        mockMvc.perform(get("/api/doctor/schedule/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.freeSlots").value(5));
    }

    @Test
    @DisplayName("GET /api/doctor/schedule/summary - Deve retornar resumo de slots")
    void shouldGetSummary() throws Exception {
        DoctorScheduleSummaryResponse summary = DoctorScheduleSummaryResponse.builder()
                .totalSlots(20)
                .totalFreeSlots(12)
                .totalBookedSlots(8)
                .build();

        when(doctorScheduleService.getDoctorScheduleSummary("medico@activeage.com")).thenReturn(summary);

        mockMvc.perform(get("/api/doctor/schedule/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalSlots").value(20));
    }
}
