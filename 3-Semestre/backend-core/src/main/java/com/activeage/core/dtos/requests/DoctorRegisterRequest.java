package com.activeage.core.dtos.requests;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO responsável por capturar os dados do cadastro de Médico Especialista vindos do Front-end.
 * Possui validações rigorosas (Jakarta Validation) alinhadas ao schema Zod do formulário.
 */
@Data
public class DoctorRegisterRequest {

    /**
     * Nome completo do médico geriatra.
     */
    @NotBlank(message = "O nome completo é obrigatório.")
    @Size(min = 5, message = "O nome completo deve ter no mínimo 5 caracteres.")
    private String fullName;

    /**
     * E-mail profissional de acesso.
     */
    @NotBlank(message = "O e-mail é obrigatório.")
    @Email(message = "Formato de e-mail inválido.")
    private String email;

    /**
     * Senha para acesso ao consultório virtual.
     */
    @NotBlank(message = "A senha é obrigatória.")
    @Size(min = 6, message = "A senha deve conter no mínimo 6 caracteres.")
    private String password;

    /**
     * CPF do profissional.
     */
    @NotBlank(message = "O CPF é obrigatório.")
    private String cpf;

    /**
     * Telefone de contato profissional / WhatsApp.
     */
    @NotBlank(message = "O telefone é obrigatório.")
    private String phone;

    /**
     * Número do registro profissional no Conselho Regional de Medicina.
     */
    @NotBlank(message = "O CRM é obrigatório.")
    @Size(min = 4, message = "O CRM deve ter no mínimo 4 dígitos.")
    private String crm;

    /**
     * Unidade Federativa emissora do CRM (ex: SP, RJ).
     */
    @NotBlank(message = "O estado (UF) do CRM é obrigatório.")
    @Pattern(regexp = "^[A-Za-z]{2}$", message = "A UF deve conter exatamente 2 letras.")
    private String ufCrm;

    /**
     * Declaração de responsabilidade e aceite dos termos éticos do CFM e LGPD.
     */
    @AssertTrue(message = "Você deve aceitar os termos de responsabilidade médica e a política de privacidade.")
    private boolean termsAccepted;
}
