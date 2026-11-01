export interface DicaLongevidade {
    id: string;
    tema: string;
    titulo: string;
    descricao: string;
    fonteCientifica: string;
    icone: 'droplets' | 'dumbbell' | 'brain' | 'shield' | 'pill' | 'moon' | 'apple' | 'heart' | 'eye' | 'activity' | 'syringe' | 'smile';
}

export const DICAS_LONGEVIDADE: DicaLongevidade[] = [
    {
        id: 'dica-hidratacao',
        tema: 'Hidratação & Fisiologia',
        titulo: 'Beba água regularmente, mesmo sem sentir sede',
        descricao: 'Com o envelhecimento, os sensores cerebrais da sede perdem sensibilidade e os rins reduzem a retenção hídrica. Manter uma ingestão fracionada de 1,5L a 2L de água ao longo do dia previne hipotensão postural, infecções urinárias e confusão mental aguda (delirium).',
        fonteCientifica: 'Sociedade Brasileira de Geriatria e Gerontologia (SBGG) & Ministério da Saúde',
        icone: 'droplets',
    },
    {
        id: 'dica-sarcopenia',
        tema: 'Massa Muscular & Força',
        titulo: 'Fortalecimento muscular contra a sarcopenia',
        descricao: 'A partir dos 60 anos, a perda natural de massa e força muscular acelera. Exercícios de força (musculação adaptada, pilates clínico ou fisioterapia) 2 a 3 vezes por semana estimulam a síntese proteica, preservam a densidade óssea e garantem a velocidade da marcha.',
        fonteCientifica: 'Grupo Europeu de Consenso em Sarcopenia (EWGSOP2) & ACSM',
        icone: 'dumbbell',
    },
    {
        id: 'dica-cognicao',
        tema: 'Cognição & Neuroplasticidade',
        titulo: 'Desafie seu cérebro com novos aprendizados',
        descricao: 'Aprender habilidades inéditas — como tocar um instrumento musical, aprender outro idioma ou praticar jogos de estratégia — estimula a neurogênese e fortalece as conexões sinápticas, construindo reserva cognitiva que protege contra quadros demenciais.',
        fonteCientifica: 'Estudo Multicêntrico FINGER / The Lancet Neurology',
        icone: 'brain',
    },
    {
        id: 'dica-quedas',
        tema: 'Segurança & Ambiente Doméstico',
        titulo: 'Prevenção ativa de quedas no domicílio',
        descricao: 'Mais de 70% das quedas em idosos ocorrem dentro de casa. Retirar tapetes soltos, instalar barras de apoio no banheiro, usar calçados firmes com solado antiderrapante e manter iluminação indireta no trajeto noturno reduzem drasticamente fraturas de fêmur.',
        fonteCientifica: 'Diretrizes Globais de Prevenção de Quedas (OMS) & SBGG',
        icone: 'shield',
    },
    {
        id: 'dica-polifarmacia',
        tema: 'Uso Racional de Medicamentos',
        titulo: 'Polifarmácia sob vigilância e desprescrição segura',
        descricao: 'O uso diário de 5 ou mais medicamentos aumenta o risco de interações adversas, tonturas e sedação. Nunca adicione ou suspenda remédios por conta própria; revise periodicamente sua receita com o geriatra para avaliar dosagens e desprescrições éticas.',
        fonteCientifica: 'Critérios de Beers (American Geriatrics Society) & STOPP/START',
        icone: 'pill',
    },
    {
        id: 'dica-sono',
        tema: 'Ciclo Circadiano & Repouso',
        titulo: 'Higiene do sono e luz solar matinal',
        descricao: 'A exposição à claridade natural logo pela manhã ajuda a regular a produção noturna de melatonina. Evite telas de celular ou TV pelo menos 1 hora antes de dormir e restrinja café e chás estimulantes após as 16h para melhorar o sono profundo restaurador.',
        fonteCientifica: 'Associação Brasileira do Sono (ABS) & National Sleep Foundation',
        icone: 'moon',
    },
    {
        id: 'dica-nutricao',
        tema: 'Nutrição & Saúde Vascular',
        titulo: 'Padrão alimentar mediterrâneo e dieta MIND',
        descricao: 'Priorizar azeite de oliva extravirgem, peixes ricos em ômega-3, folhas verdes escuras, frutas vermelhas e castanhas combate a neuroinflamação e o estresse oxidativo, beneficiando a circulação cerebral e a integridade cardiovascular.',
        fonteCientifica: 'Rush University Medical Center (Estudo Diet MIND) & American Heart Association',
        icone: 'apple',
    },
    {
        id: 'dica-social',
        tema: 'Saúde Emocional & Conexão',
        titulo: 'Cultive laços afetivos e vida comunitária ativa',
        descricao: 'A solidão e o isolamento social crônico elevam o cortisol e aumentam o risco cardiovascular e depressivo. Conversar com amigos, participar de atividades em grupo e manter contato com a família atuam como um dos maiores preditores de longevidade saudável.',
        fonteCientifica: 'Estudo de Desenvolvimento Adulto da Universidade de Harvard (Robert Waldinger)',
        icone: 'heart',
    },
    {
        id: 'dica-sentidos',
        tema: 'Estímulo Sensorial & Equilíbrio',
        titulo: 'Atenção redobrada à visão e à audição',
        descricao: 'A perda auditiva não corrigida e problemas visuais são os principais fatores de risco modificáveis para o isolamento e o declínio cognitivo precoce. Manter o uso adequado de aparelhos auditivos e óculos preserva a estimulação sensorial cortical.',
        fonteCientifica: 'Comissão The Lancet sobre Prevenção e Cuidados na Demência',
        icone: 'eye',
    },
    {
        id: 'dica-postura',
        tema: 'Flexibilidade & Equilíbrio Postural',
        titulo: 'Alongamento suave e treino de equilíbrio diário',
        descricao: 'Práticas como Tai Chi Chuan ou simples exercícios de equilíbrio postural melhoram a propriocepção das articulações e a postura, aliviando sobrecargas na coluna e joelhos provocadas pela osteoartrose.',
        fonteCientifica: 'Sociedade Brasileira de Reumatologia (SBR) & SBOT',
        icone: 'activity',
    },
    {
        id: 'dica-imunizacao',
        tema: 'Imunossenescência & Prevenção',
        titulo: 'Mantenha sua caderneta de vacinação atualizada',
        descricao: 'Com a imunossenescência natural, o organismo precisa de reforços específicos. As vacinas contra Influenza (gripe anual), Pneumocócica (contra pneumonia), Herpes-Zóster e Covid-19 evitam internações graves e complicações pulmonares.',
        fonteCientifica: 'Sociedade Brasileira de Imunizações (SBIm) & SBGG',
        icone: 'syringe',
    },
    {
        id: 'dica-mastigacao',
        tema: 'Saúde Bucal & Digestão',
        titulo: 'Mastigação eficiente e saúde bucal contínua',
        descricao: 'A correta adaptação de próteses ou dentes naturais permite triturar adequadamente as fibras e proteínas dos alimentos, evitando engasgos (disfagia), má absorção nutricional e risco de pneumonia por aspiração.',
        fonteCientifica: 'Conselho Federal de Odontologia (CFO) & SBGG',
        icone: 'smile',
    },
];

/**
 * Retorna uma dica aleatória do banco.
 * Se informado um `excluirId`, garante que uma dica diferente seja sorteada (evitando repetição imediata).
 */
export function obterDicaAleatoria(excluirId?: string): DicaLongevidade {
    const disponiveis = excluirId
        ? DICAS_LONGEVIDADE.filter(d => d.id !== excluirId)
        : DICAS_LONGEVIDADE;

    const lista = disponiveis.length > 0 ? disponiveis : DICAS_LONGEVIDADE;
    const indice = Math.floor(Math.random() * lista.length);
    return lista[indice];
}

