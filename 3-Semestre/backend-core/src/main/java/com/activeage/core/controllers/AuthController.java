package com.activeage.core.controllers;

import com.activeage.core.dtos.requests.LoginRequest;
import com.activeage.core.dtos.requests.PatientRegisterRequest;
import com.activeage.core.services.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoint de exposição para regras de Autenticação e Registro.
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
}