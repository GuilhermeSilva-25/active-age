package com.activeage.core.dtos.responses;

import com.activeage.core.domain.enums.DoctorDossierStatus;
import com.activeage.core.domain.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO para listagem de contas de usuários no painel de moderação administrativa.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserItemResponse {

    private String id;
    private String fullName;
    private String email;
    private String phone;
    private String cpf;
    private String birthDate;
    private Role role;
    private boolean active;
    private String crm;
    private String ufCrm;
    private DoctorDossierStatus dossierStatus;
    private LocalDateTime createdAt;
}
