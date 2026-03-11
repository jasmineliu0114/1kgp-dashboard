import { getSelectedPopulation, setPopulationSelection } from "./state.js";

function fmt(n) {
  return (n === null || n === undefined) ? "NA" : Number(n).toLocaleString();
}

export function renderEulerPlot({
  containerId,
  ellipses,
  continentKey,
  tooltipEl,
  onSelectPopulation
}) {
  const dim = 400;

  const svg = d3.select(`#${containerId}`)
    .append("svg")
    .attr("width", dim)
    .attr("height", dim)
    .attr("viewBox", `0 0 ${dim} ${dim}`);

  const xMin = d3.min(ellipses, d => d.h - d.a);
  const xMax = d3.max(ellipses, d => d.h + d.a);
  const yMin = d3.min(ellipses, d => d.k - d.b);
  const yMax = d3.max(ellipses, d => d.k + d.b);

  const span = Math.max(xMax - xMin, yMax - yMin);
  const margin = 40;
  const downscale = span / (dim - 2 * margin);

  const midX = (xMin + xMax) / 2;
  const midY = (yMin + yMax) / 2;
  const shiftX = dim / 2 - (midX / downscale);
  const shiftY = dim / 2 - (midY / downscale);

  function pathEllipse(d) {
    const cx = d.h / downscale + shiftX;
    const cy = d.k / downscale + shiftY;
    const rx = d.a / downscale;
    const ry = d.b / downscale;
    return ["M", cx + rx, cy, "A", rx, ry, 0, 1, 1, cx + rx, cy - 0.001].join(" ");
  }

  const paths = svg.selectAll("path")
    .data(ellipses)
    .enter()
    .append("path")
    .attr("class", "euler-path")
    .attr("id", d => `${continentKey}_${d.abbreviation}`)
    .attr("d", pathEllipse)
    .attr("transform", d => {
      const cx = d.h / downscale + shiftX;
      const cy = d.k / downscale + shiftY;
      const angleDeg = (d.phi ?? 0) * 180 / Math.PI;
      return `rotate(${angleDeg} ${cx} ${cy})`;
    })
    .attr("stroke", d => d.color ?? "#000")
    .attr("stroke-width", 3)
    .attr("stroke-dasharray", d => (d.stroke_dasharray === "none" ? null : d.stroke_dasharray))
    .attr("fill", d => d.fill ?? "none");

  paths
    .on("mouseover", function(event, d) {
      paths.style("opacity", 0.25);
      d3.select(this)
        .style("opacity", 1)
        .style("cursor", "pointer")
        .style("stroke-width", 7);

      d3.select(tooltipEl)
        .style("display", "block")
        .style("border-color", d.color ?? "#000")
        .html(`
          <div style="font-weight:700; font-size:16px; margin-bottom:6px;">
            ${d.description ?? d.abbreviation}
          </div>
          <div><b>Code:</b> ${d.abbreviation}</div>
          <div><b>Sampled individuals:</b> ${fmt(d.sampled_individuals)}</div>
          <div><b>Common variants:</b> ${fmt(d.common_variants)}</div>
          <div><b>Unshared common variants:</b> ${fmt(d.unshared_common_variants)}</div>
        `);
    })
    .on("mousemove", function(event) {
      d3.select(tooltipEl)
        .style("left", `${event.pageX + 12}px`)
        .style("top", `${event.pageY + 12}px`);
    })
    .on("mouseout", function() {
      d3.select(tooltipEl).style("display", "none");
      paths.style("opacity", 1).style("stroke-width", 3);

      const sel = getSelectedPopulation(continentKey);
      if (sel) {
        d3.select(`#${continentKey}_${sel}`)
          .style("opacity", 1)
          .style("stroke-width", 8);
      }
    })
    .on("click", function(event, d) {
      setPopulationSelection(continentKey, d.abbreviation, d);

      paths.style("opacity", 0.25).style("stroke-width", 3);
      d3.select(this).style("opacity", 1).style("stroke-width", 8);

      onSelectPopulation(d.abbreviation, d);
    });
}
