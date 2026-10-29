package com.activeage.core.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para atualização do Prontuário Médico em modo rascunho (UC14).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MedicalRecordRequest {

    @NotBlank(message = "O ID da consulta médica é obrigatório.")
    private String appointmentId;

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
}
