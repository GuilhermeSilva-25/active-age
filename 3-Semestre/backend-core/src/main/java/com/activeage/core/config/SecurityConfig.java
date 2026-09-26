package com.activeage.core.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Classe de configuração global do Spring Security.
 * Define como o tráfego HTTP é protegido, gerencia as sessões (Stateless)
 * e injeta o mecanismo de criptografia forte de senhas (BCrypt).
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    /**
     * Configura a cadeia de filtros de segurança (Security Filter Chain).
     * Define regras fundamentais como a liberação de rotas públicas e o bloqueio do restante.
     *
     * @param http Objeto HttpSecurity para configurar a segurança da web via fluent API.
     * @return A cadeia de filtros devidamente configurada.
     * @throws Exception Caso ocorra erro interno na configuração de segurança.
     */
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())

                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth

                        .requestMatchers("/api/auth/**").permitAll()

                        .anyRequest().authenticated()
                );

        return http.build();
    }

    /**
     * Define o algoritmo padrão de hashing (criptografia) de senhas do sistema.
     * O BCrypt aplica um 'salt' automático, tornando ataques de força bruta extremamente caros e lentos.
     * Atende estritamente ao requisito de segurança do RF001.
     *
     * @return Instância pronta para uso do BCryptPasswordEncoder.
     */
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}