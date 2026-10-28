package com.activeage.core.services;

import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.models.User;
import com.activeage.core.dtos.requests.UpdateDoctorProfileRequest;
import com.activeage.core.dtos.requests.UpdatePatientProfileRequest;
import com.activeage.core.dtos.responses.UserProfileResponse;
import com.activeage.core.repositories.UserRepository;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

/**
 * Serviço responsável pela gestão e atualização dos perfis de Médicos e Pacientes (RF014 / UC18).
 */
@Service
public class UserProfileService {

    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;

    public UserProfileService(UserRepository userRepository, FileStorageService fileStorageService) {
        this.userRepository = userRepository;
        this.fileStorageService = fileStorageService;
    }

    /**
     * Retorna os dados completos do perfil do usuário autenticado.
     */
    public UserProfileResponse getUserProfile(String email) {
        User user = findUserByEmail(email);
        return mapToResponse(user);
    }

    /**
     * Atualiza as informações profissionais do perfil do médico (RF014 / UC18).
     */
    public UserProfileResponse updateDoctorProfile(String email, UpdateDoctorProfileRequest request) {
        User user = findUserByEmail(email);

        if (user.getRole() != Role.ROLE_MEDICO) {
            throw new IllegalArgumentException("Apenas usuários com perfil de Médico podem atualizar estes campos.");
        }

        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            user.setPhone(request.getPhone());
        }
        user.setRqe(request.getRqe());
        user.setBio(request.getBio());
        user.setClinicalFocus(request.getClinicalFocus());
        user.setConsultationFee(request.getConsultationFee());
        user.setConsultationDurationMinutes(request.getConsultationDurationMinutes());
        user.setLattesUrl(request.getLattesUrl());

        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    /**
     * Atualiza as informações cadastrais, de endereço e de cuidador do paciente (RF014 / UC18).
     */
    public UserProfileResponse updatePatientProfile(String email, UpdatePatientProfileRequest request) {
        User user = findUserByEmail(email);

        if (user.getRole() != Role.ROLE_PACIENTE) {
            throw new IllegalArgumentException("Apenas usuários com perfil de Paciente podem atualizar estes campos.");
        }

        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            user.setPhone(request.getPhone());
        }
        user.setAddress(request.getAddress());
        user.setCaregiver(request.getCaregiver());
        user.setHealthSummary(request.getHealthSummary());

        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    /**
     * Valida, armazena e atualiza a foto de perfil (avatar) do usuário.
     */
    public String uploadAvatar(String email, MultipartFile file) {
        User user = findUserByEmail(email);

        // Se já possuía avatar anterior, extrai o nome do arquivo e remove
        if (user.getAvatarUrl() != null && user.getAvatarUrl().contains("/api/users/profile/avatar/")) {
            String oldFileName = user.getAvatarUrl().substring(user.getAvatarUrl().lastIndexOf('/') + 1);
            fileStorageService.deleteAvatar(oldFileName);
        }

        String storedFileName = fileStorageService.storeAvatar(user.getId(), file);
        String avatarUrl = "/api/users/profile/avatar/" + storedFileName;

        user.setAvatarUrl(avatarUrl);
        userRepository.save(user);

        return avatarUrl;
    }

    /**
     * Carrega o recurso binário da foto de perfil para exibição no frontend.
     */
    public Resource loadAvatarResource(String filename) {
        return fileStorageService.loadAvatarResource(filename);
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado com o e-mail: " + email));
    }

    private UserProfileResponse mapToResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole())
                .cpf(user.getCpf())
                .phone(user.getPhone())
                .birthDate(user.getBirthDate())
                .avatarUrl(user.getAvatarUrl())
                .active(user.isActive())
                .createdAt(user.getCreatedAt())
                .crm(user.getCrm())
                .ufCrm(user.getUfCrm())
                .rqe(user.getRqe())
                .bio(user.getBio())
                .clinicalFocus(user.getClinicalFocus())
                .consultationFee(user.getConsultationFee())
                .consultationDurationMinutes(user.getConsultationDurationMinutes())
                .lattesUrl(user.getLattesUrl())
                .dossierStatus(user.getDossierStatus())
                .trialExpiresAt(user.getTrialExpiresAt())
                .approvedAt(user.getApprovedAt())
                .address(user.getAddress())
                .caregiver(user.getCaregiver())
                .healthSummary(user.getHealthSummary())
                .build();
    }
}
