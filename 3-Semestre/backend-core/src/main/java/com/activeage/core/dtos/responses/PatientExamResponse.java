package com.activeage.core.dtos.responses;

import com.activeage.core.domain.enums.ExamCategory;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * DTO de resposta para exibição de exames prévios no Cofre de Saúde do Paciente (UC11 / RF008).
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PatientExamResponse {

    private String id;
    private String patientId;
    private String title;
    private ExamCategory category;
    private String categoryDescription;
    private LocalDate examDate;
    private String notes;
    private String originalFileName;
    private String contentType;
    private long sizeBytes;
    private String formattedSize;
    private LocalDateTime uploadedAt;

    /**
     * Auxiliar para formatação legível do tamanho do arquivo (KB/MB).
     */
    public static String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        char pre = "KMGTPE".charAt(exp - 1);
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }
}
