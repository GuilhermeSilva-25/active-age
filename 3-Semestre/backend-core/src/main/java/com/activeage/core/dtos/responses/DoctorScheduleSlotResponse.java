package com.activeage.core.dtos.responses;

import com.activeage.core.domain.enums.SlotStatus;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorScheduleSlotResponse {
    private String id;
    private String doctorId;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private Integer durationMinutes;
    private SlotStatus status;
    private String appointmentId;
    private String patientId;
    private String patientName;
    private String notes;
}
