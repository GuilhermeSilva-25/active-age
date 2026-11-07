package br.com.activeage.pagamento.service;

import br.com.activeage.pagamento.model.dto.AssinaturaResponse;

/**
 * Contrato de negócio para a gestão de assinaturas SaaS de médicos (DIP / Thomas Erl).
 */
public interface IAssinaturaService {

    AssinaturaResponse buscarPorMedico(String doctorId);

    AssinaturaResponse ativarAssinatura(String doctorId, String doctorEmail, String doctorNome, int mesesValidade);

    AssinaturaResponse cancelarAssinatura(String doctorId);
}
