package com.activeage.core.services;

import com.activeage.core.domain.enums.DocumentType;
import com.activeage.core.domain.models.DoctorDocumentInfo;
import com.mongodb.client.gridfs.model.GridFSFile;
import org.bson.BsonObjectId;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.Resource;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.data.mongodb.gridfs.GridFsResource;
import org.springframework.data.mongodb.gridfs.GridFsTemplate;
import org.springframework.mock.web.MockMultipartFile;

import java.io.InputStream;
import java.nio.file.Path;
import java.util.Date;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FileStorageServiceTest {

    @Mock
    private GridFsTemplate gridFsTemplate;

    private FileStorageService fileStorageService;

    @TempDir
    Path tempDir;

    @BeforeEach
    void setUp() {
        fileStorageService = new FileStorageService(
                gridFsTemplate,
                tempDir.resolve("dossiers").toString(),
                tempDir.resolve("avatars").toString()
        );
    }

    @Test
    @DisplayName("Deve armazenar documento do dossiê médico com sucesso no GridFS")
    void storeDocument_success() {
        MockMultipartFile file = new MockMultipartFile(
                "file", "crm.pdf", "application/pdf", "%PDF-1.4 mock".getBytes()
        );
        ObjectId mockId = new ObjectId();
        when(gridFsTemplate.store(any(InputStream.class), anyString(), eq("application/pdf")))
                .thenReturn(mockId);

        DoctorDocumentInfo info = fileStorageService.storeDocument("doc-1", DocumentType.CRM_CARD, file);

        assertNotNull(info);
        assertEquals(DocumentType.CRM_CARD, info.getDocumentType());
        assertEquals("crm.pdf", info.getOriginalFileName());
        assertEquals("application/pdf", info.getContentType());
        assertTrue(info.getStoredFileName().startsWith("crm_card_doc-1_"));
    }

    @Test
    @DisplayName("Deve rejeitar arquivo nulo ou vazio")
    void storeDocument_emptyFile() {
        MockMultipartFile emptyFile = new MockMultipartFile("file", "vazio.pdf", "application/pdf", new byte[0]);

        assertThrows(IllegalArgumentException.class, () ->
                fileStorageService.storeDocument("doc-1", DocumentType.CRM_CARD, emptyFile));

        assertThrows(IllegalArgumentException.class, () ->
                fileStorageService.storeDocument("doc-1", DocumentType.CRM_CARD, null));
    }

    @Test
    @DisplayName("Deve rejeitar arquivo com tipo de conteúdo não permitido")
    void storeDocument_invalidContentType() {
        MockMultipartFile exeFile = new MockMultipartFile(
                "file", "malware.exe", "application/x-msdownload", "conteudo".getBytes()
        );

        assertThrows(IllegalArgumentException.class, () ->
                fileStorageService.storeDocument("doc-1", DocumentType.CRM_CARD, exeFile));
    }

    @Test
    @DisplayName("Deve rejeitar arquivo que excede tamanho máximo de 10MB")
    void storeDocument_exceedsSize() {
        byte[] bigContent = new byte[11 * 1024 * 1024]; // 11 MB
        MockMultipartFile bigFile = new MockMultipartFile(
                "file", "grande.pdf", "application/pdf", bigContent
        );

        assertThrows(IllegalArgumentException.class, () ->
                fileStorageService.storeDocument("doc-1", DocumentType.CRM_CARD, bigFile));
    }

    @Test
    @DisplayName("Deve armazenar avatar de usuário com sucesso")
    void storeAvatar_success() {
        MockMultipartFile avatarFile = new MockMultipartFile(
                "file", "rosto.png", "image/png", new byte[]{1, 2, 3}
        );
        ObjectId mockId = new ObjectId();
        when(gridFsTemplate.store(any(InputStream.class), anyString(), eq("image/png")))
                .thenReturn(mockId);

        String stored = fileStorageService.storeAvatar("user-1", avatarFile);

        assertNotNull(stored);
        assertTrue(stored.startsWith("avatar_user-1_"));
    }

    @Test
    @DisplayName("Deve armazenar exame prévio do paciente com sucesso")
    void storePatientExam_success() {
        MockMultipartFile examFile = new MockMultipartFile(
                "file", "ecg.jpg", "image/jpeg", new byte[]{1, 2, 3}
        );
        ObjectId mockId = new ObjectId();
        when(gridFsTemplate.store(any(InputStream.class), anyString(), eq("image/jpeg")))
                .thenReturn(mockId);

        String stored = fileStorageService.storePatientExam("pac-1", examFile);

        assertNotNull(stored);
        assertTrue(stored.startsWith("exam_pac-1_"));
    }

    @Test
    @DisplayName("Deve remover documento do GridFS")
    void deleteDocument_success() {
        fileStorageService.deleteDocument("doc-1", "doc-1_CRM.pdf");
        verify(gridFsTemplate).delete(any(Query.class));
    }

    @Test
    @DisplayName("Deve carregar exame do paciente do GridFS")
    void loadPatientExamResource_success() {
        GridFSFile realGridFSFile = new GridFSFile(
                new BsonObjectId(new ObjectId()),
                "exam_123.pdf",
                100L,
                261120,
                new Date(),
                new Document("_contentType", "application/pdf")
        );

        when(gridFsTemplate.findOne(any(Query.class))).thenReturn(realGridFSFile);
        GridFsResource mockResource = mock(GridFsResource.class);
        when(mockResource.exists()).thenReturn(true);
        when(mockResource.isReadable()).thenReturn(true);
        when(gridFsTemplate.getResource(realGridFSFile)).thenReturn(mockResource);

        Resource res = fileStorageService.loadPatientExamResource("exam_123.pdf");

        assertNotNull(res);
        assertTrue(res.exists());
    }
}
