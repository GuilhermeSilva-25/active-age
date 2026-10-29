package com.activeage.core.repositories;

import com.activeage.core.domain.enums.ExamCategory;
import com.activeage.core.domain.models.PatientExam;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repositório MongoDB para gestão dos exames prévios anexados pelos pacientes (UC11 / RF008).
 */
@Repository
public interface PatientExamRepository extends MongoRepository<PatientExam, String> {

    /**
     * Retorna todos os exames de um paciente ordenados por data do exame decrescente.
     */
    List<PatientExam> findByPatientIdOrderByExamDateDesc(String patientId);

    /**
     * Retorna os exames de um paciente filtrados por categoria clínica e ordenados por data decrescente.
     */
    List<PatientExam> findByPatientIdAndCategoryOrderByExamDateDesc(String patientId, ExamCategory category);

    /**
     * Busca um exame pelo ID garantindo que pertence ao paciente titular.
     */
    Optional<PatientExam> findByIdAndPatientId(String id, String patientId);

    /**
     * Conta a quantidade total de exames anexados por um determinado paciente.
     */
    long countByPatientId(String patientId);
}
