package com.activeage.core.services;

import com.activeage.core.domain.enums.DoctorDossierStatus;
import com.activeage.core.domain.enums.DocumentStatus;
import com.activeage.core.domain.enums.DocumentType;
import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.models.DoctorDocumentInfo;
import com.activeage.core.domain.models.DoctorFinancialInfo;
import com.activeage.core.domain.models.User;
import com.activeage.core.dtos.requests.DoctorReviewRequest;
import com.activeage.core.dtos.responses.AdminDoctorItemResponse;
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

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminCredentialingServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private FileStorageService fileStorageService;

    @Mock
    private AuditService auditService;

    @Mock
    private DoctorCredentialingService doctorCredentialingService;

    @InjectMocks
    private AdminCredentialingService adminCredentialingService;

    private User doctor;
    private User admin;

    @BeforeEach
    void setUp() {
        doctor = new User();
        doctor.setId("doc-123");
        doctor.setFullName("Dr. Roberto Silva");
        doctor.setEmail("roberto@activeage.com");
        doctor.setCrm("123456");
        doctor.setUfCrm("SP");
        doctor.setRole(Role.ROLE_MEDICO);
        doctor.setDossierStatus(DoctorDossierStatus.UNDER_REVIEW);
        doctor.setCreatedAt(LocalDateTime.now().minusDays(5));

        DoctorFinancialInfo finInfo = new DoctorFinancialInfo();
        finInfo.setPixKey("roberto@activeage.com");
        doctor.setFinancialInfo(finInfo);

        Map<String, DoctorDocumentInfo> docs = new HashMap<>();
        DoctorDocumentInfo crmDoc = new DoctorDocumentInfo();
        crmDoc.setDocumentType(DocumentType.CRM_CARD);
        crmDoc.setStoredFileName("stored_crm.pdf");
        crmDoc.setOriginalFileName("crm_roberto.pdf");
        crmDoc.setStatus(DocumentStatus.UPLOADED);
        docs.put(DocumentType.CRM_CARD.name(), crmDoc);
        doctor.setDocuments(docs);

        admin = new User();
        admin.setId("admin-999");
        admin.setEmail("admin@activeage.com");
        admin.setRole(Role.ROLE_ADMIN);
    }

    @Test
    @DisplayName("Deve listar médicos na fila com filtro de status")
    void getDoctorsQueue_withFilter() {
        when(userRepository.findByRoleAndDossierStatus(Role.ROLE_MEDICO, DoctorDossierStatus.UNDER_REVIEW))
                .thenReturn(List.of(doctor));

        List<AdminDoctorItemResponse> queue = adminCredentialingService.getDoctorsQueue(DoctorDossierStatus.UNDER_REVIEW);

        assertEquals(1, queue.size());
        assertEquals("Dr. Roberto Silva", queue.get(0).getFullName());
        assertTrue(queue.get(0).isHasFinancialInfo());
        assertEquals(1, queue.get(0).getUploadedDocsCount());
    }

    @Test
    @DisplayName("Deve listar todos os médicos na fila sem filtro")
    void getDoctorsQueue_noFilter() {
        when(userRepository.findByRole(Role.ROLE_MEDICO)).thenReturn(List.of(doctor));

        List<AdminDoctorItemResponse> queue = adminCredentialingService.getDoctorsQueue(null);

        assertEquals(1, queue.size());
        verify(userRepository).findByRole(Role.ROLE_MEDICO);
    }

    @Test
    @DisplayName("Deve carregar dossiê completo e auditar a visualização")
    void getDoctorDossier_success() {
        when(userRepository.findById("doc-123")).thenReturn(Optional.of(doctor));
        when(userRepository.findByEmail("admin@activeage.com")).thenReturn(Optional.of(admin));
        when(doctorCredentialingService.buildDossierResponse(doctor))
                .thenReturn(DoctorDossierStatusResponse.builder().doctorId("doc-123").build());

        DoctorDossierStatusResponse res = adminCredentialingService.getDoctorDossier("doc-123", "admin@activeage.com", "127.0.0.1");

        assertNotNull(res);
        verify(auditService).log(eq("admin-999"), eq("admin@activeage.com"), eq("ROLE_ADMIN"),
                eq("VIEW_DOSSIER"), eq("doc-123"), anyString(), eq("127.0.0.1"));
    }

    @Test
    @DisplayName("Deve lançar exceção ao buscar dossiê de médico inexistente")
    void getDoctorDossier_notFound() {
        when(userRepository.findById("invalido")).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class, () ->
                adminCredentialingService.getDoctorDossier("invalido", "admin@activeage.com", "127.0.0.1"));
    }

    @Test
    @DisplayName("Deve carregar resource do documento e auditar")
    void getDoctorDocumentResource_success() {
        when(userRepository.findById("doc-123")).thenReturn(Optional.of(doctor));
        when(userRepository.findByEmail("admin@activeage.com")).thenReturn(Optional.of(admin));
        Resource mockResource = new ByteArrayResource(new byte[]{1, 2, 3});
        when(fileStorageService.loadDocumentAsResource("doc-123", "stored_crm.pdf")).thenReturn(mockResource);

        Resource res = adminCredentialingService.getDoctorDocumentResource("doc-123", DocumentType.CRM_CARD, "admin@activeage.com", "127.0.0.1");

        assertNotNull(res);
        verify(fileStorageService).loadDocumentAsResource("doc-123", "stored_crm.pdf");
        verify(auditService).log(any(), any(), any(), eq("VIEW_DOCUMENT"), eq("doc-123"), any(), eq("127.0.0.1"));
    }

    @Test
    @DisplayName("Deve lançar exceção ao buscar documento que o médico não enviou")
    void getDoctorDocumentResource_missingDocument() {
        when(userRepository.findById("doc-123")).thenReturn(Optional.of(doctor));

        assertThrows(IllegalArgumentException.class, () ->
                adminCredentialingService.getDoctorDocumentResource("doc-123", DocumentType.DIPLOMA, "admin@activeage.com", "127.0.0.1"));
    }

    @Test
    @DisplayName("Deve retornar informações do documento do médico")
    void getDoctorDocumentInfo_success() {
        when(userRepository.findById("doc-123")).thenReturn(Optional.of(doctor));

        DoctorDocumentInfo info = adminCredentialingService.getDoctorDocumentInfo("doc-123", DocumentType.CRM_CARD);

        assertNotNull(info);
        assertEquals("stored_crm.pdf", info.getStoredFileName());
    }

    @Test
    @DisplayName("Deve aprovar dossiê médico com sucesso e auditar")
    void reviewDoctor_approve() {
        when(userRepository.findById("doc-123")).thenReturn(Optional.of(doctor));
        when(userRepository.findByEmail("admin@activeage.com")).thenReturn(Optional.of(admin));
        when(doctorCredentialingService.buildDossierResponse(doctor))
                .thenReturn(DoctorDossierStatusResponse.builder().dossierStatus(DoctorDossierStatus.APPROVED).build());

        DoctorReviewRequest req = new DoctorReviewRequest();
        req.setAction("APPROVE");

        DoctorDossierStatusResponse res = adminCredentialingService.reviewDoctor("doc-123", req, "admin@activeage.com", "127.0.0.1");

        assertNotNull(res);
        assertEquals(DoctorDossierStatus.APPROVED, doctor.getDossierStatus());
        assertNotNull(doctor.getApprovedAt());
        assertNotNull(doctor.getTrialExpiresAt());
        verify(userRepository).save(doctor);
        verify(auditService).log(any(), any(), any(), eq("REVIEW_DOSSIER_APPROVE"), eq("doc-123"), any(), any());
    }

    @Test
    @DisplayName("Deve rejeitar dossiê médico com justificativa válida e auditar")
    void reviewDoctor_reject() {
        when(userRepository.findById("doc-123")).thenReturn(Optional.of(doctor));
        when(userRepository.findByEmail("admin@activeage.com")).thenReturn(Optional.of(admin));
        when(doctorCredentialingService.buildDossierResponse(doctor))
                .thenReturn(DoctorDossierStatusResponse.builder().dossierStatus(DoctorDossierStatus.DOCS_REJECTED).build());

        DoctorReviewRequest req = new DoctorReviewRequest();
        req.setAction("REJECT");
        req.setRejectionReason("Documento de CRM ilegível e sem carimbo.");

        DoctorDossierStatusResponse res = adminCredentialingService.reviewDoctor("doc-123", req, "admin@activeage.com", "127.0.0.1");

        assertNotNull(res);
        assertEquals(DoctorDossierStatus.DOCS_REJECTED, doctor.getDossierStatus());
        assertEquals("Documento de CRM ilegível e sem carimbo.", doctor.getRejectionReason());
        verify(userRepository).save(doctor);
        verify(auditService).log(any(), any(), any(), eq("REVIEW_DOSSIER_REJECT"), eq("doc-123"), any(), any());
    }

    @Test
    @DisplayName("Deve impedir rejeição de dossiê com justificativa curta ou ausente")
    void reviewDoctor_rejectWithoutReason() {
        when(userRepository.findById("doc-123")).thenReturn(Optional.of(doctor));

        DoctorReviewRequest req = new DoctorReviewRequest();
        req.setAction("REJECT");
        req.setRejectionReason("Curto");

        assertThrows(IllegalArgumentException.class, () ->
                adminCredentialingService.reviewDoctor("doc-123", req, "admin@activeage.com", "127.0.0.1"));
    }

    @Test
    @DisplayName("Deve lançar exceção para ação inválida de revisão")
    void reviewDoctor_invalidAction() {
        when(userRepository.findById("doc-123")).thenReturn(Optional.of(doctor));

        DoctorReviewRequest req = new DoctorReviewRequest();
        req.setAction("INVENTADA");

        assertThrows(IllegalArgumentException.class, () ->
                adminCredentialingService.reviewDoctor("doc-123", req, "admin@activeage.com", "127.0.0.1"));
    }
}
