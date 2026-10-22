package com.activeage.core.domain.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Entidade para a Trilha de Auditoria Imutável (Audit Trail).
 * Mapeada para a coleção "audit_logs" no MongoDB Atlas.
 * Atende estritamente às normas do CFM, SBIS (NGS1) e LGPD (RN007).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "audit_logs")
public class AuditLog {

    @Id
    private String id;

    /**
     * ID do usuário que executou a operação.
     */
    private String userId;

    /**
     * E-mail do usuário que executou a operação.
     */
    private String userEmail;

    /**
     * Cargo/Perfil do usuário (ROLE_ADMIN, ROLE_MEDICO, ROLE_PACIENTE).
     */
    private String userRole;

    /**
     * Tipo de ação auditada (ex: VIEW_DOCUMENT, REVIEW_DOSSIER_APPROVE, REVIEW_DOSSIER_REJECT, UPLOAD_DOCUMENT, SUBMIT_DOSSIER).
     */
    private String action;

    /**
     * ID do usuário alvo da ação (ex: ID do médico titular do dossiê consultado).
     */
    private String targetUserId;

    /**
     * Detalhes adicionais sobre a operação (ex: "Visualizou o CRM_CARD", "Dossiê aprovado", etc.).
     */
    private String details;

    /**
     * Endereço IP de origem da requisição HTTP.
     */
    private String ipAddress;

    /**
     * Carimbo de data e hora oficial da operação.
     */
    private LocalDateTime timestamp;
}
