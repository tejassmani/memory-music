// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// // Load CSV (you can replace this with your CSV)
// d3.csv("./data/df.csv", d3.autoType).then(data => {

//   // Filter + sort
//   const filtered = data
//     .filter(d => d.participant === "3F" && d.mean_rt != null);

//   filtered.sort((a, b) => {
//     const isCalmingA = a.condition.startsWith("Calming") ? 0 : 1;
//     const isCalmingB = b.condition.startsWith("Calming") ? 0 : 1;
//     return isCalmingA - isCalmingB;
//   });

//   // Setup SVG
//   const width = 600, height = 400, margin = { top: 40, right: 40, bottom: 40, left: 60 };
//   const svg = d3.select("#chart")
//     .append("svg")
//     .attr("width", width)
//     .attr("height", height);

//   const xScale = d3.scaleLinear()
//     .domain([0, filtered.length - 1])
//     .range([margin.left, width - margin.right]);

//   const yScale = d3.scaleLinear()
//     .domain([0, d3.max(filtered, d => d.mean_rt)])
//     .nice()
//     .range([height - margin.bottom, margin.top]);

//   const line = d3.line()
//     .x((d, i) => xScale(i))
//     .y(d => yScale(d.mean_rt));

//   // Draw line
//   svg.append("path")
//     .datum(filtered)
//     .attr("fill", "none")
//     .attr("stroke", "steelblue")
//     .attr("stroke-width", 2)
//     .attr("d", line);

//   // Axes
//   const xAxis = d3.axisBottom(xScale)
//     .ticks(filtered.length)
//     .tickFormat(d => d);

//   const yAxis = d3.axisLeft(yScale);

//   // Gridlines
//   svg.append("g")
//     .attr("class", "grid")
//     .attr("transform", `translate(${margin.left},0)`)
//     .call(d3.axisLeft(yScale)
//       .tickSize(-(width - margin.left - margin.right))
//       .tickFormat("")
//     )
//     .selectAll("line")
//     .attr("stroke", "#ccc");

//   svg.append("g")
//     .attr("transform", `translate(0,${height - margin.bottom})`)
//     .call(xAxis)
//     .selectAll("text")
//     .attr("transform", "rotate(-45)")
//     .style("text-anchor", "end");

//   svg.append("g")
//     .attr("transform", `translate(${margin.left},0)`)
//     .call(yAxis);

//   // Partition line
//   const calmingCount = filtered.filter(d => d.condition.startsWith("Calming")).length;
//   if (calmingCount < filtered.length) {
//     const partitionX = xScale(calmingCount - 0.5);

//     svg.append("line")
//       .attr("x1", partitionX)
//       .attr("x2", partitionX)
//       .attr("y1", margin.top)
//       .attr("y2", height - margin.bottom)
//       .attr("stroke", "red")
//       .attr("stroke-width", 2)
//       .attr("stroke-dasharray", "4,4");
//   }

//   // Interaction zones
//   const totalTrials = filtered.length;

//   const zone1_start = 0;
//   const zone1_end = Math.min(6, calmingCount - 1);

//   const zone2_size = 14;
//   const zone2_center = calmingCount - 1;
//   const zone2_start = Math.max(0, zone2_center - Math.floor(zone2_size / 2));
//   const zone2_end = Math.min(totalTrials - 1, zone2_start + zone2_size - 1);

//   const zone3_start = totalTrials - 7;
//   const zone3_end = totalTrials - 1;

//   addInteractionZone(zone1_start, zone1_end, 
//     "Which Music Type Helps you Focus Earlier", 
//     showZone1Plot);

//   addInteractionZone(zone2_start, zone2_end, 
//     "How Your Focus Shifts When Changing Music", 
//     showZone2Plot);

//   addInteractionZone(zone3_start, zone3_end, 
//     "Which Music Type Keeps You Focused", 
//     showZone3Plot);

//   // Add interaction zone function
//   function addInteractionZone(startIndex, endIndex, tooltipText, clickHandler) {
//     const zoneX = xScale(startIndex);
//     const zoneWidth = xScale(endIndex) - xScale(startIndex) + (xScale(1) - xScale(0));

