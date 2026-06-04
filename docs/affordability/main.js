/* =======================================================================
   County Affordability Explorer — chart logic
   Reads the 2025 Out of Reach datasets (WA + CA) and draws an interactive
   bubble chart comparing renter income, housing wage, and rent-burden
   measures. Viewers can filter by state, swap the axis, search a county, and
   pin labels. Built with D3.
   ======================================================================= */

/* METRICS: every measure a user can put on the X or Y axis.
   - key:        exact column header in the CSV files
   - label:      full text shown on axis labels and dropdowns
   - shortLabel: compact text used in the chart title
   - format:     how the value is displayed (currency, hours, ratio)
   - type:       drives axis tick formatting */
const METRICS = {
    income: {
        key: "Estimated Median Renter Household Income",
        label: "Median Renter Household Income",
        shortLabel: "Median renter income",
        format: d3.format("$,.0f"),
        type: "currency"
    }, 

    housingWage: {
        key: "Housing Wage for 2 bdrm FMR", //fmr is fair market rent
        label: "Housing Wage for 2 bedroom rent",
        shortLabel: "Housing Wage for 2BR",
        format: d3.format("$,.2f"),
        type: "currency"
    }, 

    minHours: {
        key: "Work hours per week at min. wage needed to afford 2 bdrm FMR",
        label: "Weekly hours at minimum wage needed for 2 bedroom rent",
        shortLabel: "Weekly hours at minimum wage",
        format: d => `${d3.format(",.0f")(d)} hrs`,
        type: "hours"
    },

    minJobs: {
        key: "# of jobs at minimum wage needed to afford a 2 bdrm FMR",
        label: "Minimum wage jobs needed for 2 bedroom rent",
        shortLabel: "Minimum wage jobs needed",
        format: d3.format(".1f"),
        type: "ratio"
    },

    twobedFmr: {
        key: "Two bedroom FMR",
        label: "Two bedroom fair market rent",
        shortLabel: "2 bedroom FMR",
        format: d3.format("$,.0f"),
        type: "currency"
    },

    rentBurden: {
        key: "Rent affordable at median renter household income ",
        label: "Monthly rent affordable at median renter income",
        shortLabel: "Affordable monthly rent",
        format: d3.format("$,.0f"),
        type: "currency"
    }
};

// Which metrics the chart starts on before the user changes anything.
const DEFAULTS = {
    xMetric: "income",
    yMetric: "minHours"
};

// Single source of truth for the chart. Every control updates this object,
// then calls render() to redraw from it.
const state = {
  data: [],                    // all parsed counties (WA + CA)
  filtered: [],                // counties currently passing the filters
  pinned: new Set(),           // county ids whose labels the user pinned
  xMetric: DEFAULTS.xMetric,   // metric currently on the X axis
  yMetric: DEFAULTS.yMetric,   // metric currently on the Y axis
  stateFilter: "all",          // "all" | "WA" | "CA"
  search: ""                    // county-name search text
};

// Cache references to the DOM elements the chart reads from / writes to.
const svg = d3.select("#chart");
const tooltip = d3.select("#tooltip");
const chartWrap = document.getElementById("chartWrap");
const chartTitle = document.getElementById("chartTitle");
const chartSubtitle = document.getElementById("chartSubtitle");
const countShown = document.getElementById("countShown");
const topBurden = document.getElementById("topBurden");
const largestMarket = document.getElementById("largestMarket");

const stateFilterEl = document.getElementById("stateFilter");
const xMetricEl = document.getElementById("xMetric");
const yMetricEl = document.getElementById("yMetric");
const countySearchEl = document.getElementById("countySearch");
const themeToggle = document.querySelector("[data-theme-toggle]");

// Space reserved around the plotting area for axes and labels.
const margin = { top: 24, right: 30, bottom: 72, left: 88};

// Apply the saved light/dark theme and wire up the toggle button.
function initThemeToggle() {
  // Prefer the page wide saved theme; fall back to the current attribute
  // (set by the inline <head> script) or the OS preference.
  let theme;
  try { theme = localStorage.getItem("pricedout-theme"); } catch (e) { theme = null; }
  if (!theme) {
    theme = document.documentElement.getAttribute("data-theme")
      || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
  }
  document.documentElement.setAttribute("data-theme", theme);
  themeToggle.addEventListener("click", () => {
    theme = theme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("pricedout-theme", theme); } catch (e) {}
  });
}

// Fill an axis dropdown with one <option> per metric in METRICS.
function populateMetricSelect(selectEl, selectedValue) {
  Object.entries(METRICS).forEach(([value, meta]) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = meta.label;
    option.selected = value === selectedValue;
    selectEl.appendChild(option);
  });
}

