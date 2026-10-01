(function () {

    "use strict";


    const PROJECT =
        window.GDHAGP_PROJECT;

    const SOURCES =
        window.GDHAGP_SOURCES || [];

    const ENTRIES =
        window.GDHAGP_ENTRIES || [];


    const app =
        document.getElementById("app");

    const sidebar =
        document.getElementById("sidebar");

    const menuButton =
        document.getElementById("menu-button");

    const themeButton =
        document.getElementById("theme-button");


    const ENTRY_TABS = [
        "GDHAGP",
        "Fontes",
        "Tradução",
        "Análise",
        "Formas",
        "Bibliografia"
    ];


    function escapeHtml(value) {

        return String(value ?? "")
            .replace(
                /[&<>"']/g,
                character => ({
                    "&": "&amp;",
                    "<": "&lt;",
                    ">": "&gt;",
                    "\"": "&quot;",
                    "'": "&#039;"
                })[character]
            );

    }


    function normalizeSearch(value) {

        return String(value ?? "")
            .normalize("NFD")
            .replace(/\p{M}/gu, "")
            .toLocaleLowerCase("pt-BR")
            .trim();

    }


    function sourceById(id) {

        return SOURCES.find(
            source => source.id === id
        );

    }


    function getRoute() {

        const route =
            decodeURIComponent(
                location.hash.replace(/^#/, "")
            );

        return route || "inicio";

    }


    function setTheme(theme) {

        document.documentElement.dataset.theme =
            theme;

        localStorage.setItem(
            "gdhagp-theme",
            theme
        );

        if (theme === "dark") {

            themeButton.textContent =
                "☀";

            themeButton.title =
                "Usar tema claro";

        }
        else {

            themeButton.textContent =
                "◐";

            themeButton.title =
                "Usar tema escuro";

        }

    }


    function initializeTheme() {

        const storedTheme =
            localStorage.getItem(
                "gdhagp-theme"
            );

        const prefersDark =
            window.matchMedia &&
            window.matchMedia(
                "(prefers-color-scheme: dark)"
            ).matches;

        setTheme(
            storedTheme ||
            (
                prefersDark
                    ? "dark"
                    : "light"
            )
        );

    }


    function closeSidebar() {

        sidebar.classList.remove("open");

        menuButton.setAttribute(
            "aria-expanded",
            "false"
        );

    }


    function setActiveNavigation(route) {

        let navigationRoute =
            route.split("/")[0];

        if (
            navigationRoute ===
            "verbete"
        ) {

            const entry =
                ENTRIES.find(
                    item =>
                        item.id ===
                        route.split("/")[1]
                );

            navigationRoute =
                entry?.language ||
                "grego";

        }


        document
            .querySelectorAll(
                ".main-navigation a"
            )
            .forEach(link => {

                link.classList.toggle(
                    "active",
                    link.dataset.route ===
                    navigationRoute
                );

            });

    }


    function renderSearchForm(
        value = ""
    ) {

        return `

            <form
                id="search-form"
                class="search-form"
                role="search"
            >

                <input
                    id="search-input"
                    class="search-input"
                    type="search"
                    value="${escapeHtml(value)}"
                    placeholder="Buscar lema, transliteração, definição ou acepção…"
                    aria-label="Buscar no GDHAGP"
                >

                <button
                    class="primary-button"
                    type="submit"
                >
                    Buscar
                </button>

            </form>

        `;

    }


    function bindSearchForm() {

        const form =
            document.getElementById(
                "search-form"
            );

        if (!form) {
            return;
        }


        form.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                const input =
                    document.getElementById(
                        "search-input"
                    );

                const query =
                    input.value.trim();

                if (!query) {

                    location.hash =
                        "busca";

                    return;

                }

                location.hash =
                    "busca/" +
                    encodeURIComponent(query);

            }
        );

    }


    function entrySearchText(entry) {

        const definitions =
            entry.definitions
                .map(
                    definition =>
                        [
                            definition.title,
                            definition.definition,
                            ...(definition.equivalents || [])
                        ].join(" ")
                )
                .join(" ");


        return [

            entry.lemma,

            entry.lexicalForm,

            entry.article,

            entry.genitive,

            entry.transliteration,

            entry.partOfSpeech,

            entry.gender,

            entry.declension,

            entry.shortSummary,

            entry.principalSemiticCorrespondence,

            definitions

        ].join(" ");

    }


    function searchEntries(query) {

        const needle =
            normalizeSearch(query);


        if (!needle) {
            return ENTRIES;
        }


        return ENTRIES
            .map(entry => {

                const lemma =
                    normalizeSearch(
                        entry.lemma
                    );

                const transliteration =
                    normalizeSearch(
                        entry.transliteration
                    );

                const content =
                    normalizeSearch(
                        entrySearchText(entry)
                    );


                let score = 0;


                if (lemma === needle) {
                    score += 100;
                }

                if (
                    transliteration ===
                    needle
                ) {
                    score += 90;
                }

                if (
                    lemma.includes(
                        needle
                    )
                ) {
                    score += 60;
                }

                if (
                    transliteration.includes(
                        needle
                    )
                ) {
                    score += 40;
                }

                if (
                    content.includes(
                        needle
                    )
                ) {
                    score += 10;
                }


                return {
                    entry,
                    score
                };

            })

            .filter(
                item =>
                    item.score > 0
            )

            .sort(
                (a, b) =>
                    b.score - a.score
            )

            .map(
                item =>
                    item.entry
            );

    }


    function renderHome() {

        app.innerHTML = `

            <section class="paper">

                <div class="home-grid">

                    <div>

                        <div class="eyebrow">
                            Projeto lexicográfico
                        </div>

                        <h1 class="project-title">
                            ${escapeHtml(PROJECT.fullName)}
                        </h1>

                        <p class="lede">

                            Dicionário filológico de longo prazo,
                            organizado para manter separadas
                            documentação das fontes,
                            tradução controlada,
                            análise e síntese editorial.

                        </p>

                        ${renderSearchForm()}

                    </div>


                    <aside class="editorial-principle">

                        <div class="eyebrow">
                            Método fundamental
                        </div>

                        ${PROJECT.editorialLayers
                            .map(
                                (layer, index) => `

                                    <div class="editorial-layer">

                                        <span class="editorial-layer-number">
                                            ${index + 1}
                                        </span>

                                        <div>

                                            <strong>
                                                ${escapeHtml(layer.label)}
                                            </strong>

                                            <br>

                                            ${escapeHtml(layer.description)}

                                        </div>

                                    </div>

                                `
                            )
                            .join("")}

                    </aside>

                </div>

            </section>


            <section class="paper">

                <div class="eyebrow">
                    Verbete inaugural
                </div>

                <div class="lemma">
                    λόγος
                </div>

                <p class="entry-summary">
                    ${escapeHtml(
                        ENTRIES[0]?.shortSummary || ""
                    )}
                </p>

                <p>
                    <a href="#verbete/gr-logos">
                        Abrir o verbete completo →
                    </a>
                </p>

            </section>

        `;


        bindSearchForm();

    }


    function renderSearch(routeParts) {

        const query =
            routeParts
                .slice(1)
                .join("/");

        const decodedQuery =
            query
                ? decodeURIComponent(query)
                : "";


        const results =
            searchEntries(
                decodedQuery
            );


        app.innerHTML = `

            <section class="paper">

                <div class="eyebrow">
                    Consulta local
                </div>

                <h1>
                    Busca
                </h1>

                <p class="lede">

                    A pesquisa é executada inteiramente
                    no navegador e procura lema,
                    transliteração, metadados,
                    definições e equivalentes.

                </p>

                ${renderSearchForm(
                    decodedQuery
                )}


                <div class="search-results">

                    ${
                        results.length
                            ?
                            results
                                .map(
                                    entry => `

                                        <a
                                            class="search-result"
                                            href="#verbete/${encodeURIComponent(entry.id)}"
                                        >

                                            <div class="search-result-lemma">
                                                ${escapeHtml(entry.lemma)}
                                            </div>

                                            <div>

                                                <em>
                                                    ${escapeHtml(entry.transliteration)}
                                                </em>

                                                ·

                                                ${escapeHtml(entry.partOfSpeech)}

                                            </div>

                                            <div class="search-result-meta">
                                                ${escapeHtml(entry.shortSummary)}
                                            </div>

                                        </a>

                                    `
                                )
                                .join("")

                            :

                            `
                                <div class="empty-state">
                                    Nenhum verbete encontrado.
                                </div>
                            `
                    }

                </div>

            </section>

        `;


        bindSearchForm();

    }


    function renderLanguage(
        language
    ) {

        const labels = {

            grego: {
                title: "Grego",
                sample: "λόγος",
                className: "greek"
            },

            hebraico: {
                title: "Hebraico",
                sample: "דָּבָר",
                className: "hebrew"
            },

            aramaico: {
                title: "Aramaico",
                sample: "מִלָּה",
                className: "hebrew"
            }

        };


        const configuration =
            labels[language];


        const entries =
            ENTRIES.filter(
                entry =>
                    entry.language ===
                    language
            );


        app.innerHTML = `

            <section class="paper">

                <div class="language-banner">

                    <div>

                        <div
                            class="
                                language-symbol
                                ${configuration.className}
                            "
                        >
                            ${configuration.sample}
                        </div>

                        <h1>
                            ${configuration.title}
                        </h1>

                        <p class="lede">

                            ${
                                entries.length
                                    ?
                                    `${entries.length} verbete(s) disponível(is) nesta versão.`
                                    :
                                    "Seção preparada para expansão futura."
                            }

                        </p>

                    </div>

                </div>


                ${
                    entries.length
                        ?
                        `

                        <div class="search-results">

                            ${entries
                                .map(
                                    entry => `

                                    <a
                                        class="search-result"
                                        href="#verbete/${entry.id}"
                                    >

                                        <div class="search-result-lemma">
                                            ${escapeHtml(entry.lemma)}
                                        </div>

                                        <div>
                                            <em>
                                                ${escapeHtml(entry.transliteration)}
                                            </em>
                                        </div>

                                        <div class="search-result-meta">
                                            ${escapeHtml(entry.shortSummary)}
                                        </div>

                                    </a>

                                    `
                                )
                                .join("")}

                        </div>

                        `
                        :
                        ""
                }

            </section>

        `;

    }


    function renderSourcesPage() {

        app.innerHTML = `

            <section class="paper">

                <div class="eyebrow">
                    Documentação
                </div>

                <h1>
                    Fontes
                </h1>

                <p class="lede">

                    Cada fonte lexicográfica permanece
                    independente.
                    O GDHAGP não cria uma fonte composta
                    artificial pela fusão silenciosa
                    de léxicos diferentes.

                </p>


                ${SOURCES
                    .map(
                        source => `

                            <article class="source-card">

                                <h3>
                                    ${escapeHtml(source.shortName)}
                                </h3>

                                <div class="source-meta">

                                    <span>
                                        ${escapeHtml(source.material)}
                                    </span>

                                    <span>
                                        ${escapeHtml(source.scope)}
                                    </span>

                                    ${
                                        source.year
                                            ?
                                            `<span>${source.year}</span>`
                                            :
                                            ""
                                    }

                                </div>


                                <p>

                                    <strong>
                                        ${escapeHtml(source.authors)}
                                    </strong>

                                    <br>

                                    <em>
                                        ${escapeHtml(source.title)}
                                    </em>

                                    ${
                                        source.edition
                                            ?
                                            `, ${escapeHtml(source.edition)}`
                                            :
                                            ""
                                    }

                                </p>


                                <ul>

                                    ${(source.notes || [])
                                        .map(
                                            note => `
                                                <li>
                                                    ${escapeHtml(note)}
                                                </li>
                                            `
                                        )
                                        .join("")}

                                </ul>

                            </article>

                        `
                    )
                    .join("")}

            </section>

        `;

    }


    function renderMethod() {

        app.innerHTML = `

            <section class="paper">

                <div class="eyebrow">
                    Princípios editoriais
                </div>

                <h1>
                    Método
                </h1>

                <p class="lede">

                    O GDHAGP foi concebido para impedir
                    que dados documentais,
                    traduções,
                    análises e decisões editoriais
                    sejam confundidos.

                </p>


                <div class="method-grid">

                    ${PROJECT.editorialLayers
                        .map(
                            (layer, index) => `

                                <article class="method-card">

                                    <div class="eyebrow">
                                        Camada ${index + 1}
                                    </div>

                                    <h3>
                                        ${escapeHtml(layer.label)}
                                    </h3>

                                    <p>
                                        ${escapeHtml(layer.description)}
                                    </p>

                                </article>

                            `
                        )
                        .join("")}

                </div>


                <hr class="rule">


                <div class="notice">

                    <strong>
                        Independência das fontes.
                    </strong>

                    BDAG,
                    Lust–Eynikel–Hauspie,
                    Robinson,
                    Thayer
                    e quaisquer fontes futuras
                    são documentados separadamente.

                </div>


                <div class="notice">

                    <strong>
                        Sem reconstrução fictícia.
                    </strong>

                    Uma fonte em scan
                    não recebe transcrição diplomática
                    até que tal transcrição
                    tenha sido efetivamente realizada
                    e conferida.

                </div>


                <div class="notice">

                    <strong>
                        Distinção epistemológica.
                    </strong>

                    Fato documental,
                    tradução,
                    inferência,
                    hipótese
                    e decisão editorial
                    devem permanecer identificáveis.

                </div>

            </section>

        `;

    }


    function renderGeneralEntry(
        entry
    ) {

        const fields = [

            [
                "Forma lexical",
                entry.lexicalForm
            ],

            [
                "Lema",
                entry.lemma
            ],

            [
                "Artigo",
                entry.article
            ],

            [
                "Genitivo",
                entry.genitive
            ],

            [
                "Transliteração",
                entry.transliteration
            ],

            [
                "Classe gramatical",
                entry.partOfSpeech
            ],

            [
                "Gênero",
                entry.gender
            ],

            [
                "Declinação",
                entry.declension
            ],

            [
                "Tema nominal",
                entry.stem
            ],

            [
                "Correspondência semítica principal",
                entry.principalSemiticCorrespondence
            ],

            [
                "Tradução básica",
                entry.basicTranslation
            ],

            [
                "Tradução tradicional especial",
                entry.traditionalSpecialTranslation
            ],

            [
                "Status editorial",
                entry.status
            ]

        ];


        return `

            <section class="general-entry">

                <div class="eyebrow">
                    Entrada geral
                </div>

                <div class="general-fields">

                    ${fields
                        .map(
                            field => `

                                <div class="general-field">

                                    <span class="general-field-label">
                                        ${escapeHtml(field[0])}
                                    </span>

                                    <span>
                                        ${escapeHtml(field[1])}
                                    </span>

                                </div>

                            `
                        )
                        .join("")}

                </div>

            </section>

        `;

    }


    function renderDefinitions(
        entry
    ) {

        return `

            <div class="definitions-introduction">

                Cada acepção abaixo constitui
                uma unidade lexicográfica independente.
                O resumo global aparece apenas
                ao final da seção.

            </div>


            ${entry.definitions
                .map(
                    definition => `

                        <article class="definition-card">

                            <header class="definition-heading">

                                <span class="definition-number">
                                    ${definition.number}.
                                </span>

                                <h3 class="definition-title">
                                    ${escapeHtml(definition.title)}
                                </h3>

                            </header>


                            <div class="definition-section">

                                <div class="definition-label">
                                    Definição
                                </div>

                                <p>
                                    ${escapeHtml(definition.definition)}
                                </p>

                            </div>


                            ${
                                definition.equivalents?.length
                                    ?
                                    `

                                    <div class="definition-section">

                                        <div class="definition-label">
                                            Equivalentes principais
                                        </div>

                                        <p>
                                            ${definition.equivalents
                                                .map(
                                                    value =>
                                                        escapeHtml(value)
                                                )
                                                .join("; ")}
                                        </p>

                                    </div>

                                    `
                                    :
                                    ""
                            }


                            ${
                                definition.characteristicExpressions?.length
                                    ?
                                    `

                                    <div class="definition-section">

                                        <div class="definition-label">
                                            Expressões características
                                        </div>

                                        <p class="greek">
                                            ${definition.characteristicExpressions
                                                .map(
                                                    value =>
                                                        escapeHtml(value)
                                                )
                                                .join(" · ")}
                                        </p>

                                    </div>

                                    `
                                    :
                                    ""
                            }


                            ${
                                definition.examples?.length
                                    ?
                                    `

                                    <div class="definition-section">

                                        <div class="definition-label">
                                            Exemplos
                                        </div>

                                        ${definition.examples
                                            .map(
                                                example => `

                                                    <div class="example">

                                                        <div class="example-reference">
                                                            ➥ ${escapeHtml(example.reference)}
                                                        </div>

                                                        ${
                                                            example.greek
                                                                ?
                                                                `
                                                                <div class="greek">
                                                                    ${escapeHtml(example.greek)}
                                                                </div>
                                                                `
                                                                :
                                                                ""
                                                        }

                                                        ${
                                                            example.translation
                                                                ?
                                                                `
                                                                <div>
                                                                    “${escapeHtml(example.translation)}”
                                                                </div>
                                                                `
                                                                :
                                                                ""
                                                        }

                                                    </div>

                                                `
                                            )
                                            .join("")}

                                    </div>

                                    `
                                    :
                                    ""
                            }


                            ${
                                definition.notes?.length
                                    ?
                                    `

                                    <div class="definition-section">

                                        <div class="definition-label">
                                            Notas
                                        </div>

                                        ${definition.notes
                                            .map(
                                                note => `
                                                    <p>
                                                        ${escapeHtml(note)}
                                                    </p>
                                                `
                                            )
                                            .join("")}

                                    </div>

                                    `
                                    :
                                    ""
                            }


                            <div class="definition-section">

                                <div class="definition-label">
                                    Fontes de apoio
                                </div>

                                <p>

                                    ${(definition.sources || [])
                                        .map(
                                            sourceId => {

                                                const source =
                                                    sourceById(sourceId);

                                                return source
                                                    ?
                                                    escapeHtml(
                                                        source.shortName
                                                    )
                                                    :
                                                    escapeHtml(sourceId);

                                            }
                                        )
                                        .join(" · ")}

                                </p>

                            </div>

                        </article>

                    `
                )
                .join("")}


            <hr class="rule">


            <h2>
                Resumo das definições
            </h2>


            <table class="summary-table">

                <thead>

                    <tr>

                        <th>
                            Nº
                        </th>

                        <th>
                            Definição resumida
                        </th>

                    </tr>

                </thead>

                <tbody>

                    ${entry.definitions
                        .map(
                            definition => `

                                <tr>

                                    <td class="summary-number">
                                        ${definition.number}
                                    </td>

                                    <td>
                                        ${escapeHtml(definition.title)}
                                    </td>

                                </tr>

                            `
                        )
                        .join("")}

                </tbody>

            </table>


            <hr class="rule">


            <h2>
                Síntese final
            </h2>

            <p>
                ${escapeHtml(entry.finalSummary)}
            </p>

        `;

    }


    function renderSourceLayers(
        entry
    ) {

        return entry.sourceLayers
            .map(layer => {

                const source =
                    sourceById(
                        layer.sourceId
                    );


                return `

                    <article class="source-card">

                        <span class="layer-label">
                            Fonte ·
                            ${escapeHtml(layer.status)}
                        </span>

                        <h3>
                            ${escapeHtml(source?.shortName || layer.sourceId)}
                        </h3>

                        <p>
                            ${escapeHtml(layer.summary)}
                        </p>

                        ${
                            layer.details?.length
                                ?
                                `

                                <ul class="source-list">

                                    ${layer.details
                                        .map(
                                            detail => `
                                                <li>
                                                    ${escapeHtml(detail)}
                                                </li>
                                            `
                                        )
                                        .join("")}

                                </ul>

                                `
                                :
                                ""
                        }

                    </article>

                `;

            })
            .join("");

    }


    function renderTranslations(
        entry
    ) {

        return entry.sourceLayers
            .map(layer => {

                const source =
                    sourceById(
                        layer.sourceId
                    );


                return `

                    <article class="source-card">

                        <span class="layer-label">
                            Tradução controlada
                        </span>

                        <h3>
                            ${escapeHtml(source?.shortName || layer.sourceId)}
                        </h3>

                        <ul>

                            ${(layer.controlledTranslation || [])
                                .map(
                                    value => `
                                        <li>
                                            ${escapeHtml(value)}
                                        </li>
                                    `
                                )
                                .join("")}

                        </ul>

                        <p class="source-meta">

                            Esta tradução pertence
                            exclusivamente a esta fonte
                            e não representa fusão
                            com os demais léxicos.

                        </p>

                    </article>

                `;

            })
            .join("");

    }


    function renderAnalysis(
        entry
    ) {

        return `

            <div class="analysis-grid">

                ${entry.analysis
                    .map(
                        analysis => `

                            <article class="analysis-card">

                                <h3>
                                    ${escapeHtml(analysis.title)}
                                </h3>

                                <p>
                                    ${escapeHtml(analysis.text)}
                                </p>

                            </article>

                        `
                    )
                    .join("")}

            </div>


            <hr class="rule">


            <h2>
                Relações lexicais
            </h2>


            ${entry.lexicalRelations
                .map(
                    relation => `

                        <p>

                            <strong class="${
                                /[\u0370-\u03ff]/u.test(relation.lemma)
                                    ?
                                    "greek"
                                    :
                                    /[\u0590-\u05ff]/u.test(relation.lemma)
                                        ?
                                        "hebrew"
                                        :
                                        ""
                            }">

                                ${escapeHtml(relation.lemma)}

                            </strong>

                            —

                            ${escapeHtml(relation.relation)}

                        </p>

                    `
                )
                .join("")}

        `;

    }


    function renderMorphology(
        entry
    ) {

        function morphologyTable(
            title,
            rows
        ) {

            return `

                <section>

                    <h3>
                        ${title}
                    </h3>

                    <table class="morphology-table">

                        <thead>

                            <tr>

                                <th>
                                    Caso
                                </th>

                                <th>
                                    Forma
                                </th>

                            </tr>

                        </thead>

                        <tbody>

                            ${rows
                                .map(
                                    row => `

                                        <tr>

                                            <td>
                                                ${escapeHtml(row.case)}
                                            </td>

                                            <td>
                                                ${escapeHtml(row.form)}
                                            </td>

                                        </tr>

                                    `
                                )
                                .join("")}

                        </tbody>

                    </table>

                </section>

            `;

        }


        return `

            <p>

                <strong>
                    ${escapeHtml(entry.partOfSpeech)}
                    ${escapeHtml(entry.gender)}
                </strong>

                ·

                ${escapeHtml(entry.declension)}

                · tema

                <span class="greek">
                    ${escapeHtml(entry.stem)}
                </span>

            </p>


            <div class="morphology-grid">

                ${morphologyTable(
                    "Singular",
                    entry.morphology.singular
                )}

                ${morphologyTable(
                    "Plural",
                    entry.morphology.plural
                )}

            </div>

        `;

    }


    function renderBibliography(
        entry
    ) {

        return entry.bibliography
            .map(item => {

                const source =
                    sourceById(
                        item.sourceId
                    );


                return `

                    <div class="bibliography-item">

                        <strong>
                            ${escapeHtml(source?.shortName || item.sourceId)}
                        </strong>

                        <br>

                        ${escapeHtml(item.citation)}

                    </div>

                `;

            })
            .join("");

    }


    function renderTabContent(
        entry,
        tab
    ) {

        switch (tab) {

            case "GDHAGP":
                return renderDefinitions(entry);

            case "Fontes":
                return renderSourceLayers(entry);

            case "Tradução":
                return renderTranslations(entry);

            case "Análise":
                return renderAnalysis(entry);

            case "Formas":
                return renderMorphology(entry);

            case "Bibliografia":
                return renderBibliography(entry);

            default:
                return renderDefinitions(entry);

        }

    }


    function renderEntry(
        id
    ) {

        const entry =
            ENTRIES.find(
                item =>
                    item.id === id
            );


        if (!entry) {

            app.innerHTML = `

                <section class="paper">

                    <h1>
                        Verbete não encontrado
                    </h1>

                    <p>
                        <a href="#busca">
                            Voltar à busca
                        </a>
                    </p>

                </section>

            `;

            return;

        }


        const storedTab =
            sessionStorage.getItem(
                `gdhagp-tab-${entry.id}`
            );

        const initialTab =
            ENTRY_TABS.includes(storedTab)
                ?
                storedTab
                :
                "GDHAGP";


        app.innerHTML = `

            <article class="paper">

                <header class="entry-header">

                    <div>

                        <div class="eyebrow">
                            ${escapeHtml(entry.language)} · verbete
                        </div>

                        <div class="lemma">
                            ${escapeHtml(entry.lemma)}
                        </div>

                        <div class="entry-meta">

                            <span>
                                <strong>
                                    ${escapeHtml(entry.lexicalForm)}
                                </strong>
                            </span>

                            <span>
                                ·
                            </span>

                            <span>
                                <em>
                                    ${escapeHtml(entry.transliteration)}
                                </em>
                            </span>

                            <span>
                                ·
                            </span>

                            <span>
                                ${escapeHtml(entry.partOfSpeech)}
                            </span>

                            <span>
                                ·
                            </span>

                            <span>
                                ${escapeHtml(entry.gender)}
                            </span>

                        </div>


                        <p class="entry-summary">
                            ${escapeHtml(entry.shortSummary)}
                        </p>


                        <div class="pills">

                            ${entry.varieties
                                .map(
                                    variety => `
                                        <span class="pill">
                                            ${escapeHtml(variety)}
                                        </span>
                                    `
                                )
                                .join("")}

                        </div>

                    </div>


                    <div class="entry-actions">

                        <button
                            id="copy-link-button"
                            class="secondary-button"
                            type="button"
                        >
                            Copiar link
                        </button>

                        <button
                            id="print-button"
                            class="secondary-button"
                            type="button"
                        >
                            Imprimir
                        </button>

                    </div>

                </header>


                ${renderGeneralEntry(entry)}


                <div
                    class="tabs"
                    role="tablist"
                    aria-label="Seções do verbete"
                >

                    ${ENTRY_TABS
                        .map(
                            tab => `

                                <button
                                    class="tab"
                                    type="button"
                                    role="tab"
                                    data-tab="${tab}"
                                    aria-selected="${
                                        tab === initialTab
                                            ?
                                            "true"
                                            :
                                            "false"
                                    }"
                                >
                                    ${tab}
                                </button>

                            `
                        )
                        .join("")}

                </div>


                <section
                    id="tab-panel"
                    class="tab-panel"
                >

                    ${renderTabContent(
                        entry,
                        initialTab
                    )}

                </section>

            </article>

        `;


        document
            .querySelectorAll(".tab")
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const tab =
                            button.dataset.tab;


                        sessionStorage.setItem(
                            `gdhagp-tab-${entry.id}`,
                            tab
                        );


                        document
                            .querySelectorAll(".tab")
                            .forEach(item => {

                                item.setAttribute(
                                    "aria-selected",
                                    String(
                                        item === button
                                    )
                                );

                            });


                        document.getElementById(
                            "tab-panel"
                        ).innerHTML =
                            renderTabContent(
                                entry,
                                tab
                            );

                    }
                );

            });


        const copyButton =
            document.getElementById(
                "copy-link-button"
            );


        copyButton.addEventListener(
            "click",
            async () => {

                try {

                    await navigator.clipboard
                        .writeText(
                            location.href
                        );

                    copyButton.textContent =
                        "Link copiado";

                }
                catch {

                    copyButton.textContent =
                        "Copie pela barra de endereço";

                }


                window.setTimeout(
                    () => {

                        copyButton.textContent =
                            "Copiar link";

                    },
                    1500
                );

            }
        );


        document
            .getElementById(
                "print-button"
            )
            .addEventListener(
                "click",
                () => window.print()
            );

    }


    function route() {

        const route =
            getRoute();

        const parts =
            route.split("/");

        const base =
            parts[0];


        setActiveNavigation(
            route
        );


        switch (base) {

            case "inicio":

                renderHome();

                break;


            case "busca":

                renderSearch(parts);

                break;


            case "grego":

                renderLanguage(
                    "grego"
                );

                break;


            case "hebraico":

                renderLanguage(
                    "hebraico"
                );

                break;


            case "aramaico":

                renderLanguage(
                    "aramaico"
                );

                break;


            case "fontes":

                renderSourcesPage();

                break;


            case "metodo":

                renderMethod();

                break;


            case "verbete":

                renderEntry(
                    parts[1] || ""
                );

                break;


            default:

                renderHome();

                break;

        }


        closeSidebar();


        window.scrollTo({
            top: 0,
            behavior: "instant"
        });

    }


    initializeTheme();


    themeButton.addEventListener(
        "click",
        () => {

            const currentTheme =
                document.documentElement
                    .dataset.theme;

            setTheme(
                currentTheme === "dark"
                    ?
                    "light"
                    :
                    "dark"
            );

        }
    );


    menuButton.addEventListener(
        "click",
        () => {

            const opened =
                sidebar.classList.toggle(
                    "open"
                );

            menuButton.setAttribute(
                "aria-expanded",
                String(opened)
            );

        }
    );


    document.addEventListener(
        "click",
        event => {

            if (
                window.innerWidth <= 900
                &&
                sidebar.classList.contains(
                    "open"
                )
                &&
                !sidebar.contains(
                    event.target
                )
                &&
                event.target !==
                menuButton
            ) {

                closeSidebar();

            }

        }
    );


    window.addEventListener(
        "hashchange",
        route
    );


    route();

})();