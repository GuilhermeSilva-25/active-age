import type { DoctorDossierStatus } from './dossier';

export type UserRole = 'ROLE_PACIENTE' | 'ROLE_MEDICO' | 'ROLE_ADMIN';

export interface UserItemResponse {
    id: string;
    fullName: string;
    email: string;
    phone?: string;
    cpf?: string;
    birthDate?: string;
    role: UserRole;
    active: boolean;
    crm?: string;
    ufCrm?: string;
    dossierStatus?: DoctorDossierStatus;
    createdAt: string;
}

export interface AuditLogResponse {
    id: string;
    userId: string;
    userEmail: string;
    userRole: string;
    action: string;
    targetUserId?: string;
    details: string;
    ipAddress: string;
    timestamp: string;
}

export interface AuditLogStatsResponse {
    totalLogs: number;
    logsLast24Hours: number;
    documentViewsCount: number;
    dossierReviewsCount: number;
}
