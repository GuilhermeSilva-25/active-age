package com.activeage.core.dtos.requests;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO para solicitação de alteração do status de ativação de um usuário pelo Administrador.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserStatusUpdateRequest {

    @NotNull(message = "O status de ativação (active) é obrigatório.")
    private Boolean active;

    private String reason;
}