//     svg.append("rect")
//       .attr("x", zoneX)
//       .attr("y", margin.top)
//       .attr("width", zoneWidth)
//       .attr("height", height - margin.bottom - margin.top)
//       .attr("fill", "transparent")
//       .style("cursor", "pointer")
//       .on("mouseover", function() {
//         tooltip.style("visibility", "visible")
//           .text(tooltipText);
//       })
//       .on("mousemove", function(event) {
//         tooltip
//           .style("top", (event.pageY - 20) + "px")
//           .style("left", (event.pageX + 20) + "px");
//       })
//       .on("mouseout", function() {
//         tooltip.style("visibility", "hidden");
//       })
//       .on("click", clickHandler);
//   }

//   // Tooltip
//   const tooltip = d3.select("body").append("div")
//     .style("position", "absolute")
//     .style("background", "#f9f9f9")
//     .style("padding", "6px 10px")
//     .style("border", "1px solid #ccc")
//     .style("border-radius", "4px")
//     .style("visibility", "hidden")
//     .style("pointer-events", "none")
//     .style("font-size", "14px");

//   // Click Handlers (with simple example subcharts!)
//   function showZone1Plot() {
//     console.log("Zone 1 clicked");
//     showSubchart("Zone 1: Avg RT for First 7 Calming vs Vexing");
//   }

//   function showZone2Plot() {
//     console.log("Zone 2 clicked");
//     showSubchart("Zone 2: Line Plot of 14 Rounds around Partition");
//   }

//   function showZone3Plot() {
//     console.log("Zone 3 clicked");
//     showSubchart("Zone 3: Avg RT for Last 7 Calming vs Vexing");
//   }

//   // Show subchart with dummy content
//   function showSubchart(titleText) {
//     d3.select("#chart").style("display", "none");
//     d3.select("#subchart").style("display", "block");
//     d3.select("#backButton").style("display", "inline-block");

//     // Simple example subchart
//     const subSvg = d3.select("#subchart").html("").append("svg")
//       .attr("width", width)
//       .attr("height", height);

//     subSvg.append("text")
//       .attr("x", width / 2)
//       .attr("y", height / 2)
//       .attr("text-anchor", "middle")
//       .attr("font-size", "18px")
//       .text(titleText);
//   }

//   // Back button
//   d3.select("#backButton")
//     .on("click", () => {
//       d3.select("#subchart").style("display", "none");
//       d3.select("#chart").style("display", "block");
//       d3.select("#backButton").style("display", "none");
//     });

// function averageMeanRT(trials) {
//   return d3.mean(trials, d => d.mean_rt);
// }

// function drawBarplot(data, titleText) {
//   const subSvg = d3.select("#subchart").html("").append("svg")
//     .attr("width", width)
//     .attr("height", height);

//   subSvg.append("text")
//     .attr("x", width / 2)
//     .attr("y", 30)
//     .attr("text-anchor", "middle")
//     .attr("font-size", "18px")
//     .text(titleText);

//   const x = d3.scaleBand()
//     .domain(data.map(d => d.type))
//     .range([margin.left, width - margin.right])
//     .padding(0.4);

//   const y = d3.scaleLinear()
//     .domain([0, d3.max(data, d => d.mean_rt)])
//     .nice()
//     .range([height - margin.bottom, margin.top]);

//   subSvg.append("g")
//     .selectAll("rect")
//     .data(data)
//     .join("rect")
//     .attr("x", d => x(d.type))
//     .attr("y", d => y(d.mean_rt))
//     .attr("width", x.bandwidth())
//     .attr("height", d => y(0) - y(d.mean_rt))
//     .attr("fill", "steelblue");

//   subSvg.append("g")
//     .attr("transform", `translate(0,${height - margin.bottom})`)
//     .call(d3.axisBottom(x));

//   subSvg.append("g")
//     .attr("transform", `translate(${margin.left},0)`)
//     .call(d3.axisLeft(y));
// }

// function drawLineplotWithPartition(trials, titleText) {
//   const subSvg = d3.select("#subchart").html("").append("svg")
//     .attr("width", width)
//     .attr("height", height);

//   subSvg.append("text")
//     .attr("x", width / 2)
//     .attr("y", 30)
//     .attr("text-anchor", "middle")
//     .attr("font-size", "18px")
//     .text(titleText);

//   const x = d3.scaleLinear()
//     .domain([0, trials.length - 1])
//     .range([margin.left, width - margin.right]);

