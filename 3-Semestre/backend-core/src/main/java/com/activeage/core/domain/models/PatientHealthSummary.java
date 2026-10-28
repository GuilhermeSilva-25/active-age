package com.activeage.core.domain.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Ficha clínica básica declarada pelo paciente ou seu cuidador para auxílio na anamnese geriátrica.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientHealthSummary {

    /**
     * Tipo sanguíneo e fator Rh (ex: A+, O-, etc.).
     */
    private String bloodType;

    /**
     * Alergias conhecidas a medicamentos, alimentos ou substâncias.
     */
    private String allergies;

    /**
     * Doenças ou condições crônicas pré-existentes (ex: Hipertensão, Diabetes tipo 2, Osteoporose).
     */
    private String chronicConditions;

    /**
     * Medicamentos de uso contínuo / regular.
     */
    private String regularMedications;
}
