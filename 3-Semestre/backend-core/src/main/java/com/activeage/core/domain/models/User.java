package com.activeage.core.domain.models;

import com.activeage.core.domain.enums.Role;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

/**
 * Representa a entidade central de Autenticação da plataforma Active Age.
 * Esta classe é mapeada para a coleção "users" no MongoDB e armazena
 * estritamente os dados necessários para login e controle de acesso,
 * respeitando o princípio de minimização de dados da LGPD.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    /**
     * Identificador único gerado automaticamente pelo MongoDB.
     */
    @Id
    private String id;

    /**
     * E-mail de acesso do usuário. Deve ser único no sistema.
     * Utilizado como credencial principal de login.
     */
    private String email;

    /**
     * Senha do usuário.
     * Deve obrigatoriamente ser criptografada via BCrypt antes da persistência.
     * Nunca deve ser exposta ou trafegada em texto plano.
     */
    private String password;

    /**
     * Cargo/Permissão do usuário no sistema (Ex: Paciente ou Médico).
     * Essencial para o Controle de Permissões Baseado em Cargo (RBAC).
     */
    private Role role;

    /**
     * Indicador de consentimento dos termos de uso e política de privacidade (TCLE).
     * Registro obrigatório para a conformidade com a LGPD.
     */
    private boolean termsAccepted;

    /**
     * Data e hora exata em que o usuário foi registrado na plataforma.
     * Utilizado para registros básicos de auditoria (Logs).
     */
    private LocalDateTime createdAt;

    /**
     * Status da conta do usuário.
     * Contas inativas (false) são bloqueadas na camada de Autenticação.
     */
    private boolean active;
}