package com.activeage.core.dtos.requests;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO (Data Transfer Object) responsável por receber os dados de Login do Front-end.
 * Funciona como um contrato rígido para barrar requisições malformadas.
 */
@Data
public class LoginRequest {

    /**
     * E-mail fornecido na tela de login.
     * Não pode ser vazio e deve ter formato válido (ex: contem @).
     */
    @NotBlank(message = "O e-mail é obrigatório.")
    @Email(message = "Formato de e-mail inválido.")
    private String email;

    /**
     * Senha fornecida na tela de login.
     * Não pode ser enviada em branco.
     */
    @NotBlank(message = "A senha é obrigatória.")
    private String password;
}