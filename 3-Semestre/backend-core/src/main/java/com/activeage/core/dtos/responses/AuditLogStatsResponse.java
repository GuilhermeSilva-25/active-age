package com.activeage.core.dtos.responses;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para retorno das métricas consolidadas da Trilha de Auditoria.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLogStatsResponse {

    private long totalLogs;
    private long logsLast24Hours;
    private long documentViewsCount;
    private long dossierReviewsCount;
}
