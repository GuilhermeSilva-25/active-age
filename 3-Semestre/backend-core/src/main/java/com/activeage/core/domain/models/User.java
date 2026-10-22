package com.activeage.core.domain.models;

import com.activeage.core.domain.enums.DoctorDossierStatus;
import com.activeage.core.domain.enums.Role;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

/**
 * Representa a entidade central de Usuários e Autenticação da plataforma Active Age.
 * Mapeada para a coleção "users" no MongoDB Atlas.
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
     * Nome completo do usuário.
     */
    private String fullName;

    /**
     * Documento de identificação (CPF) do usuário.
     */
    private String cpf;

    /**
     * Telefone de contato do usuário.
     */
    private String phone;

    /**
     * Data de nascimento do usuário.
     */
    private String birthDate;

    /**
     * E-mail de acesso do usuário. Deve ser único no sistema.
     * Utilizado como credencial principal de login.
     */
    private String email;

    /**
     * Senha do usuário criptografada via BCrypt.
     */
    private String password;

    /**
     * Cargo/Permissão do usuário no sistema (ROLE_PACIENTE, ROLE_MEDICO, ROLE_ADMIN).
     * Essencial para o Controle de Permissões Baseado em Cargo (RBAC).
     */
    private Role role;

    /**
     * Registro profissional no Conselho Regional de Medicina (Exclusivo para ROLE_MEDICO).
     */
    private String crm;

    /**
     * Unidade Federativa do CRM do médico (Ex: SP, RJ - Exclusivo para ROLE_MEDICO).
     */
    private String ufCrm;

    /**
     * Indicador de consentimento dos termos de uso e política de privacidade (TCLE).
     * Registro obrigatório para a conformidade com a LGPD.
     */
    private boolean termsAccepted;

    /**
     * Data e hora exata em que o usuário foi registrado na plataforma.
     */
    private LocalDateTime createdAt;

    /**
     * Status da conta do usuário. Contas inativas são bloqueadas.
     */
    private boolean active;

    // ==========================================
    // CAMPOS DE CREDENCIAMENTO MÉDICO (RF002 / RN008)
    // ==========================================

    /**
     * Status do ciclo de vida do credenciamento do médico.
     * PENDING_DOCS, UNDER_REVIEW, DOCS_REJECTED, APPROVED, SUSPENDED.
     */
    private DoctorDossierStatus dossierStatus;

    /**
     * Mapa com os metadados dos documentos do Dossiê enviados pelo médico.
     * Chave: Tipo de Documento em String (ex: CRM_CARD, DIPLOMA, etc.).
     */
    private Map<String, DoctorDocumentInfo> documents = new HashMap<>();

    /**
     * Dados bancários e fiscais do médico para configuração de Split Direto.
     */
    private DoctorFinancialInfo financialInfo;

    /**
     * Motivo ou justificativa técnica em caso de reprovação do Dossiê na auditoria.
     */
    private String rejectionReason;

    /**
     * Data em que o médico formalizou a submissão do dossiê completo para auditoria.
     */
    private LocalDateTime submittedAt;

    /**
     * Data em que o dossiê foi aprovado pelo Administrador / Auditor de Conformidade.
     */
    private LocalDateTime approvedAt;

    /**
     * Data limite do período promocional de 15 dias de teste grátis no consultório virtual.
     */
    private LocalDateTime trialExpiresAt;
}
