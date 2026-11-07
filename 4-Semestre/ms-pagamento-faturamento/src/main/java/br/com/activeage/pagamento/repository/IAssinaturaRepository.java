package br.com.activeage.pagamento.repository;

import br.com.activeage.pagamento.model.entity.AssinaturaMedico;
import br.com.activeage.pagamento.model.enums.StatusAssinatura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Interface Spring Data JPA para operações com a tabela tb_assinaturas.
 */
@Repository
public interface IAssinaturaRepository extends JpaRepository<AssinaturaMedico, Long> {

    Optional<AssinaturaMedico> findByDoctorId(String doctorId);

    Optional<AssinaturaMedico> findByMpPreapprovalId(String mpPreapprovalId);

    List<AssinaturaMedico> findByStatus(StatusAssinatura status);
}
