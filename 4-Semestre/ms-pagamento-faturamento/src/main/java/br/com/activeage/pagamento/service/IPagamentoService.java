package br.com.activeage.pagamento.service;

import br.com.activeage.pagamento.model.dto.PagamentoAssinaturaRequest;
import br.com.activeage.pagamento.model.dto.PagamentoConsultaRequest;
import br.com.activeage.pagamento.model.dto.PagamentoResponse;
import br.com.activeage.pagamento.model.dto.WebhookEventDto;

/**
 * Contrato de negócio para o ciclo de vida transacional de pagamentos (DIP / Thomas Erl).
 */
public interface IPagamentoService {

    PagamentoResponse criarPagamentoConsulta(PagamentoConsultaRequest request);

    PagamentoResponse criarPagamentoAssinatura(PagamentoAssinaturaRequest request);

    PagamentoResponse buscarPorId(Long id);

    PagamentoResponse buscarPorConsulta(String appointmentId);

    java.util.List<PagamentoResponse> buscarPorBeneficiario(String beneficiarioId);

    java.util.List<PagamentoResponse> buscarPorPagador(String pagadorId);

    PagamentoResponse estornarPagamento(Long id);

    void processarWebhook(WebhookEventDto event);
}
