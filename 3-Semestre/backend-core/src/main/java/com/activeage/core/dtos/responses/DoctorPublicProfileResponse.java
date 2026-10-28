package com.activeage.core.dtos.responses;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO para exibição pública de médicos geriatras no catálogo e vitrine neutra de busca (UC08 / RF005).
 * Em estrita conformidade com a Resolução CFM nº 2.336/2023 e LGPD (sem dados sensíveis pessoais).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorPublicProfileResponse {

    private String id;
    private String fullName;
    private String avatarUrl;
    private String crm;
    private String ufCrm;
    private String rqe;
    private String bio;
    private List<String> clinicalFocus;
    private BigDecimal consultationFee;
    private Integer consultationDurationMinutes;
    private String lattesUrl;
}
