package com.activeage.core.domain.models;

import com.activeage.core.domain.enums.ExamCategory;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Entidade que representa um exame prévio ou laudo médico anexado pelo paciente (UC11 / RF008).
 * Mapeada para a coleção 'patient_exams' no MongoDB Atlas com arquivos armazenados no GridFS.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "patient_exams")
public class PatientExam {

    @Id
    private String id;

    /**
     * ID do paciente titular do exame (User.id).
     */
    private String patientId;

    /**
     * Título descritivo do exame (ex: "Hemograma e Perfil Lipídico").
     */
    private String title;

    /**
     * Categoria clínica do exame.
     */
    private ExamCategory category;

    /**
     * Data em que o exame foi realizado pelo paciente.
     */
    private LocalDate examDate;

    /**
     * Observações adicionais inseridas pelo paciente ou cuidador.
     */
    private String notes;

    /**
     * Nome identificador do arquivo gravado no MongoDB GridFS.
     */
    private String storedFileName;

    /**
     * Nome original do arquivo enviado na requisição multipart.
     */
    private String originalFileName;

    /**
     * Tipo MIME do arquivo (application/pdf, image/jpeg, etc.).
     */
    private String contentType;

    /**
     * Tamanho do arquivo em bytes.
     */
    private long sizeBytes;

    /**
     * Timestamp de quando o exame foi anexado à plataforma.
     */
    private LocalDateTime uploadedAt;
}
