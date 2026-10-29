package com.activeage.core.repositories;

import com.activeage.core.domain.models.MedicalRecord;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositório MongoDB para gestão de Prontuários Médicos Eletrônicos (UC14 / RN003).
 */
@Repository
public interface MedicalRecordRepository extends MongoRepository<MedicalRecord, String> {

    /**
     * Busca o prontuário vinculado a uma consulta específica.
     */
    Optional<MedicalRecord> findByAppointmentId(String appointmentId);

    /**
     * Verifica se já existe prontuário para a consulta informada.
     */
    boolean existsByAppointmentId(String appointmentId);

    /**
     * Busca o histórico de prontuários de um determinado paciente por ordem cronológica decrescente.
     */
    List<MedicalRecord> findByPatientIdOrderByCreatedAtDesc(String patientId);
}