//   const y = d3.scaleLinear()
//     .domain([0, d3.max(trials, d => d.mean_rt)])
//     .nice()
//     .range([height - margin.bottom, margin.top]);

//   const line = d3.line()
//     .x((d, i) => x(i))
//     .y(d => y(d.mean_rt));

//   // Draw line
//   subSvg.append("path")
//     .datum(trials)
//     .attr("fill", "none")
//     .attr("stroke", "steelblue")
//     .attr("stroke-width", 2)
//     .attr("d", line);

//   // Draw partition line in the middle of x axis if the center is known
//   const partitionIndexInZone = trials.findIndex(d => d.condition.startsWith("Vexing"));
//   if (partitionIndexInZone > 0) {
//     const partitionX = x(partitionIndexInZone - 0.5);

//     subSvg.append("line")
//       .attr("x1", partitionX)
//       .attr("x2", partitionX)
//       .attr("y1", margin.top)
//       .attr("y2", height - margin.bottom)
//       .attr("stroke", "red")
//       .attr("stroke-width", 2)
//       .attr("stroke-dasharray", "4,4");
//   }

//   // X axis
//   subSvg.append("g")
//     .attr("transform", `translate(0,${height - margin.bottom})`)
//     .call(d3.axisBottom(x).ticks(trials.length).tickFormat(d => d));

//   // Y axis
//   subSvg.append("g")
//     .attr("transform", `translate(${margin.left},0)`)
//     .call(d3.axisLeft(y));
// }

// function showZone1Plot() {
//   console.log("Zone 1 clicked");
//   d3.select("#chart").style("display", "none");
//   d3.select("#subchart").style("display", "block");
//   d3.select("#backButton").style("display", "inline-block");

//   // Get first 7 calming
//   const first7Calming = filtered.filter(d => d.condition.startsWith("Calming")).slice(0, 7);
//   const first7Vexing = filtered.filter(d => d.condition.startsWith("Vexing")).slice(0, 7);

//   const barData = [
//     { type: "Calming", mean_rt: averageMeanRT(first7Calming) },
//     { type: "Vexing", mean_rt: averageMeanRT(first7Vexing) }
//   ];

//   drawBarplot(barData, "First 7: Calming vs Vexing");
// }


// function showZone2Plot() {
//   console.log("Zone 2 clicked");
//   d3.select("#chart").style("display", "none");
//   d3.select("#subchart").style("display", "block");
//   d3.select("#backButton").style("display", "inline-block");

//   const trials = filtered.slice(zone2_start, zone2_end + 1);

//   drawLineplotWithPartition(trials, "Middle 14 Rounds: RT Over Time");
// }

// function showZone3Plot() {
//   console.log("Zone 3 clicked");
//   d3.select("#chart").style("display", "none");
//   d3.select("#subchart").style("display", "block");
//   d3.select("#backButton").style("display", "inline-block");

//   // Get last 7 calming
//   const last7Calming = filtered.filter(d => d.condition.startsWith("Calming")).slice(-7);
//   const last7Vexing = filtered.filter(d => d.condition.startsWith("Vexing")).slice(-7);

//   const barData = [
//     { type: "Calming", mean_rt: averageMeanRT(last7Calming) },
//     { type: "Vexing", mean_rt: averageMeanRT(last7Vexing) }
//   ];

//   drawBarplot(barData, "Last 7: Calming vs Vexing");
// }


// });

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// ───────────────────────────────────────────────────
// Configuration (mostly identical to your previous D3 charts):
// ───────────────────────────────────────────────────
const width = 800,
      height = 400,
      margin = { top: 60, right: 40, bottom: 60, left: 60 };

const colorMap = {
  "Calming": "#2196f3",
  "Vexing": "#f44336"
};

let fullData = [];

// Two separate “last-used” filter objects:
let accuracyFilters = {};
let responseFilters = {};

// Track which chart was last active (“accuracy”, “response”, or “both”)
let lastPlotTarget = "both";


