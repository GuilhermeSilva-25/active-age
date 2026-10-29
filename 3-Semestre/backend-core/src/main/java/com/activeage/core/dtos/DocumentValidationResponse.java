package com.activeage.core.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para validação pública e checagem de conformidade de documentos médicos perante o CRM.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentValidationResponse {

    private boolean valid;
    private String validationCode;
    private String documentType;
    private String title;
    private String doctorName;
    private String doctorCrm;
    private String doctorUfCrm;
    private String patientName;
    private LocalDateTime issuedAt;
    private String message;
}
