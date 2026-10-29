package com.activeage.core.repositories;

import com.activeage.core.domain.enums.SlotStatus;
import com.activeage.core.domain.models.DoctorScheduleSlot;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface DoctorScheduleSlotRepository extends MongoRepository<DoctorScheduleSlot, String> {

    List<DoctorScheduleSlot> findByDoctorIdAndStartDateTimeBetweenOrderByStartDateTimeAsc(
        String doctorId, LocalDateTime start, LocalDateTime end
    );

    List<DoctorScheduleSlot> findByDoctorIdAndStartDateTimeGreaterThanEqualOrderByStartDateTimeAsc(
        String doctorId, LocalDateTime from
    );

    List<DoctorScheduleSlot> findByDoctorIdAndStatusAndStartDateTimeGreaterThanEqualOrderByStartDateTimeAsc(
        String doctorId, SlotStatus status, LocalDateTime from
    );

    boolean existsByDoctorIdAndStartDateTime(String doctorId, LocalDateTime startDateTime);

    long countByDoctorIdAndStatus(String doctorId, SlotStatus status);

    long countByDoctorId(String doctorId);
}
