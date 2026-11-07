package br.com.activeage.pagamento.service.impl;

import br.com.activeage.pagamento.exception.PagamentoException;
import br.com.activeage.pagamento.model.dto.*;
import br.com.activeage.pagamento.model.entity.Pagamento;
import br.com.activeage.pagamento.model.enums.MetodoPagamento;
import br.com.activeage.pagamento.model.enums.StatusPagamento;
import br.com.activeage.pagamento.model.enums.TipoPagamento;
import br.com.activeage.pagamento.repository.IPagamentoRepository;
import br.com.activeage.pagamento.service.IAssinaturaService;
import br.com.activeage.pagamento.service.IPagamentoService;
import br.com.activeage.pagamento.service.gateway.IMercadoPagoGateway;
import br.com.activeage.pagamento.service.strategy.IEstrategiaSplit;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * Implementação principal do Serviço de Pagamento e Split de Liquidação (DIP / Thomas Erl).
 */
@Slf4j
@Service
public class PagamentoServiceImpl implements IPagamentoService {

    private final IPagamentoRepository pagamentoRepository;
    private final IMercadoPagoGateway mercadoPagoGateway;
    private final IAssinaturaService assinaturaService;
    private final Map<TipoPagamento, IEstrategiaSplit> splitStrategies;

    @Value("${activeage.core.url:http://localhost:8080}")
    private String coreUrl;

    public PagamentoServiceImpl(
            IPagamentoRepository pagamentoRepository,
            IMercadoPagoGateway mercadoPagoGateway,
            IAssinaturaService assinaturaService,
            List<IEstrategiaSplit> strategies
    ) {
        this.pagamentoRepository = pagamentoRepository;
        this.mercadoPagoGateway = mercadoPagoGateway;
        this.assinaturaService = assinaturaService;
        this.splitStrategies = strategies.stream()
                .collect(Collectors.toMap(IEstrategiaSplit::getTipo, s -> s));
    }

    @Override
    @Transactional
    public PagamentoResponse criarPagamentoConsulta(PagamentoConsultaRequest request) {
        log.info("Solicitando intenção de pagamento para teleconsulta: appointmentId={}, paciente={}, médico={}, valor=R$ {}",
                request.getAppointmentId(), request.getPatientNome(), request.getDoctorNome(), request.getValor());

        Optional<Pagamento> existente = pagamentoRepository.findByReferenciaIdAndTipo(
                request.getAppointmentId(), TipoPagamento.CONSULTA_TELEMEDICINA
        );

        if (existente.isPresent() && existente.get().getStatus() == StatusPagamento.APROVADO) {
            throw new PagamentoException("Esta teleconsulta já possui pagamento confirmado.", HttpStatus.CONFLICT);
        }

        IEstrategiaSplit strategy = getStrategy(TipoPagamento.CONSULTA_TELEMEDICINA);
        IEstrategiaSplit.SplitResult split = strategy.calcularSplit(request.getValor());

        Pagamento pagamento = existente.orElseGet(() -> Pagamento.builder()
                .tipo(TipoPagamento.CONSULTA_TELEMEDICINA)
                .referenciaId(request.getAppointmentId())
                .pagadorId(request.getPatientId())
                .pagadorNome(request.getPatientNome())
                .pagadorCpfCnpj(request.getPatientCpf())
                .beneficiarioId(request.getDoctorId())
                .dataCriacao(LocalDateTime.now())
                .build());

        pagamento.setValorTotal(request.getValor());
        pagamento.setValorBeneficiario(split.valorBeneficiario());
        pagamento.setTaxaPlataforma(split.taxaPlataforma());
        pagamento.setMetodo(request.getMetodo());
        pagamento.setStatus(StatusPagamento.PENDENTE);
        pagamento.setDataVencimento(LocalDateTime.now().plusMinutes(15)); // 15 minutos para Pix

        if (request.getMetodo() == MetodoPagamento.PIX) {
            IMercadoPagoGateway.MercadoPagoPixResponse pixResponse = mercadoPagoGateway.gerarCobrancaPix(pagamento);
            pagamento.setMpPaymentId(pixResponse.mpPaymentId());
            pagamento.setQrCodePix(pixResponse.qrCodePix());
            pagamento.setQrCodeBase64(pixResponse.qrCodeBase64());

            if (pixResponse.mpPaymentId().startsWith("CONTINGENCIA-")) {
                pagamento.setStatus(StatusPagamento.PENDENTE_CONTINGENCIA);
            }
        } else if (request.getMetodo() == MetodoPagamento.MERCADO_PAGO_CHECKOUT) {
            IMercadoPagoGateway.MercadoPagoPreferenciaResponse pref = mercadoPagoGateway.criarPreferenciaCheckoutPro(pagamento);
            pagamento.setMpPreferenceId(pref.preferenceId());
            pagamento.setMpInitPoint(pref.initPoint());
            pagamento.setMpSandboxInitPoint(pref.sandboxInitPoint());
        } else {
            String preferenceId = mercadoPagoGateway.criarPreferenciaCartao(pagamento);
            pagamento.setMpPreferenceId(preferenceId);
        }

        Pagamento salvo = pagamentoRepository.save(pagamento);
        return mapToResponse(salvo);
    }

