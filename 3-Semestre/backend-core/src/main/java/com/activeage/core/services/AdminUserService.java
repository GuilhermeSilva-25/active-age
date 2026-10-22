package com.activeage.core.services;

import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.models.User;
import com.activeage.core.dtos.requests.UserStatusUpdateRequest;
import com.activeage.core.dtos.responses.UserItemResponse;
import com.activeage.core.repositories.UserRepository;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Serviço de negócio para Gestão e Moderação de Contas de Usuários pelo Administrador.
 * Implementa controle de acesso, filtros de busca, soft-lock e registro compulsório em audit_logs.
 */
@Service
public class AdminUserService {

    private final UserRepository userRepository;
    private final AuditService auditService;

    public AdminUserService(UserRepository userRepository, AuditService auditService) {
        this.userRepository = userRepository;
        this.auditService = auditService;
    }

    /**
     * Lista todos os usuários da plataforma com suporte a filtros por Role, Status (ativo/inativo) e busca textual.
     */
    public List<UserItemResponse> getUsers(Role roleFilter, Boolean activeFilter, String search) {
        List<User> users = userRepository.findAll();

        if (roleFilter != null) {
            users = users.stream().filter(u -> u.getRole() == roleFilter).collect(Collectors.toList());
        }

        if (activeFilter != null) {
            users = users.stream().filter(u -> u.isActive() == activeFilter).collect(Collectors.toList());
        }

        if (search != null && !search.isBlank()) {
            String lowerSearch = search.toLowerCase();
            users = users.stream().filter(u ->
                    (u.getFullName() != null && u.getFullName().toLowerCase().contains(lowerSearch)) ||
                    (u.getEmail() != null && u.getEmail().toLowerCase().contains(lowerSearch)) ||
                    (u.getCpf() != null && u.getCpf().contains(lowerSearch)) ||
                    (u.getCrm() != null && u.getCrm().toLowerCase().contains(lowerSearch))
            ).collect(Collectors.toList());
        }

        return users.stream()
                .sorted(Comparator.comparing(User::getCreatedAt, Comparator.nullsLast(Comparator.reverseOrder())))
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    /**
     * Retorna o perfil completo de um usuário pelo ID.
     */
    public UserItemResponse getUserById(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado com ID: " + id));
        return mapToResponse(user);
    }

    /**
     * Alterna o status da conta do usuário (soft-lock), gravando a ação na Trilha de Auditoria.
     */
    public UserItemResponse updateUserStatus(String targetUserId, UserStatusUpdateRequest request,
                                             String adminEmail, String ipAddress) {
        User targetUser = userRepository.findById(targetUserId)
                .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado com ID: " + targetUserId));

        User admin = userRepository.findByEmail(adminEmail).orElse(null);

        // Trava de segurança: impede que o administrador inative a si mesmo
        if (admin != null && admin.getId().equals(targetUserId) && Boolean.FALSE.equals(request.getActive())) {
            throw new IllegalArgumentException("Não é permitido inativar a própria conta de administrador.");
        }

        boolean newStatus = Boolean.TRUE.equals(request.getActive());
        targetUser.setActive(newStatus);
        userRepository.save(targetUser);

        String action = newStatus ? "ACTIVATE_USER" : "DEACTIVATE_USER";
        String details = "Alterou status da conta de " + targetUser.getFullName() + " (" + targetUser.getRole() + ") para "
                + (newStatus ? "ATIVA" : "INATIVA")
                + (request.getReason() != null && !request.getReason().isBlank() ? ". Motivo: " + request.getReason().trim() : "");

        auditService.log(
                admin != null ? admin.getId() : "ADMIN",
                adminEmail,
                "ROLE_ADMIN",
                action,
                targetUser.getId(),
                details,
                ipAddress
        );

        return mapToResponse(targetUser);
    }

    private UserItemResponse mapToResponse(User user) {
        return UserItemResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .cpf(user.getCpf())
                .birthDate(user.getBirthDate())
                .role(user.getRole())
                .active(user.isActive())
                .crm(user.getCrm())
                .ufCrm(user.getUfCrm())
                .dossierStatus(user.getDossierStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
