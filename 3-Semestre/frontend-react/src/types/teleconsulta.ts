export interface MedicalRecord {
    id?: string;
    appointmentId: string;
    doctorId?: string;
    doctorName?: string;
    doctorCrm?: string;
    doctorUfCrm?: string;
    patientId?: string;
    patientName?: string;

    // Anamnese
    chiefComplaint: string;
    historyOfPresentIllness: string;
    clinicalEvolution: string;

    // Avaliação Geriátrica Ampla (AGA)
    cognitiveStatus: string;
    mobilityRisk: string;
    functionalIndependence: string;
    familySupport: string;

    // Diagnóstico e Conduta (CID-11)
    cid11Code: string;
    cid11Description: string;
    clinicalConduct: string;

    // Imutabilidade Ética
    status: 'DRAFT' | 'FINALIZED';
    finalizedAt?: string;
    hashSignature?: string;
    createdAt?: string;
    updatedAt?: string;
}

export type MedicalDocumentType = 'RECEITA_MEDICA' | 'PEDIDO_EXAME' | 'ATESTADO_MEDICO';

export interface MedicalDocument {
    id: string;
    appointmentId: string;
    medicalRecordId?: string;
    doctorId: string;
    doctorName: string;
    doctorCrm: string;
    doctorUfCrm: string;
    doctorRqe?: string;
    patientId: string;
    patientName: string;
    patientCpf?: string;
    documentType: MedicalDocumentType;
    title: string;
    content: string;
    recommendations?: string;
    validationCode: string;
    issuedAt: string;
    createdAt: string;
}

export interface PatientExamItem {
    id: string;
    patientId: string;
    title: string;
    category: string;
    categoryDescription: string;
    examDate: string;
    notes?: string;
    originalFileName: string;
    contentType: string;
    sizeBytes: number;
    formattedSize: string;
    uploadedAt: string;
}

export interface DocumentValidation {
    valid: boolean;
    validationCode?: string;
    documentType?: string;
    title?: string;
    doctorName?: string;
    doctorCrm?: string;
    doctorUfCrm?: string;
    patientName?: string;
    issuedAt?: string;
    message: string;
}
