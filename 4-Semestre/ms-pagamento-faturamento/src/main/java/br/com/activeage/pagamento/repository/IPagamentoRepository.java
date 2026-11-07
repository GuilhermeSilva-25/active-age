package br.com.activeage.pagamento.repository;

import br.com.activeage.pagamento.model.entity.Pagamento;
import br.com.activeage.pagamento.model.enums.StatusPagamento;
import br.com.activeage.pagamento.model.enums.TipoPagamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Interface Spring Data JPA para operações com a tabela tb_pagamentos.
 */
@Repository
public interface IPagamentoRepository extends JpaRepository<Pagamento, Long> {

    Optional<Pagamento> findByReferenciaIdAndTipo(String referenciaId, TipoPagamento tipo);

    Optional<Pagamento> findByMpPaymentId(String mpPaymentId);

    List<Pagamento> findByStatus(StatusPagamento status);

    List<Pagamento> findByPagadorId(String pagadorId);

    List<Pagamento> findByBeneficiarioId(String beneficiarioId);
}
