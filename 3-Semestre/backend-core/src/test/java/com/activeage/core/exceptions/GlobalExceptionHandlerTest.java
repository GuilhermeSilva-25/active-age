package com.activeage.core.exceptions;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.core.MethodParameter;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.BeanPropertyBindingResult;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;

import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class GlobalExceptionHandlerTest {

    private GlobalExceptionHandler exceptionHandler;

    @BeforeEach
    void setUp() {
        exceptionHandler = new GlobalExceptionHandler();
    }

    @Test
    @DisplayName("Deve mapear IllegalArgumentException para HTTP 400 Bad Request")
    void handleIllegalArgumentException() {
        IllegalArgumentException ex = new IllegalArgumentException("Credenciais inválidas");
        ResponseEntity<Map<String, String>> response = exceptionHandler.handleIllegalArgumentException(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Credenciais inválidas", response.getBody().get("message"));
    }

    @Test
    @DisplayName("Deve mapear IllegalStateException para HTTP 400 Bad Request")
    void handleIllegalStateException() {
        IllegalStateException ex = new IllegalStateException("Horário já ocupado");
        ResponseEntity<Map<String, String>> response = exceptionHandler.handleIllegalStateException(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Horário já ocupado", response.getBody().get("message"));
    }

    @Test
    @DisplayName("Deve mapear SecurityException para HTTP 403 Forbidden")
    void handleSecurityException() {
        SecurityException ex = new SecurityException("Acesso negado para este recurso");
        ResponseEntity<Map<String, String>> response = exceptionHandler.handleSecurityException(ex);

        assertEquals(HttpStatus.FORBIDDEN, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Acesso negado para este recurso", response.getBody().get("message"));
    }

    @Test
    @DisplayName("Deve mapear MethodArgumentNotValidException para HTTP 400 com mapa de erros de campos")
    void handleValidationExceptions() throws NoSuchMethodException {
        BeanPropertyBindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "target");
        bindingResult.addError(new FieldError("target", "crm", "CRM é obrigatório"));
        bindingResult.addError(new FieldError("target", "email", "E-mail inválido"));

        MethodParameter parameter = new MethodParameter(
                GlobalExceptionHandlerTest.class.getDeclaredMethod("setUp"), -1
        );
        MethodArgumentNotValidException ex = new MethodArgumentNotValidException(parameter, bindingResult);

        ResponseEntity<Map<String, String>> response = exceptionHandler.handleValidationExceptions(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("CRM é obrigatório", response.getBody().get("crm"));
        assertEquals("E-mail inválido", response.getBody().get("email"));
    }

    @Test
    @DisplayName("Deve mapear Exception genérica para HTTP 500 com mensagem segura")
    void handleGenericException() {
        Exception ex = new RuntimeException("Erro inesperado no banco");
        ResponseEntity<Map<String, String>> response = exceptionHandler.handleGenericException(ex);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Ocorreu um erro interno no servidor. Tente novamente mais tarde.", response.getBody().get("message"));
    }
}
