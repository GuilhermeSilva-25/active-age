package com.activeage.core.domain.models;

import com.activeage.core.domain.enums.DocumentStatus;
import com.activeage.core.domain.enums.DocumentType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Metadados de um documento anexado pelo médico geriatra em seu Dossiê de Credenciamento.
 * O arquivo binário real é armazenado fora do web root em diretório privado e seguro (RN007).
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorDocumentInfo {
    private DocumentType documentType;
    private String originalFileName;
    private String storedFileName;
    private String contentType;
    private long sizeBytes;
    private LocalDateTime uploadedAt;
    private DocumentStatus status;
}
