package com.activeage.core.dtos.responses;

import com.activeage.core.domain.enums.DoctorDossierStatus;
import com.activeage.core.domain.models.DoctorDocumentInfo;
import com.activeage.core.domain.models.DoctorFinancialInfo;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Resposta com o estado consolidado do Dossiê de Credenciamento do médico.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDossierStatusResponse {

    private String doctorId;
    private String fullName;
    private String email;
    private String crm;
    private String ufCrm;
    private DoctorDossierStatus dossierStatus;
    private Map<String, DoctorDocumentInfo> documents;
    private DoctorFinancialInfo financialInfo;
    private String rejectionReason;
    private LocalDateTime submittedAt;
    private LocalDateTime approvedAt;
    private LocalDateTime trialExpiresAt;
    private int mandatoryUploadedCount;
    private int totalMandatoryCount;
    private boolean canSubmit;
}
