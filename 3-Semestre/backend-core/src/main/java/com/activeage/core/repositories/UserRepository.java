package com.activeage.core.repositories;

import com.activeage.core.domain.enums.DoctorDossierStatus;
import com.activeage.core.domain.enums.Role;
import com.activeage.core.domain.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Interface responsável pelas operações de banco de dados (CRUD)
 * para a entidade User no MongoDB Atlas.
 */
@Repository
public interface UserRepository extends MongoRepository<User, String> {

    /**
     * Busca um usuário pelo seu e-mail.
     */
    Optional<User> findByEmail(String email);

    /**
     * Verifica se já existe um usuário cadastrado com um determinado e-mail.
     */
    boolean existsByEmail(String email);

    /**
     * Retorna todos os usuários por perfil (ex: ROLE_MEDICO).
     */
    List<User> findByRole(Role role);

    /**
     * Retorna médicos filtrados por status do Dossiê de Credenciamento.
     */
    List<User> findByRoleAndDossierStatus(Role role, DoctorDossierStatus dossierStatus);

    /**
     * Retorna médicos homologados e ativos para exibição na vitrine de busca pública (UC08 / RN004).
     */
    List<User> findByRoleAndActiveAndDossierStatus(Role role, boolean active, DoctorDossierStatus dossierStatus);

    /**
     * Conta médicos por status do Dossiê (para métricas e badges de pendência).
     */
    long countByRoleAndDossierStatus(Role role, DoctorDossierStatus dossierStatus);

    /**
     * Conta usuários por perfil (ex: ROLE_PACIENTE).
     */
    long countByRole(Role role);
}
