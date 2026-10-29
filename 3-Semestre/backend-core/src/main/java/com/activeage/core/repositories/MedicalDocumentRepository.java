package com.activeage.core.repositories;

import com.activeage.core.domain.models.MedicalDocument;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositório MongoDB para gestão de Documentos Clínicos Digitais (UC15 / UC16).
 */
@Repository
public interface MedicalDocumentRepository extends MongoRepository<MedicalDocument, String> {

    /**
     * Retorna todos os documentos emitidos durante uma teleconsulta específica.
     */
    List<MedicalDocument> findByAppointmentId(String appointmentId);

    /**
     * Retorna todos os documentos clínicos emitidos para um paciente em ordem decrescente de emissão.
     */
    List<MedicalDocument> findByPatientIdOrderByIssuedAtDesc(String patientId);

    /**
     * Busca um documento clínico por seu código de validação público (ICP-Brasil).
     */
    Optional<MedicalDocument> findByValidationCode(String validationCode);

    /**
     * Verifica se determinado código de validação já está em uso no sistema.
     */
    boolean existsByValidationCode(String validationCode);
}