// ───────────────────────────────────────────────────
// 1) Load the CSV and kick off everything
// ───────────────────────────────────────────────────
d3.csv("../data/df.csv", d3.autoType).then(data => {
  // Assume data rows look like: { participant: "3F", condition: "Calming_1", mean_rt: 550, ... }

  // Filter to just participant “3F” and non-null RT
  const filtered = data
    .filter(d => d.participant === "3F" && d.mean_rt != null);

  // Sort so that all Calming come first, then Vexing
  filtered.sort((a, b) => {
    const isCalmingA = a.condition.startsWith("Calming") ? 0 : 1;
    const isCalmingB = b.condition.startsWith("Calming") ? 0 : 1;
    return isCalmingA - isCalmingB;
  });

  // Save filtered into a global for use in subcharts
  fullData = filtered;

  // 1a) Add a main title above the “#chart” div
  d3.select("#chart")
    .insert("h2", ":first-child")        // prepend an <h2> to #chart
    .text("Mean RT Interactive Line Plot")
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .style("margin-bottom", "10px")
    .style("font-family", "sans-serif");

  // 1b) Initialize both filter objects from whatever the UI currently shows
  accuracyFilters = getCurrentFilters();
  responseFilters = getCurrentFilters();

  // 1c) Draw the main line‐plot
  drawMainChart(filtered);

  // 1d) Hide the subchart & backButton on load
  d3.select("#subchart").style("display", "none");
  d3.select("#backButton").style("display", "none");

  // 1e) Attach listeners to filter inputs
  d3.select("#plot-target").on("change", onPlotTargetChange);
  d3.selectAll("#task-type, #x-axis, #participant").on("change", onAnyFilterChange);
  d3.selectAll(".session-type").on("change", onAnyFilterChange);
  d3.select("#trial-range").on("input", function() {
    const val = +this.value;
    d3.select("#trial-range-value").text(`1–${val}`);
    onAnyFilterChange();
  });

});


// ───────────────────────────────────────────────────
// 2) Helpers: map “Trial Number” ↔ “TrialNumber” column
// ───────────────────────────────────────────────────
function mapXAxisChoice(rawValue) {
  rawValue = rawValue.toLowerCase();
  if (rawValue.includes("trial")) {
    return "TrialNumber";
  } else {
    return "Stimulus_Letter";
  }
}


// ───────────────────────────────────────────────────
// 3) Read all UI inputs into a JS object
//    (taskFilter, participant, rawXAxis, xAxisChoice, trialMax, sessionTypes)
// ───────────────────────────────────────────────────
function getCurrentFilters() {
  const taskFilterRaw = d3.select("#task-type").node().value;     // “Both” / “1-back” / “3-back”
  const participant   = d3.select("#participant").node().value;    // “All” or specific ID
  const rawXAxis      = d3.select("#x-axis").node().value;         // “Trial Number” or “Stimulus Letter”
  const xAxisChoice   = mapXAxisChoice(rawXAxis);
  const trialMax      = +d3.select("#trial-range").node().value;   // numeric ≤ 16

  const sessionTypes = [];
  d3.selectAll(".session-type").each(function() {
    if (d3.select(this).property("checked")) {
      sessionTypes.push(this.value);  // “Calming” / “Vexing”
    }
  });

  return {
    taskFilter:     taskFilterRaw.toLowerCase(),  // normalize to lowercase (“both”, “1-back”, “3-back”)
    participant,                                   // “all” or actual ID
    rawXAxis,                                      // exactly what the dropdown says now
    xAxisChoice,                                   // “TrialNumber” or “Stimulus_Letter”
    trialMax,                                      // number ≤ 16
    sessionTypes                                   // e.g. [“Calming”, “Vexing”]
  };
}


// ───────────────────────────────────────────────────
// 4) Restore all UI inputs from a given filter‐object.
//    In particular, set #x-axis value = filters.rawXAxis, so it never “jumps”.
// ───────────────────────────────────────────────────
function restoreInputsFrom(filters) {
  // Task Type
  d3.select("#task-type").property("value", filters.taskFilter);

  // Participant
  d3.select("#participant").property("value", filters.participant);

  // X‐Axis exactly as raw text
  d3.select("#x-axis").property("value", filters.rawXAxis);

  // Trial Range slider
  d3.select("#trial-range").property("value", filters.trialMax);
  d3.select("#trial-range-value").text(`1–${filters.trialMax}`);

  // Session checkboxes
  d3.selectAll(".session-type").each(function() {
    const cb = d3.select(this);
    const val = cb.property("value"); 
    cb.property("checked", filters.sessionTypes.includes(val));
  });
}


