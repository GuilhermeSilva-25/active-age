export type DoctorDossierStatus =
    | 'PENDING_DOCS'
    | 'UNDER_REVIEW'
    | 'DOCS_REJECTED'
    | 'APPROVED'
    | 'SUSPENDED';

export type DocumentType =
    | 'CRM_CARD'
    | 'DIPLOMA'
    | 'RQE'
    | 'ID_DOCUMENT'
    | 'ETHICAL_CERTIFICATE'
    | 'ICP_BRAZIL_CERT'
    | 'CRM_TELEMEDICINE_TERM'
    | 'PROOF_OF_ADDRESS'
    | 'CNPJ_CARD';

export type DocumentStatus = 'UPLOADED' | 'APPROVED' | 'REJECTED';

export interface DoctorDocumentInfo {
    documentType: DocumentType;
    originalFileName: string;
    storedFileName: string;
    contentType: string;
    sizeBytes: number;
    uploadedAt: string;
    status: DocumentStatus;
}

export interface DoctorFinancialInfo {
    bankName: string;
    agency: string;
    accountNumber: string;
    accountType: string;
    pixKey: string;
    pixKeyType: string;
    cnpj?: string;
    corporateName?: string;
    updatedAt?: string;
}

export interface DoctorDossierStatusResponse {
    doctorId: string;
    fullName: string;
    email: string;
    crm: string;
    ufCrm: string;
    dossierStatus: DoctorDossierStatus;
    documents: Record<string, DoctorDocumentInfo>;
    financialInfo?: DoctorFinancialInfo;
    rejectionReason?: string;
    submittedAt?: string;
    approvedAt?: string;
    trialExpiresAt?: string;
    mandatoryUploadedCount: number;
    totalMandatoryCount: number;
    canSubmit: boolean;
}

export interface AdminDoctorItemResponse {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    crm: string;
    ufCrm: string;
    dossierStatus: DoctorDossierStatus;
    uploadedDocsCount: number;
    hasFinancialInfo: boolean;
    createdAt: string;
    submittedAt?: string;
    approvedAt?: string;
    trialExpiresAt?: string;
}

export interface DocumentDefinition {
    type: DocumentType;
    title: string;
    pillar: number;
    mandatory: boolean;
    description: string;
    allowedFormats: string;
}

export const DOSSIER_DOCUMENT_DEFINITIONS: DocumentDefinition[] = [
    // Pilar 1
    {
        type: 'CRM_CARD',
        title: 'Carteira do CRM (Frente e Verso)',
        pillar: 1,
        mandatory: true,
        description: 'Cópia legível da identidade médica profissional com número e UF nítidos.',
        allowedFormats: 'PDF, JPG ou PNG (máx. 10MB)',
    },
    {
        type: 'DIPLOMA',
        title: 'Diploma de Medicina (MEC)',
        pillar: 1,
        mandatory: true,
        description: 'Frente e verso do diploma de graduação reconhecido pelo Ministério da Educação.',
        allowedFormats: 'PDF, JPG ou PNG (máx. 10MB)',
    },
    {
        type: 'RQE',
        title: 'Registro de Qualificação de Especialista (RQE)',
        pillar: 1,
        mandatory: false,
        description: 'Mandatório caso vá atender ou se anunciar como especialista em Geriatria.',
        allowedFormats: 'PDF, JPG ou PNG (máx. 10MB)',
    },
    {
        type: 'ID_DOCUMENT',
        title: 'Documento Geral com Foto (RG/CNH/Passaporte)',
        pillar: 1,
        mandatory: true,
        description: 'Documento oficial para cruzamento e validação de identidade civil.',
        allowedFormats: 'PDF, JPG ou PNG (máx. 10MB)',
    },
    // Pilar 2
    {
        type: 'ETHICAL_CERTIFICATE',
        title: 'Certidão Ético-Profissional (CRM)',
        pillar: 2,
        mandatory: true,
        description: 'Emitida gratuitamente pelo site do CRM do seu estado, comprovando ausência de sanções.',
        allowedFormats: 'PDF (máx. 10MB)',
    },
    // Pilar 3
    {
        type: 'ICP_BRAZIL_CERT',
        title: 'Comprovante de Certificado ICP-Brasil (A1 ou A3)',
        pillar: 3,
        mandatory: true,
        description: 'Res. CFM nº 2.314/2022: Obrigatório para assinar digitalmente receitas e prontuários.',
        allowedFormats: 'PDF, JPG ou PNG (máx. 10MB)',
    },
    {
        type: 'CRM_TELEMEDICINE_TERM',
        title: 'Declaração de Telemedicina no CRM',
        pillar: 3,
        mandatory: true,
        description: 'Comprovante/print da declaração de atuação em telemedicina cadastrada no portal do CRM.',
        allowedFormats: 'PDF, JPG ou PNG (máx. 10MB)',
    },
    // Pilar 4
    {
        type: 'PROOF_OF_ADDRESS',
        title: 'Comprovante de Residência Atualizado',
        pillar: 4,
        mandatory: true,
        description: 'Comprovante de endereço recente (máximo 90 dias) para fins de cadastro e faturamento.',
        allowedFormats: 'PDF, JPG ou PNG (máx. 10MB)',
    },
    {
        type: 'CNPJ_CARD',
        title: 'Cartão CNPJ da PJ Médica (Opcional)',
        pillar: 4,
        mandatory: false,
        description: 'Caso opte por prestar serviços e emitir notas fiscais via Pessoa Jurídica médica.',
        allowedFormats: 'PDF, JPG ou PNG (máx. 10MB)',
    },
];
