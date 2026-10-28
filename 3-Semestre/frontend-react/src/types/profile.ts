export interface UserAddress {
    cep?: string;
    logradouro?: string;
    numero?: string;
    complemento?: string;
    bairro?: string;
    cidade?: string;
    uf?: string;
}

export interface CaregiverInfo {
    hasCaregiver: boolean;
    caregiverName?: string;
    caregiverPhone?: string;
    relationship?: string;
}

export interface PatientHealthSummary {
    bloodType?: string;
    allergies?: string;
    chronicConditions?: string;
    regularMedications?: string;
}

export interface UserProfile {
    id: string;
    fullName: string;
    email: string;
    role: 'ROLE_PACIENTE' | 'ROLE_MEDICO' | 'ROLE_ADMIN';
    cpf?: string;
    phone?: string;
    birthDate?: string;
    avatarUrl?: string;
    active: boolean;
    createdAt?: string;

    // Campos do Médico
    crm?: string;
    ufCrm?: string;
    rqe?: string;
    bio?: string;
    clinicalFocus?: string[];
    consultationFee?: number;
    consultationDurationMinutes?: number;
    lattesUrl?: string;
    dossierStatus?: 'PENDING_DOCS' | 'UNDER_REVIEW' | 'DOCS_REJECTED' | 'APPROVED';
    trialExpiresAt?: string;
    approvedAt?: string;

    // Campos do Paciente
    address?: UserAddress;
    caregiver?: CaregiverInfo;
    healthSummary?: PatientHealthSummary;
}

export interface UpdateDoctorProfilePayload {
    phone?: string;
    rqe?: string;
    bio?: string;
    clinicalFocus?: string[];
    consultationFee?: number;
    consultationDurationMinutes?: number;
    lattesUrl?: string;
}

export interface UpdatePatientProfilePayload {
    phone?: string;
    address?: UserAddress;
    caregiver?: CaregiverInfo;
    healthSummary?: PatientHealthSummary;
}
