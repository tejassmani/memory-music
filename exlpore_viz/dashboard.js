// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// document.addEventListener("DOMContentLoaded", () => {
//   // ─── 1) SETUP ──────────────────────────────────────────────────────────
//   const margin = { top: 60, right: 20, bottom: 60, left: 60 },
//         width  = 800 - margin.left - margin.right,
//         height = 500 - margin.top  - margin.bottom;

//   // Create SVG container
//   const svg = d3.select("#eda-accuracy-chart")
//     .append("svg")
//       .attr("width",  width  + margin.left + margin.right)
//       .attr("height", height + margin.top  + margin.bottom)
//     .append("g")
//       .attr("transform", `translate(${margin.left},${margin.top})`);

//   // Scales
//   const xScale = d3.scaleLinear().range([0, width]);
//   const yScale = d3.scaleLinear().range([height, 0]);
//   // Ordinal color for session_type
// //   const colorMap = { Calming: "#2196f3", Vexing: "#f44336" };
// //   const colorScale = d3.scaleOrdinal()
// //     .domain(["Calming", "Vexing"])
// //     .range([colorMap.Calming, colorMap.Vexing]);
// const condColor = d3.scaleOrdinal()
//     .domain(["Calming","Vexing"])
//     .range([ d3.interpolateMagma(0.3), d3.interpolateMagma(0.7) ]);

//   // Axis groups
//   const xAxisG = svg.append("g").attr("transform", `translate(0,${height})`);
//   const yAxisG = svg.append("g");

//   // Axis labels
//   svg.append("text")
//     .attr("x", width/2).attr("y", height + 45)
//     .style("text-anchor", "middle")
//     .style("font-size", "14px")
//     .text("Mean EDA (μS)");

//   svg.append("text")
//     .attr("transform", "rotate(-90)")
//     .attr("x", -height/2).attr("y", -45)
//     .style("text-anchor", "middle")
//     .style("font-size", "14px")
//     .text("Accuracy");

//   // Tooltip
//   const tooltip = d3.select("body").append("div")
//     .style("position","absolute")
//     .style("background","#f9f9f9")
//     .style("padding","6px 10px")
//     .style("border","1px solid #ccc")
//     .style("border-radius","4px")
//     .style("pointer-events","none")
//     .style("opacity",0);

//   // Controls
//   const genderFilter      = d3.select("#gender-filter");
//   const taskFilter        = d3.select("#task-filter");
//   const trialSlider       = d3.select("#trial-slider");
//   const trialSliderValue  = d3.select("#trial-slider-value");

//   let dataStore = [];

//   // ─── 2) LOAD & PROCESS ───────────────────────────────────────────────
//   d3.csv("../data/df.csv", d3.autoType).then(raw => {
//     dataStore = raw.map(d => {
//       // condition is like "Calming 1-back" or "Vexing 3-back"
//       const parts = d.condition.split(" ");
//       return {
//         ...d,
//         eda:          +d.mean_eda,
//         acc:          +d.accuracy,
//         trial:        +d.trial,
//         session_type: parts[0],        // "Calming" or "Vexing"
//         task_type:    parts[1],        // "1-back" or "3-back"
//         gender:       d.participant.slice(-1) === "F" ? "Female" : "Male"
//       };
//     });

//     // Setup trial slider
//     const maxTrial = d3.max(dataStore, d => d.trial);
//     trialSlider
//       .attr("min", 1)
//       .attr("max", maxTrial)
//       .property("value", maxTrial);
//     trialSliderValue.text(`1–${maxTrial}`);

//     // Set domains
//     xScale.domain(d3.extent(dataStore, d => d.eda)).nice();
//     yScale.domain([0, 1]).nice();

//     // Draw static axes
//     xAxisG.call(d3.axisBottom(xScale));
//     yAxisG.call(d3.axisLeft(yScale).tickFormat(d3.format(".0%")));

//     // Draw discrete legend for session_type
//     drawDiscreteLegend();

//     // Initial draw
//     updateChart();

//     // Hook controls
//     genderFilter.on("change", updateChart);
//     taskFilter.on("change", updateChart);
//     trialSlider.on("input", function() {
//       trialSliderValue.text(`1–${this.value}`);
//       updateChart();
//     });
//   });

//   // ─── 3) UPDATE ────────────────────────────────────────────────────────
//   function updateChart() {
//     const selGender = genderFilter.node().value;
//     const selTask   = taskFilter.node().value;
//     const maxTrial  = +trialSlider.node().value;

//     // Apply filters
//     const filtered = dataStore
//       .filter(d => selGender === "All" || d.gender === selGender)
//       .filter(d => selTask   === "All" || d.task_type === selTask)
//       .filter(d => d.trial <= maxTrial);

//     // JOIN
//     const pts = svg.selectAll("circle.point").data(filtered, d => d.participant + "-" + d.trial);

//     // EXIT
//     pts.exit().remove();

