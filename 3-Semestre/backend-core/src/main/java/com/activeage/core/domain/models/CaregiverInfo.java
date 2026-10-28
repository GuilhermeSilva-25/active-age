package com.activeage.core.domain.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Representa os dados do Cuidador ou Familiar Responsável pelo Paciente Idoso.
 * Essencial para suporte técnico, acompanhamento de teleconsultas e comunicação de emergência.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CaregiverInfo {

    /**
     * Indica se o paciente possui um cuidador cadastrado.
     */
    private boolean hasCaregiver;

    /**
     * Nome completo do cuidador ou familiar responsável.
     */
    private String caregiverName;

    /**
     * Telefone / WhatsApp do cuidador para contato imediato.
     */
    private String caregiverPhone;

    /**
     * Grau de parentesco ou vínculo com o idoso (ex: Filho(a), Cônjuge, Neto(a), Cuidador Profissional, Outro).
     */
    private String relationship;
}
