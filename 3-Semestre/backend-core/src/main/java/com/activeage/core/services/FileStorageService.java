package com.activeage.core.services;

import com.activeage.core.domain.enums.DocumentStatus;
import com.activeage.core.domain.enums.DocumentType;
import com.activeage.core.domain.models.DoctorDocumentInfo;
import com.mongodb.client.gridfs.model.GridFSFile;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
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
 * Serviço responsável pelo armazenamento isolado, seguro e persistente dos documentos do Dossiê Médico
 * e fotos de perfil (avatares) dos usuários.
 *
 * Arquitetura de Nuvem Resiliente (Render + MongoDB Atlas):
 * Os arquivos são persistidos no MongoDB GridFS (na nuvem do Atlas), garantindo que sobrevivam
 * a qualquer reinicialização, modo de espera ou novo deploy em contêineres Docker efêmeros.
 */
@Slf4j
@Service
public class FileStorageService {

    private final GridFsTemplate gridFsTemplate;
    private final Path rootLocation;
    private final Path avatarLocation;

    private static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    private static final long MAX_AVATAR_SIZE = 5 * 1024 * 1024; // 5 MB

    private static final List<String> ALLOWED_CONTENT_TYPES = Arrays.asList(
            "application/pdf",
            "image/jpeg",
            "image/png",
            "image/jpg"
    );

    private static final List<String> ALLOWED_AVATAR_CONTENT_TYPES = Arrays.asList(
            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/webp"
    );

