package com.activeage.core.domain.enums;

/**
 * Define os níveis de acesso e controle de permissões dentro da plataforma (RBAC).
 * Utilizado pelo Spring Security para restringir o acesso a rotas e painéis específicos,
 * garantindo a separação entre a Área do Paciente, a Área do Médico e o Painel Administrativo.
 */
public enum Role {
    ROLE_PACIENTE,
    ROLE_MEDICO,
    ROLE_ADMIN
}