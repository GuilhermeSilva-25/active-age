package com.activeage.core.repositories;

import com.activeage.core.domain.enums.AppointmentStatus;
import com.activeage.core.domain.models.Appointment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AppointmentRepository extends MongoRepository<Appointment, String> {

    List<Appointment> findByPatientIdOrderByStartDateTimeDesc(String patientId);

    List<Appointment> findByPatientIdAndStatusAndStartDateTimeGreaterThanEqualOrderByStartDateTimeAsc(
        String patientId, AppointmentStatus status, LocalDateTime from
    );

    Optional<Appointment> findFirstByPatientIdAndStatusAndStartDateTimeGreaterThanEqualOrderByStartDateTimeAsc(
        String patientId, AppointmentStatus status, LocalDateTime from
    );

    List<Appointment> findByDoctorIdOrderByStartDateTimeAsc(String doctorId);

    List<Appointment> findByDoctorIdAndStatusAndStartDateTimeBetweenOrderByStartDateTimeAsc(
        String doctorId, AppointmentStatus status, LocalDateTime start, LocalDateTime end
    );

    boolean existsBySlotId(String slotId);

    long countByStatus(AppointmentStatus status);

    long countByStatusIn(List<AppointmentStatus> statuses);

    List<Appointment> findAllByOrderByStartDateTimeDesc();
}
