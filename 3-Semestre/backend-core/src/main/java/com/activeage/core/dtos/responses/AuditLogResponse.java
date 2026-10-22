package com.activeage.core.dtos.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para retorno de registros da Trilha de Auditoria Imutável (audit_logs).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogResponse {

    private String id;
    private String userId;
    private String userEmail;
    private String userRole;
    private String action;
    private String targetUserId;
    private String details;
    private String ipAddress;
    private LocalDateTime timestamp;
}
