package com.activeage.core.repositories;

import com.activeage.core.domain.models.User;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

/**
 * Interface responsável pelas operações de banco de dados (CRUD)
 * para a entidade User. O Spring Data MongoDB fornece as implementações
 * automaticamente em tempo de execução.
 */
@Repository
public interface UserRepository extends MongoRepository<User, String> {

    /**
     * Busca um usuário pelo seu e-mail.
     * Utilizado internamente pelo Spring Security no processo de autenticação (Login).
     *
     * @param email E-mail a ser pesquisado no banco de dados.
     * @return Um Optional contendo o usuário, se encontrado.
     */
    Optional<User> findByEmail(String email);

    /**
     * Verifica se já existe um usuário cadastrado com um determinado e-mail.
     * Utilizado para validação de regras de negócio no momento do cadastro.
     *
     * @param email E-mail a ser verificado.
     * @return true se o e-mail já existir na plataforma, false caso contrário.
     */
    boolean existsByEmail(String email);
}