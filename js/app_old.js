import { CONTINENTS, PANEL1_OPTIONS, PANEL2_OPTIONS } from "./config.js";
import { state, getSelectedPopulation, getSelectedDatum } from "./state.js";
import { renderEulerPlot } from "./euler.js";

async function loadPopulations() {
    const res = await fetch("assets/metadata/populations.json");
    state.populations = await res.json();
}

function createSelect(id, options) {
    const select = document.createElement("select");
    select.id = id;

    for (const opt of options) {
        const option = document.createElement("option");
        option.value = opt.value;
        option.textContent = opt.label;
        select.appendChild(option);
    }

    return select;
}

function getPlotPath(popCode, mode) {
    const pop = state.populations[popCode];
    console.log("getPlotPath", popCode, mode, pop);
    if (!pop) return null;
    console.log("plots available", pop.plots);
    return pop.plots?.[mode] || null;
}


function updateIframe(panelEls, continentKey) {
    const popCode = getSelectedPopulation(continentKey);
    const datum = getSelectedDatum(continentKey);
    if (!popCode || !datum) return;

    const mode = panelEls.select.value;
    const path = getPlotPath(popCode, mode);

    panelEls.title.textContent = `${mode}: ${popCode}${datum.description ? ` — ${datum.description}` : ""}`;
    panelEls.caption.textContent =
        `Sampled individuals: ${datum.sampled_individuals ?? "NA"} · ` +
        `Common variants: ${Number(datum.common_variants ?? 0).toLocaleString()} · ` +
        `Unshared common variants: ${Number(datum.unshared_common_variants ?? 0).toLocaleString()}`;

    if (path) {
        panelEls.iframe.src = path;
        panelEls.iframe.style.display = "block";
        panelEls.placeholder.style.display = "none";
    } else {
        panelEls.iframe.removeAttribute("src");
        panelEls.iframe.style.display = "none";
        panelEls.placeholder.style.display = "block";
        panelEls.placeholder.textContent = `No plot available for ${popCode} (${mode}).`;
    }
}

function createPlotPanel({ continentKey, panelIndex, options }) {
    const panel = document.createElement("div");
    panel.className = "panel-wide";

    const title = document.createElement("h3");
    title.className = "plot-title";
    title.textContent = `Plot panel ${panelIndex}`;

    const label = document.createElement("label");
    label.className = "control-label";
    label.textContent = "Plot type:";

    const select = createSelect(`${continentKey}_select_${panelIndex}`, options);
    label.appendChild(select);

    const placeholder = document.createElement("div");
    placeholder.className = "plot-placeholder";
    placeholder.textContent = "Click a population ellipse to display a plot here.";

    const iframe = document.createElement("iframe");
    iframe.id = `${continentKey}_iframe_${panelIndex}`;
    iframe.title = `Plot ${panelIndex}`;

    const caption = document.createElement("p");
    caption.className = "plot-caption";

    panel.appendChild(title);
    panel.appendChild(label);
    panel.appendChild(placeholder);
    panel.appendChild(iframe);
    panel.appendChild(caption);

    return { panel, title, select, placeholder, iframe, caption };
}

async function createContinentSection(continent, tooltipEl) {
    const scrollRow = document.createElement("div");
    scrollRow.className = "scroll-row";

    const wrap = document.createElement("div");
    wrap.className = "wrap";

    const eulerPanel = document.createElement("div");
    eulerPanel.className = "panel";

    const heading = document.createElement("div");
    heading.style.fontWeight = "700";
    heading.style.marginBottom = "8px";
    heading.textContent = `${continent.title} Euler diagram`;

    const figureDiv = document.createElement("div");
    figureDiv.id = `figure_${continent.key}`;

    const subtext = document.createElement("div");
    subtext.className = "panel-subtext";
    subtext.textContent = "Hover for details. Click an ellipse to load the plots.";

    eulerPanel.appendChild(heading);
    eulerPanel.appendChild(figureDiv);
    eulerPanel.appendChild(subtext);

    const plotPanel1 = createPlotPanel({ continentKey: continent.key, panelIndex: 1, options: PANEL1_OPTIONS });
    const plotPanel2 = createPlotPanel({ continentKey: continent.key, panelIndex: 2, options: PANEL2_OPTIONS });

    const syncUpdate = () => {
        updateIframe(plotPanel1, continent.key);
        updateIframe(plotPanel2, continent.key);
    };

    plotPanel1.select.addEventListener("change", syncUpdate);
    plotPanel2.select.addEventListener("change", syncUpdate);

    wrap.appendChild(eulerPanel);
    wrap.appendChild(plotPanel1.panel);
    wrap.appendChild(plotPanel2.panel);
    scrollRow.appendChild(wrap);

    const res = await fetch(continent.eulerJson);
    console.log("fetching euler json", continent.eulerJson, res.status);

    const ellipses = await res.json();
    console.log("loaded ellipses", continent.key, ellipses.length);

    console.log("about to render", continent.key, figureDiv.id);
    renderEulerPlot({
        containerEl: figureDiv,
        ellipses,
        continentKey: continent.key,
        tooltipEl,
        onSelectPopulation: () => {
            syncUpdate();
        }
    });
    console.log("finished render", continent.key);

    return scrollRow;
}

async function init() {
    console.log("init start");

    await loadPopulations();
    console.log("populations loaded", state.populations);

    const app = document.getElementById("app");
    const tooltipEl = document.getElementById("tooltip");

    console.log("continents", CONTINENTS);

    for (const continent of CONTINENTS) {
        console.log("creating continent section", continent);
        const section = await createContinentSection(continent, tooltipEl);
        app.appendChild(section);
    }

    console.log("init done");
}

init().catch(err => {
    console.error(err);
    document.body.insertAdjacentHTML("beforeend", `<pre style="color:red">${err}</pre>`);
});