// ───────────────────────────────────────────────────
// 5) When any filter input (except #plot-target) changes:
//    • Stash the current UI into the appropriate filters object (accuracy or response or both).
//    • If the user explicitly selected “Accuracy Only” or “Response Only,” remember that.
//    • Redraw the main chart (we didn't actually modify how the main chart filters data here—
//      you can re‐use your existing filtered dataset or re‐apply filters if needed).
// ───────────────────────────────────────────────────
function onAnyFilterChange() {
  const plotTarget    = d3.select("#plot-target").node().value; 
  const currentFilter = getCurrentFilters();

  if (plotTarget === "accuracy") {
    accuracyFilters = currentFilter;
  } else if (plotTarget === "response") {
    responseFilters = currentFilter;
  } else {
    // “both charts”
    accuracyFilters = currentFilter;
    responseFilters = currentFilter;
  }

  if (plotTarget === "accuracy" || plotTarget === "response") {
    lastPlotTarget = plotTarget;
  }

  // Redraw the main chart with updated filters if desired.
  // (In this example, we’ve already drawn it once. If you want
  //  to re‐filter and re‐draw, call drawMainChart(...) here again.)
}


// ───────────────────────────────────────────────────
// 6) When “Apply filters to” dropdown changes:
//    • Stash the CURRENT UI into whichever filter set was active before (tracked by lastPlotTarget).
//    • Restore the UI from the newly selected filter set (or the one last edited, if “Both Charts”).
//    • Update lastPlotTarget and re‐draw if necessary.
// ───────────────────────────────────────────────────
function onPlotTargetChange() {
  const newTarget     = d3.select("#plot-target").node().value; // “accuracy”, “response”, “both”
  const currentFilter = getCurrentFilters();

  // (1) Stash current UI into lastPlotTarget’s filter set
  if (lastPlotTarget === "accuracy") {
    accuracyFilters = currentFilter;
  } else if (lastPlotTarget === "response") {
    responseFilters = currentFilter;
  } else {
    accuracyFilters = currentFilter;
    responseFilters = currentFilter;
  }

  // (2) Decide which filter to restore into the UI
  if (newTarget === "accuracy") {
    restoreInputsFrom(accuracyFilters);
  } else if (newTarget === "response") {
    restoreInputsFrom(responseFilters);
  } else {
    // “both charts” → restore from whoever was last edited
    if (lastPlotTarget === "accuracy") {
      restoreInputsFrom(accuracyFilters);
    } else if (lastPlotTarget === "response") {
      restoreInputsFrom(responseFilters);
    } else {
      restoreInputsFrom(accuracyFilters);
    }
  }

  // (3) Update lastPlotTarget
  lastPlotTarget = newTarget;
}


