package com.activeage.core.dtos.responses;

import com.activeage.core.domain.enums.DoctorDossierStatus;
import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.models.CaregiverInfo;
import com.activeage.core.domain.models.PatientHealthSummary;
import com.activeage.core.domain.models.UserAddress;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

/**
 * DTO com as informações completas de perfil do usuário autenticado.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {

    // Dados Globais de Identificação
    private String id;
    private String fullName;
    private String email;
    private Role role;
    private String cpf;
    private String phone;
    private String birthDate;
    private String avatarUrl;
    private boolean active;
    private LocalDateTime createdAt;

    // Dados Médicos (ROLE_MEDICO)
    private String crm;
    private String ufCrm;
    private String rqe;
    private String bio;
    private List<String> clinicalFocus;
    private BigDecimal consultationFee;
    private Integer consultationDurationMinutes;
    private String lattesUrl;
    private DoctorDossierStatus dossierStatus;
    private LocalDateTime trialExpiresAt;
    private LocalDateTime approvedAt;

    // Dados do Paciente (ROLE_PACIENTE)
    private UserAddress address;
    private CaregiverInfo caregiver;
    private PatientHealthSummary healthSummary;
}
