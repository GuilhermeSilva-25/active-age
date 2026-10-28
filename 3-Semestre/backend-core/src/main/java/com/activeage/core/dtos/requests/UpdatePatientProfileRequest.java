package com.activeage.core.dtos.requests;

import com.activeage.core.domain.models.CaregiverInfo;
import com.activeage.core.domain.models.PatientHealthSummary;
import com.activeage.core.domain.models.UserAddress;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para atualização do perfil do paciente, endereço e cuidador (RF014 / UC18).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdatePatientProfileRequest {

    /**
     * Telefone de contato do paciente com máscara.
     */
    @Pattern(regexp = "^$|^\\(\\d{2}\\)\\s?\\d{4,5}-\\d{4}$", message = "Telefone deve seguir o padrão (00) 00000-0000")
    private String phone;

    /**
     * Endereço residencial do paciente.
     */
    private UserAddress address;

    /**
     * Dados do cuidador ou familiar responsável.
     */
    private CaregiverInfo caregiver;

    /**
     * Ficha declaratória básica de saúde.
     */
    private PatientHealthSummary healthSummary;
}
