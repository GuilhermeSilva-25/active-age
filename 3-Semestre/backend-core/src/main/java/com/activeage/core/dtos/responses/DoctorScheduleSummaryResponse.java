package com.activeage.core.dtos.responses;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorScheduleSummaryResponse {
    private long totalSlots;
    private long totalFreeSlots;
    private long totalBookedSlots;
    private long totalBlockedSlots;
    private double occupancyRatePercentage;
}
