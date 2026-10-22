package com.activeage.core.services;

import com.activeage.core.domain.models.AuditLog;
import com.activeage.core.dtos.responses.AuditLogResponse;
import com.activeage.core.dtos.responses.AuditLogStatsResponse;
import com.activeage.core.repositories.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Serviço responsável por gravar e consultar eventos na Trilha de Auditoria Imutável (audit_logs).
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

    /**
     * Consulta os registros de auditoria com suporte a filtro por tipo de ação e busca textual.
     */
    public List<AuditLogResponse> getLogs(String action, String search) {
        List<AuditLog> logs;

        if (action != null && !action.isBlank() && !"ALL".equalsIgnoreCase(action)) {
            logs = auditLogRepository.findByActionOrderByTimestampDesc(action.toUpperCase());
        } else {
            logs = auditLogRepository.findAllByOrderByTimestampDesc();
        }

        if (search != null && !search.isBlank()) {
            String lowerSearch = search.toLowerCase();
            logs = logs.stream().filter(l ->
                    (l.getUserEmail() != null && l.getUserEmail().toLowerCase().contains(lowerSearch)) ||
                    (l.getDetails() != null && l.getDetails().toLowerCase().contains(lowerSearch)) ||
                    (l.getIpAddress() != null && l.getIpAddress().contains(lowerSearch)) ||
                    (l.getTargetUserId() != null && l.getTargetUserId().contains(lowerSearch))
            ).collect(Collectors.toList());
        }

        return logs.stream().map(l -> AuditLogResponse.builder()
                .id(l.getId())
                .userId(l.getUserId())
                .userEmail(l.getUserEmail())
                .userRole(l.getUserRole())
                .action(l.getAction())
                .targetUserId(l.getTargetUserId())
                .details(l.getDetails())
                .ipAddress(l.getIpAddress())
                .timestamp(l.getTimestamp())
                .build()
        ).collect(Collectors.toList());
    }

    /**
     * Consolida as métricas da Trilha de Auditoria para os cards de governança.
     */
    public AuditLogStatsResponse getStats() {
        long totalLogs = auditLogRepository.count();
        LocalDateTime last24h = LocalDateTime.now().minusHours(24);
        long logsLast24Hours = auditLogRepository.countByTimestampAfter(last24h);
        long documentViewsCount = auditLogRepository.countByAction("VIEW_DOCUMENT");
        long dossierReviewsCount = auditLogRepository.countByActionIn(Arrays.asList(
                "REVIEW_DOSSIER_APPROVE",
                "REVIEW_DOSSIER_REJECT"
        ));

        return AuditLogStatsResponse.builder()
                .totalLogs(totalLogs)
                .logsLast24Hours(logsLast24Hours)
                .documentViewsCount(documentViewsCount)
                .dossierReviewsCount(dossierReviewsCount)
                .build();
    }
}
