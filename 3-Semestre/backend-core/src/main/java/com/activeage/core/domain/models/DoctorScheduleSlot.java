package com.activeage.core.domain.models;

import com.activeage.core.domain.enums.SlotStatus;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

/**
 * Entidade que representa um slot individual de horário na grade do médico.
 * 
 * Possui índice composto único no MongoDB para impedir agendamentos sobrepostos
 * ou horários duplicados para o mesmo médico (Res. CFM nº 2.314/2022).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "doctor_schedule_slots")
@CompoundIndex(name = "doctor_start_time_unique_idx", def = "{'doctorId': 1, 'startDateTime': 1}", unique = true)
public class DoctorScheduleSlot {

    @Id
    private String id;

    private String doctorId;

    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;

    private Integer durationMinutes;

    @Builder.Default
    private SlotStatus status = SlotStatus.LIVRE;

    private String appointmentId;
    private String patientId;
    private String patientName;

    private String notes;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