// ───────────────────────────────────────────────────
// 7) Draw the main line chart (RT over all trials for Participant “3F”)
//    Exactly as before, but updated to match your previous charts’ style:
//    • White background, gray gridlines, black axes, same margins & fonts.
//    • We also overlay an <rect> for each interactive zone (transparent, with mouse events).
// ───────────────────────────────────────────────────
function drawMainChart(filtered) {
  // 1) Remove any existing SVG inside #chart
  d3.select("#chart").select("svg").remove();

  // 2) Create new SVG
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // 3) Scales
  const xScale = d3.scaleLinear()
    .domain([0, filtered.length - 1])
    .range([margin.left, width - margin.right]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(filtered, d => d.mean_rt)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  // 4) Build a “backdrop” white line so the line stands out against grid
  const line = d3.line()
    .x((d, i) => xScale(i))
    .y(d => yScale(d.mean_rt));

  svg.append("path")
    .datum(filtered)
    .attr("fill", "none")
    .attr("stroke", "#fff")
    .attr("stroke-width", 4)
    .attr("d", line);

  // 5) Draw the steelblue line on top
  svg.append("path")
    .datum(filtered)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);

  // 6) Draw dots at each data point
  svg.selectAll("circle.main-dot")
    .data(filtered)
    .enter()
    .append("circle")
      .attr("class", "main-dot")
      .attr("cx", (d, i) => xScale(i))
      .attr("cy", d => yScale(d.mean_rt))
      .attr("r", 4)
      .attr("fill", "steelblue")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .append("title")
      .text((d, i) => `Trial ${i}\nRT: ${Math.round(d.mean_rt)} ms`);

  // 7) Draw gridlines (horizontal, light gray dashed)
  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale)
      .tickSize(-(width - margin.left - margin.right))
      .tickFormat("")
    )
    .selectAll("line")
      .attr("stroke", "#ddd")
      .attr("stroke-dasharray", "3,3");

  // 8) Draw X axis (rotated ticks)
  const xAxis = d3.axisBottom(xScale)
    .ticks(filtered.length)
    .tickFormat(d => d);

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "12px")
      .style("font-family", "sans-serif");

  // 9) Draw Y axis
  const yAxis = d3.axisLeft(yScale);

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis)
    .selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "sans-serif");

  // 10) Draw partition line (red dashed) where Calming → Vexing
  const calmingCount = filtered.filter(d => d.condition.startsWith("Calming")).length;
  if (calmingCount < filtered.length) {
    const partitionX = xScale(calmingCount - 0.5);
    svg.append("line")
      .attr("x1", partitionX)
      .attr("x2", partitionX)
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4,4");
  }

  // 11) Add axis labels:
  // X‐axis label: “Trial Number”
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height - margin.bottom + 40)
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-family", "sans-serif")
    .text("Trial Number");

  // Y‐axis label: “Average response time (ms)”
  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", margin.left - 45)
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-family", "sans-serif")
    .text("Average response time (ms)");

  // 12) Interaction Zones (same as before)
  const totalTrials = filtered.length;

  const zone1_start = 0;
  const zone1_end   = Math.min(6, calmingCount - 1);

  const zone2_size   = 14;
  const zone2_center = calmingCount - 1;
  const zone2_start  = Math.max(0, zone2_center - Math.floor(zone2_size / 2));
  const zone2_end    = Math.min(totalTrials - 1, zone2_start + zone2_size - 1);

  const zone3_start = totalTrials - 7;
  const zone3_end   = totalTrials - 1;

  addInteractionZone(svg, xScale, margin, filtered,
    zone1_start, zone1_end,
    "Compare the first 7 Calming vs Vexing rounds",
    showZone1Plot
  );
  addInteractionZone(svg, xScale, margin, filtered,
    zone2_start, zone2_end,
    "Observe how RT changes when music switches",
    showZone2Plot
  );
  addInteractionZone(svg, xScale, margin, filtered,
    zone3_start, zone3_end,
    "Compare the last 7 Calming vs Vexing rounds",
    showZone3Plot
  );
}



// ───────────────────────────────────────────────────
// 8) Draw one “interaction zone” as a transparent rect with hover & click:
//    On hover: show tooltipText. On click: call clickHandler().
// ───────────────────────────────────────────────────
function addInteractionZone(svg, xScale, margin, filtered,
                            startIndex, endIndex, tooltipText, clickHandler) {
  const zoneX     = xScale(startIndex);
  const zoneWidth = xScale(endIndex) - xScale(startIndex) + (xScale(1) - xScale(0));

  svg.append("rect")
    .attr("x", zoneX)
    .attr("y", margin.top)
    .attr("width", zoneWidth)
    .attr("height", height - margin.bottom - margin.top)
    .attr("fill", "transparent")
    .style("cursor", "pointer")
    .on("mouseover", function(event) {
      d3.select("#chart-tooltip")
        .style("visibility", "visible")
        .text(tooltipText);
    })
    .on("mousemove", function(event) {
      d3.select("#chart-tooltip")
        .style("top", (event.pageY - 30) + "px")
        .style("left", (event.pageX + 20) + "px");
    })
    .on("mouseout", function() {
      d3.select("#chart-tooltip")
        .style("visibility", "hidden");
    })
    .on("click", clickHandler);
}


// ───────────────────────────────────────────────────
// 9) Tooltip DIV (positioned in the body, styled similar to earlier):
// ───────────────────────────────────────────────────
d3.select("body")
  .append("div")
  .attr("id", "chart-tooltip")
  .style("position", "absolute")
  .style("background", "#f9f9f9")
  .style("padding", "6px 10px")
  .style("border", "1px solid #ccc")
  .style("border-radius", "4px")
  .style("visibility", "hidden")
  .style("pointer-events", "none")
  .style("font-size", "14px")
  .style("font-family", "sans-serif");


// ───────────────────────────────────────────────────
// 10) Helpers for computing averages & drawing subcharts:
// ───────────────────────────────────────────────────
function averageMeanRT(trials) {
  return d3.mean(trials, d => d.mean_rt);
}

