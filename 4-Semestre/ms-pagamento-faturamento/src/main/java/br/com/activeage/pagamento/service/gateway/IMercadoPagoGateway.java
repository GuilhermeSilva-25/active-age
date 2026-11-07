package br.com.activeage.pagamento.service.gateway;

import br.com.activeage.pagamento.model.entity.Pagamento;

/**
 * Interface abstrata do cliente de integração com o gateway de pagamentos do Mercado Pago (DIP).
 */
public interface IMercadoPagoGateway {

    /**
     * Gera cobrança Pix com split de liquidação configurado.
     */
    MercadoPagoPixResponse gerarCobrancaPix(Pagamento pagamento);

    /**
     * Cria preferência de pagamento com cartão de crédito transparente.
     */
    String criarPreferenciaCartao(Pagamento pagamento);

    /**
     * Cria preferência oficial do Checkout Pro do Mercado Pago (retorna init_point e sandbox_init_point).
     */
    MercadoPagoPreferenciaResponse criarPreferenciaCheckoutPro(Pagamento pagamento);

    /**
     * Consulta o status real de uma transação diretamente no gateway.
     */
    String consultarStatusTransacao(String mpPaymentId);

    /**
     * Realiza o estorno de uma transação aprovada.
     */
    boolean estornarTransacao(String mpPaymentId);

    record MercadoPagoPixResponse(
            String mpPaymentId,
            String qrCodePix,
            String qrCodeBase64
    ) {}

    record MercadoPagoPreferenciaResponse(
            String preferenceId,
            String initPoint,
            String sandboxInitPoint
    ) {}
}
