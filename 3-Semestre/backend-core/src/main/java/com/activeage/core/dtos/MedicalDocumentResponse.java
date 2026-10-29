package com.activeage.core.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para retorno de documentos clínicos emitidos (UC15 / UC16).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalDocumentResponse {

    private String id;
    private String appointmentId;
    private String medicalRecordId;

    private String doctorId;
    private String doctorName;
    private String doctorCrm;
    private String doctorUfCrm;
    private String doctorRqe;

    private String patientId;
    private String patientName;
    private String patientCpf;

    private String documentType;
    private String title;
    private String content;
    private String recommendations;

    private String validationCode;
    private LocalDateTime issuedAt;
    private LocalDateTime createdAt;
}
