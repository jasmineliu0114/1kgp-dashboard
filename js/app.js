import { CONTINENTS, PANEL1_OPTIONS, PANEL2_OPTIONS, GLOBAL_MODES } from "./config.js";
import {
    state,
    setSuperpopSelection,
    setContinentSelection,
    setContinentPopSelection
} from "./state.js";
import { renderEulerPlot } from "./euler.js";

async function loadPopulations() {
    const res = await fetch("assets/metadata/populations.json");
    if (!res.ok) {
        throw new Error(`Failed to load populations metadata: ${res.status}`);
    }
    state.populations = await res.json();
}

function createSelect(id, options, defaultValue = null) {
    const select = document.createElement("select");
    select.id = id;

    for (const opt of options) {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.label;
        if (defaultValue !== null && opt.value === defaultValue) {
            option.selected = true;
        }
        select.appendChild(option);
    }

    return select;
}

function formatNumber(x) {
    if (x === null || x === undefined || Number.isNaN(Number(x))) return "NA";
    return Number(x).toLocaleString();
}

function getPopulationPlotPath(popCode, mode) {
    const pop = state.populations?.[popCode];
    if (!pop) return null;
    return pop.plots?.[mode] || null;
}

// Update these filenames to match your actual exported global HTML files.
function getGlobalPlotPath(kind, mode) {
    // kind: "pca" or "umap"
    // mode: "base", "stability", "contour", "stability_contour"
    return `assets/plots/global_common_${kind}_${mode}.html`;
}

function createSectionBlock(titleText) {
    const section = document.createElement("section");
    section.className = "section-block";

    const title = document.createElement("div");
    title.className = "section-title";
    title.textContent = titleText;

    section.appendChild(title);
    return section;
}

function createControlsRow() {
    const row = document.createElement("div");
    row.className = "controls-row";
    return row;
}

function createBasePanel({ className = "panel", titleText }) {
    const panel = document.createElement("div");
    panel.className = className;

    const title = document.createElement("h3");
    title.className = "plot-title";
    title.textContent = titleText;

    panel.appendChild(title);

    return { panel, title };
}

function createIframeElements(placeholderText) {
    const placeholder = document.createElement("div");
    placeholder.className = "plot-placeholder";
    placeholder.textContent = placeholderText;

    const iframe = document.createElement("iframe");
    const caption = document.createElement("p");
    caption.className = "plot-caption";

    return { placeholder, iframe, caption };
}

function createPlotPanel({
    className = "panel-wide",
    titleText,
    selectId,
    selectOptions,
    defaultValue = null,
    placeholderText
}) {
    const base = createBasePanel({ className, titleText });

    const label = document.createElement("label");
    label.className = "control-label";
    label.textContent = "Plot type:";

    const select = createSelect(selectId, selectOptions, defaultValue);
    label.appendChild(select);

    const iframeEls = createIframeElements(placeholderText);

    base.panel.appendChild(label);
    base.panel.appendChild(iframeEls.placeholder);
    base.panel.appendChild(iframeEls.iframe);
    base.panel.appendChild(iframeEls.caption);

    return {
        panel: base.panel,
        title: base.title,
        select,
        placeholder: iframeEls.placeholder,
        iframe: iframeEls.iframe,
        caption: iframeEls.caption
    };
}

function resetPanel(panelObj, message) {
    panelObj.iframe.removeAttribute("src");
    panelObj.iframe.style.display = "none";
    panelObj.placeholder.style.display = "block";
    panelObj.placeholder.textContent = message;
    panelObj.caption.textContent = "";
}

function updateGlobalPanel(panelObj, kind) {
    const mode = panelObj.select.value;
    const path = getGlobalPlotPath(kind, mode);

    panelObj.title.textContent = `Global common variants · ${kind.toUpperCase()} · ${mode}`;

    if (path) {
        panelObj.iframe.src = path;
        panelObj.iframe.style.display = "block";
        panelObj.placeholder.style.display = "none";
        panelObj.caption.textContent = "";
    } else {
        panelObj.iframe.removeAttribute("src");
        panelObj.iframe.style.display = "none";
        panelObj.placeholder.style.display = "block";
        panelObj.placeholder.textContent = `No global ${kind.toUpperCase()} plot available for "${mode}".`;
        panelObj.caption.textContent = "";
    }
}

