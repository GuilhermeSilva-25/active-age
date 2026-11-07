package br.com.activeage.pagamento.exception;

import org.springframework.http.HttpStatus;

/**
 * Exceção de negócio para falhas no fluxo de pagamento ou assinaturas SaaS.
 */
public class PagamentoException extends RuntimeException {

    private final HttpStatus status;

    public PagamentoException(String message) {
        super(message);
        this.status = HttpStatus.BAD_REQUEST;
    }

    public PagamentoException(String message, HttpStatus status) {
        super(message);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }
}
