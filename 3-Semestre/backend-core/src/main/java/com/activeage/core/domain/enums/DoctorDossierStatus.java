package com.activeage.core.domain.enums;

/**
 * Representa os estados possíveis do ciclo de vida do credenciamento do médico.
 * Em conformidade com o requisito RF002 e a regra RN008 da Resolução CFM nº 2.314/2022.
 */
public enum DoctorDossierStatus {
    /**
     * Médico pré-cadastrado na plataforma, porém ainda não submeteu todos os documentos obrigatórios.
     * Consultório virtual e vitrine de horários permanecem bloqueados.
     */
    PENDING_DOCS,

    /**
     * Médico submeteu os documentos obrigatórios do Dossiê nos 4 pilares.
     * Encontra-se na fila de análise da equipe de compliance (ROLE_ADMIN).
     */
    UNDER_REVIEW,

    /**
     * Um ou mais documentos foram reprovados na auditoria com justificativa técnica.
     * O médico deve corrigir os arquivos apontados e submeter novamente.
     */
    DOCS_REJECTED,

    /**
     * Dossiê integralmente homologado e aprovado pelo Administrador/Auditor.
     * Ativa o período promocional de 15 dias de teste grátis e libera o consultório virtual.
     */
    APPROVED,

    /**
     * Cadastro suspenso administrativamente por infração ética, inadimplência ou interdição no CRM.
     */
    SUSPENDED
}