function updatePopulationPanel(panelObj, popCode, datum, titlePrefix) {
    if (!popCode || !datum) {
        resetPanel(panelObj, "Click a population ellipse to display a plot here.");
        return;
    }

    const mode = panelObj.select.value;
    const path = getPopulationPlotPath(popCode, mode);

    panelObj.title.textContent =
        `${titlePrefix}: ${popCode}` + (datum.description ? ` — ${datum.description}` : "");

    const superpop_list = ['AFR', 'AMR', 'EAS', 'EUR', 'SAS']
    if (superpop_list.includes(popCode)) {
        panelObj.caption.textContent =
            `Sampled individuals: ${formatNumber(datum.sampled_individuals)} · ` +
            `Common variants: ${formatNumber(datum.common_variants)} · ` +
            `Unshared common variants globally: ${formatNumber(datum.unshared_common_variants)}`;
    }
    panelObj.caption.textContent =
        `Sampled individuals: ${formatNumber(datum.sampled_individuals)} · ` +
        `Common variants: ${formatNumber(datum.common_variants)} · ` +
        `Unshared common variants within continent group: ${formatNumber(datum.unshared_common_variants)} · ` +
        `Unshared common variants globally: ${formatNumber(datum.unshared_common_variants_all)}`;

    if (path) {
        panelObj.iframe.src = path;
        panelObj.iframe.style.display = "block";
        panelObj.placeholder.style.display = "none";
    } else {
        panelObj.iframe.removeAttribute("src");
        panelObj.iframe.style.display = "none";
        panelObj.placeholder.style.display = "block";
        panelObj.placeholder.textContent = `No plot available for ${popCode} (${mode}).`;
    }
}

async function fetchEulerData(continentKey) {
    const continent = CONTINENTS.find(d => d.key === continentKey);
    if (!continent) {
        throw new Error(`Unknown continent key: ${continentKey}`);
    }

    const res = await fetch(continent.eulerJson);
    if (!res.ok) {
        throw new Error(`Failed to load Euler JSON for ${continentKey}: ${res.status}`);
    }

    return await res.json();
}

async function renderEulerSection({
    figureDiv,
    continentKey,
    tooltipEl,
    onSelectPopulation
}) {
    figureDiv.innerHTML = "";

    const ellipses = await fetchEulerData(continentKey);

    renderEulerPlot({
        containerEl: figureDiv,
        ellipses,
        continentKey,
        tooltipEl,
        onSelectPopulation
    });
}

async function createGlobalSection() {
    const section = createSectionBlock("Global common variants");

    const scrollRow = document.createElement("div");
    scrollRow.className = "scroll-row";

    const wrap = document.createElement("div");
    wrap.className = "wrap";

    const pcaPanel = createPlotPanel({
        titleText: "Global common variants · PCA",
        selectId: "global_pca_select",
        selectOptions: GLOBAL_MODES,
        defaultValue: "base",
        placeholderText: "Select a PCA display mode."
    });

    const umapPanel = createPlotPanel({
        titleText: "Global common variants · UMAP",
        selectId: "global_umap_select",
        selectOptions: GLOBAL_MODES,
        defaultValue: "base",
        placeholderText: "Select a UMAP display mode."
    });

    pcaPanel.select.addEventListener("change", () => {
        state.global.pcaMode = pcaPanel.select.value;
        updateGlobalPanel(pcaPanel, "pca");
    });

    umapPanel.select.addEventListener("change", () => {
        state.global.umapMode = umapPanel.select.value;
        updateGlobalPanel(umapPanel, "umap");
    });

    wrap.appendChild(pcaPanel.panel);
    wrap.appendChild(umapPanel.panel);
    scrollRow.appendChild(wrap);
    section.appendChild(scrollRow);

    updateGlobalPanel(pcaPanel, "pca");
    updateGlobalPanel(umapPanel, "umap");

    return section;
}

async function createSuperpopSection(tooltipEl) {
    const section = createSectionBlock("Superpopulation explorer");

    const scrollRow = document.createElement("div");
    scrollRow.className = "scroll-row";

    const wrap = document.createElement("div");
    wrap.className = "wrap";

    const eulerPanelBase = createBasePanel({
        className: "panel",
        titleText: "Superpopulation Euler diagram"
    });

    const figureDiv = document.createElement("div");
    figureDiv.id = "figure_superpop";

    const subtext = document.createElement("div");
    subtext.className = "panel-subtext";
    subtext.textContent = "Hover for details. Click an ellipse to load PCA and UMAP.";

    eulerPanelBase.panel.appendChild(figureDiv);
    eulerPanelBase.panel.appendChild(subtext);

    const superpopPcaOptions = PANEL1_OPTIONS.filter(opt => opt.value === "unique_pca");
    const superpopUmapOptions = PANEL2_OPTIONS.filter(opt => opt.value === "unique_umap");

    const pcaPanel = createPlotPanel({
        titleText: "Superpopulation · PCA",
        selectId: "superpop_pca_select",
        selectOptions: superpopPcaOptions,
        defaultValue: "unique_pca",
        placeholderText: "Click a superpopulation ellipse to display a PCA plot of unique common variants."
    });

    const umapPanel = createPlotPanel({
        titleText: "Superpopulation · UMAP",
        selectId: "superpop_umap_select",
        selectOptions: superpopUmapOptions,
        defaultValue: "unique_umap",
        placeholderText: "Click a superpopulation ellipse to display a UMAP plot of unique common variants."
    });

    pcaPanel.select.addEventListener("change", () => {
        updatePopulationPanel(
            pcaPanel,
            state.superpop.selectedPop,
            state.superpop.selectedDatum,
            "Superpopulation · PCA"
        );
    });

    umapPanel.select.addEventListener("change", () => {
        updatePopulationPanel(
            umapPanel,
            state.superpop.selectedPop,
            state.superpop.selectedDatum,
            "Superpopulation · UMAP"
        );
    });

    await renderEulerSection({
        figureDiv,
        continentKey: "SP",
        tooltipEl,
        onSelectPopulation: (popCode, datum) => {
            setSuperpopSelection(popCode, datum);
            updatePopulationPanel(pcaPanel, popCode, datum, "Superpopulation · PCA");
            updatePopulationPanel(umapPanel, popCode, datum, "Superpopulation · UMAP");
        }
    });

    wrap.appendChild(eulerPanelBase.panel);
    wrap.appendChild(pcaPanel.panel);
    wrap.appendChild(umapPanel.panel);
    scrollRow.appendChild(wrap);
    section.appendChild(scrollRow);

    return section;
}

