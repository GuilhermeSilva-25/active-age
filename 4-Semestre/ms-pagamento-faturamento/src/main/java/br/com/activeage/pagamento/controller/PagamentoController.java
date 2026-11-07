package br.com.activeage.pagamento.controller;

import br.com.activeage.pagamento.model.dto.ApiResponseWrapper;
import br.com.activeage.pagamento.model.dto.PagamentoAssinaturaRequest;
import br.com.activeage.pagamento.model.dto.PagamentoConsultaRequest;
import br.com.activeage.pagamento.model.dto.PagamentoResponse;
import br.com.activeage.pagamento.service.IPagamentoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Controlador RESTful Magro para operações financeiras de pagamentos (MVC / SIGVS-Faturamento).
 */
@RestController
@RequestMapping("/api/v1/pagamentos")
@RequiredArgsConstructor
@Tag(name = "Pagamentos & Split", description = "Operações de checkout e cobranças com Split Direto (Mercado Pago)")
public class PagamentoController {

    private final IPagamentoService pagamentoService;

    @PostMapping("/consulta")
    @Operation(summary = "Gera cobrança para consulta do paciente com Split Direto para o médico")
    public ResponseEntity<ApiResponseWrapper<PagamentoResponse>> criarPagamentoConsulta(
            @Valid @RequestBody PagamentoConsultaRequest request) {
        PagamentoResponse response = pagamentoService.criarPagamentoConsulta(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponseWrapper.success("Cobrança de teleconsulta gerada com sucesso.", response));
    }

    @PostMapping("/assinatura")
    @Operation(summary = "Gera cobrança para contratação da assinatura mensal SaaS pelo médico")
    public ResponseEntity<ApiResponseWrapper<PagamentoResponse>> criarPagamentoAssinatura(
            @Valid @RequestBody PagamentoAssinaturaRequest request) {
        PagamentoResponse response = pagamentoService.criarPagamentoAssinatura(request);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponseWrapper.success("Cobrança de assinatura SaaS gerada com sucesso.", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consulta dados de um pagamento pelo ID primário")
    public ResponseEntity<ApiResponseWrapper<PagamentoResponse>> buscarPorId(@PathVariable Long id) {
        PagamentoResponse response = pagamentoService.buscarPorId(id);
        return ResponseEntity.ok(ApiResponseWrapper.success("Pagamento localizado com sucesso.", response));
    }

    @GetMapping("/consulta/{appointmentId}")
    @Operation(summary = "Busca fatura/pagamento vinculado a uma teleconsulta")
    public ResponseEntity<ApiResponseWrapper<PagamentoResponse>> buscarPorConsulta(@PathVariable String appointmentId) {
        PagamentoResponse response = pagamentoService.buscarPorConsulta(appointmentId);
        return ResponseEntity.ok(ApiResponseWrapper.success("Pagamento da consulta localizado.", response));
    }

    @PostMapping("/{id}/estorno")
    @Operation(summary = "Realiza o cancelamento ético de consulta (> 24h) com estorno financeiro")
    public ResponseEntity<ApiResponseWrapper<PagamentoResponse>> estornarPagamento(@PathVariable Long id) {
        PagamentoResponse response = pagamentoService.estornarPagamento(id);
        return ResponseEntity.ok(ApiResponseWrapper.success("Estorno realizado com sucesso.", response));
    }
}