function drawBarplot(data, titleText, subtitleText) {
  // Clear subchart area
  d3.select("#subchart").html("");

  // Append main title + subtitle
  d3.select("#subchart")
    .append("h2")
    .text(titleText)
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .style("margin-bottom", "4px");

  d3.select("#subchart")
    .append("div")
    .text(subtitleText)
    .style("font-size", "14px")
    .style("font-style", "italic")
    .style("font-family", "sans-serif")
    .style("margin-bottom", "10px");

  // Create SVG for barplot
  const subSvg = d3.select("#subchart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  // X scale (band for “Calming” / “Vexing”)
  const x = d3.scaleBand()
    .domain(data.map(d => d.type))
    .range([margin.left, width - margin.right])
    .padding(0.4);

  // Y scale (RT)
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.mean_rt)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  // Bars
  subSvg.append("g")
    .selectAll("rect")
    .data(data)
    .join("rect")
      .attr("x", d => x(d.type))
      .attr("y", d => y(d.mean_rt))
      .attr("width", x.bandwidth())
      .attr("height", d => y(0) - y(d.mean_rt))
      .attr("fill", "steelblue");

  // X axis (Condition)
  subSvg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "sans-serif");

  // Y axis (Mean RT)
  subSvg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "sans-serif");

  // Y‐axis label
  subSvg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height/2)
    .attr("y", margin.left - 40)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-family", "sans-serif")
    .text("Mean Response Time (ms)");

  // X‐axis label
  subSvg.append("text")
    .attr("x", width/2)
    .attr("y", height - margin.bottom + 40)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-family", "sans-serif")
    .text("Condition");
}

function drawLineplotWithPartition(trials, titleText, subtitleText) {
  // 1) Clear subchart area
  d3.select("#subchart").html("");

  // 2) Append title & subtitle (same style as main)
  d3.select("#subchart")
    .append("h2")
    .text(titleText)
    .style("font-size", "20px")
    .style("font-weight", "bold")
    .style("font-family", "sans-serif")
    .style("margin-bottom", "4px");

  d3.select("#subchart")
    .append("div")
    .text(subtitleText)
    .style("font-size", "14px")
    .style("font-style", "italic")
    .style("font-family", "sans-serif")
    .style("margin-bottom", "10px");

  // 3) Create SVG (600×400, same as main)
  const subSvg = d3.select("#subchart")
    .append("svg")
    .attr("width", width)   // 600
    .attr("height", height) // 400
    .style("background", "#fff"); // white background

  // 4) X & Y scales
  const x = d3.scaleLinear()
    .domain([0, trials.length - 1])
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(trials, d => d.mean_rt)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  // 5) Build line generator
  const line = d3.line()
    .x((d, i) => x(i))
    .y(d => y(d.mean_rt));

  // 6) Draw “backdrop” white line for clarity against grid
  subSvg.append("path")
    .datum(trials)
    .attr("fill", "none")
    .attr("stroke", "#fff")
    .attr("stroke-width", 4)
    .attr("d", line);

  // 7) Draw the steelblue line on top
  subSvg.append("path")
    .datum(trials)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);

  // 8) Draw a circle at each data point (r=4) with a white stroke
  subSvg.selectAll("circle.sub-dot")
    .data(trials)
    .enter()
    .append("circle")
      .attr("class", "sub-dot")
      .attr("cx", (d, i) => x(i))
      .attr("cy", d => y(d.mean_rt))
      .attr("r", 4)
      .attr("fill", "steelblue")
      .attr("stroke", "#fff")
      .attr("stroke-width", 1)
      .append("title")
      .text((d, i) => `Trial ${i}\nRT: ${Math.round(d.mean_rt)} ms`);

  // 9) Draw horizontal gridlines (light gray dashed)
  subSvg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y)
      .tickSize(-(width - margin.left - margin.right))
      .tickFormat("")
    )
    .selectAll("line")
      .attr("stroke", "#ddd")
      .attr("stroke-dasharray", "3,3");

  // 10) Draw partition (red dashed) where calming→vexing in this slice
  const partitionIndexInZone = trials.findIndex(d => d.condition.startsWith("Vexing"));
  if (partitionIndexInZone > 0) {
    const partitionX = x(partitionIndexInZone - 0.5);
    subSvg.append("line")
      .attr("x1", partitionX)
      .attr("x2", partitionX)
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "4,4");
  }

  // 11) X axis (rotated ticks, same style)
  subSvg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(trials.length).tickFormat(d => d))
    .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
      .style("font-size", "12px")
      .style("font-family", "sans-serif");

  // 12) Y axis (same styling)
  subSvg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y))
    .selectAll("text")
      .style("font-size", "12px")
      .style("font-family", "sans-serif");

  // 13) Y‐axis label: “Mean Response Time (ms)”
  subSvg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", margin.left - 45)
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-family", "sans-serif")
    .text("Mean Response Time (ms)");

  // 14) X‐axis label: “Trial Index”
  subSvg.append("text")
    .attr("x", width / 2)
    .attr("y", height - margin.bottom + 40)
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .style("font-family", "sans-serif")
    .text("Trial Index");
}



