package com.activeage.core.domain.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Entidade que representa o Prontuário Ético Eletrônico Geriátrico de uma teleconsulta (UC14 / RN003).
 * Mapeada para a coleção 'medical_records' no MongoDB Atlas.
 * Implementa garantia de imutabilidade ética conforme CFM nº 2.314/2022 e SBIS NGS1.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "medical_records")
public class MedicalRecord {

    @Id
    private String id;

    @Indexed(unique = true)
    private String appointmentId;

    private String doctorId;
    private String doctorName;
    private String doctorCrm;
    private String doctorUfCrm;

    private String patientId;
    private String patientName;

    // === ANAMNESE CLÍNICA ===
    private String chiefComplaint;          // Queixa principal relatada
    private String historyOfPresentIllness; // História da moléstia atual
    private String clinicalEvolution;       // Evolução clínica e anotações da sessão

    // === AVALIAÇÃO GERIÁTRICA AMPLA (AGA) ===
    private String cognitiveStatus;         // Preservado | Declínio Cognitivo Leve | Demência em Investigação
    private String mobilityRisk;            // Baixo Risco | Risco Moderado de Quedas | Marcha Instável
    private String functionalIndependence;  // Totalmente Independente | Dependência Parcial | Dependência Total
    private String familySupport;           // Cuidador Presente | Apoio Familiar Regular | Idoso Vive Só

    // === HIPÓTESE DIAGNÓSTICA E CONDUTA (CID-11) ===
    private String cid11Code;               // Código oficial CID-11 (ex: "8A00", "BA00", "MB40")
    private String cid11Description;        // Descrição da afecção clínica CID-11
    private String clinicalConduct;         // Conduta médica e plano de cuidados individualizado

    // === IMUTABILIDADE ÉTICA (RN003 / CFM) ===
    @Builder.Default
    private String status = "DRAFT";        // "DRAFT" (rascunho editável) ou "FINALIZED" (imutável)
    private LocalDateTime finalizedAt;      // Data e hora exata da assinatura digital
    private String hashSignature;           // Hash SHA-256 do prontuário para garantia de não-adulteração

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