    public FileStorageService(
            GridFsTemplate gridFsTemplate,
            @Value("${activeage.upload.dir:uploads/dossiers}") String uploadDir,
            @Value("${activeage.upload.avatar-dir:uploads/avatars}") String avatarDir) {
        this.gridFsTemplate = gridFsTemplate;
        this.rootLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.avatarLocation = Paths.get(avatarDir).toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.rootLocation);
            Files.createDirectories(this.avatarLocation);
        } catch (IOException e) {
            log.warn("Aviso: Diretórios locais de upload não puderam ser criados. Utilizando MongoDB GridFS como armazenamento primário.");
        }
    }

    /**
     * Valida e armazena um arquivo do dossiê médico de forma persistente no MongoDB GridFS.
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
            String originalFileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "documento";
            String extension = getFileExtension(originalFileName);
            String storedFileName = documentType.name().toLowerCase() + "_" + doctorId + "_" + UUID.randomUUID() + extension;

            // 1. Armazenamento Primário e Persistente no MongoDB GridFS (Nuvem Atlas)
            gridFsTemplate.store(file.getInputStream(), storedFileName, contentType);
            log.info("Documento salvo com sucesso no MongoDB GridFS: {}", storedFileName);

            // 2. Cache local (opcional / se sistema de arquivos local estiver acessível)
            try {
                Path doctorDir = this.rootLocation.resolve(doctorId).normalize();
                Files.createDirectories(doctorDir);
                Path targetLocation = doctorDir.resolve(storedFileName).normalize();
                if (targetLocation.startsWith(doctorDir)) {
                    Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
                }
            } catch (Exception ex) {
                log.debug("Cache local de arquivo não pôde ser gravado (normal em contêineres efêmeros): {}", ex.getMessage());
            }

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
     * Busca prioritariamente no MongoDB GridFS; caso ausente, verifica o disco local.
     *
     * @param doctorId ID do médico.
     * @param storedFileName Nome do arquivo armazenado.
     * @return Resource para envio no corpo da resposta HTTP.
     */
    public Resource loadDocumentAsResource(String doctorId, String storedFileName) {
        // 1. Tenta carregar do MongoDB GridFS
        try {
            GridFSFile gridFsFile = gridFsTemplate.findOne(Query.query(Criteria.where("filename").is(storedFileName)));
            if (gridFsFile != null) {
                GridFsResource resource = gridFsTemplate.getResource(gridFsFile);
                if (resource.exists() && resource.isReadable()) {
                    return resource;
                }
            }
        } catch (Exception ex) {
            log.warn("Erro ao buscar documento no MongoDB GridFS: {}", ex.getMessage());
        }

        // 2. Fallback para disco local (para arquivos antigos que possam estar no disco)
        try {
            Path doctorDir = this.rootLocation.resolve(doctorId).normalize();
            Path filePath = doctorDir.resolve(storedFileName).normalize();

            if (!filePath.startsWith(doctorDir)) {
                throw new SecurityException("Tentativa de acesso ilegal a caminho de arquivo.");
            }

            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            }
        } catch (MalformedURLException ignored) {
        }

        throw new IllegalArgumentException("Documento não encontrado ou inacessível no servidor.");
    }

    /**
     * Remove um arquivo anterior caso o médico faça o reenvio de um documento corrigido.
     */
    public void deleteDocument(String doctorId, String storedFileName) {
        if (storedFileName == null || storedFileName.isBlank()) return;

        // 1. Remove do MongoDB GridFS
        try {
            gridFsTemplate.delete(Query.query(Criteria.where("filename").is(storedFileName)));
            log.info("Documento removido do MongoDB GridFS: {}", storedFileName);
        } catch (Exception ex) {
            log.warn("Erro ao remover documento do GridFS: {}", ex.getMessage());
        }

        // 2. Remove do disco local se existir
        try {
            Path doctorDir = this.rootLocation.resolve(doctorId).normalize();
            Path filePath = doctorDir.resolve(storedFileName).normalize();
            if (filePath.startsWith(doctorDir)) {
                Files.deleteIfExists(filePath);
            }
        } catch (IOException ignored) {
        }
    }

    /**
     * Valida e armazena a foto de perfil (avatar) do usuário de forma persistente no MongoDB GridFS.
     *
     * @param userId ID do usuário titular.
     * @param file Imagem enviada na requisição multipart.
     * @return Nome do arquivo salvo.
     */
    public String storeAvatar(String userId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("A foto de perfil não pode ser vazia.");
        }

        if (file.getSize() > MAX_AVATAR_SIZE) {
            throw new IllegalArgumentException("A foto de perfil excede o limite máximo permitido de 5MB.");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_AVATAR_CONTENT_TYPES.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Formato não suportado. Por favor, envie imagens JPG, PNG ou WEBP.");
        }

        try {
            String originalFileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "avatar.jpg";
            String extension = getFileExtension(originalFileName);
            String storedFileName = "avatar_" + userId + "_" + UUID.randomUUID() + extension;

            // 1. Armazenamento Primário e Persistente no MongoDB GridFS (Nuvem Atlas)
            gridFsTemplate.store(file.getInputStream(), storedFileName, contentType);
            log.info("Avatar persistido com sucesso no MongoDB GridFS: {}", storedFileName);

            // 2. Cache local (opcional)
            try {
                Path targetLocation = this.avatarLocation.resolve(storedFileName).normalize();
                if (targetLocation.startsWith(this.avatarLocation)) {
                    Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
                }
            } catch (Exception ex) {
                log.debug("Cache local de avatar não gravado (normal em contêineres efêmeros): {}", ex.getMessage());
            }

            return storedFileName;

        } catch (IOException e) {
            throw new RuntimeException("Falha ao salvar a foto de perfil no servidor.", e);
        }
    }

    /**
     * Carrega a foto de perfil como recurso para download ou exibição em tela.
     * Busca prioritariamente no MongoDB GridFS; caso ausente, verifica o disco local.
     */
    public Resource loadAvatarResource(String storedFileName) {
        // 1. Tenta carregar do MongoDB GridFS
        try {
            GridFSFile gridFsFile = gridFsTemplate.findOne(Query.query(Criteria.where("filename").is(storedFileName)));
            if (gridFsFile != null) {
                GridFsResource resource = gridFsTemplate.getResource(gridFsFile);
                if (resource.exists() && resource.isReadable()) {
                    return resource;
                }
            }
        } catch (Exception ex) {
            log.warn("Erro ao buscar avatar no MongoDB GridFS: {}", ex.getMessage());
        }

        // 2. Fallback para disco local (para arquivos legados que possam ter ficado no disco)
        try {
            Path filePath = this.avatarLocation.resolve(storedFileName).normalize();
            if (filePath.startsWith(this.avatarLocation)) {
                Resource resource = new UrlResource(filePath.toUri());
                if (resource.exists() && resource.isReadable()) {
                    return resource;
                }
            }
        } catch (MalformedURLException ignored) {
        }

        throw new IllegalArgumentException("Foto de perfil não encontrada no servidor.");
    }

    /**
     * Remove um avatar antigo após a substituição.
     */
    public void deleteAvatar(String storedFileName) {
        if (storedFileName == null || storedFileName.isBlank()) return;

        // 1. Remove do MongoDB GridFS
        try {
            gridFsTemplate.delete(Query.query(Criteria.where("filename").is(storedFileName)));
            log.info("Avatar removido do MongoDB GridFS: {}", storedFileName);
        } catch (Exception ex) {
            log.warn("Erro ao remover avatar do GridFS: {}", ex.getMessage());
        }

        // 2. Remove do disco local se existir
        try {
            Path filePath = this.avatarLocation.resolve(storedFileName).normalize();
            if (filePath.startsWith(this.avatarLocation)) {
                Files.deleteIfExists(filePath);
            }
        } catch (IOException ignored) {
        }
    }

    /**
     * Valida e armazena um exame prévio ou laudo médico do paciente no MongoDB GridFS (UC11 / RF008).
     *
     * @param patientId ID do paciente titular.
     * @param file Arquivo do laudo/exame em formato PDF ou imagem.
     * @return Nome único identificador do arquivo salvo no GridFS.
     */
    public String storePatientExam(String patientId, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("O arquivo do exame não pode ser vazio.");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("O arquivo excede o limite máximo permitido de 10MB.");
        }

        String contentType = file.getContentType();
        List<String> allowedExamTypes = Arrays.asList(
                "application/pdf",
                "image/jpeg",
                "image/png",
                "image/jpg",
                "image/webp"
        );

        if (contentType == null || !allowedExamTypes.contains(contentType.toLowerCase())) {
            throw new IllegalArgumentException("Formato não suportado. Por favor, envie laudos em PDF, JPG, PNG ou WEBP.");
        }

        try {
            String originalFileName = file.getOriginalFilename() != null ? file.getOriginalFilename() : "exame";
            String extension = getFileExtension(originalFileName);
            String storedFileName = "exam_" + patientId + "_" + UUID.randomUUID() + extension;

            // Armazenamento Primário no MongoDB GridFS (Atlas)
            gridFsTemplate.store(file.getInputStream(), storedFileName, contentType);
            log.info("Exame do paciente persistido com sucesso no MongoDB GridFS: {}", storedFileName);

            return storedFileName;

        } catch (IOException e) {
            throw new RuntimeException("Falha ao salvar o exame prévio no cofre de saúde.", e);
        }
    }

    /**
     * Carrega o arquivo binário do exame prévio do paciente como recurso a partir do MongoDB GridFS.
     */
    public Resource loadPatientExamResource(String storedFileName) {
        try {
            GridFSFile gridFsFile = gridFsTemplate.findOne(Query.query(Criteria.where("filename").is(storedFileName)));
            if (gridFsFile != null) {
                GridFsResource resource = gridFsTemplate.getResource(gridFsFile);
                if (resource.exists() && resource.isReadable()) {
                    return resource;
                }
            }
        } catch (Exception ex) {
            log.warn("Erro ao buscar exame do paciente no MongoDB GridFS: {}", ex.getMessage());
        }

        throw new IllegalArgumentException("Arquivo do exame não encontrado no cofre de saúde.");
    }

    /**
     * Remove o arquivo do exame prévio do paciente do MongoDB GridFS.
     */
    public void deletePatientExam(String storedFileName) {
        if (storedFileName == null || storedFileName.isBlank()) return;

        try {
            gridFsTemplate.delete(Query.query(Criteria.where("filename").is(storedFileName)));
            log.info("Exame do paciente removido com sucesso do MongoDB GridFS: {}", storedFileName);
        } catch (Exception ex) {
            log.warn("Erro ao remover exame do GridFS: {}", ex.getMessage());
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
