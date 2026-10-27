/**
 * Utilitários de Máscaras Bancárias e Lista de Instituições Financeiras Oficiais (Febraban / BACEN).
 * Atende às necessidades de Split Direto de Pagamentos da Active Age.
 */

export interface BankOption {
    code: string;
    name: string;
    label: string;
}

export const BRAZILIAN_BANKS: BankOption[] = [
    { code: '001', name: 'Banco do Brasil S.A.', label: '001 - Banco do Brasil S.A.' },
    { code: '033', name: 'Banco Santander (Brasil) S.A.', label: '033 - Banco Santander (Brasil) S.A.' },
    { code: '104', name: 'Caixa Econômica Federal', label: '104 - Caixa Econômica Federal' },
    { code: '237', name: 'Banco Bradesco S.A.', label: '237 - Banco Bradesco S.A.' },
    { code: '260', name: 'Nu Pagamentos S.A. (Nubank)', label: '260 - Nu Pagamentos S.A. (Nubank)' },
    { code: '341', name: 'Itaú Unibanco S.A.', label: '341 - Itaú Unibanco S.A.' },
    { code: '077', name: 'Banco Inter S.A.', label: '077 - Banco Inter S.A.' },
    { code: '212', name: 'Banco Original S.A.', label: '212 - Banco Original S.A.' },
    { code: '290', name: 'PagBank (PagSeguro)', label: '290 - PagBank (PagSeguro)' },
    { code: '336', name: 'Banco C6 S.A.', label: '336 - Banco C6 S.A.' },
    { code: '380', name: 'PicPay Serviços S.A.', label: '380 - PicPay Serviços S.A.' },
    { code: '748', name: 'Banco Cooperativo Sicredi S.A.', label: '748 - Banco Cooperativo Sicredi S.A.' },
    { code: '756', name: 'Banco Cooperativo Sicoob S.A.', label: '756 - Banco Cooperativo Sicoob S.A.' },
    { code: '041', name: 'Banco do Estado do Rio Grande do Sul (Banrisul)', label: '041 - Banrisul' },
    { code: '070', name: 'Banco de Brasília (BRB)', label: '070 - BRB (Banco de Brasília)' },
    { code: '422', name: 'Banco Safra S.A.', label: '422 - Banco Safra S.A.' },
    { code: '655', name: 'Banco Votorantim S.A.', label: '655 - Banco Votorantim S.A.' },
    { code: '208', name: 'Banco BTG Pactual S.A.', label: '208 - Banco BTG Pactual S.A.' },
    { code: 'OUTRO', name: 'Outra Instituição Financeira', label: 'Outra Instituição Financeira' },
];

/**
 * Formata Agência Bancária (máx 5 dígitos com hífen opcional para dígito verificador).
 * Ex: 1234 ou 1234-5
 */
export function maskAgency(value: string): string {
    const raw = value.replace(/[^0-9kKxX-]/g, '').toUpperCase();
    // Limita o tamanho total em 7 caracteres (ex: 12345-X)
    return raw.slice(0, 7);
}

/**
 * Formata Número da Conta Bancária (números com dígito verificador final após hífen).
 * Ex: 12345-6 ou 12345678-X
 */
export function maskAccountNumber(value: string): string {
    // Remove qualquer caractere que não seja número ou x/X
    const clean = value.replace(/[^0-9kKxX]/g, '').toUpperCase();
    if (!clean) return '';
    if (clean.length === 1) return clean;

    // Se tiver mais de 1 caractere, separa o último como dígito verificador
    const accountPart = clean.slice(0, -1).slice(0, 11);
    const digitPart = clean.slice(-1);
    return `${accountPart}-${digitPart}`;
}

/**
 * Formata CPF: 000.000.000-00
 */
export function maskCpf(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
}

/**
 * Formata CNPJ: 00.000.000/0001-00
 */
export function maskCnpj(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 14);
    return digits
        .replace(/(\d{2})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1/$2')
        .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
}

/**
 * Formata Telefone Celular: (00) 00000-0000
 */
export function maskPhone(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 10) {
        return digits
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{4})(\d{1,4})$/, '$1-$2');
    }
    return digits
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d{1,4})$/, '$1-$2');
}

/**
 * Aplica a máscara dinâmica na Chave PIX conforme a tipagem regulatória.
 */
export function maskPixKey(value: string, keyType: string): string {
    switch (keyType) {
        case 'CPF':
            return maskCpf(value);
        case 'CNPJ':
            return maskCnpj(value);
        case 'TELEFONE':
            return maskPhone(value);
        case 'EMAIL':
            return value.trim().toLowerCase();
        case 'ALEATORIA':
            return value.trim();
        default:
            return value;
    }
}
