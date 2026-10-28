package com.activeage.core.services;

import com.activeage.core.domain.enums.DoctorDossierStatus;
import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.models.User;
import com.activeage.core.dtos.responses.DoctorPublicProfileResponse;
import com.activeage.core.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Serviço de Catálogo e Busca Inteligente de Médicos Geriatras (UC08 / RF005).
 * Garante estrita neutralidade conforme a Resolução CFM nº 2.336/2023 e proteção perimetral (RN004).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DoctorService {

    private final UserRepository userRepository;

    /**
     * Realiza a pesquisa de médicos geriatras homologados e ativos com base em critérios objetivos.
     *
     * @param query  Termo de busca textual livre (nome, bio ou RQE).
     * @param uf     Filtro por Unidade Federativa do CRM (ex: "SP", "RJ").
     * @param focus  Filtro por área de foco clínico geriátrico.
     * @param maxFee Teto máximo de honorários por teleconsulta.
     * @param sort   Critério de ordenação objetiva (name_asc, name_desc, fee_asc, fee_desc).
     * @return Lista de médicos compatíveis formatados para exibição pública.
     */
    public List<DoctorPublicProfileResponse> searchApprovedDoctors(
            String query,
            String uf,
            String focus,
            BigDecimal maxFee,
            String sort
    ) {
        log.info("Executando busca de médicos geriatras: query='{}', uf='{}', focus='{}', maxFee={}, sort='{}'",
                query, uf, focus, maxFee, sort);

        // Busca perimetral no MongoDB: apenas médicos ativos e homologados na auditoria (RN004)
        List<User> approvedDoctors = userRepository.findByRoleAndActiveAndDossierStatus(
                Role.ROLE_MEDICO,
                true,
                DoctorDossierStatus.APPROVED
        );

        String normalizedQuery = (query != null && !query.trim().isEmpty()) ? query.trim().toLowerCase() : null;
        String normalizedUf = (uf != null && !uf.trim().isEmpty() && !uf.equalsIgnoreCase("TODOS")) ? uf.trim().toUpperCase() : null;
        String normalizedFocus = (focus != null && !focus.trim().isEmpty() && !focus.equalsIgnoreCase("TODOS")) ? focus.trim().toLowerCase() : null;

        return approvedDoctors.stream()
                // Filtro por termo textual (Nome, Bio ou RQE)
                .filter(doc -> {
                    if (normalizedQuery == null) return true;
                    boolean matchName = doc.getFullName() != null && doc.getFullName().toLowerCase().contains(normalizedQuery);
                    boolean matchBio = doc.getBio() != null && doc.getBio().toLowerCase().contains(normalizedQuery);
                    boolean matchRqe = doc.getRqe() != null && doc.getRqe().toLowerCase().contains(normalizedQuery);
                    return matchName || matchBio || matchRqe;
                })
                // Filtro por UF do CRM
                .filter(doc -> {
                    if (normalizedUf == null) return true;
                    return doc.getUfCrm() != null && doc.getUfCrm().equalsIgnoreCase(normalizedUf);
                })
                // Filtro por área de foco clínico geriátrico
                .filter(doc -> {
                    if (normalizedFocus == null) return true;
                    if (doc.getClinicalFocus() == null || doc.getClinicalFocus().isEmpty()) return false;
                    return doc.getClinicalFocus().stream()
                            .anyMatch(tag -> tag != null && tag.toLowerCase().contains(normalizedFocus));
                })
                // Filtro por teto de honorários
                .filter(doc -> {
                    if (maxFee == null) return true;
                    if (doc.getConsultationFee() == null) return true;
                    return doc.getConsultationFee().compareTo(maxFee) <= 0;
                })
                // Ordenação objetiva e transparente (Res. CFM nº 2.336/2023)
                .sorted(getComparator(sort))
                // Mapeamento para DTO público (Sem vazamento de dados sensíveis LGPD)
                .map(this::mapToPublicProfile)
                .collect(Collectors.toList());
    }

    /**
     * Retorna os dados públicos de um médico homologado específico pelo seu ID.
     */
    public DoctorPublicProfileResponse getApprovedDoctorById(String doctorId) {
        User doctor = userRepository.findById(doctorId)
                .orElseThrow(() -> new IllegalArgumentException("Médico não encontrado na plataforma."));

        if (doctor.getRole() != Role.ROLE_MEDICO || !doctor.isActive() || doctor.getDossierStatus() != DoctorDossierStatus.APPROVED) {
            throw new IllegalArgumentException("O profissional solicitado não está disponível para consultas públicas.");
        }

        return mapToPublicProfile(doctor);
    }

    private Comparator<User> getComparator(String sort) {
        String option = (sort != null) ? sort.trim().toLowerCase() : "name_asc";
        switch (option) {
            case "name_desc":
                return Comparator.comparing(User::getFullName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER)).reversed();
            case "fee_asc":
                return Comparator.comparing(User::getConsultationFee, Comparator.nullsLast(BigDecimal::compareTo));
            case "fee_desc":
                return Comparator.comparing(User::getConsultationFee, Comparator.nullsLast(BigDecimal::compareTo)).reversed();
            case "name_asc":
            default:
                return Comparator.comparing(User::getFullName, Comparator.nullsLast(String.CASE_INSENSITIVE_ORDER));
        }
    }

    private DoctorPublicProfileResponse mapToPublicProfile(User doc) {
        return DoctorPublicProfileResponse.builder()
                .id(doc.getId())
                .fullName(doc.getFullName())
                .avatarUrl(doc.getAvatarUrl())
                .crm(doc.getCrm())
                .ufCrm(doc.getUfCrm())
                .rqe(doc.getRqe())
                .bio(doc.getBio())
                .clinicalFocus(doc.getClinicalFocus() != null ? doc.getClinicalFocus() : List.of())
                .consultationFee(doc.getConsultationFee())
                .consultationDurationMinutes(doc.getConsultationDurationMinutes() != null ? doc.getConsultationDurationMinutes() : 50)
                .lattesUrl(doc.getLattesUrl())
                .build();
    }
}