//     // ENTER
//     const enter = pts.enter()
//       .append("circle")
//         .attr("class", "point")
//         .attr("r", 5)
//         .attr("stroke", "#333")
//         .attr("stroke-width", 1)
//         .on("mouseover", (event,d) => {
//           tooltip.html(`
//             <strong>Subj:</strong> ${d.participant}<br/>
//             <strong>Trial:</strong> ${d.trial}<br/>
//             <strong>EDA:</strong> ${d.eda.toFixed(2)} μS<br/>
//             <strong>Acc:</strong> ${(d.acc*100).toFixed(1)}%<br/>
//             <strong>Type:</strong> ${d.task_type}<br/>
//             <strong>Session:</strong> ${d.session_type}<br/>
//             <strong>Gender:</strong> ${d.gender}
//           `)
//           .style("left", (event.pageX+10) + "px")
//           .style("top",  (event.pageY-30) + "px")
//           .transition().duration(200).style("opacity",1);
//         })
//         .on("mouseout", () => tooltip.transition().duration(200).style("opacity",0));

//     // ENTER + UPDATE
//     enter.merge(pts)
//       .attr("cx", d => xScale(d.eda))
//       .attr("cy", d => yScale(d.acc))
//     //   .attr("fill", d => colorScale(d.session_type));
//       .attr("fill", d => condColor(d.session_type));
//   }

//   // ─── 4) LEGEND ────────────────────────────────────────────────────────
//   function drawDiscreteLegend() {
//     const items = ["Calming","Vexing"];
//     const lg = svg.append("g")
//       .attr("transform", `translate(${width - 120}, -40)`);

//     // Title
//     lg.append("text")
//       .attr("x", 0).attr("y", -8)
//       .style("font-size", "12px")
//       .style("font-family", "sans-serif")
//       .style("font-weight", "600")
//     //   .text("Session Type");
//     .text("Music Session");

//     items.forEach((key,i) => {
//       const g = lg.append("g")
//         .attr("transform", `translate(0, ${i * 20})`);
//       g.append("circle")
//         .attr("r", 6)
//         .attr("cx", 0)
//         .attr("cy", 0)
//         // .attr("fill", colorMap[key]);
//         .attr("fill", condColor(key));
//       g.append("text")
//         .attr("x", 12)
//         .attr("y", 4)
//         .style("font-size", "12px")
//         .style("font-family", "sans-serif")
//         .text(key);
//     });
//   }

// });

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

