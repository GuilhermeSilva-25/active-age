package com.activeage.core.domain.enums;

/**
 * Categorias clínicas para classificação de exames laboratoriais e laudos médicos (UC11 / RF008).
 */
public enum ExamCategory {
    LABORATORIAL("Exame Laboratorial / Sangue"),
    IMAGEM("Exame de Imagem (Raio-X, Tomografia, Ressonância)"),
    CARDIOLOGICO("Exame Cardiológico (ECG, Holter, MAPA)"),
    OUTROS("Outros Documentos Clínicos / Relatórios");

    private final String description;

    ExamCategory(String description) {
        this.description = description;
    }

    public String getDescription() {
        return description;
    }
}
