package com.activeage.core.services;

import com.activeage.core.domain.enums.DoctorDossierStatus;
import com.activeage.core.domain.enums.DocumentType;
import com.activeage.core.domain.models.DoctorDocumentInfo;
import com.activeage.core.domain.models.DoctorFinancialInfo;
import com.activeage.core.domain.models.User;
import com.activeage.core.dtos.requests.DoctorFinancialInfoRequest;
import com.activeage.core.dtos.responses.DoctorDossierStatusResponse;
import com.activeage.core.repositories.UserRepository;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;

/**
 * Serviço de negócio para submissão e acompanhamento do Dossiê de Credenciamento pelo Médico.
 * Atende aos requisitos RF002, RN007 e RN008 da Resolução CFM nº 2.314/2022.
 */
@Service
public class DoctorCredentialingService {

    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final AuditService auditService;

    // Os 7 tipos obrigatórios que compõem o Dossiê
    private static final List<DocumentType> MANDATORY_DOCUMENTS = Arrays.asList(
            DocumentType.CRM_CARD,
            DocumentType.DIPLOMA,
            DocumentType.ID_DOCUMENT,
            DocumentType.ETHICAL_CERTIFICATE,
            DocumentType.ICP_BRAZIL_CERT,
            DocumentType.CRM_TELEMEDICINE_TERM,
            DocumentType.PROOF_OF_ADDRESS
    );

    public DoctorCredentialingService(UserRepository userRepository,
                                      FileStorageService fileStorageService,
                                      AuditService auditService) {
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
        this.auditService = auditService;
    }

    /**
     * Consulta o estado consolidado do dossiê do médico autenticado.
     */
    public DoctorDossierStatusResponse getStatus(String doctorEmail) {
        User doctor = findDoctorByEmail(doctorEmail);
        return buildDossierResponse(doctor);
    }

    /**
     * Realiza o upload de um documento do dossiê médico.
     */
    public DoctorDocumentInfo uploadDocument(String doctorEmail, DocumentType documentType, MultipartFile file, String ipAddress) {
        User doctor = findDoctorByEmail(doctorEmail);

        if (doctor.getDocuments() == null) {
            doctor.setDocuments(new HashMap<>());
        }

        // Se já existia versão anterior deste documento, remove arquivo antigo do disco
        DoctorDocumentInfo previousDoc = doctor.getDocuments().get(documentType.name());
        if (previousDoc != null && previousDoc.getStoredFileName() != null) {
            fileStorageService.deleteDocument(doctor.getId(), previousDoc.getStoredFileName());
        }

        DoctorDocumentInfo docInfo = fileStorageService.storeDocument(doctor.getId(), documentType, file);
        doctor.getDocuments().put(documentType.name(), docInfo);

        if (doctor.getDossierStatus() == null) {
            doctor.setDossierStatus(DoctorDossierStatus.PENDING_DOCS);
        }

        userRepository.save(doctor);

        auditService.log(
                doctor.getId(),
                doctor.getEmail(),
                doctor.getRole().name(),
                "UPLOAD_DOCUMENT",
                doctor.getId(),
                "Enviou documento: " + documentType.name() + " (" + docInfo.getOriginalFileName() + ")",
                ipAddress
        );

        return docInfo;
    }

    /**
     * Salva ou atualiza os dados bancários do médico para configuração do Split Direto de Pagamento.
     */
    public DoctorFinancialInfo updateFinancialInfo(String doctorEmail, DoctorFinancialInfoRequest request, String ipAddress) {
        User doctor = findDoctorByEmail(doctorEmail);

        DoctorFinancialInfo fin = doctor.getFinancialInfo();
        if (fin == null) {
            fin = new DoctorFinancialInfo();
        }

        fin.setBankName(request.getBankName());
        fin.setAgency(request.getAgency());
        fin.setAccountNumber(request.getAccountNumber());
        fin.setAccountType(request.getAccountType());
        fin.setPixKey(request.getPixKey());
        fin.setPixKeyType(request.getPixKeyType());
        fin.setCnpj(request.getCnpj());
        fin.setCorporateName(request.getCorporateName());
        fin.setUpdatedAt(LocalDateTime.now());

        doctor.setFinancialInfo(fin);
        userRepository.save(doctor);

        auditService.log(
                doctor.getId(),
                doctor.getEmail(),
                doctor.getRole().name(),
                "UPDATE_FINANCIAL_INFO",
                doctor.getId(),
                "Atualizou dados bancários para Split Direto (PIX: " + request.getPixKeyType() + ")",
                ipAddress
        );

        return fin;
    }

