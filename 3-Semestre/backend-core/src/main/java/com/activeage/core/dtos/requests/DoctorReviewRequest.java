package com.activeage.core.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para submissão do parecer de auditoria do Administrador sobre o Dossiê Médico.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorReviewRequest {

    /**
     * Ação do auditor: "APPROVE" para homologar ou "REJECT" para reprovar.
     */
    @NotBlank(message = "A ação de auditoria é obrigatória (APPROVE ou REJECT).")
    private String action;

    /**
     * Justificativa técnica obrigatória em caso de reprovação (mínimo de 10 caracteres).
     */
    private String rejectionReason;
}
