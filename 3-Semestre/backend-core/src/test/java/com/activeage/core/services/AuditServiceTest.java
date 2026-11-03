package com.activeage.core.services;

import com.activeage.core.domain.models.AuditLog;
import com.activeage.core.dtos.responses.AuditLogResponse;
import com.activeage.core.dtos.responses.AuditLogStatsResponse;
import com.activeage.core.repositories.AuditLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuditServiceTest {

    @Mock
    private AuditLogRepository auditLogRepository;

    @InjectMocks
    private AuditService auditService;

    private AuditLog sampleLog;

    @BeforeEach
    void setUp() {
        sampleLog = AuditLog.builder()
                .id("log-1")
                .userId("user-1")
                .userEmail("admin@activeage.com")
                .userRole("ROLE_ADMIN")
                .action("VIEW_DOCUMENT")
                .targetUserId("doc-123")
                .details("Inspecionou CRM")
                .ipAddress("192.168.1.1")
                .timestamp(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Deve registrar log de auditoria com IP fallback quando ip for nulo")
    void log_success() {
        when(auditLogRepository.save(any(AuditLog.class))).thenAnswer(i -> i.getArgument(0));

        AuditLog saved = auditService.log("user-1", "admin@activeage.com", "ROLE_ADMIN",
                "LOGIN", "user-1", "Login efetuado", null);

        assertNotNull(saved);
        assertEquals("0.0.0.0", saved.getIpAddress());
        assertEquals("LOGIN", saved.getAction());
        verify(auditLogRepository).save(any(AuditLog.class));
    }

    @Test
    @DisplayName("Deve consultar logs com filtro por ação e busca textual")
    void getLogs_withFilters() {
        when(auditLogRepository.findByActionOrderByTimestampDesc("VIEW_DOCUMENT"))
                .thenReturn(List.of(sampleLog));

        List<AuditLogResponse> logs = auditService.getLogs("VIEW_DOCUMENT", "admin@activeage.com");

        assertEquals(1, logs.size());
        assertEquals("VIEW_DOCUMENT", logs.get(0).getAction());
        assertEquals("admin@activeage.com", logs.get(0).getUserEmail());
    }

    @Test
    @DisplayName("Deve consultar todos os logs quando ação for 'ALL'")
    void getLogs_all() {
        when(auditLogRepository.findAllByOrderByTimestampDesc()).thenReturn(List.of(sampleLog));

        List<AuditLogResponse> logs = auditService.getLogs("ALL", null);

        assertEquals(1, logs.size());
        verify(auditLogRepository).findAllByOrderByTimestampDesc();
    }

    @Test
    @DisplayName("Deve consolidar métricas da trilha de auditoria")
    void getStats_success() {
        when(auditLogRepository.count()).thenReturn(150L);
        when(auditLogRepository.countByTimestampAfter(any(LocalDateTime.class))).thenReturn(25L);
        when(auditLogRepository.countByAction("VIEW_DOCUMENT")).thenReturn(40L);
        when(auditLogRepository.countByActionIn(anyList())).thenReturn(10L);

        AuditLogStatsResponse stats = auditService.getStats();

        assertNotNull(stats);
        assertEquals(150L, stats.getTotalLogs());
        assertEquals(25L, stats.getLogsLast24Hours());
        assertEquals(40L, stats.getDocumentViewsCount());
        assertEquals(10L, stats.getDossierReviewsCount());
    }
}
