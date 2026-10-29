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
 * Entidade que representa um Documento Clínico Digital emitido pelo médico geriatra (UC15 / UC16).
 * Suporta: RECEITA_MEDICA, PEDIDO_EXAME, ATESTADO_MEDICO.
 * Possui código identificador único de validação perante o CRM e ICP-Brasil.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "medical_documents")
public class MedicalDocument {

    @Id
    private String id;

    @Indexed
    private String appointmentId;

    private String medicalRecordId;

    private String doctorId;
    private String doctorName;
    private String doctorCrm;
    private String doctorUfCrm;
    private String doctorRqe;

    @Indexed
    private String patientId;
    private String patientName;
    private String patientCpf;

    private String documentType;        // RECEITA_MEDICA | PEDIDO_EXAME | ATESTADO_MEDICO
    private String title;               // Ex: "Receita Médica de Controle Especial", "Atestado Médico"
    private String content;             // Medicamentos, posologia, orientações ou justificativa do atestado
    private String recommendations;     // Instruções alimentares, cuidados adicionais ou período de repouso

    @Indexed(unique = true)
    private String validationCode;      // Código seguro para validação pública (ex: "AA-2026-X8K9L2")

    private LocalDateTime issuedAt;
    private LocalDateTime createdAt;
}
