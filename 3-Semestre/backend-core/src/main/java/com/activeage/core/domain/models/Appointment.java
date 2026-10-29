package com.activeage.core.domain.models;

import com.activeage.core.domain.enums.AppointmentStatus;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Entidade que representa uma teleconsulta agendada entre um paciente e um médico geriatra (UC09).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "appointments")
public class Appointment {

    @Id
    private String id;

    @Indexed
    private String patientId;
    private String patientName;
    private String patientEmail;
    private String patientPhone;

    @Indexed
    private String doctorId;
    private String doctorName;
    private String doctorCrm;
    private String doctorUfCrm;
    private String doctorSpecialty;

    @Indexed
    private String slotId;

    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private Integer durationMinutes;

    private BigDecimal consultationFee;

    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.AGENDADA;

    private String patientNotes;
    private String cancellationReason;

    private String meetRoomId;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
