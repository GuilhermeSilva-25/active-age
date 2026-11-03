package com.activeage.core.controllers;

import com.activeage.core.dtos.responses.AuditLogResponse;
import com.activeage.core.dtos.responses.AuditLogStatsResponse;
import com.activeage.core.exceptions.GlobalExceptionHandler;
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

import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ExtendWith(MockitoExtension.class)
class AdminAuditLogControllerTest {

    @Mock
    private AuditService auditService;

    @InjectMocks
    private AdminAuditLogController adminAuditLogController;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(adminAuditLogController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("GET /api/admin/audit-logs - Deve retornar lista de logs com filtros")
    void shouldGetLogs() throws Exception {
        AuditLogResponse log = AuditLogResponse.builder()
                .id("log-1")
                .action("USER_LOGIN")
                .userEmail("admin@activeage.com")
                .build();

        when(auditService.getLogs("USER_LOGIN", "admin")).thenReturn(List.of(log));

        mockMvc.perform(get("/api/admin/audit-logs")
                        .param("action", "USER_LOGIN")
                        .param("search", "admin"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].action").value("USER_LOGIN"));
    }

    @Test
    @DisplayName("GET /api/admin/audit-logs/stats - Deve retornar estatísticas de auditoria")
    void shouldGetStats() throws Exception {
        AuditLogStatsResponse stats = AuditLogStatsResponse.builder()
                .totalLogs(150)
                .build();

        when(auditService.getStats()).thenReturn(stats);

        mockMvc.perform(get("/api/admin/audit-logs/stats"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalLogs").value(150));
    }
}