// Turn a raw CSV string into a number, stripping $, commas, and % signs.
// Returns null for blanks or non-numeric values so they can be filtered out.
function parseNumber(value) {
  if (value == null || value === "" || value === "-") return null;
  const cleaned = String(value).replace(/[$,%]/g, "").trim();
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

// Drop a trailing " County" so labels read "King" instead of "King County".
function cleanCountyName(name) {
  return String(name || "").replace(/ County$/i, "").trim();
}

// Convert one CSV row into a clean county object.
// Returns null for rows skipped (statewide/metro totals, or rows missing
// any of the values the chart needs to plot a bubble).
function rowToCounty(row, fallbackState) {
  // Keep only county level rows; skip state and metro summary rows.
  const geoValue = String(row.GEO || "").trim().toUpperCase();
  if (geoValue !== "4" && geoValue !== "COUNTY") return null;

  const county = row["COUNTY/METRO"] || row.COUNTY || row.County || "";
  if (!county) return null;

  const parsed = {
    county: cleanCountyName(county),
    countyFull: county,
    state: row.ST || fallbackState,
    renterHouseholds: parseNumber(row["Renter Households (2019-2023)"]),
    income: parseNumber(row[METRICS.income.key]),
    housingWage: parseNumber(row[METRICS.housingWage.key]),
    minHours: parseNumber(row[METRICS.minHours.key]),
    minJobs: parseNumber(row[METRICS.minJobs.key]),
    twobedFmr: parseNumber(row[METRICS.twobedFmr.key]),
    rentBurden: parseNumber(row[METRICS.rentBurden.key])
  };

  // Drop any county missing a core value so the chart never plots a half-row.
  const required = [parsed.renterHouseholds, parsed.income, parsed.housingWage, parsed.minHours, parsed.minJobs];
  if (required.some(v => v == null)) return null;

  // Unique id (state + county) used for D3 data joins and pin tracking.
  parsed.id = `${parsed.state}-${parsed.county}`;
  return parsed;
}

// Load both CSVs in parallel, parse each row, and combine into one array.
function loadData() {
  return Promise.all([
    d3.csv("washington.csv"),
    d3.csv("california.csv")
  ]).then(([waRows, caRows]) => {
    const wa = waRows.map(row => rowToCounty(row, "WA")).filter(Boolean);
    const ca = caRows.map(row => rowToCounty(row, "CA")).filter(Boolean);
    return [...wa, ...ca];
  });
}

// Recompute state.filtered from the current state filter and search text.
function updateFilteredData() {
  const searchTerm = state.search.trim().toLowerCase();
  state.filtered = state.data.filter(d => {
    const matchesState = state.stateFilter === "all" || d.state === state.stateFilter;
    const matchesSearch = !searchTerm || d.county.toLowerCase().includes(searchTerm);
    return matchesState && matchesSearch;
  });
}

// Color a bubble by state: teal for Washington, gold for California.
// Pulls the actual hex from the active theme's CSS variables.
function getColor(d) {
  const styles = getComputedStyle(document.documentElement);
  return d.state === "WA"
    ? styles.getPropertyValue("--color-primary").trim()
    : styles.getPropertyValue("--color-secondary").trim();
}

// Format a value using its metric's formatter (or "N/A" if missing).
function formatMetric(metricKey, value) {
  return value == null ? "N/A" : METRICS[metricKey].format(value);
}

// Min/max of a metric across the data — used to build axis scales.
function metricExtent(data, metricKey) {
  return d3.extent(data, d => d[metricKey]);
}

// Refresh the three summary cards above the chart (count, highest burden,
// and largest renter market) for whatever counties are currently shown.
function updateSummary() {
  countShown.textContent = d3.format(",")(state.filtered.length);

  if (!state.filtered.length) {
    topBurden.textContent = "—";
    largestMarket.textContent = "—";
    return;
  }

  const highest = d3.max(state.filtered, d => d.minJobs);
  const highestCounty = state.filtered.find(d => d.minJobs === highest);
  const largest = d3.max(state.filtered, d => d.renterHouseholds);
  const largestCounty = state.filtered.find(d => d.renterHouseholds === largest);

  topBurden.textContent = `${highestCounty.county}, ${highestCounty.state} (${d3.format(".1f")(highestCounty.minJobs)} jobs)`;
  largestMarket.textContent = `${largestCounty.county}, ${largestCounty.state} (${d3.format(",")(largestCounty.renterHouseholds)} renters)`;
}

// Compute the dashed "break-even" reference line, shown only on the default
// income-vs-hours view. It maps each income level to the weekly hours a
// minimum-wage worker would need to afford rent at that income.
function getReferenceLineValues(xMetric, yMetric, xDomain, yDomain) {
  if (xMetric !== "income" || yMetric !== "minHours") return null;

  // income -> affordable monthly rent (30%) -> weekly hours at $16.66/hr
  const incomeToHours = income => ((income / 12) / 0.3) / 4 / 16.66;
  const x1 = xDomain[0];
  const x2 = xDomain[1];
  const y1 = incomeToHours(x1);
  const y2 = incomeToHours(x2);

  if ([y1, y2].every(y => y >= yDomain[0] && y <= yDomain[1])) {
    return [{ x: x1, y: y1 }, { x: x2, y: y2 }];
  }

  return null;
}

// Main draw routine: clears the SVG and rebuilds the whole chart from the
// current state. Called on load and after every control change or resize.
function render() {
  updateFilteredData();
  updateSummary();

  const bounds = chartWrap.getBoundingClientRect();
  const width = bounds.width;
  const height = bounds.height || 620;
  svg.attr("viewBox", `0 0 ${width} ${height}`);
  svg.selectAll("*").remove();

  chartTitle.textContent = `${METRICS[state.yMetric].shortLabel} vs. ${METRICS[state.xMetric].shortLabel}`;
  chartSubtitle.textContent = state.stateFilter === "all"
    ? "Bubble size shows renter households across Washington and California counties."
    : `Bubble size shows renter households across ${state.stateFilter === "WA" ? "Washington" : "California"} counties.`;

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const root = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  // Nothing to plot (e.g. a search with no matches): show a friendly message.
  if (!state.filtered.length) {
    root.append("text")
      .attr("class", "empty-state")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight / 2)
      .attr("text-anchor", "middle")
      .text("No counties match the current filter.");
    return;
  }

  // Build the scales from the data range (with a little padding on X/Y).
  // Bubble radius uses a square-root scale so area — not radius — maps to size.
  const xDomain = metricExtent(state.filtered, state.xMetric);
  const yDomain = metricExtent(state.filtered, state.yMetric);
  const sizeDomain = d3.extent(state.filtered, d => d.renterHouseholds);

  const xPad = (xDomain[1] - xDomain[0]) * 0.08 || 1;
  const yPad = (yDomain[1] - yDomain[0]) * 0.08 || 1;

  const xScale = d3.scaleLinear()
    .domain([Math.max(0, xDomain[0] - xPad), xDomain[1] + xPad])
    .range([0, innerWidth]);

  const yScale = d3.scaleLinear()
    .domain([Math.max(0, yDomain[0] - yPad), yDomain[1] + yPad])
    .nice()
    .range([innerHeight, 0]);

  const radiusScale = d3.scaleSqrt()
    .domain(sizeDomain)
    .range([5, 34]);

  // Faint background gridlines (axes with no labels, full-width tick marks).
  const gridX = d3.axisBottom(xScale).ticks(width < 700 ? 5 : 7).tickSize(-innerHeight).tickFormat("");
  const gridY = d3.axisLeft(yScale).ticks(height < 560 ? 5 : 7).tickSize(-innerWidth).tickFormat("");

  root.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(gridX);

  root.append("g")
    .attr("class", "grid")
    .call(gridY);

  const xAxis = d3.axisBottom(xScale)
    .ticks(width < 700 ? 5 : 7)
    .tickFormat(d => METRICS[state.xMetric].type === "currency" ? d3.format("$,.0f")(d) : d3.format(",.0f")(d));

  const yAxis = d3.axisLeft(yScale)
    .ticks(height < 560 ? 5 : 7)
    .tickFormat(d => {
      const type = METRICS[state.yMetric].type;
      if (type === "currency") return d3.format("$,.0f")(d);
      if (type === "ratio") return d3.format(".1f")(d);
      return d3.format(",.0f")(d);
    });

  root.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${innerHeight})`)
    .call(xAxis);

  root.append("g")
    .attr("class", "axis")
    .call(yAxis);

  root.append("text")
    .attr("class", "axis-label")
    .attr("x", innerWidth / 2)
    .attr("y", innerHeight + 54)
    .attr("text-anchor", "middle")
    .text(METRICS[state.xMetric].label);

  root.append("text")
    .attr("class", "axis-label")
    .attr("transform", `translate(${-58}, ${innerHeight / 2}) rotate(-90)`)
    .attr("text-anchor", "middle")
    .text(METRICS[state.yMetric].label);

  const reference = getReferenceLineValues(state.xMetric, state.yMetric, xScale.domain(), yScale.domain());
  if (reference) {
    root.append("line")
      .attr("class", "reference-line")
      .attr("x1", xScale(reference[0].x))
      .attr("y1", yScale(reference[0].y))
      .attr("x2", xScale(reference[1].x))
      .attr("y2", yScale(reference[1].y));

    root.append("text")
      .attr("class", "reference-label")
      .attr("x", xScale(reference[1].x) - 4)
      .attr("y", yScale(reference[1].y) - 10)
      .attr("text-anchor", "end")
      .text("Break-even line");
  }

  // Two layers: bubbles underneath, county labels on top so they stay legible.
  const bubbleLayer = root.append("g").attr("class", "bubble-layer");
  const labelLayer = root.append("g").attr("class", "label-layer");

  // Draw one circle per county, animating the radius in from 0.
  bubbleLayer.selectAll("circle")
    .data(state.filtered, d => d.id)
    .join("circle")
    .attr("class", d => `bubble ${state.pinned.has(d.id) ? "active" : ""}`)
    .attr("cx", d => xScale(d[state.xMetric]))
    .attr("cy", d => yScale(d[state.yMetric]))
    .attr("r", 0)
    .attr("fill", d => getColor(d))
    .attr("fill-opacity", 0.72)
    .attr("stroke", d => d3.color(getColor(d)).darker(0.6))
    .style("cursor", "pointer")
    .transition()
    .duration(650)
    .attr("r", d => radiusScale(d.renterHouseholds));

  // Hover = highlight this bubble, dim the rest, and show a tooltip.
  // Click = pin/unpin the county's label.
  bubbleLayer.selectAll("circle")
    .on("mousemove", function(event, d) {
      const current = d3.select(this);
      bubbleLayer.selectAll("circle").classed("dimmed", true);
      current.classed("dimmed", false);
      current.classed("active", true);

      const html = `
        <strong>${d.county} County, ${d.state}</strong><br>
        Median renter income: ${formatMetric("income", d.income)}<br>
        2BR housing wage: ${formatMetric("housingWage", d.housingWage)}<br>
        Weekly hours at minimum wage: ${formatMetric("minHours", d.minHours)}<br>
        Minimum-wage jobs for 2BR: ${formatMetric("minJobs", d.minJobs)}<br>
        Renter households: ${d3.format(",")(d.renterHouseholds)}
      `;
      tooltip.html(html).classed("visible", true);
      const [x, y] = d3.pointer(event, chartWrap);
      tooltip.style("left", `${x + 16}px`).style("top", `${y + 16}px`);
    })
    .on("mouseleave", function(event, d) {
      bubbleLayer.selectAll("circle").classed("dimmed", false);
      d3.select(this).classed("active", state.pinned.has(d.id));
      tooltip.classed("visible", false);
    })
    .on("click", function(event, d) {
      if (state.pinned.has(d.id)) state.pinned.delete(d.id);
      else state.pinned.add(d.id);
      render();
    });

  // Always label the 4 highest-burden counties, plus any the user pinned.
  const autoLabels = state.filtered
    .slice()
    .sort((a, b) => d3.descending(a.minJobs, b.minJobs) || d3.descending(a.renterHouseholds, b.renterHouseholds))
    .slice(0, 4)
    .map(d => d.id);

  const labelsToShow = state.filtered.filter(d => state.pinned.has(d.id) || autoLabels.includes(d.id));

  labelLayer.selectAll("text")
    .data(labelsToShow, d => d.id)
    .join("text")
    .attr("x", d => xScale(d[state.xMetric]) + radiusScale(d.renterHouseholds) + 6)
    .attr("y", d => yScale(d[state.yMetric]) - radiusScale(d.renterHouseholds) - 4)
    .text(d => d.county);
}

// Wire up every control so changing it updates state and redraws the chart.
function attachEvents() {
  stateFilterEl.addEventListener("change", e => {
    state.stateFilter = e.target.value;
    render();
  });

  xMetricEl.addEventListener("change", e => {
    state.xMetric = e.target.value;
    render();
  });

  yMetricEl.addEventListener("change", e => {
    state.yMetric = e.target.value;
    render();
  });

  countySearchEl.addEventListener("input", e => {
    state.search = e.target.value;
    render();
  });

  window.addEventListener("resize", () => render());
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => render());
  themeToggle.addEventListener("click", () => setTimeout(render, 0));
}

// Entry point: set up theme + controls, load the data, then draw.
async function init() {
  initThemeToggle();
  populateMetricSelect(xMetricEl, DEFAULTS.xMetric);
  populateMetricSelect(yMetricEl, DEFAULTS.yMetric);
  attachEvents();

  try {
    state.data = await loadData();
    render();
  } catch (error) {
    console.error(error);
    chartSubtitle.textContent = "The CSV files could not be loaded. Check the filenames and make sure Live Server is running.";
  }
}

init(); //If you read this far you are a really cool person :)