    @Override
    @Transactional
    public PagamentoResponse criarPagamentoAssinatura(PagamentoAssinaturaRequest request) {
        log.info("Solicitando contratação de assinatura SaaS: médicoId={}, nome={}, valor=R$ {}",
                request.getDoctorId(), request.getDoctorNome(), request.getValor());

        IEstrategiaSplit strategy = getStrategy(TipoPagamento.ASSINATURA_SAAS_MEDICO);
        IEstrategiaSplit.SplitResult split = strategy.calcularSplit(request.getValor());

        Pagamento pagamento = Pagamento.builder()
                .tipo(TipoPagamento.ASSINATURA_SAAS_MEDICO)
                .referenciaId(request.getDoctorId())
                .pagadorId(request.getDoctorId())
                .pagadorNome(request.getDoctorNome())
                .pagadorCpfCnpj(request.getDoctorCpfCnpj())
                .beneficiarioId("ACTIVE_AGE_PLATAFORMA")
                .valorTotal(request.getValor())
                .valorBeneficiario(split.valorBeneficiario())
                .taxaPlataforma(split.taxaPlataforma())
                .metodo(request.getMetodo())
                .status(StatusPagamento.PENDENTE)
                .dataCriacao(LocalDateTime.now())
                .dataVencimento(LocalDateTime.now().plusDays(1))
                .build();

        if (request.getMetodo() == MetodoPagamento.PIX) {
            IMercadoPagoGateway.MercadoPagoPixResponse pix = mercadoPagoGateway.gerarCobrancaPix(pagamento);
            pagamento.setMpPaymentId(pix.mpPaymentId());
            pagamento.setQrCodePix(pix.qrCodePix());
            pagamento.setQrCodeBase64(pix.qrCodeBase64());
        } else if (request.getMetodo() == MetodoPagamento.MERCADO_PAGO_CHECKOUT) {
            IMercadoPagoGateway.MercadoPagoPreferenciaResponse pref = mercadoPagoGateway.criarPreferenciaCheckoutPro(pagamento);
            pagamento.setMpPreferenceId(pref.preferenceId());
            pagamento.setMpInitPoint(pref.initPoint());
            pagamento.setMpSandboxInitPoint(pref.sandboxInitPoint());
        } else {
            String preferenceId = mercadoPagoGateway.criarPreferenciaCartao(pagamento);
            pagamento.setMpPreferenceId(preferenceId);
        }

        Pagamento salvo = pagamentoRepository.save(pagamento);
        return mapToResponse(salvo);
    }

    @Override
    @Transactional(readOnly = true)
    public PagamentoResponse buscarPorId(Long id) {
        Pagamento p = pagamentoRepository.findById(id)
                .orElseThrow(() -> new PagamentoException("Pagamento não encontrado com ID: " + id, HttpStatus.NOT_FOUND));
        return mapToResponse(p);
    }

