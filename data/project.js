window.GDHAGP_PROJECT = {

    name:
        "GDHAGP",

    fullName:
        "Grande Dicionário Hebraico–Aramaico–Grego–Português",

    version:
        "0.1",

    status:
        "Projeto filológico e lexicográfico em desenvolvimento",

    description:
        "O GDHAGP — Grande Dicionário Hebraico–Aramaico–Grego–Português — é um projeto filológico e lexicográfico dedicado às línguas bíblicas e à literatura cristã antiga. Cada verbete distingue fontes, traduções, análise e síntese editorial própria, preservando a independência dos léxicos, a precisão semântica e o contexto histórico de cada acepção em si.",

    languages: [
        "Grego",
        "Hebraico",
        "Aramaico"
    ],

    editorialLayers: [

        {
            id:
                "fonte",

            label:
                "Fonte",

            description:
                "Reprodução documental do que cada fonte efetivamente apresenta, preservando o verbete integral, sua organização, exemplos, referências, remissões, notas e aparato."
        },

        {
            id:
                "traducao",

            label:
                "Tradução",

            description:
                "Tradução integral e controlada de cada fonte, mantendo sua estrutura e sem acrescentar silenciosamente dados de outros léxicos."
        },

        {
            id:
                "analise",

            label:
                "Análise",

            description:
                "Discussão filológica, morfológica, histórica, textual, semântica e etimológica, claramente separada da documentação das fontes."
        },

        {
            id:
                "gdhagp",

            label:
                "GDHAGP",

            description:
                "Síntese lexicográfica própria e independente, construída criticamente depois do exame das fontes."
        }

    ],

    principles: [

        "As fontes permanecem independentes.",

        "O verbete de uma fonte não pode ser substituído por resumo ou seleção de acepções.",

        "Transcrição, tradução, análise e síntese são camadas diferentes.",

        "Não se inventam leituras ilegíveis.",

        "Transcrições de scans devem declarar seu estado de conferência.",

        "Fontes on-line devem ser identificadas pela edição ou provedor consultado.",

        "Fatos, inferências, hipóteses, cognatos, empréstimos e reconstruções devem permanecer distinguíveis."

    ]

};