// ───────────────────────────────────────────────────
// 11) Zone‐specific click handlers to compute & show subplots
// ───────────────────────────────────────────────────
// Note: We refer to the global “fullData” (sorted by calming→vexing).

function showZone1Plot() {
  // Hide main chart, show subchart + backButton
  d3.select("#chart").style("display", "none");
  d3.select("#subchart").style("display", "block");
  // d3.select("#backButton").style("display", "inline-block");
  d3.select("#backButton")
  .style("display", "inline-block")
  .style("margin-top", "20px");   // push it lower so it doesn’t overlap the x‐axis label


  // First 7 Calming
  const first7Calming = fullData
    .filter(d => d.condition.startsWith("Calming"))
    .slice(0, 7);

  // First 7 Vexing (which actually start at index = calmingCount)
  const first7Vexing = fullData
    .filter(d => d.condition.startsWith("Vexing"))
    .slice(0, 7);

  const barData = [
    { type: "Calming", mean_rt: averageMeanRT(first7Calming) },
    { type: "Vexing",  mean_rt: averageMeanRT(first7Vexing) }
  ];

  drawBarplot(
    barData,
    "First 7 Rounds: Calming vs Vexing", 
    "Compare which music produced faster response times in the first 7 rounds."
  );
}

function showZone2Plot() {
  d3.select("#chart").style("display", "none");
  d3.select("#subchart").style("display", "block");
  d3.select("#backButton")
  .style("display", "inline-block")
  .style("margin-top", "20px");   // push it lower so it doesn’t overlap the x‐axis label

  // Build the center window of 14 trials around the partition
  const calmingCount = fullData.filter(d => d.condition.startsWith("Calming")).length;
  const zone2Size   = 14;
  const zone2Center = calmingCount - 1; 
  const zone2Start  = Math.max(0, zone2Center - Math.floor(zone2Size / 2));
  const zone2End    = Math.min(fullData.length - 1, zone2Start + zone2Size - 1);

  const zoneTrials = fullData.slice(zone2Start, zone2End + 1);

  drawLineplotWithPartition(
    zoneTrials,
    "Middle 14 Rounds: RT Over Time",
    "Observe how your response times change when the music switches from Calming to Vexing."
  );
}

function showZone3Plot() {
  d3.select("#chart").style("display", "none");
  d3.select("#subchart").style("display", "block");
  d3.select("#backButton")
  .style("display", "inline-block")
  .style("margin-top", "20px");   // push it lower so it doesn’t overlap the x‐axis label
  const calmingTrials = fullData.filter(d => d.condition.startsWith("Calming"));
  const vexingTrials  = fullData.filter(d => d.condition.startsWith("Vexing"));

  // Last 7 Calming
  const last7Calming = calmingTrials.slice(-7);

  // Last 7 Vexing
  const last7Vexing = vexingTrials.slice(-7);

  const barData = [
    { type: "Calming", mean_rt: averageMeanRT(last7Calming) },
    { type: "Vexing",  mean_rt: averageMeanRT(last7Vexing) }
  ];

  drawBarplot(
    barData,
    "Last 7 Rounds: Calming vs Vexing",
    "Compare which music produced faster response times in the final 7 rounds."
  );
}


// ───────────────────────────────────────────────────
// 12) Back button restores the main chart
// ───────────────────────────────────────────────────
d3.select("#backButton").on("click", () => {
  d3.select("#subchart").style("display", "none");
  d3.select("#chart").style("display", "block");
  d3.select("#backButton").style("display", "none");
});

