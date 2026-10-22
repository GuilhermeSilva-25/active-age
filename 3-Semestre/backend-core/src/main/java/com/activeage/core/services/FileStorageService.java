package com.activeage.core.services;

import com.activeage.core.domain.enums.DocumentStatus;
import com.activeage.core.domain.enums.DocumentType;
import com.activeage.core.domain.models.DoctorDocumentInfo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

/**
 * Serviço responsável pelo armazenamento isolado e seguro dos documentos do Dossiê Médico.
 * Os arquivos são gravados fora do web root público, impedindo qualquer acesso direto
 * não autenticado por URL estática (RN007).
 */
@Service
public class FileStorageService {

    private final Path rootLocation;
    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/jpg"
    );

    public FileStorageService(@Value("${activeage.upload.dir:uploads/dossiers}") String uploadDir) {
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
        } catch (IOException e) {
            throw new RuntimeException("Não foi possível inicializar o diretório de armazenamento de documentos.", e);
        }
    }

    /**
     * Valida e armazena um arquivo do dossiê médico em diretório isolado por médico.
     *
     * @param doctorId ID do médico titular.
     * @param documentType Tipo do documento sendo submetido.
     * @param file Arquivo binário enviado na requisição multipart.
     * @return Metadados do documento salvo.
     */
    public DoctorDocumentInfo storeDocument(String doctorId, DocumentType documentType, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("O arquivo enviado não pode ser vazio.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("O arquivo excede o limite máximo permitido de 10MB.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Formato não suportado. Por favor, envie arquivos PDF, JPG ou PNG.");
        }

        try {
            Path doctorDir = this.rootLocation.resolve(doctorId).normalize();
            Files.createDirectories(doctorDir);

            String originalFileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "documento";
            String extension = getFileExtension(originalFileName);
            String storedFileName = documentType.name().toLowerCase() + "_" + UUID.randomUUID() + extension;

            Path targetLocation = doctorDir.resolve(storedFileName).normalize();

            // Proteção contra Path Traversal
            if (!targetLocation.startsWith(doctorDir)) {
                throw new SecurityException("Tentativa de acesso ilegal a caminho de arquivo.");
            }

            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            DoctorDocumentInfo docInfo = new DoctorDocumentInfo();
            docInfo.setDocumentType(documentType);
            docInfo.setOriginalFileName(originalFileName);
            docInfo.setStoredFileName(storedFileName);
            docInfo.setContentType(contentType);
            docInfo.setSizeBytes(file.getSize());
            docInfo.setUploadedAt(LocalDateTime.now());
            docInfo.setStatus(DocumentStatus.UPLOADED);

            return docInfo;

        } catch (IOException e) {
            throw new RuntimeException("Falha ao salvar o documento no servidor seguro.", e);
        }
    }

    /**
     * Carrega um documento como Resource para streaming seguro via endpoint autenticado.
     *
     * @param doctorId ID do médico.
     * @param storedFileName Nome do arquivo armazenado.
     * @return Resource para envio no corpo da resposta HTTP.
     */
    public Resource loadDocumentAsResource(String doctorId, String storedFileName) {
        try {
            Path doctorDir = this.rootLocation.resolve(doctorId).normalize();
            Path filePath = doctorDir.resolve(storedFileName).normalize();

            if (!filePath.startsWith(doctorDir)) {
                throw new SecurityException("Tentativa de acesso ilegal a caminho de arquivo.");
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new IllegalArgumentException("Documento não encontrado ou inacessível no servidor.");
            }
        } catch (MalformedURLException e) {
            throw new IllegalArgumentException("Caminho do documento inválido.", e);
        }
    }

    /**
     * Remove um arquivo anterior caso o médico faça o reenvio de um documento corrigido.
     */
    public void deleteDocument(String doctorId, String storedFileName) {
        try {
            Path doctorDir = this.rootLocation.resolve(doctorId).normalize();
            Path filePath = doctorDir.resolve(storedFileName).normalize();
            if (filePath.startsWith(doctorDir)) {
                Files.deleteIfExists(filePath);
            }
        } catch (IOException ignored) {
        }
    }

    private String getFileExtension(String filename) {
        int lastDotIndex = filename.lastIndexOf('.');
        if (lastDotIndex > 0 && lastDotIndex < filename.length() - 1) {
            return filename.substring(lastDotIndex).toLowerCase();
        }
        return ".bin";
    }
}
