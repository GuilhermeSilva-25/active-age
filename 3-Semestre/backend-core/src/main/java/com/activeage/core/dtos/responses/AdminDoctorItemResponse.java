package com.activeage.core.dtos.responses;

import com.activeage.core.domain.enums.DoctorDossierStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Item simplificado para listagem na Fila de Credenciamento do Painel Administrativo.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDoctorItemResponse {

    private String id;
    private String fullName;
    private String email;
    private String phone;
    private String crm;
    private String ufCrm;
    private DoctorDossierStatus dossierStatus;
    private int uploadedDocsCount;
    private boolean hasFinancialInfo;
    private LocalDateTime createdAt;
    private LocalDateTime submittedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime trialExpiresAt;
}