    /**
     * Submete formalmente o Dossiê completo para a fila de auditoria do Administrador.
     */
    public DoctorDossierStatusResponse submitDossier(String doctorEmail, String ipAddress) {
        User doctor = findDoctorByEmail(doctorEmail);

        if (doctor.getDocuments() == null || doctor.getDocuments().isEmpty()) {
            throw new IllegalArgumentException("Nenhum documento foi enviado ainda.");
        }

        for (DocumentType mandatory : MANDATORY_DOCUMENTS) {
            if (!doctor.getDocuments().containsKey(mandatory.name())) {
                throw new IllegalArgumentException("Falta enviar o documento obrigatório: " + mandatory.getDescription());
            }
        }

        if (doctor.getFinancialInfo() == null || doctor.getFinancialInfo().getPixKey() == null) {
            throw new IllegalArgumentException("Preencha as informações financeiras e chave PIX antes de submeter o dossiê.");
        }

        doctor.setDossierStatus(DoctorDossierStatus.UNDER_REVIEW);
        doctor.setSubmittedAt(LocalDateTime.now());
        doctor.setRejectionReason(null);

        userRepository.save(doctor);

        auditService.log(
                doctor.getId(),
                doctor.getEmail(),
                doctor.getRole().name(),
                "SUBMIT_DOSSIER",
                doctor.getId(),
                "Submeteu dossiê completo de credenciamento para auditoria",
                ipAddress
        );

        return buildDossierResponse(doctor);
    }

    /**
     * Carrega arquivo do próprio médico para conferência visual.
     */
    public Resource getDoctorOwnDocument(String doctorEmail, DocumentType documentType) {
        User doctor = findDoctorByEmail(doctorEmail);
        if (doctor.getDocuments() == null || !doctor.getDocuments().containsKey(documentType.name())) {
            throw new IllegalArgumentException("Documento não encontrado para este médico.");
        }

        DoctorDocumentInfo docInfo = doctor.getDocuments().get(documentType.name());
        return fileStorageService.loadDocumentAsResource(doctor.getId(), docInfo.getStoredFileName());
    }

    public DoctorDocumentInfo getDoctorDocumentInfo(String doctorEmail, DocumentType documentType) {
        User doctor = findDoctorByEmail(doctorEmail);
        if (doctor.getDocuments() == null || !doctor.getDocuments().containsKey(documentType.name())) {
            throw new IllegalArgumentException("Documento não encontrado.");
        }
        return doctor.getDocuments().get(documentType.name());
    }

    private User findDoctorByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Médico não encontrado no sistema."));
    }

    public DoctorDossierStatusResponse buildDossierResponse(User doctor) {
        int uploadedCount = 0;
        if (doctor.getDocuments() != null) {
            for (DocumentType mandatory : MANDATORY_DOCUMENTS) {
                if (doctor.getDocuments().containsKey(mandatory.name())) {
                    uploadedCount++;
                }
            }
        }

        boolean hasFinancial = doctor.getFinancialInfo() != null && doctor.getFinancialInfo().getPixKey() != null;
        boolean canSubmit = (uploadedCount >= MANDATORY_DOCUMENTS.size()) && hasFinancial
                && (doctor.getDossierStatus() == null
                || doctor.getDossierStatus() == DoctorDossierStatus.PENDING_DOCS
                || doctor.getDossierStatus() == DoctorDossierStatus.DOCS_REJECTED);

        return DoctorDossierStatusResponse.builder()
                .doctorId(doctor.getId())
                .fullName(doctor.getFullName())
                .email(doctor.getEmail())
                .crm(doctor.getCrm())
                .ufCrm(doctor.getUfCrm())
                .dossierStatus(doctor.getDossierStatus() != null ? doctor.getDossierStatus() : DoctorDossierStatus.PENDING_DOCS)
                .documents(doctor.getDocuments() != null ? doctor.getDocuments() : new HashMap<>())
                .financialInfo(doctor.getFinancialInfo())
                .rejectionReason(doctor.getRejectionReason())
                .submittedAt(doctor.getSubmittedAt())
                .approvedAt(doctor.getApprovedAt())
                .trialExpiresAt(doctor.getTrialExpiresAt())
                .mandatoryUploadedCount(uploadedCount)
                .totalMandatoryCount(MANDATORY_DOCUMENTS.size())
                .canSubmit(canSubmit)
                .build();
    }
}
