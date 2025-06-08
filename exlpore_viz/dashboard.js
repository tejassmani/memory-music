// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// document.addEventListener("DOMContentLoaded", () => {
//   // 1) CONFIG
//   const margin = { top: 60, right: 20, bottom: 60, left: 60 },
//         width  = 800 - margin.left - margin.right,
//         height = 500 - margin.top - margin.bottom;

//   const svg = d3.select("#eda-accuracy-chart")
//     .append("svg")
//       .attr("width",  width  + margin.left + margin.right)
//       .attr("height", height + margin.top  + margin.bottom)
//     .append("g")
//       .attr("transform", `translate(${margin.left},${margin.top})`);

//   // Scales
//   const xScale     = d3.scaleLinear().range([0, width]);
//   const yScale     = d3.scaleLinear().range([height, 0]);
//   const colorScale = d3.scaleSequential(d3.interpolateViridis);

//   // Axis groups
//   const xAxisG = svg.append("g")
//       .attr("transform", `translate(0,${height})`);
//   const yAxisG = svg.append("g");

//   // Axis labels
//   svg.append("text")
//     .attr("x", width/2)
//     .attr("y", height + 45)
//     .style("text-anchor", "middle")
//     .style("font-size", "14px")
//     .text("Mean EDA (μS)");

//   svg.append("text")
//     .attr("transform", "rotate(-90)")
//     .attr("x", -height/2)
//     .attr("y", -45)
//     .style("text-anchor", "middle")
//     .style("font-size", "14px")
//     .text("Accuracy");

//   // Tooltip
//   const tooltip = d3.select("body")
//     .append("div")
//       .style("position", "absolute")
//       .style("background", "#f9f9f9")
//       .style("padding", "6px 10px")
//       .style("border", "1px solid #ccc")
//       .style("border-radius", "4px")
//       .style("pointer-events", "none")
//       .style("opacity", 0);

//   // Controls
//   const genderFilter     = d3.select("#gender-filter");
//   const taskFilter       = d3.select("#task-filter");
//   const trialSlider      = d3.select("#trial-slider");
//   const trialSliderValue = d3.select("#trial-slider-value");

//   let processedData = [];

//   // 2) LOAD DATA
//   d3.csv("../data/df.csv", d3.autoType).then(raw => {
//     processedData = raw.map(d => ({
//       ...d,
//       eda:       +d.mean_eda,
//       acc:       +d.accuracy,
//       trial:     +d.trial,
//       gender:    d.participant.slice(-1) === "F" ? "Female"
//                 : d.participant.slice(-1) === "M" ? "Male"
//                 : "Unknown",
//       task_type: d.condition.split(" ")[1]
//     }));

//     // Set slider max
//     const maxTrial = d3.max(processedData, d => d.trial);
//     trialSlider.attr("max", maxTrial).property("value", maxTrial);
//     trialSliderValue.text(`1–${maxTrial}`);

//     // Set scales’ domains
//     xScale.domain(d3.extent(processedData, d => d.eda)).nice();
//     yScale.domain([0,1]).nice();
//     colorScale.domain(d3.extent(processedData, d => d.trial));

//     // Draw axes
//     xAxisG.call(d3.axisBottom(xScale));
//     yAxisG.call(d3.axisLeft(yScale).tickFormat(d3.format(".0%")));

//     // Draw legend
//     drawLegend();

//     // Initial plot
//     updateChart();

//     // Hook controls
//     genderFilter.on("change", updateChart);
//     taskFilter.on("change", updateChart);
//     trialSlider.on("input", function() {
//       trialSliderValue.text(`1–${this.value}`);
//       updateChart();
//     });
//   });

//   // 3) UPDATE
//   function updateChart() {
//     const selGender = genderFilter.node().value;
//     const selTask   = taskFilter.node().value;
//     const maxTrial  = +trialSlider.node().value;

//     let data = processedData
//       .filter(d => (selGender === "All" || d.gender === selGender))
//       .filter(d => (selTask   === "All" || d.task_type === selTask))
//       .filter(d => d.trial <= maxTrial);

//     // JOIN
//     const circles = svg.selectAll("circle.point").data(data, d => d.participant + "-" + d.trial);

//     // EXIT
//     circles.exit().remove();

