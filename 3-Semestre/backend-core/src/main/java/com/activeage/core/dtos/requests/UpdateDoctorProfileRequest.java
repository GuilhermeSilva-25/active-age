package com.activeage.core.dtos.requests;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * DTO para atualização de informações profissionais do médico geriatra (RF014 / UC18).
 * Respeita a Resolução CFM nº 2.336/2023 (Publicidade Médica).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDoctorProfileRequest {

    /**
     * Telefone de contato profissional com máscara.
     */
    @Pattern(regexp = "^$|^\\(\\d{2}\\)\\s?\\d{4,5}-\\d{4}$", message = "Telefone deve seguir o padrão (00) 00000-0000")
    private String phone;

    /**
     * Registro de Qualificação de Especialista (RQE).
     */
    @Size(max = 40, message = "O RQE deve ter no máximo 40 caracteres")
    private String rqe;

    /**
     * Mini-biografia e formação acadêmica (máx. 1200 caracteres).
     */
    @Size(max = 1200, message = "A biografia profissional não pode exceder 1200 caracteres")
    private String bio;

    /**
     * Lista de áreas de foco clínico geriátrico.
     */
    private List<String> clinicalFocus;

    /**
     * Valor dos honorários brutos da teleconsulta (BRL).
     */
    @DecimalMin(value = "0.0", message = "O valor da consulta não pode ser negativo")
    private BigDecimal consultationFee;

    /**
     * Duração estimada da teleconsulta em minutos (entre 15 e 180 min).
     */
    @Min(value = 15, message = "A duração mínima é de 15 minutos")
    @Max(value = 180, message = "A duração máxima é de 180 minutos")
    private Integer consultationDurationMinutes;

    /**
     * Link para o currículo oficial na Plataforma Lattes.
     */
    @Pattern(regexp = "^$|^https?://.*", message = "O link do Lattes deve ser uma URL válida iniciando com http ou https")
    private String lattesUrl;
}
