package com.activeage.core.controllers;

import com.activeage.core.domain.enums.Role;
import com.activeage.core.dtos.requests.UserStatusUpdateRequest;
import com.activeage.core.dtos.responses.UserItemResponse;
import com.activeage.core.services.AdminUserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Controller RESTful para Gestão e Moderação de Contas de Usuários pelo Administrador.
 * Todas as rotas são restritas a ROLE_ADMIN.
 */
@RestController
@RequestMapping("/api/admin/users")
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    /**
     * Lista todos os usuários cadastrados com suporte a filtros por Role, Status e busca textual.
     */
    @GetMapping
    public ResponseEntity<List<UserItemResponse>> getUsers(
            @RequestParam(value = "role", required = false) Role role,
            @RequestParam(value = "active", required = false) Boolean active,
            @RequestParam(value = "search", required = false) String search
    ) {
        return ResponseEntity.ok(adminUserService.getUsers(role, active, search));
    }

    /**
     * Retorna o perfil completo de um usuário pelo ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<UserItemResponse> getUserById(@PathVariable("id") String id) {
        return ResponseEntity.ok(adminUserService.getUserById(id));
    }

    /**
     * Altera o status da conta do usuário (ativação ou desativação soft-lock).
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<UserItemResponse> updateUserStatus(
            @PathVariable("id") String id,
            @Valid @RequestBody UserStatusUpdateRequest request,
            @AuthenticationPrincipal String adminEmail,
            HttpServletRequest httpRequest
    ) {
        String clientIp = extractClientIp(httpRequest);
        return ResponseEntity.ok(adminUserService.updateUserStatus(id, request, adminEmail, clientIp));
    }

    private String extractClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
