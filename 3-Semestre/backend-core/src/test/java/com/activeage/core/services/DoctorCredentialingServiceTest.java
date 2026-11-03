package com.activeage.core.services;

import com.activeage.core.domain.enums.DoctorDossierStatus;
import com.activeage.core.domain.enums.DocumentStatus;
import com.activeage.core.domain.enums.DocumentType;
import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.models.DoctorDocumentInfo;
import com.activeage.core.domain.models.DoctorFinancialInfo;
import com.activeage.core.domain.models.User;
import com.activeage.core.dtos.requests.DoctorFinancialInfoRequest;
import com.activeage.core.dtos.responses.DoctorDossierStatusResponse;
import com.activeage.core.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.mock.web.MockMultipartFile;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DoctorCredentialingServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private AuditService auditService;

    @InjectMocks
    private DoctorCredentialingService doctorCredentialingService;

    private User doctor;

    @BeforeEach
    void setUp() {
        doctor = new User();
        doctor.setId("doc-123");
        doctor.setEmail("medico@activeage.com");
        doctor.setFullName("Dr. Ada Lovelace");
        doctor.setRole(Role.ROLE_MEDICO);
        doctor.setDocuments(new HashMap<>());
    }

    @Test
    @DisplayName("Deve consultar status do dossiê do médico")
    void getStatus_success() {
        when(userRepository.findByEmail("medico@activeage.com")).thenReturn(Optional.of(doctor));

        DoctorDossierStatusResponse res = doctorCredentialingService.getStatus("medico@activeage.com");

        assertNotNull(res);
        assertEquals("doc-123", res.getDoctorId());
        assertEquals(DoctorDossierStatus.PENDING_DOCS, res.getDossierStatus());
        assertFalse(res.isCanSubmit());
    }

    @Test
    @DisplayName("Deve realizar upload de documento e remover anterior se existir")
    void uploadDocument_success() {
        DoctorDocumentInfo previous = new DoctorDocumentInfo();
        previous.setStoredFileName("old.pdf");
        doctor.getDocuments().put(DocumentType.CRM_CARD.name(), previous);

        when(userRepository.findByEmail("medico@activeage.com")).thenReturn(Optional.of(doctor));

        DoctorDocumentInfo newDoc = new DoctorDocumentInfo();
        newDoc.setStoredFileName("new.pdf");
        newDoc.setOriginalFileName("crm.pdf");
        newDoc.setStatus(DocumentStatus.UPLOADED);

        MockMultipartFile file = new MockMultipartFile("file", "crm.pdf", "application/pdf", new byte[]{1, 2});
        when(fileStorageService.storeDocument(eq("doc-123"), eq(DocumentType.CRM_CARD), eq(file))).thenReturn(newDoc);

        DoctorDocumentInfo result = doctorCredentialingService.uploadDocument("medico@activeage.com", DocumentType.CRM_CARD, file, "127.0.0.1");

        assertNotNull(result);
        assertEquals("new.pdf", result.getStoredFileName());
        verify(fileStorageService).deleteDocument("doc-123", "old.pdf");
        verify(userRepository).save(doctor);
        verify(auditService).log(any(), any(), any(), eq("UPLOAD_DOCUMENT"), any(), any(), any());
    }

    @Test
    @DisplayName("Deve atualizar dados bancários do médico para split")
    void updateFinancialInfo_success() {
        when(userRepository.findByEmail("medico@activeage.com")).thenReturn(Optional.of(doctor));

        DoctorFinancialInfoRequest req = new DoctorFinancialInfoRequest();
        req.setBankName("341 - Itaú");
        req.setAgency("1234");
        req.setAccountNumber("56789-0");
        req.setAccountType("CORRENTE");
        req.setPixKey("medico@activeage.com");
        req.setPixKeyType("EMAIL");

        DoctorFinancialInfo fin = doctorCredentialingService.updateFinancialInfo("medico@activeage.com", req, "127.0.0.1");

        assertNotNull(fin);
        assertEquals("medico@activeage.com", fin.getPixKey());
        verify(userRepository).save(doctor);
        verify(auditService).log(any(), any(), any(), eq("UPDATE_FINANCIAL_INFO"), any(), any(), any());
    }

    @Test
    @DisplayName("Deve submeter dossiê completo com todos os documentos e financeiro")
    void submitDossier_success() {
        for (DocumentType type : DocumentType.values()) {
            doctor.getDocuments().put(type.name(), new DoctorDocumentInfo());
        }
        DoctorFinancialInfo fin = new DoctorFinancialInfo();
        fin.setPixKey("chave-pix");
        doctor.setFinancialInfo(fin);

        when(userRepository.findByEmail("medico@activeage.com")).thenReturn(Optional.of(doctor));

        DoctorDossierStatusResponse res = doctorCredentialingService.submitDossier("medico@activeage.com", "127.0.0.1");

        assertNotNull(res);
        assertEquals(DoctorDossierStatus.UNDER_REVIEW, doctor.getDossierStatus());
        assertNotNull(doctor.getSubmittedAt());
        verify(userRepository).save(doctor);
        verify(auditService).log(any(), any(), any(), eq("SUBMIT_DOSSIER"), any(), any(), any());
    }

    @Test
    @DisplayName("Deve impedir submissão com documentos obrigatórios faltantes")
    void submitDossier_missingMandatoryDocs() {
        when(userRepository.findByEmail("medico@activeage.com")).thenReturn(Optional.of(doctor));

        assertThrows(IllegalArgumentException.class, () ->
                doctorCredentialingService.submitDossier("medico@activeage.com", "127.0.0.1"));
    }

    @Test
    @DisplayName("Deve carregar recurso de documento próprio do médico")
    void getDoctorOwnDocument_success() {
        DoctorDocumentInfo docInfo = new DoctorDocumentInfo();
        docInfo.setStoredFileName("meu_diploma.pdf");
        doctor.getDocuments().put(DocumentType.DIPLOMA.name(), docInfo);

        when(userRepository.findByEmail("medico@activeage.com")).thenReturn(Optional.of(doctor));
        when(fileStorageService.loadDocumentAsResource("doc-123", "meu_diploma.pdf"))
                .thenReturn(new ByteArrayResource(new byte[]{1}));

        Resource res = doctorCredentialingService.getDoctorOwnDocument("medico@activeage.com", DocumentType.DIPLOMA);

        assertNotNull(res);
        verify(fileStorageService).loadDocumentAsResource("doc-123", "meu_diploma.pdf");
    }

    @Test
    @DisplayName("Deve retornar metadados do documento do médico")
    void getDoctorDocumentInfo_success() {
        DoctorDocumentInfo docInfo = new DoctorDocumentInfo();
        docInfo.setStoredFileName("meu_diploma.pdf");
        doctor.getDocuments().put(DocumentType.DIPLOMA.name(), docInfo);

        when(userRepository.findByEmail("medico@activeage.com")).thenReturn(Optional.of(doctor));

        DoctorDocumentInfo res = doctorCredentialingService.getDoctorDocumentInfo("medico@activeage.com", DocumentType.DIPLOMA);

        assertNotNull(res);
        assertEquals("meu_diploma.pdf", res.getStoredFileName());
    }
}