//     // ENTER
//     const enterSel = circles.enter()
//       .append("circle")
//         .attr("class", "point")
//         .attr("r", 5)
//         .attr("stroke", "#333")
//         .attr("stroke-width", 1)
//         .on("mouseover", (event, d) => {
//           tooltip.html(`
//             <strong>Subj:</strong> ${d.participant}<br/>
//             <strong>Trial:</strong> ${d.trial}<br/>
//             <strong>EDA:</strong> ${d.eda.toFixed(2)} μS<br/>
//             <strong>Acc:</strong> ${(d.acc * 100).toFixed(1)}%<br/>
//             <strong>Task:</strong> ${d.task_type}<br/>
//             <strong>Gender:</strong> ${d.gender}
//           `)
//           .style("left",  (event.pageX + 10) + "px")
//           .style("top",   (event.pageY - 30) + "px")
//           .transition().duration(200).style("opacity", 1);
//         })
//         .on("mouseout", () => {
//           tooltip.transition().duration(200).style("opacity", 0);
//         });

//     // ENTER + UPDATE
//     enterSel.merge(circles)
//       .attr("cx", d => xScale(d.eda))
//       .attr("cy", d => yScale(d.acc))
//       .attr("fill", d => colorScale(d.trial));
//   }

//   // 4) LEGEND
//   function drawLegend() {
//     const legendWidth  = 200,
//           legendHeight = 10;

//     // defs + gradient
//     const defs = svg.append("defs");
//     const gradient = defs.append("linearGradient")
//         .attr("id", "legend-gradient")
//         .attr("x1", "0%").attr("x2", "100%")
//         .attr("y1", "0%").attr("y2", "0%");

//     const [minT, maxT] = colorScale.domain();
//     gradient.append("stop")
//       .attr("offset", "0%")
//       .attr("stop-color", colorScale(minT));
//     gradient.append("stop")
//       .attr("offset", "100%")
//       .attr("stop-color", colorScale(maxT));

//     // legend group
//     const legendG = svg.append("g")
//       .attr("class", "legend")
//       .attr("transform", `translate(${width - legendWidth - 10}, -40)`);

//     // color bar
//     legendG.append("rect")
//       .attr("width",  legendWidth)
//       .attr("height", legendHeight)
//       .style("fill", "url(#legend-gradient)");

//     // min label
//     legendG.append("text")
//       .attr("x", 0)
//       .attr("y", legendHeight + 15)
//       .style("font-size", "12px")
//       .style("font-family", "sans-serif")
//       .text(`Trial ${minT}`);

//     // max label
//     legendG.append("text")
//       .attr("x", legendWidth)
//       .attr("y", legendHeight + 15)
//       .style("text-anchor", "end")
//       .style("font-size", "12px")
//       .style("font-family", "sans-serif")
//       .text(`Trial ${maxT}`);

//     // legend title
//     legendG.append("text")
//       .attr("x", 0)
//       .attr("y", -6)
//       .style("font-size", "12px")
//       .style("font-family", "sans-serif")
//       .text("Trial");
//   }

// });

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

