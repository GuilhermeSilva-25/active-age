package com.activeage.core.domain.enums;

/**
 * Identificadores oficiais dos documentos que compõem o Dossiê de Credenciamento Médico.
 * Organizados nos 4 pilares regulatórios da Resolução CFM nº 2.314/2022.
 */
public enum DocumentType {
    // --- PILAR 1: Habilitação Profissional e Identificação ---
    CRM_CARD("Carteira do CRM - Frente (ou PDF Único)", 1, true),
    CRM_CARD_VERSO("Carteira do CRM - Verso (Opcional se PDF Único)", 1, false),
    DIPLOMA("Diploma de Graduação em Medicina - Frente (ou PDF Único)", 1, true),
    DIPLOMA_VERSO("Diploma de Graduação em Medicina - Verso (Opcional se PDF Único)", 1, false),
    RQE("Registro de Qualificação de Especialista (RQE)", 1, false),
    ID_DOCUMENT("Documento Oficial de Identidade (RG/CNH/Passaporte)", 1, true),

    // --- PILAR 2: Regularidade Ética e Legal ---
    ETHICAL_CERTIFICATE("Certidão de Regularidade Ético-Profissional (CRM)", 2, true),

    // --- PILAR 3: Requisitos Técnicos para Telemedicina (Res. CFM nº 2.314/2022) ---
    ICP_BRAZIL_CERT("Comprovante de Certificado Digital ICP-Brasil (A1/A3)", 3, true),
    CRM_TELEMEDICINE_TERM("Declaração/Notificação de Telemedicina no CRM", 3, true),

    // --- PILAR 4: Dados Cadastrais e Financeiros ---
    PROOF_OF_ADDRESS("Comprovante de Residência Atualizado", 4, true),
    CNPJ_CARD("Cartão CNPJ da PJ Médica (Opcional)", 4, false);

    private final String description;
    private final int pillar;
    private final boolean mandatory;

    DocumentType(String description, int pillar, boolean mandatory) {
        this.description = description;
        this.pillar = pillar;
        this.mandatory = mandatory;
    }

    public String getDescription() {
        return description;
    }

    public int getPillar() {
        return pillar;
    }

    public boolean isMandatory() {
        return mandatory;
    }
}
