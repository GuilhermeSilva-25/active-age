package com.activeage.core.utils;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private static final String TEST_SECRET = "superSecretKeyActiveAgeTelemedicinaGeriatrica2026SecureKey!";
    private static final long EXPIRATION_TIME = 3600000L; // 1 hora

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        ReflectionTestUtils.setField(jwtUtil, "secret", TEST_SECRET);
        ReflectionTestUtils.setField(jwtUtil, "expirationTime", EXPIRATION_TIME);
    }

    @Test
    @DisplayName("Deve gerar token JWT válido contendo email e role")
    void generateToken_success() {
        String token = jwtUtil.generateToken("medico@teste.com", "ROLE_MEDICO");

        assertNotNull(token);
        assertFalse(token.isBlank());
        assertTrue(jwtUtil.isTokenValid(token));
        assertEquals("medico@teste.com", jwtUtil.getEmailFromToken(token));
        assertEquals("ROLE_MEDICO", jwtUtil.getRoleFromToken(token));
    }

    @Test
    @DisplayName("Deve retornar false para token adulterado ou inválido")
    void isTokenValid_invalidToken() {
        assertFalse(jwtUtil.isTokenValid("token.completamente.invalido"));
        assertFalse(jwtUtil.isTokenValid(null));
        assertFalse(jwtUtil.isTokenValid(""));
    }

    @Test
    @DisplayName("Deve invalidar token expirado")
    void isTokenValid_expiredToken() {
        // Configura expiração negativa para gerar token já expirado
        ReflectionTestUtils.setField(jwtUtil, "expirationTime", -1000L);
        String expiredToken = jwtUtil.generateToken("expirado@teste.com", "ROLE_PACIENTE");

        assertFalse(jwtUtil.isTokenValid(expiredToken));
    }
}
