package com.activeage.core.dtos.requests;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSlotRequest {

    @NotNull(message = "A data e hora de início são obrigatórias.")
    @Future(message = "O horário deve ser agendado para uma data e hora futura.")
    private LocalDateTime startDateTime;

    @Builder.Default
    private Integer durationMinutes = 50;

    private String notes;
}
