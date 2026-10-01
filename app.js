(function () {

    "use strict";


    /* =========================================================
       DADOS
       ========================================================= */

    const PROJECT =
        window.GDHAGP_PROJECT || {};

    const SOURCES =
        window.GDHAGP_SOURCES || [];

    const SOURCE_TEXTS =
        window.GDHAGP_SOURCE_TEXTS || {};

    const ENTRIES =
        window.GDHAGP_ENTRIES || [];


    /* =========================================================
       ELEMENTOS
       ========================================================= */

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


    /* =========================================================
       STORAGE
       ========================================================= */

    function storageGet(storage, key) {

        try {

            return storage.getItem(key);

        }
        catch {

            return null;

        }

    }


    function storageSet(storage, key, value) {

        try {

            storage.setItem(
                key,
                value
            );

        }
        catch {

            /* file:// pode restringir storage */

        }

    }


    /* =========================================================
       UTILITÁRIOS
       ========================================================= */

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
            source =>
                source.id === id
        );

    }


    function sourceTextsForEntry(entryId) {

        return SOURCE_TEXTS[entryId] || [];

    }


    function getRoute() {

        const route =
            decodeURIComponent(
                location.hash.replace(
                    /^#/,
                    ""
                )
            );


        return route || "inicio";

    }


    /* =========================================================
       TEMA
       ========================================================= */

    function setTheme(theme) {

        document.documentElement.dataset.theme =
            theme;


        storageSet(
            localStorage,
            "gdhagp-theme",
            theme
        );


        if (!themeButton) {
            return;
        }


        if (theme === "light") {

            themeButton.textContent =
                "☾";

            themeButton.title =
                "Usar tema escuro";

            themeButton.setAttribute(
                "aria-label",
                "Usar tema escuro"
            );

        }
        else {

            themeButton.textContent =
                "☀";

            themeButton.title =
                "Usar tema claro";

            themeButton.setAttribute(
                "aria-label",
                "Usar tema claro"
            );

        }

    }


    function initializeTheme() {

        const storedTheme =
            storageGet(
                localStorage,
                "gdhagp-theme"
            );


        /*
         * Dark azulado é agora o tema padrão
         * do projeto.
         */

        setTheme(
            storedTheme === "light"
                ?
                "light"
                :
                "dark"
        );

    }


    /* =========================================================
       MENU
       ========================================================= */

    function closeSidebar() {

        if (
            !sidebar ||
            !menuButton
        ) {
            return;
        }


        sidebar.classList.remove(
            "open"
        );


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


    /* =========================================================
       BUSCA
       ========================================================= */

    function renderSearchForm(value = "") {

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
                    placeholder="Buscar lema, transliteração, definição, fonte ou acepção…"
                    aria-label="Buscar no GDHAGP"
                    autocomplete="off"
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
                    input?.value.trim() ||
                    "";


                location.hash =
                    query
                        ?
                        "busca/" +
                        encodeURIComponent(query)
                        :
                        "busca";

            }
        );

    }


    function entrySourceSearchText(entry) {

        return sourceTextsForEntry(
            entry.id
        )
            .map(record => {

                const source =
                    sourceById(
                        record.sourceId
                    );


                return [

                    source?.shortName,
                    source?.authors,
                    source?.title,

                    record.location,

                    record.materialType,

                    record.transcriptionStatus,

                    record.originalEntry,

                    record.literalTranslation,

                    record.editorialNote,

                    record.pendingMessage

                ].join(" ");

            })
            .join(" ");

    }


    function entrySearchText(entry) {

        const definitions =
            (entry.definitions || [])
                .map(
                    definition => [

                        definition.title,

                        definition.definition,

                        ...(definition.equivalents || []),

                        ...(definition.characteristicExpressions || []),

                        ...(definition.notes || [])

                    ].join(" ")
                )
                .join(" ");


        const analysis =
            (entry.analysis || [])
                .map(
                    item =>
                        `${item.title} ${item.text}`
                )
                .join(" ");


        return [

            entry.lemma,

            entry.lexicalForm,

            entry.transliteration,

            entry.partOfSpeech,

            entry.gender,

            entry.declension,

            entry.stem,

            entry.shortSummary,

            entry.finalSummary,

            entry.principalSemiticCorrespondence,

            definitions,

            analysis,

            entrySourceSearchText(entry)

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


    /* =========================================================
       INÍCIO
       ========================================================= */

    function renderHome() {

        app.innerHTML = `

            <section class="paper">

                <div class="home-grid">

                    <div>

                        <div class="eyebrow">
                            Projeto lexicográfico
                        </div>


                        <h1 class="project-title">

                            ${escapeHtml(
                                PROJECT.fullName
                            )}

                        </h1>


                        <p class="lede">

                            ${escapeHtml(
                                PROJECT.description ||
                                ""
                            )}

                        </p>


                        ${renderSearchForm()}

                    </div>


                    <aside class="editorial-principle">

                        <div class="eyebrow">
                            Método fundamental
                        </div>


                        ${(PROJECT.editorialLayers || [])
                            .map(
                                (layer, index) => `

                                    <div class="editorial-layer">

                                        <span class="editorial-layer-number">
                                            ${index + 1}
                                        </span>

                                        <div>

                                            <strong>
                                                ${escapeHtml(
                                                    layer.label
                                                )}
                                            </strong>

                                            <br>

                                            ${escapeHtml(
                                                layer.description
                                            )}

                                        </div>

                                    </div>

                                `
                            )
                            .join("")}

                    </aside>

                </div>

            </section>


            ${
                ENTRIES[0]
                    ?
                    `

                    <section class="paper">

                        <div class="eyebrow">
                            Verbete inaugural
                        </div>

                        <div class="lemma">

                            ${escapeHtml(
                                ENTRIES[0].lemma
                            )}

                        </div>

                        <p class="entry-summary">

                            ${escapeHtml(
                                ENTRIES[0].shortSummary
                            )}

                        </p>

                        <p>

                            <a href="#verbete/${encodeURIComponent(ENTRIES[0].id)}">
                                Abrir o verbete completo →
                            </a>

                        </p>

                    </section>

                    `
                    :
                    ""
            }

        `;


        bindSearchForm();

    }


    /* =========================================================
       BUSCA
       ========================================================= */

    function renderSearch(routeParts) {

        const query =
            routeParts
                .slice(1)
                .join("/");


        const decodedQuery =
            query
                ?
                decodeURIComponent(query)
                :
                "";


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

                    A pesquisa inclui verbetes,
                    definições GDHAGP,
                    textos documentais das fontes,
                    traduções e análise.

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

                                                ${escapeHtml(
                                                    entry.lemma
                                                )}

                                            </div>

                                            <div>

                                                <em>

                                                    ${escapeHtml(
                                                        entry.transliteration
                                                    )}

                                                </em>

                                                ·

                                                ${escapeHtml(
                                                    entry.partOfSpeech
                                                )}

                                            </div>

                                            <div class="search-result-meta">

                                                ${escapeHtml(
                                                    entry.shortSummary
                                                )}

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


    /* =========================================================
       IDIOMAS
       ========================================================= */

    function renderLanguage(language) {

        const labels = {

            grego: {
                title:
                    "Grego",

                sample:
                    "λόγος",

                className:
                    "greek"
            },

            hebraico: {
                title:
                    "Hebraico",

                sample:
                    "דָּבָר",

                className:
                    "hebrew"
            },

            aramaico: {
                title:
                    "Aramaico",

                sample:
                    "מִלָּה",

                className:
                    "hebrew"
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
                                    `${entries.length} verbete(s) disponível(is).`
                                    :
                                    "Seção preparada para expansão futura."
                            }

                        </p>

                    </div>

                </div>


                ${entries
                    .map(
                        entry => `

                            <a
                                class="search-result"
                                href="#verbete/${entry.id}"
                            >

                                <div class="search-result-lemma">

                                    ${escapeHtml(
                                        entry.lemma
                                    )}

                                </div>

                                <div>

                                    <em>

                                        ${escapeHtml(
                                            entry.transliteration
                                        )}

                                    </em>

                                </div>

                                <div class="search-result-meta">

                                    ${escapeHtml(
                                        entry.shortSummary
                                    )}

                                </div>

                            </a>

                        `
                    )
                    .join("")}

            </section>

        `;

    }


    /* =========================================================
       PÁGINA DE FONTES
       ========================================================= */

    function renderSourcesPage() {

        app.innerHTML = `

            <section class="paper">

                <div class="eyebrow">
                    Corpus lexicográfico
                </div>

                <h1>
                    Fontes
                </h1>

                <p class="lede">

                    Cada fonte é documentada
                    independentemente.
                    O GDHAGP não funde silenciosamente
                    léxicos distintos.

                </p>


                ${SOURCES
                    .map(
                        source => `

                            <article class="source-card">

                                <h3>

                                    ${escapeHtml(
                                        source.shortName
                                    )}

                                </h3>


                                <div class="source-meta">

                                    <span>

                                        ${escapeHtml(
                                            source.material
                                        )}

                                    </span>

                                    <span>

                                        ${escapeHtml(
                                            source.scope
                                        )}

                                    </span>

                                    ${
                                        source.year
                                            ?
                                            `
                                            <span>
                                                ${source.year}
                                            </span>
                                            `
                                            :
                                            ""
                                    }

                                    ${
                                        source.onlineProvider
                                            ?
                                            `
                                            <span>

                                                ${escapeHtml(
                                                    source.onlineProvider
                                                )}

                                            </span>
                                            `
                                            :
                                            ""
                                    }

                                </div>


                                <p>

                                    <strong>

                                        ${escapeHtml(
                                            source.authors
                                        )}

                                    </strong>

                                    <br>

                                    <em>

                                        ${escapeHtml(
                                            source.title
                                        )}

                                    </em>

                                </p>


                                ${
                                    source.notes?.length
                                        ?
                                        `

                                        <ul>

                                            ${source.notes
                                                .map(
                                                    note => `

                                                        <li>

                                                            ${escapeHtml(
                                                                note
                                                            )}

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

                        `
                    )
                    .join("")}

            </section>

        `;

    }


    /* =========================================================
       MÉTODO
       ========================================================= */

    function renderMethod() {

        app.innerHTML = `

            <section class="paper">

                <div class="eyebrow">
                    Princípios editoriais
                </div>

                <h1>
                    Método
                </h1>


                <div class="method-grid">

                    ${(PROJECT.editorialLayers || [])
                        .map(
                            (layer, index) => `

                                <article class="method-card">

                                    <div class="eyebrow">

                                        Camada
                                        ${index + 1}

                                    </div>

                                    <h3>

                                        ${escapeHtml(
                                            layer.label
                                        )}

                                    </h3>

                                    <p>

                                        ${escapeHtml(
                                            layer.description
                                        )}

                                    </p>

                                </article>

                            `
                        )
                        .join("")}

                </div>


                <hr class="rule">


                ${(PROJECT.principles || [])
                    .map(
                        principle => `

                            <div class="notice">

                                ${escapeHtml(
                                    principle
                                )}

                            </div>

                        `
                    )
                    .join("")}

            </section>

        `;

    }


    /* =========================================================
       ENTRADA GERAL
       ========================================================= */

    function renderGeneralEntry(entry) {

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
                        .filter(
                            field =>
                                field[1] !== undefined &&
                                field[1] !== null &&
                                field[1] !== ""
                        )
                        .map(
                            field => `

                                <div class="general-field">

                                    <span class="general-field-label">

                                        ${escapeHtml(
                                            field[0]
                                        )}

                                    </span>

                                    <span>

                                        ${escapeHtml(
                                            field[1]
                                        )}

                                    </span>

                                </div>

                            `
                        )
                        .join("")}

                </div>


                ${
                    entry.frequencyNotes?.length
                        ?
                        `

                        <div class="pills">

                            ${entry.frequencyNotes
                                .map(
                                    note => `

                                        <span class="pill">

                                            ${escapeHtml(
                                                note
                                            )}

                                        </span>

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


    /* =========================================================
       DEFINIÇÕES
       ========================================================= */

    function renderDefinitions(entry) {

        const definitions =
            entry.definitions ||
            [];


        return `

            <div class="definitions-introduction">

                Cada acepção constitui uma unidade
                lexicográfica independente.
                O resumo conjunto aparece somente
                ao final.

            </div>


            ${definitions
                .map(
                    definition => `

                        <article class="definition-card">

                            <header class="definition-heading">

                                <span class="definition-number">

                                    ${definition.number}.

                                </span>

                                <h3 class="definition-title">

                                    ${escapeHtml(
                                        definition.title
                                    )}

                                </h3>

                            </header>


                            <div class="definition-section">

                                <div class="definition-label">
                                    Definição
                                </div>

                                <p>

                                    ${escapeHtml(
                                        definition.definition
                                    )}

                                </p>

                            </div>


                            ${
                                definition.equivalents?.length
                                    ?
                                    `

                                    <div class="definition-section">

                                        <div class="definition-label">
                                            Equivalentes
                                        </div>

                                        <p>

                                            ${definition.equivalents
                                                .map(
                                                    escapeHtml
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
                                                    escapeHtml
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

                                                            ➥
                                                            ${escapeHtml(
                                                                example.reference
                                                            )}

                                                        </div>

                                                        ${
                                                            example.greek
                                                                ?
                                                                `

                                                                <div class="greek">

                                                                    ${escapeHtml(
                                                                        example.greek
                                                                    )}

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

                                                                    “${escapeHtml(
                                                                        example.translation
                                                                    )}”

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
                                definition.sources?.length
                                    ?
                                    `

                                    <div class="definition-section">

                                        <div class="definition-label">
                                            Fontes de apoio
                                        </div>

                                        <p>

                                            ${definition.sources
                                                .map(
                                                    sourceId =>
                                                        escapeHtml(
                                                            sourceById(
                                                                sourceId
                                                            )?.shortName ||
                                                            sourceId
                                                        )
                                                )
                                                .join(" · ")}

                                        </p>

                                    </div>

                                    `
                                    :
                                    ""
                            }

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

                    ${definitions
                        .map(
                            definition => `

                                <tr>

                                    <td class="summary-number">

                                        ${definition.number}

                                    </td>

                                    <td>

                                        ${escapeHtml(
                                            definition.title
                                        )}

                                    </td>

                                </tr>

                            `
                        )
                        .join("")}

                </tbody>

            </table>


            ${
                entry.finalSummary
                    ?
                    `

                    <hr class="rule">

                    <h2>
                        Síntese final
                    </h2>

                    <p>

                        ${escapeHtml(
                            entry.finalSummary
                        )}

                    </p>

                    `
                    :
                    ""
            }

        `;

    }


    /* =========================================================
       FONTES
       ========================================================= */

    function renderSourceLayers(entry) {

        const records =
            sourceTextsForEntry(
                entry.id
            );


        if (!records.length) {

            return `

                <div class="empty-state">
                    Nenhuma fonte documental cadastrada.
                </div>

            `;

        }


        return records
            .map(record => {

                const source =
                    sourceById(
                        record.sourceId
                    );


                const hasText =
                    Boolean(
                        record.originalEntry?.trim()
                    );


                return `

                    <article class="source-document">

                        <header class="source-document-header">

                            <div>

                                <span class="layer-label">
                                    Fonte integral
                                </span>

                                <h3 class="source-document-title">

                                    ${escapeHtml(
                                        source?.shortName ||
                                        record.sourceId
                                    )}

                                </h3>

                            </div>


                            <div class="source-status">

                                ${
                                    record.location
                                        ?
                                        `

                                        <span>

                                            ${escapeHtml(
                                                record.location
                                            )}

                                        </span>

                                        `
                                        :
                                        ""
                                }

                                ${
                                    record.materialType
                                        ?
                                        `

                                        <span>

                                            ${escapeHtml(
                                                record.materialType
                                            )}

                                        </span>

                                        `
                                        :
                                        ""
                                }

                                ${
                                    record.transcriptionStatus
                                        ?
                                        `

                                        <span>

                                            ${escapeHtml(
                                                record.transcriptionStatus
                                            )}

                                        </span>

                                        `
                                        :
                                        ""
                                }

                            </div>

                        </header>


                        ${
                            source
                                ?
                                `

                                <div class="source-meta">

                                    <span>

                                        ${escapeHtml(
                                            source.authors
                                        )}

                                    </span>

                                    <span>

                                        ${escapeHtml(
                                            source.title
                                        )}

                                    </span>

                                </div>

                                `
                                :
                                ""
                        }


                        ${
                            record.editorialNote
                                ?
                                `

                                <div class="source-editorial-note">

                                    <strong>
                                        Nota documental
                                    </strong>

                                    <p>

                                        ${escapeHtml(
                                            record.editorialNote
                                        )}

                                    </p>

                                </div>

                                `
                                :
                                ""
                        }


                        ${
                            hasText
                                ?
                                `

                                <div class="source-verbatim">

                                    ${escapeHtml(
                                        record.originalEntry.trim()
                                    )}

                                </div>

                                `
                                :
                                `

                                <div class="source-pending">

                                    ${escapeHtml(
                                        record.pendingMessage ||
                                        "Transcrição integral ainda não incorporada."
                                    )}

                                </div>

                                `
                        }

                    </article>

                `;

            })
            .join("");

    }


    /* =========================================================
       TRADUÇÕES
       ========================================================= */

    function renderTranslations(entry) {

        const records =
            sourceTextsForEntry(
                entry.id
            );


        if (!records.length) {

            return `

                <div class="empty-state">
                    Nenhuma tradução cadastrada.
                </div>

            `;

        }


        return records
            .map(record => {

                const source =
                    sourceById(
                        record.sourceId
                    );


                const sourceAlreadyPortuguese =
                    record.translationNotRequired ===
                    true;


                const hasTranslation =
                    Boolean(
                        record.literalTranslation?.trim()
                    );


                return `

                    <article
                        class="
                            source-document
                            translation-document
                        "
                    >

                        <header class="source-document-header">

                            <div>

                                <span class="layer-label">
                                    Tradução da fonte
                                </span>

                                <h3 class="source-document-title">

                                    ${escapeHtml(
                                        source?.shortName ||
                                        record.sourceId
                                    )}

                                </h3>

                            </div>


                            <div class="source-status">

                                <span>

                                    ${
                                        sourceAlreadyPortuguese
                                            ?
                                            "fonte em português"
                                            :
                                            escapeHtml(
                                                record.translationStatus ||
                                                "em elaboração"
                                            )
                                    }

                                </span>

                            </div>

                        </header>


                        ${
                            sourceAlreadyPortuguese
                                ?
                                `

                                <div class="source-editorial-note">

                                    <strong>
                                        Tradução não necessária
                                    </strong>

                                    <p>

                                        Esta fonte já está redigida
                                        em português.
                                        Seu texto original é consultado
                                        diretamente na aba
                                        <strong>Fontes</strong>.

                                    </p>

                                </div>

                                `
                                :
                                hasTranslation
                                    ?
                                    `

                                    <div class="source-verbatim">

                                        ${escapeHtml(
                                            record.literalTranslation.trim()
                                        )}

                                    </div>

                                    `
                                    :
                                    `

                                    <div class="source-pending">

                                        A tradução integral desta fonte
                                        ainda não foi incorporada.

                                    </div>

                                    `
                        }

                    </article>

                `;

            })
            .join("");

    }


    /* =========================================================
       ANÁLISE
       ========================================================= */

    function renderAnalysis(entry) {

        return `

            <div class="analysis-grid">

                ${(entry.analysis || [])
                    .map(
                        item => `

                            <article class="analysis-card">

                                <h3>

                                    ${escapeHtml(
                                        item.title
                                    )}

                                </h3>

                                <p>

                                    ${escapeHtml(
                                        item.text
                                    )}

                                </p>

                            </article>

                        `
                    )
                    .join("")}

            </div>


            ${
                entry.lexicalRelations?.length
                    ?
                    `

                    <hr class="rule">

                    <h2>
                        Relações lexicais
                    </h2>

                    ${entry.lexicalRelations
                        .map(
                            relation => `

                                <p>

                                    <strong>

                                        ${escapeHtml(
                                            relation.lemma
                                        )}

                                    </strong>

                                    —

                                    ${escapeHtml(
                                        relation.relation
                                    )}

                                </p>

                            `
                        )
                        .join("")}

                    `
                    :
                    ""
            }

        `;

    }


    /* =========================================================
       FORMAS
       ========================================================= */

    function renderMorphology(entry) {

        function table(
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

                            ${(rows || [])
                                .map(
                                    row => `

                                        <tr>

                                            <td>

                                                ${escapeHtml(
                                                    row.case
                                                )}

                                            </td>

                                            <td>

                                                ${escapeHtml(
                                                    row.form
                                                )}

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

                    ${escapeHtml(
                        entry.partOfSpeech
                    )}

                    ${escapeHtml(
                        entry.gender
                    )}

                </strong>

                ·

                ${escapeHtml(
                    entry.declension
                )}

                · tema

                <span class="greek">

                    ${escapeHtml(
                        entry.stem
                    )}

                </span>

            </p>


            <div class="morphology-grid">

                ${table(
                    "Singular",
                    entry.morphology?.singular
                )}

                ${table(
                    "Plural",
                    entry.morphology?.plural
                )}

            </div>

        `;

    }


    /* =========================================================
       BIBLIOGRAFIA
       ========================================================= */

    function renderBibliography(entry) {

        return (entry.bibliography || [])
            .map(item => {

                const source =
                    sourceById(
                        item.sourceId
                    );


                return `

                    <div class="bibliography-item">

                        <strong>

                            ${escapeHtml(
                                source?.shortName ||
                                item.sourceId
                            )}

                        </strong>

                        <br>

                        ${escapeHtml(
                            item.citation
                        )}

                    </div>

                `;

            })
            .join("");

    }


    /* =========================================================
       ABAS
       ========================================================= */

    function renderTabContent(
        entry,
        tab
    ) {

        switch (tab) {

            case "GDHAGP":

                return renderDefinitions(
                    entry
                );


            case "Fontes":

                return renderSourceLayers(
                    entry
                );


            case "Tradução":

                return renderTranslations(
                    entry
                );


            case "Análise":

                return renderAnalysis(
                    entry
                );


            case "Formas":

                return renderMorphology(
                    entry
                );


            case "Bibliografia":

                return renderBibliography(
                    entry
                );


            default:

                return renderDefinitions(
                    entry
                );

        }

    }


    /* =========================================================
       VERBETE
       ========================================================= */

    function renderEntry(id) {

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

                </section>

            `;

            return;

        }


        const storedTab =
            storageGet(
                sessionStorage,
                `gdhagp-tab-${entry.id}`
            );


        const initialTab =
            ENTRY_TABS.includes(
                storedTab
            )
                ?
                storedTab
                :
                "GDHAGP";


        app.innerHTML = `

            <article class="paper">

                <header class="entry-header">

                    <div>

                        <div class="eyebrow">

                            ${escapeHtml(
                                entry.language
                            )}

                            · verbete

                        </div>


                        <div class="lemma">

                            ${escapeHtml(
                                entry.lemma
                            )}

                        </div>


                        <div class="entry-meta">

                            <span>

                                <strong>

                                    ${escapeHtml(
                                        entry.lexicalForm
                                    )}

                                </strong>

                            </span>

                            <span>
                                ·
                            </span>

                            <span>

                                <em>

                                    ${escapeHtml(
                                        entry.transliteration
                                    )}

                                </em>

                            </span>

                            <span>
                                ·
                            </span>

                            <span>

                                ${escapeHtml(
                                    entry.partOfSpeech
                                )}

                            </span>

                            <span>
                                ·
                            </span>

                            <span>

                                ${escapeHtml(
                                    entry.gender
                                )}

                            </span>

                        </div>


                        <p class="entry-summary">

                            ${escapeHtml(
                                entry.shortSummary
                            )}

                        </p>


                        <div class="pills">

                            ${(entry.varieties || [])
                                .map(
                                    variety => `

                                        <span class="pill">

                                            ${escapeHtml(
                                                variety
                                            )}

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


                ${renderGeneralEntry(
                    entry
                )}


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
                                    data-tab="${escapeHtml(tab)}"
                                    aria-selected="${
                                        tab === initialTab
                                            ?
                                            "true"
                                            :
                                            "false"
                                    }"
                                >

                                    ${escapeHtml(
                                        tab
                                    )}

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
            .querySelectorAll(
                ".tab"
            )
            .forEach(button => {

                button.addEventListener(
                    "click",
                    () => {

                        const tab =
                            button.dataset.tab;


                        storageSet(
                            sessionStorage,
                            `gdhagp-tab-${entry.id}`,
                            tab
                        );


                        document
                            .querySelectorAll(
                                ".tab"
                            )
                            .forEach(item => {

                                item.setAttribute(
                                    "aria-selected",
                                    String(
                                        item === button
                                    )
                                );

                            });


                        const panel =
                            document.getElementById(
                                "tab-panel"
                            );


                        if (panel) {

                            panel.innerHTML =
                                renderTabContent(
                                    entry,
                                    tab
                                );

                        }

                    }
                );

            });


        document
            .getElementById(
                "copy-link-button"
            )
            ?.addEventListener(
                "click",
                async event => {

                    const button =
                        event.currentTarget;


                    try {

                        await navigator
                            .clipboard
                            .writeText(
                                location.href
                            );


                        button.textContent =
                            "Link copiado";

                    }
                    catch {

                        button.textContent =
                            "Copie pela barra de endereço";

                    }


                    setTimeout(
                        () => {

                            button.textContent =
                                "Copiar link";

                        },
                        1600
                    );

                }
            );


        document
            .getElementById(
                "print-button"
            )
            ?.addEventListener(
                "click",
                () =>
                    window.print()
            );

    }


    /* =========================================================
       ROTEADOR
       ========================================================= */

    function route() {

        const routeValue =
            getRoute();


        const parts =
            routeValue.split("/");


        const base =
            parts[0];


        setActiveNavigation(
            routeValue
        );


        switch (base) {

            case "inicio":

                renderHome();

                break;


            case "busca":

                renderSearch(
                    parts
                );

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
                    parts[1] ||
                    ""
                );

                break;


            default:

                renderHome();

        }


        closeSidebar();


        window.scrollTo({
            top: 0,
            behavior: "auto"
        });

    }


    /* =========================================================
       INICIALIZAÇÃO
       ========================================================= */

    initializeTheme();


    themeButton
        ?.addEventListener(
            "click",
            () => {

                const current =
                    document
                        .documentElement
                        .dataset
                        .theme;


                setTheme(
                    current === "dark"
                        ?
                        "light"
                        :
                        "dark"
                );

            }
        );


    menuButton
        ?.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                const opened =
                    sidebar
                        .classList
                        .toggle(
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
                window.innerWidth <= 900 &&
                sidebar &&
                menuButton &&
                sidebar.classList.contains(
                    "open"
                ) &&
                !sidebar.contains(
                    event.target
                ) &&
                !menuButton.contains(
                    event.target
                )
            ) {

                closeSidebar();

            }

        }
    );


    window.addEventListener(
        "resize",
        () => {

            if (
                window.innerWidth > 900
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