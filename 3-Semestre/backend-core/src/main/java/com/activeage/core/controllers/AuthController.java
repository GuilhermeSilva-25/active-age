package com.activeage.core.controllers;

import com.activeage.core.dtos.requests.PatientRegisterRequest;
import com.activeage.core.services.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controlador REST responsável por expor as rotas de autenticação e registro.
 * Funciona como a porta de entrada (API) para o React (Frontend) se comunicar.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;

    /**
     * Rota pública para registro de novos pacientes.
     * URL Final: POST /api/auth/register-patient
     *
     * @param request Dados em JSON. A anotação @Valid obriga o Spring a rodar
     *                as regras do DTO antes de liberar a execução do método.
     * @return Resposta HTTP 201 (Created) em caso de sucesso, ou 400 (Bad Request) em caso de erro.
     */
    @PostMapping("/register-patient")
    public ResponseEntity<?> registerPatient(@Valid @RequestBody PatientRegisterRequest request) {
        try {
            authService.registerPatient(request);

            return ResponseEntity
                    .status(HttpStatus.CREATED)
                    .body(Map.of("message", "Paciente registrado com sucesso na plataforma!"));

        } catch (IllegalArgumentException e) {
            return ResponseEntity
                    .status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}