document.addEventListener("DOMContentLoaded", () => {
  // ─── 1) SETUP ──────────────────────────────────────────────────────────
  const margin = { top: 60, right: 20, bottom: 60, left: 60 },
        width  = 800 - margin.left - margin.right,
        height = 500 - margin.top  - margin.bottom;

  // Create SVG container
  const svg = d3.select("#eda-accuracy-chart")
    .append("svg")
      .attr("width",  width  + margin.left + margin.right)
      .attr("height", height + margin.top  + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  // Scales
  const xScale = d3.scaleLinear().range([0, width]);
  const yScale = d3.scaleLinear().range([height, 0]);
  // Ordinal color for session_type
  const colorMap = { Calming: "#2196f3", Vexing: "#f44336" };
  const colorScale = d3.scaleOrdinal()
    .domain(["Calming", "Vexing"])
    .range([colorMap.Calming, colorMap.Vexing]);

  // Axis groups
  const xAxisG = svg.append("g").attr("transform", `translate(0,${height})`);
  const yAxisG = svg.append("g");

  // Axis labels
  svg.append("text")
    .attr("x", width/2).attr("y", height + 45)
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Mean EDA (μS)");

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height/2).attr("y", -45)
    .style("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Accuracy");

  // Tooltip
  const tooltip = d3.select("body").append("div")
    .style("position","absolute")
    .style("background","#f9f9f9")
    .style("padding","6px 10px")
    .style("border","1px solid #ccc")
    .style("border-radius","4px")
    .style("pointer-events","none")
    .style("opacity",0);

  // Controls
  const genderFilter      = d3.select("#gender-filter");
  const taskFilter        = d3.select("#task-filter");
  const trialSlider       = d3.select("#trial-slider");
  const trialSliderValue  = d3.select("#trial-slider-value");

  let dataStore = [];

  // ─── 2) LOAD & PROCESS ───────────────────────────────────────────────
  d3.csv("../data/df.csv", d3.autoType).then(raw => {
    dataStore = raw.map(d => {
      // condition is like "Calming 1-back" or "Vexing 3-back"
      const parts = d.condition.split(" ");
      return {
        ...d,
        eda:          +d.mean_eda,
        acc:          +d.accuracy,
        trial:        +d.trial,
        session_type: parts[0],        // "Calming" or "Vexing"
        task_type:    parts[1],        // "1-back" or "3-back"
        gender:       d.participant.slice(-1) === "F" ? "Female" : "Male"
      };
    });

    // Setup trial slider
    const maxTrial = d3.max(dataStore, d => d.trial);
    trialSlider
      .attr("min", 1)
      .attr("max", maxTrial)
      .property("value", maxTrial);
    trialSliderValue.text(`1–${maxTrial}`);

    // Set domains
    xScale.domain(d3.extent(dataStore, d => d.eda)).nice();
    yScale.domain([0, 1]).nice();

    // Draw static axes
    xAxisG.call(d3.axisBottom(xScale));
    yAxisG.call(d3.axisLeft(yScale).tickFormat(d3.format(".0%")));

    // Draw discrete legend for session_type
    drawDiscreteLegend();

    // Initial draw
    updateChart();

    // Hook controls
    genderFilter.on("change", updateChart);
    taskFilter.on("change", updateChart);
    trialSlider.on("input", function() {
      trialSliderValue.text(`1–${this.value}`);
      updateChart();
    });
  });

  // ─── 3) UPDATE ────────────────────────────────────────────────────────
  function updateChart() {
    const selGender = genderFilter.node().value;
    const selTask   = taskFilter.node().value;
    const maxTrial  = +trialSlider.node().value;

    // Apply filters
    const filtered = dataStore
      .filter(d => selGender === "All" || d.gender === selGender)
      .filter(d => selTask   === "All" || d.task_type === selTask)
      .filter(d => d.trial <= maxTrial);

    // JOIN
    const pts = svg.selectAll("circle.point").data(filtered, d => d.participant + "-" + d.trial);

    // EXIT
    pts.exit().remove();

    // ENTER
    const enter = pts.enter()
      .append("circle")
        .attr("class", "point")
        .attr("r", 5)
        .attr("stroke", "#333")
        .attr("stroke-width", 1)
        .on("mouseover", (event,d) => {
          tooltip.html(`
            <strong>Subj:</strong> ${d.participant}<br/>
            <strong>Trial:</strong> ${d.trial}<br/>
            <strong>EDA:</strong> ${d.eda.toFixed(2)} μS<br/>
            <strong>Acc:</strong> ${(d.acc*100).toFixed(1)}%<br/>
            <strong>Type:</strong> ${d.task_type}<br/>
            <strong>Session:</strong> ${d.session_type}<br/>
            <strong>Gender:</strong> ${d.gender}
          `)
          .style("left", (event.pageX+10) + "px")
          .style("top",  (event.pageY-30) + "px")
          .transition().duration(200).style("opacity",1);
        })
        .on("mouseout", () => tooltip.transition().duration(200).style("opacity",0));

    // ENTER + UPDATE
    enter.merge(pts)
      .attr("cx", d => xScale(d.eda))
      .attr("cy", d => yScale(d.acc))
      .attr("fill", d => colorScale(d.session_type));
  }

  // ─── 4) LEGEND ────────────────────────────────────────────────────────
  function drawDiscreteLegend() {
    const items = ["Calming","Vexing"];
    const lg = svg.append("g")
      .attr("transform", `translate(${width - 120}, -40)`);

    // Title
    lg.append("text")
      .attr("x", 0).attr("y", -8)
      .style("font-size", "12px")
      .style("font-family", "sans-serif")
      .style("font-weight", "600")
      .text("Session Type");

    items.forEach((key,i) => {
      const g = lg.append("g")
        .attr("transform", `translate(0, ${i * 20})`);
      g.append("circle")
        .attr("r", 6)
        .attr("cx", 0)
        .attr("cy", 0)
        .attr("fill", colorMap[key]);
      g.append("text")
        .attr("x", 12)
        .attr("y", 4)
        .style("font-size", "12px")
        .style("font-family", "sans-serif")
        .text(key);
    });
  }

});

