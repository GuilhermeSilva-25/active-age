package com.activeage.core.dtos;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO com dados do prontuário médico para visualização pelo médico na sala de teleconsulta.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordResponse {

    private String id;
    private String appointmentId;

    private String doctorId;
    private String doctorName;
    private String doctorCrm;
    private String doctorUfCrm;

    private String patientId;
    private String patientName;

    // Anamnese
    private String chiefComplaint;
    private String historyOfPresentIllness;
    private String clinicalEvolution;

    // Avaliação Geriátrica Ampla (AGA)
    private String cognitiveStatus;
    private String mobilityRisk;
    private String functionalIndependence;
    private String familySupport;

    // Diagnóstico e Conduta
    private String cid11Code;
    private String cid11Description;
    private String clinicalConduct;

    // Imutabilidade Ética
    private String status;
    private LocalDateTime finalizedAt;
    private String hashSignature;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
