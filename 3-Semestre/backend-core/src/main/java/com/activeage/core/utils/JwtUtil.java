package com.activeage.core.utils;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

/**
 * Utilitário responsável por gerar e validar os Tokens JWT (Crachás digitais).
 * Atende ao requisito RF001 de autenticação sem estado (Stateless) e RBAC.
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
     * Gera um Token JWT válido para o usuário autenticado, incluindo seu cargo (Role).
     *
     * @param email O email do usuário que será embutido no Token.
     * @param role  O cargo do usuário (ex: ROLE_PACIENTE) para o controle de acesso (RBAC).
     * @return O token JWT assinado em formato String.
     */
    public String generateToken(String email, String role) {
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationTime))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Extrai todas as informações (Claims) contidas dentro do payload do token JWT.
     */
    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Extrai o email contido dentro do payload do token JWT.
     *
     * @param token O token JWT criptografado.
     * @return O email original do usuário.
     */
    public String getEmailFromToken(String token) {
        return extractAllClaims(token).getSubject();
    }

    /**
     * Extrai o cargo (Role) contido dentro do token JWT.
     *
     * @param token O token JWT criptografado.
     * @return O cargo original do usuário (ex: ROLE_PACIENTE).
     */
    public String getRoleFromToken(String token) {
        return extractAllClaims(token).get("role", String.class);
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
            extractAllClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}