async function createContinentExplorerSection(tooltipEl) {
    const section = createSectionBlock("Continent explorer");

    const controls = createControlsRow();

    const continentOptions = CONTINENTS
        .filter(c => c.key !== "SP")
        .map(c => ({ value: c.key, label: c.title }));

    const continentLabel = document.createElement("label");
    continentLabel.className = "control-label";
    continentLabel.textContent = "Continent group:";

    const continentSelect = createSelect(
        "continent_group_select",
        continentOptions,
        state.continentExplorer.selectedContinent
    );

    continentLabel.appendChild(continentSelect);
    controls.appendChild(continentLabel);
    section.appendChild(controls);

    const scrollRow = document.createElement("div");
    scrollRow.className = "scroll-row";

    const wrap = document.createElement("div");
    wrap.className = "wrap";

    const eulerPanelBase = createBasePanel({
        className: "panel",
        titleText: "Continent Euler diagram"
    });

    const figureDiv = document.createElement("div");
    figureDiv.id = "figure_continent";

    const subtext = document.createElement("div");
    subtext.className = "panel-subtext";
    subtext.textContent = "Hover for details. Click an ellipse to load PCA and UMAP.";

    eulerPanelBase.panel.appendChild(figureDiv);
    eulerPanelBase.panel.appendChild(subtext);

    const pcaPanel = createPlotPanel({
        titleText: "Continent · PCA",
        selectId: "continent_pca_select",
        selectOptions: PANEL1_OPTIONS,
        defaultValue: PANEL1_OPTIONS[0]?.value ?? null,
        placeholderText: "Click a population ellipse to display a PCA plot of unique common variants."
    });

    const umapPanel = createPlotPanel({
        titleText: "Continent · UMAP",
        selectId: "continent_umap_select",
        selectOptions: PANEL2_OPTIONS,
        defaultValue: PANEL2_OPTIONS[0]?.value ?? null,
        placeholderText: "Click a population ellipse to display a UMAP plot of unique common variants."
    });

    function refreshContinentPanels() {
        updatePopulationPanel(
            pcaPanel,
            state.continentExplorer.selectedPop,
            state.continentExplorer.selectedDatum,
            "Continent · PCA"
        );
        updatePopulationPanel(
            umapPanel,
            state.continentExplorer.selectedPop,
            state.continentExplorer.selectedDatum,
            "Continent · UMAP"
        );
    }

    pcaPanel.select.addEventListener("change", refreshContinentPanels);
    umapPanel.select.addEventListener("change", refreshContinentPanels);

    async function rerenderSelectedContinent() {
        resetPanel(pcaPanel, "Click a population ellipse to display a PCA plot.");
        resetPanel(umapPanel, "Click a population ellipse to display a UMAP plot.");

        await renderEulerSection({
            figureDiv,
            continentKey: state.continentExplorer.selectedContinent,
            tooltipEl,
            onSelectPopulation: (popCode, datum) => {
                setContinentPopSelection(popCode, datum);
                refreshContinentPanels();
            }
        });
    }

    continentSelect.addEventListener("change", async (e) => {
        setContinentSelection(e.target.value);
        await rerenderSelectedContinent();
    });

    wrap.appendChild(eulerPanelBase.panel);
    wrap.appendChild(pcaPanel.panel);
    wrap.appendChild(umapPanel.panel);
    scrollRow.appendChild(wrap);
    section.appendChild(scrollRow);

    await rerenderSelectedContinent();

    return section;
}

async function init() {
    console.log("init start");

    await loadPopulations();
    console.log("populations loaded", Object.keys(state.populations).length);

    const app = document.getElementById("app");
    const tooltipEl = document.getElementById("tooltip");

    const globalSection = await createGlobalSection();
    const superpopSection = await createSuperpopSection(tooltipEl);
    const continentSection = await createContinentExplorerSection(tooltipEl);

    app.appendChild(globalSection);
    app.appendChild(superpopSection);
    app.appendChild(continentSection);

    console.log("init done");
}

init().catch(err => {
    console.error(err);
    document.body.insertAdjacentHTML(
        "beforeend",
        `<pre style="color:red; white-space:pre-wrap;">${err.stack || err}</pre>`
    );
});
