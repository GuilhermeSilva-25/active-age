package com.activeage.core.services;

import com.activeage.core.domain.models.AuditLog;
import com.activeage.core.repositories.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * Serviço responsável por gravar eventos na Trilha de Auditoria Imutável (audit_logs).
 * Atende às exigências de rastreabilidade e perenidade do CFM, SBIS (NGS1) e LGPD (RN007).
 */
@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Registra uma operação auditável no sistema.
     *
     * @param userId ID do usuário operador.
     * @param userEmail E-mail do usuário operador.
     * @param userRole Cargo/perfil do operador.
     * @param action Ação realizada (ex: VIEW_DOCUMENT, REVIEW_DOSSIER_APPROVE, REVIEW_DOSSIER_REJECT).
     * @param targetUserId ID do usuário alvo afetado pela operação.
     * @param details Descrição detalhada do evento.
     * @param ipAddress Endereço IP de origem.
     */
    public AuditLog log(String userId, String userEmail, String userRole, String action,
                        String targetUserId, String details, String ipAddress) {
        AuditLog auditLog = AuditLog.builder()
                .userId(userId)
                .userEmail(userEmail)
                .userRole(userRole)
                .action(action)
                .targetUserId(targetUserId)
                .details(details)
                .ipAddress(ipAddress != null ? ipAddress : "0.0.0.0")
                .timestamp(LocalDateTime.now())
                .build();

        return auditLogRepository.save(auditLog);
    }
}
