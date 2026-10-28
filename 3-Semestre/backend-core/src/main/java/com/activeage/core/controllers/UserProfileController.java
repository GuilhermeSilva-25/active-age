package com.activeage.core.controllers;

import com.activeage.core.dtos.requests.UpdateDoctorProfileRequest;
import com.activeage.core.dtos.requests.UpdatePatientProfileRequest;
import com.activeage.core.dtos.responses.UserProfileResponse;
import com.activeage.core.services.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

/**
 * Controller responsável pelos endpoints de gestão de perfil e identidade visual (RF014 / UC18).
 */
@RestController
@RequestMapping("/api/users/profile")
@CrossOrigin(origins = "*")
public class UserProfileController {

    private final UserProfileService userProfileService;

    public UserProfileController(UserProfileService userProfileService) {
        this.userProfileService = userProfileService;
    }

    /**
     * Retorna o perfil completo do usuário autenticado.
     */
    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> getMyProfile() {
        String email = getAuthenticatedEmail();
        UserProfileResponse profile = userProfileService.getUserProfile(email);
        return ResponseEntity.ok(profile);
    }

    /**
     * Atualiza as informações do perfil médico (honorários, RQE, bio, especialidades).
     */
    @PutMapping("/doctor")
    @PreAuthorize("hasRole('MEDICO')")
    public ResponseEntity<UserProfileResponse> updateDoctorProfile(@Valid @RequestBody UpdateDoctorProfileRequest request) {
        String email = getAuthenticatedEmail();
        UserProfileResponse updated = userProfileService.updateDoctorProfile(email, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Atualiza as informações do perfil do paciente (endereço residencial, cuidador e ficha básica).
     */
    @PutMapping("/patient")
    @PreAuthorize("hasRole('PACIENTE')")
    public ResponseEntity<UserProfileResponse> updatePatientProfile(@Valid @RequestBody UpdatePatientProfileRequest request) {
        String email = getAuthenticatedEmail();
        UserProfileResponse updated = userProfileService.updatePatientProfile(email, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * Realiza o upload da foto de perfil (avatar) do usuário autenticado.
     */
    @PostMapping(value = "/avatar", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> uploadAvatar(@RequestParam("file") MultipartFile file) {
        String email = getAuthenticatedEmail();
        String avatarUrl = userProfileService.uploadAvatar(email, file);
        return ResponseEntity.ok(Map.of(
                "message", "Foto de perfil atualizada com sucesso!",
                "avatarUrl", avatarUrl
        ));
    }

    /**
     * Endpoint público para carregar e exibir a foto de perfil.
     */
    @GetMapping("/avatar/{filename:.+}")
    public ResponseEntity<Resource> getAvatar(@PathVariable String filename) {
        Resource resource = userProfileService.loadAvatarResource(filename);

        String contentType = "image/jpeg";
        String lower = filename.toLowerCase();
        if (lower.endsWith(".png")) {
            contentType = "image/png";
        } else if (lower.endsWith(".webp")) {
            contentType = "image/webp";
        }

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                .header(HttpHeaders.CACHE_CONTROL, "public, max-age=86400")
                .body(resource);
    }

    private String getAuthenticatedEmail() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new IllegalArgumentException("Usuário não autenticado.");
        }
        return auth.getName();
    }
}
