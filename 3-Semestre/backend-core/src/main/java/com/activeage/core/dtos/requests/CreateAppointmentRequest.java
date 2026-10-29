package com.activeage.core.dtos.requests;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateAppointmentRequest {

    @NotBlank(message = "A seleção do horário de atendimento é obrigatória.")
    private String slotId;

    private String patientNotes;
}
