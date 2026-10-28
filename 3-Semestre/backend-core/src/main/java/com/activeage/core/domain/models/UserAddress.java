package com.activeage.core.domain.models;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Representa os dados de endereço residencial de um usuário (especialmente Paciente).
 * Necessário para conformidade legal na emissão de receitas médicas digitais com entrega em domicílio.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserAddress {

    /**
     * Código de Endereçamento Postal (CEP com máscara 00000-000).
     */
    private String cep;

    /**
     * Logradouro (Rua, Avenida, Alameda, etc.).
     */
    private String logradouro;

    /**
     * Número do imóvel.
     */
    private String numero;

    /**
     * Complemento do imóvel (Apto, Bloco, Casa, etc.).
     */
    private String complemento;

    /**
     * Bairro residencial.
     */
    private String bairro;

    /**
     * Cidade / Município.
     */
    private String cidade;

    /**
     * Unidade Federativa (UF com 2 letras).
     */
    private String uf;
}