window.onload = () => {
  // ─── 0) CLEAR & CREATE PANES ─────────────────────────────────────────────
  // Make sure #vis4 exists and is empty
  const vis4 = d3.select("#vis4")
    .style("display", null)    // scroller will hide/show it
    .html("");

  // Build a flex container inside it
  const container = vis4.append("div")
    .attr("id", "dashboard-container")
    .style("display", "flex")
    .style("height", "100%");

  // Left: chart
  container.append("div")
    .attr("id", "eda-accuracy-chart")
    .style("flex", "1");

  // Right: controls panel
  const panel = container.append("div")
    .attr("id", "dashboard-panel");

  // ─── 1) BUILD CONTROL UI ─────────────────────────────────────────────────
  panel.append("h3")
    .text("Controls")
    .style("font-size", "1.6rem")
    .style("font-weight", "600")
    .style("background", "linear-gradient(45deg, #c266ea, #764ba2)")
    .style("-webkit-background-clip", "text")
    .style("-webkit-text-fill-color", "transparent")
    .style("margin-bottom", "1rem");

  // Gender filter
  panel.append("label").text("Gender:")
    .style("display","block").style("margin-bottom","1rem")
    .append("select").attr("id","gender-filter")
      .selectAll("option")
      .data(["All","Female","Male"])
      .join("option")
        .text(d=>d);

  // Task‐type filter
  panel.append("label").text("Task Type:")
    .style("display","block").style("margin-bottom","1rem")
    .append("select").attr("id","task-filter")
      .selectAll("option")
      .data(["All","1-back","3-back"])
      .join("option")
        .text(d=>d);

  // Trial slider
  panel.append("label").text("Trial ≤")
    .style("display","block").style("margin-bottom","1rem")
    .append("input")
      .attr("type","range")
      .attr("id","trial-slider")
      .attr("min",1)
      .attr("max",32)    // placeholder, will reset below
      .attr("value",32);

  panel.append("div")
    .attr("id","trial-slider-value")
    .style("margin","4px 0 16px")
    .text("1–32");

  // ─── 2) SETUP SVG & SCALES ───────────────────────────────────────────────
  const margin = { top: 60, right: 20, bottom: 60, left: 60 },
        width  = 800 - margin.left - margin.right,
        height = 500 - margin.top  - margin.bottom;

  const svg = d3.select("#eda-accuracy-chart")
    .append("svg")
      .attr("width",  width  + margin.left + margin.right)
      .attr("height", height + margin.top  + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  const xScale = d3.scaleLinear().range([0, width]);
  const yScale = d3.scaleLinear().range([height, 0]);

  // Magma palette for sessions
  const condColor = d3.scaleOrdinal()
    .domain(["Calming","Vexing"])
    .range([ d3.interpolateMagma(0.3), d3.interpolateMagma(0.7) ]);

  // Axes groups
  const xAxisG = svg.append("g").attr("transform", `translate(0,${height})`);
  const yAxisG = svg.append("g");

  // Axis labels
  svg.append("text")
    .attr("x", width/2).attr("y", height + 45)
    .style("text-anchor","middle")
    .style("font-size","14px")
    .text("Mean EDA (μS)");

  svg.append("text")
    .attr("transform","rotate(-90)")
    .attr("x", -height/2).attr("y", -45)
    .style("text-anchor","middle")
    .style("font-size","14px")
    .text("Accuracy");

  // Tooltip
  const tooltip = d3.select("body").append("div")
    .style("position","absolute")
    .style("background","#fff")
    .style("padding","6px 10px")
    .style("border","1px solid #ccc")
    .style("border-radius","4px")
    .style("pointer-events","none")
    .style("opacity",0);

  // Control selections
  const genderFilter     = d3.select("#gender-filter");
  const taskFilter       = d3.select("#task-filter");
  const trialSlider      = d3.select("#trial-slider");
  const trialSliderValue = d3.select("#trial-slider-value");

  let dataStore = [];

  // ─── 3) LOAD DATA & INITIALIZE ─────────────────────────────────────────
  d3.csv("../data/df.csv", d3.autoType).then(raw => {
    dataStore = raw.map(d => {
      const [session, task] = d.condition.split(" ");
      return {
        ...d,
        eda:          +d.mean_eda,
        acc:          +d.accuracy,
        trial:        +d.trial,
        session_type: session,
        task_type:    task,
        gender:       d.participant.slice(-1) === "F" ? "Female" : "Male"
      };
    });

    // slider domain now that we know max trial
    const maxT = d3.max(dataStore, d=>d.trial);
    trialSlider.attr("max", maxT).property("value", maxT);
    trialSliderValue.text(`1–${maxT}`);

    // scales domain
    xScale.domain(d3.extent(dataStore, d=>d.eda)).nice();
    yScale.domain([0,1]).nice();

    // draw axes
    xAxisG.call(d3.axisBottom(xScale));
    yAxisG.call(d3.axisLeft(yScale).tickFormat(d3.format(".0%")));

    // discrete legend
    drawLegend();

    // first render
    updateChart();

    // hook controls
    genderFilter.on("change", updateChart);
    taskFilter.on("change", updateChart);
    trialSlider.on("input", () => {
      trialSliderValue.text(`1–${trialSlider.node().value}`);
      updateChart();
    });
  });

  // ─── 4) UPDATE LOGIC ────────────────────────────────────────────────────
  function updateChart() {
    const G = genderFilter.node().value;
    const T = taskFilter.node().value;
    const M = +trialSlider.node().value;

    const filtered = dataStore
      .filter(d => G==="All"   || d.gender     === G)
      .filter(d => T==="All"   || d.task_type  === T)
      .filter(d => d.trial <= M);

    // join
    const pts = svg.selectAll("circle.point").data(filtered, d=>`${d.participant}-${d.trial}`);
    pts.exit().remove();

    const enter = pts.enter()
      .append("circle").attr("class","point")
      .attr("r",5)
      .attr("stroke","#333").attr("stroke-width",1)
      .on("mouseover",(e,d)=>{
        tooltip.html(`
          <strong>Subj:</strong> ${d.participant}<br/>
          <strong>Trial:</strong> ${d.trial}<br/>
          <strong>EDA:</strong> ${d.eda.toFixed(2)} μS<br/>
          <strong>Acc:</strong> ${(d.acc*100).toFixed(1)}%<br/>
          <strong>Task:</strong> ${d.task_type}<br/>
          <strong>Session:</strong> ${d.session_type}<br/>
          <strong>Gender:</strong> ${d.gender}
        `)
        .style("left", (e.pageX+10)+"px")
        .style("top",  (e.pageY-30)+"px")
        .transition().duration(200).style("opacity",1);
      })
      .on("mouseout",()=>tooltip.transition().duration(200).style("opacity",0));

    enter.merge(pts)
      .attr("cx", d=> xScale(d.eda))
      .attr("cy", d=> yScale(d.acc))
      .attr("fill",d=> condColor(d.session_type));
  }

  // ─── 5) LEGEND ──────────────────────────────────────────────────────────
  function drawLegend() {
    const lg = svg.append("g")
      .attr("transform", `translate(${width-120},-40)`);

    lg.append("text")
      .attr("x",0).attr("y",-8)
      .style("font-family","sans-serif")
      .style("font-weight","600")
      .style("font-size","12px")
      .text("Music Session");

    ["Calming","Vexing"].forEach((key,i)=>{
      const g = lg.append("g")
        .attr("transform", `translate(0,${i*20})`);
      g.append("circle")
        .attr("r",6).attr("cx",0).attr("cy",0)
        .attr("fill", condColor(key));
      g.append("text")
        .attr("x",12).attr("y",4)
        .style("font-family","sans-serif")
        .style("font-size","12px")
        .text(key);
    });
  }
};
