package br.com.activeage.pagamento;

import br.com.activeage.pagamento.config.OpenApiConfig;
import br.com.activeage.pagamento.exception.GlobalExceptionHandler;
import br.com.activeage.pagamento.exception.PagamentoException;
import br.com.activeage.pagamento.model.dto.ApiResponseWrapper;
import io.swagger.v3.oas.models.OpenAPI;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import static org.junit.jupiter.api.Assertions.*;

class ExceptionAndConfigTest {

    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();
    private final OpenApiConfig openApiConfig = new OpenApiConfig();

    @Test
    @DisplayName("PCE: Deve tratar PagamentoException e retornar envelope de erro")
    void shouldHandlePagamentoException() {
        PagamentoException ex = new PagamentoException("Erro de negócio financeiro", HttpStatus.UNPROCESSABLE_ENTITY);
        ResponseEntity<ApiResponseWrapper<Void>> response = handler.handlePagamentoException(ex);

        assertEquals(HttpStatus.UNPROCESSABLE_ENTITY, response.getStatusCode());
        assertEquals("ERROR", response.getBody().getStatus());
        assertEquals("Erro de negócio financeiro", response.getBody().getMessage());
    }

    @Test
    @DisplayName("PCE: Deve tratar IllegalArgumentException")
    void shouldHandleIllegalArgumentException() {
        IllegalArgumentException ex = new IllegalArgumentException("Parâmetro inválido");
        ResponseEntity<ApiResponseWrapper<Void>> response = handler.handleIllegalArgumentException(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("ERROR", response.getBody().getStatus());
    }

    @Test
    @DisplayName("PCE: Deve tratar Exception genérica com HTTP 500")
    void shouldHandleGenericException() {
        Exception ex = new RuntimeException("Falha catastrófica");
        ResponseEntity<ApiResponseWrapper<Void>> response = handler.handleGenericException(ex);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("ERROR", response.getBody().getStatus());
    }

    @Test
    @DisplayName("PCE: Deve carregar configuração do OpenAPI")
    void shouldLoadOpenAPI() {
        OpenAPI openAPI = openApiConfig.customOpenAPI();
        assertNotNull(openAPI);
        assertNotNull(openAPI.getInfo());
        assertEquals("Active Age — Microsserviço de Pagamento & Assinaturas SaaS", openAPI.getInfo().getTitle());
    }
}
