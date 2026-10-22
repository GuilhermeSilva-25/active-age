package com.activeage.core.controllers;

import com.activeage.core.dtos.responses.AuditLogResponse;
import com.activeage.core.dtos.responses.AuditLogStatsResponse;
import com.activeage.core.services.AuditService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Controller RESTful para consulta da Trilha de Auditoria Imutável (audit_logs).
 * Atende às exigências da SBIS/CFM (NGS1) e Art. 37 da LGPD.
 * Todas as rotas são restritas a ROLE_ADMIN.
 */
@RestController
@RequestMapping("/api/admin/audit-logs")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminAuditLogController {

    private final AuditService auditService;

    public AdminAuditLogController(AuditService auditService) {
        this.auditService = auditService;
    }

    /**
     * Retorna a lista cronológica de eventos auditados com filtros por ação e busca textual.
     */
    @GetMapping
    public ResponseEntity<List<AuditLogResponse>> getLogs(
            @RequestParam(value = "action", required = false) String action,
            @RequestParam(value = "search", required = false) String search
    ) {
        return ResponseEntity.ok(auditService.getLogs(action, search));
    }

    /**
     * Retorna as métricas consolidadas da Trilha de Auditoria.
     */
    @GetMapping("/stats")
    public ResponseEntity<AuditLogStatsResponse> getStats() {
        return ResponseEntity.ok(auditService.getStats());
    }
}
