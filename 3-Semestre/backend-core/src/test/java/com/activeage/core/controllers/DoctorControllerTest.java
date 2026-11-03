package com.activeage.core.controllers;

import com.activeage.core.dtos.responses.DoctorPublicProfileResponse;
import com.activeage.core.dtos.responses.DoctorScheduleSlotResponse;
import com.activeage.core.exceptions.GlobalExceptionHandler;
import com.activeage.core.services.DoctorScheduleService;
import com.activeage.core.services.DoctorService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class DoctorControllerTest {

    @Mock
    private DoctorService doctorService;

    @Mock
    private DoctorScheduleService doctorScheduleService;

    @InjectMocks
    private DoctorController doctorController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(doctorController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /api/doctors/search - Deve retornar lista de médicos homologados com filtros")
    void shouldSearchApprovedDoctors() throws Exception {
        DoctorPublicProfileResponse doc = DoctorPublicProfileResponse.builder()
                .id("doc-1")
                .fullName("Dra. Ada Lovelace")
                .crm("111222")
                .ufCrm("SP")
                .consultationFee(BigDecimal.valueOf(250.00))
                .build();

        when(doctorService.searchApprovedDoctors(any(), any(), any(), any(), any()))
                .thenReturn(List.of(doc));

        mockMvc.perform(get("/api/doctors/search")
                        .param("q", "Ada")
                        .param("uf", "SP")
                        .param("sort", "name_asc"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].fullName").value("Dra. Ada Lovelace"));
    }

    @Test
    @DisplayName("GET /api/doctors/{id} - Deve retornar detalhes do médico homologado por ID")
    void shouldGetDoctorById() throws Exception {
        DoctorPublicProfileResponse doc = DoctorPublicProfileResponse.builder()
                .id("doc-1")
                .fullName("Dr. Alan Turing")
                .bio("Especialista em neurogeriatria")
                .build();

        when(doctorService.getApprovedDoctorById("doc-1")).thenReturn(doc);

        mockMvc.perform(get("/api/doctors/doc-1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value("doc-1"))
                .andExpect(jsonPath("$.fullName").value("Dr. Alan Turing"))
                .andExpect(jsonPath("$.bio").value("Especialista em neurogeriatria"));
    }

    @Test
    @DisplayName("GET /api/doctors/{id}/availability - Deve retornar grade de horários livres")
    void shouldGetDoctorAvailability() throws Exception {
        DoctorScheduleSlotResponse slot = DoctorScheduleSlotResponse.builder()
                .id("slot-1")
                .startDateTime(LocalDateTime.now().plusDays(1))
                .endDateTime(LocalDateTime.now().plusDays(1).plusMinutes(50))
                .build();

        when(doctorScheduleService.listPublicAvailability("doc-1")).thenReturn(List.of(slot));

        mockMvc.perform(get("/api/doctors/doc-1/availability"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value("slot-1"));
    }
}
