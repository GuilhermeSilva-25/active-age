package com.activeage.core.dtos.requests;

import jakarta.validation.constraints.AssertTrue;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * DTO responsável por capturar os dados do cadastro de Paciente vindos do Front-end.
 * Possui validações rigorosas (Jakarta Validation) para blindar o banco de dados
 * e fazer duplo-check com o Zod (React).
 */
@Data
public class PatientRegisterRequest {

    /**
     * Nome completo do paciente.
     * Validado para impedir nomes muito curtos.
     */
    @NotBlank(message = "O nome completo é obrigatório.")
    @Size(min = 5, message = "O nome completo deve ter no mínimo 5 caracteres.")
    private String fullName;

    /**
     * E-mail para contato e login.
     */
    @NotBlank(message = "O e-mail é obrigatório.")
    @Email(message = "Formato de e-mail inválido.")
    private String email;

    /**
     * Senha do usuário escolhida no cadastro.
     * Deve ter no mínimo 6 caracteres, espelhando a regra do frontend.
     */
    @NotBlank(message = "A senha é obrigatória.")
    @Size(min = 6, message = "A senha deve conter no mínimo 6 caracteres.")
    private String password;

    /**
     * CPF mascarado ou limpo vindo do frontend.
     */
    @NotBlank(message = "O CPF é obrigatório.")
    private String cpf;

    /**
     * Telefone (WhatsApp) para notificações e alertas.
     */
    @NotBlank(message = "O telefone é obrigatório.")
    private String phone;

    /**
     * Data de nascimento em formato String (para ser parseada ou salva como texto).
     */
    @NotBlank(message = "A data de nascimento é obrigatória.")
    private String birthDate;

    /**
     * Checkbox de confirmação da política de privacidade.
     * O Jakarta exige que isso seja enviado como verdadeiro (@AssertTrue).
     */
    @AssertTrue(message = "Você deve aceitar os termos de uso e política de privacidade.")
    private boolean termsAccepted;
}