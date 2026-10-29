package com.activeage.core.dtos.requests;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateBatchSlotsRequest {

    @NotNull(message = "A data de atendimento é obrigatória.")
    @FutureOrPresent(message = "A data de atendimento deve ser hoje ou uma data futura.")
    private LocalDate date;

    @NotNull(message = "O horário de início do turno é obrigatório.")
    private LocalTime startTime;

    @NotNull(message = "O horário de encerramento do turno é obrigatório.")
    private LocalTime endTime;

    @Builder.Default
    private Integer durationMinutes = 50;

    @Builder.Default
    private Integer breakMinutes = 10;

    private String notes;
}
