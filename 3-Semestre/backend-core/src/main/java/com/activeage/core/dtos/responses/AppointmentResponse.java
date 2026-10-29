package com.activeage.core.dtos.responses;

import com.activeage.core.domain.enums.AppointmentStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AppointmentResponse {

    private String id;
    private String patientId;
    private String patientName;
    private String doctorId;
    private String doctorName;
    private String doctorCrm;
    private String doctorUfCrm;
    private String doctorSpecialty;
    private String slotId;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private Integer durationMinutes;
    private BigDecimal consultationFee;
    private AppointmentStatus status;
    private String patientNotes;
    private String meetRoomId;
    private boolean canCancel;
    private LocalDateTime createdAt;
}
