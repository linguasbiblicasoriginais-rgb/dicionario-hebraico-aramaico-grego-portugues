window.GDHAGP_PROJECT = {

    name: "GDHAGP",

    fullName:
        "Grande Dicionário Hebraico–Aramaico–Grego–Português",

    version: "0.1",

    status:
        "Projeto lexicográfico em desenvolvimento",

    languages: [
        "Grego",
        "Hebraico",
        "Aramaico"
    ],

    editorialLayers: [

        {
            id: "fonte",

            label: "Fonte",

            description:
                "Registro documental do que cada léxico ou fonte efetivamente apresenta, sem fusão silenciosa entre obras diferentes."
        },

        {
            id: "traducao",

            label: "Tradução",

            description:
                "Tradução literal ou controlada do material de cada fonte, mantendo cada testemunho lexicográfico independente."
        },

        {
            id: "analise",

            label: "Análise",

            description:
                "Discussão filológica, morfológica, histórica, textual, semântica e etimológica, explicitamente distinta da documentação das fontes."
        },

        {
            id: "gdhagp",

            label: "GDHAGP",

            description:
                "Síntese editorial própria e independente do projeto, construída criticamente depois do exame das fontes."
        }

    ]

};