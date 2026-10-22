package com.activeage.core.controllers;

import com.activeage.core.domain.models.User;
import com.activeage.core.dtos.requests.DoctorRegisterRequest;
import com.activeage.core.dtos.requests.LoginRequest;
import com.activeage.core.dtos.requests.PatientRegisterRequest;
import com.activeage.core.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

/**
 * Endpoint de exposição para regras de Autenticação, Registro e Gestão de Sessão.
 */
@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Endpoint público para registrar um novo paciente.
     *
     * @param request Dados validados recebidos do formulário de cadastro.
     * @return Status 201 Created caso o usuário seja criado.
     */
    @PostMapping("/register-patient")
    public ResponseEntity<?> registerPatient(@Valid @RequestBody PatientRegisterRequest request) {
        authService.registerPatient(request);
        return ResponseEntity.status(HttpStatus.CREATED).body("Paciente registrado com sucesso na plataforma!");
    }

    /**
     * Endpoint público para registrar um novo médico especialista.
     *
     * @param request Dados validados do profissional de geriatria.
     * @return Status 201 Created caso o médico seja criado com perfil ROLE_MEDICO.
     */
    @PostMapping("/register-doctor")
    public ResponseEntity<?> registerDoctor(@Valid @RequestBody DoctorRegisterRequest request) {
        authService.registerDoctor(request);
        return ResponseEntity.status(HttpStatus.CREATED).body("Médico especialista registrado com sucesso na plataforma!");
    }

    /**
     * Endpoint público para verificar a disponibilidade de um e-mail antes do avanço de etapas de cadastro.
     *
     * @param email E-mail a ser pesquisado.
     * @return 200 OK com mapa JSON { "available": boolean, "message": string }.
     */
    @GetMapping("/check-email")
    public ResponseEntity<?> checkEmailAvailability(@RequestParam String email) {
        boolean available = authService.isEmailAvailable(email);
        Map<String, Object> response = new HashMap<>();
        response.put("available", available);
        if (!available) {
            response.put("message", "Este e-mail já está em uso.");
        }
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint público para realizar login.
     * Ao autenticar com sucesso, retorna um Cookie Seguro (HttpOnly) contendo o Token JWT.
     *
     * @param request Dados de login (email e senha).
     * @return Resposta com status 200 OK e o Cookie embutido no Header.
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        String token = authService.login(request);

        ResponseCookie cookie = ResponseCookie.from("accessToken", token)
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(86400)
                .sameSite("Strict")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body("Login realizado com sucesso!");
    }

    /**
     * Endpoint protegido para recuperar as informações do usuário autenticado a partir da sessão ativa (JWT).
     *
     * @return Dados de perfil do usuário (id, nome, email, role, crm).
     */
    @GetMapping("/me")
    public ResponseEntity<?> getProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário não autenticado.");
        }

        String email = authentication.getName();
        Optional<User> userOpt = authService.getUserByEmail(email);

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Perfil não localizado.");
        }

        User user = userOpt.get();
        Map<String, Object> profile = new HashMap<>();
        profile.put("id", user.getId());
        profile.put("fullName", user.getFullName());
        profile.put("email", user.getEmail());
        profile.put("role", user.getRole().name());
        profile.put("crm", user.getCrm());
        profile.put("ufCrm", user.getUfCrm());
        profile.put("cpf", user.getCpf());
        profile.put("phone", user.getPhone());
        profile.put("birthDate", user.getBirthDate());
        profile.put("active", user.isActive());
        profile.put("dossierStatus", user.getDossierStatus() != null ? user.getDossierStatus().name() : null);
        profile.put("rejectionReason", user.getRejectionReason());
        profile.put("trialExpiresAt", user.getTrialExpiresAt());
        profile.put("approvedAt", user.getApprovedAt());

        return ResponseEntity.ok(profile);
    }

    /**
     * Endpoint para encerrar a sessão do usuário (Logout).
     * Invalida o cookie seguro do navegador definindo maxAge = 0.
     *
     * @return Resposta 200 OK com cookie expirado no cabeçalho.
     */
    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        ResponseCookie cookie = ResponseCookie.from("accessToken", "")
                .httpOnly(true)
                .secure(true)
                .path("/")
                .maxAge(0)
                .sameSite("Strict")
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body("Logout realizado com sucesso!");
    }
}