    @Override
    @Transactional(readOnly = true)
    public PagamentoResponse buscarPorConsulta(String appointmentId) {
        Pagamento p = pagamentoRepository.findByReferenciaIdAndTipo(appointmentId, TipoPagamento.CONSULTA_TELEMEDICINA)
                .orElseThrow(() -> new PagamentoException("Nenhum pagamento registrado para a consulta: " + appointmentId, HttpStatus.NOT_FOUND));
        return mapToResponse(p);
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<PagamentoResponse> buscarPorBeneficiario(String beneficiarioId) {
        return pagamentoRepository.findByBeneficiarioId(beneficiarioId).stream()
                .sorted((a, b) -> b.getDataCriacao().compareTo(a.getDataCriacao()))
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public java.util.List<PagamentoResponse> buscarPorPagador(String pagadorId) {
        return pagamentoRepository.findByPagadorId(pagadorId).stream()
                .sorted((a, b) -> b.getDataCriacao().compareTo(a.getDataCriacao()))
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    @Transactional
    public PagamentoResponse estornarPagamento(Long id) {
        Pagamento p = pagamentoRepository.findById(id)
                .orElseThrow(() -> new PagamentoException("Pagamento não encontrado com ID: " + id, HttpStatus.NOT_FOUND));

        if (p.getStatus() != StatusPagamento.APROVADO) {
            throw new PagamentoException("Apenas pagamentos aprovados podem ser estornados.", HttpStatus.BAD_REQUEST);
        }

        boolean sucesso = mercadoPagoGateway.estornarTransacao(p.getMpPaymentId());
        if (!sucesso) {
            throw new PagamentoException("Falha na solicitação de estorno perante o gateway.", HttpStatus.BAD_GATEWAY);
        }

        p.setStatus(StatusPagamento.ESTORNADO);
        Pagamento salvo = pagamentoRepository.save(p);
        log.info("Pagamento ID {} estornado com sucesso.", id);
        return mapToResponse(salvo);
    }

    @Override
    @Transactional
    public void processarWebhook(WebhookEventDto event) {
        log.info("Processando Webhook do Mercado Pago: action={}, id={}", event.getAction(), event.getId());

        String mpPaymentId = null;
        if (event.getData() != null && event.getData().containsKey("id")) {
            mpPaymentId = String.valueOf(event.getData().get("id"));
        } else if (event.getId() != null) {
            mpPaymentId = event.getId();
        }

        if (mpPaymentId == null) {
            log.warn("Notificação de Webhook ignorada: ID do pagamento ausente.");
            return;
        }

        Optional<Pagamento> optPagamento = pagamentoRepository.findByMpPaymentId(mpPaymentId);
        if (optPagamento.isEmpty()) {
            // Tenta localizar o primeiro pendente caso seja um ID recém-gerado pelo gateway
            optPagamento = pagamentoRepository.findByStatus(StatusPagamento.PENDENTE).stream().findFirst();
        }

        if (optPagamento.isPresent()) {
            Pagamento p = optPagamento.get();
            p.setStatus(StatusPagamento.APROVADO);
            p.setDataConfirmacao(LocalDateTime.now());
            pagamentoRepository.save(p);
            log.info("Pagamento aprovado via Webhook: ID={}, Tipo={}, Referência={}", p.getId(), p.getTipo(), p.getReferenciaId());

            if (p.getTipo() == TipoPagamento.CONSULTA_TELEMEDICINA) {
                notificarConfirmacaoConsultaNoCore(p.getReferenciaId());
            } else if (p.getTipo() == TipoPagamento.ASSINATURA_SAAS_MEDICO) {
                assinaturaService.ativarAssinatura(p.getReferenciaId(), p.getPagadorNome() + "@teste.com", p.getPagadorNome(), 1);
                notificarAtivacaoAssinaturaNoCore(p.getReferenciaId());
            }
        }
    }

    private void notificarConfirmacaoConsultaNoCore(String appointmentId) {
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(2))
                    .build();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(coreUrl + "/api/internal/appointments/" + appointmentId + "/confirm-payment"))
                    .method("PATCH", HttpRequest.BodyPublishers.noBody())
                    .timeout(Duration.ofSeconds(2))
                    .build();

            client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                    .thenAccept(res -> log.info("Callback para Core recebido: status={}", res.statusCode()))
                    .exceptionally(err -> {
                        log.warn("Core indisponível para callback imediato de consulta: {}", err.getMessage());
                        return null;
                    });
        } catch (Exception e) {
            log.warn("Erro ao despachar notificação para o Backend Core: {}", e.getMessage());
        }
    }

    private void notificarAtivacaoAssinaturaNoCore(String doctorId) {
        try {
            HttpClient client = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(2))
                    .build();

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(coreUrl + "/api/internal/doctors/" + doctorId + "/activate-subscription"))
                    .method("PATCH", HttpRequest.BodyPublishers.noBody())
                    .timeout(Duration.ofSeconds(2))
                    .build();

            client.sendAsync(request, HttpResponse.BodyHandlers.ofString())
                    .thenAccept(res -> log.info("Callback de assinatura para Core recebido: status={}", res.statusCode()))
                    .exceptionally(err -> {
                        log.warn("Core indisponível para callback imediato de assinatura: {}", err.getMessage());
                        return null;
                    });
        } catch (Exception e) {
            log.warn("Erro ao despachar notificação de assinatura para o Backend Core: {}", e.getMessage());
        }
    }

    private IEstrategiaSplit getStrategy(TipoPagamento tipo) {
        IEstrategiaSplit strategy = splitStrategies.get(tipo);
        if (strategy == null) {
            throw new PagamentoException("Estratégia de cobrança não encontrada para o tipo: " + tipo);
        }
        return strategy;
    }

    private PagamentoResponse mapToResponse(Pagamento p) {
        return PagamentoResponse.builder()
                .id(p.getId())
                .tipo(p.getTipo())
                .referenciaId(p.getReferenciaId())
                .pagadorNome(p.getPagadorNome())
                .beneficiarioId(p.getBeneficiarioId())
                .valorTotal(p.getValorTotal())
                .valorBeneficiario(p.getValorBeneficiario())
                .taxaPlataforma(p.getTaxaPlataforma())
                .metodo(p.getMetodo())
                .status(p.getStatus())
                .mpPaymentId(p.getMpPaymentId())
                .mpPreferenceId(p.getMpPreferenceId())
                .mpInitPoint(p.getMpInitPoint())
                .mpSandboxInitPoint(p.getMpSandboxInitPoint())
                .qrCodePix(p.getQrCodePix())
                .qrCodeBase64(p.getQrCodeBase64())
                .dataCriacao(p.getDataCriacao())
                .dataVencimento(p.getDataVencimento())
                .dataConfirmacao(p.getDataConfirmacao())
                .build();
    }
}
