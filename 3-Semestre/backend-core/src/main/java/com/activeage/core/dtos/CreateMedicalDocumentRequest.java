package com.activeage.core.dtos;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para emissão de prescrição, pedido de exame ou atestado médico (UC15).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateMedicalDocumentRequest {

    @NotBlank(message = "O identificador da consulta é obrigatório.")
    private String appointmentId;

    @NotBlank(message = "O tipo do documento é obrigatório (RECEITA_MEDICA, PEDIDO_EXAME, ATESTADO_MEDICO).")
    private String documentType;

    @NotBlank(message = "O título do documento é obrigatório.")
    private String title;

    @NotBlank(message = "O conteúdo/prescrição do documento é obrigatório.")
    private String content;

    private String recommendations;
}
