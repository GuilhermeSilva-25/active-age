package com.activeage.core.utils;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * Utilitário responsável por gerar e validar os Tokens JWT (Crachás digitais).
 * Atende ao requisito RF001 de autenticação sem estado (Stateless).
 */
@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private long expirationTime;

    /**
     * Gera a chave criptográfica HmacSHA256 a partir do segredo.
     */
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secret.getBytes());
    }

    /**
     * Gera um Token JWT válido para o usuário autenticado.
     *
     * @param email O email do usuário que será embutido no Token.
     * @return O token JWT assinado em formato String.
     */
    public String generateToken(String email) {
        return Jwts.builder()
                .subject(email)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Extrai o email contido dentro do payload do token JWT.
     *
     * @param token O token JWT criptografado.
     * @return O email original do usuário.
     */
    public String getEmailFromToken(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    /**
     * Valida matematicamente se o token foi assinado pelo nosso servidor
     * e se não expirou (prazo de validade).
     *
     * @param token O token a ser validado.
     * @return true se for autêntico e válido, false se foi adulterado ou expirou.
     */
    public boolean isTokenValid(String token) {
        try {
            Jwts.parser().verifyWith(getSigningKey()).build().parseSignedClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}