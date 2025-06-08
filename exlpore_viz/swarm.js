import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Two horizontal beeswarm plots + shared legend with hover & click.
// Default: dots colored by condition (purple theme).
// Hover: highlight participant’s dots in unique color, fade others.
// Click: filter to that participant, fade & disable other legend entries.
// Click again: clear filter, restore everything.



// 1) Dimensions
const margin = { top: 20, right: 150, bottom: 40, left: 60 };
const singleChartHeight = 180;
const chartSpacing     = 60;
const svgWidth  = 600;
const svgHeight = margin.top
                + singleChartHeight
                + chartSpacing
                + singleChartHeight
                + margin.bottom;
const chartWidth = svgWidth - margin.left - margin.right;

// 2) Create SVG

// const svg = d3.select("#swarm")
const svg = d3.select("#vis1").append("svg").attr("id", "swarm")
  .attr("width", svgWidth)
  .attr("height", svgHeight)
  .style("display", "block")    // make it a block…
  .style("margin", "0 auto");   // …and auto-center horizontally

// 3) Load data
d3.csv("../data/df.csv").then(data => {
  data.forEach(d => {
    d.accuracy = +d.accuracy;
    d.mean_rt  = +d.mean_rt;
    d.cond_cat  = d.condition.split(" ")[0]; // “Calming” or “Vexing”
  });

  // 4) Scales & color schemes
  const conditions = ["Calming","Vexing"];
  // Purple-themed, color-blind safe for conditions:
  const condPalette = [
    d3.interpolateMagma(0.3), // lighter purple
    d3.interpolateMagma(0.7)  // darker purple
  ];
  const condColor = d3.scaleOrdinal()
    .domain(conditions)
    .range(condPalette);

  // Unique, color-blind safe palette for participants:
  const participants = Array.from(new Set(data.map(d => d.participant)));
  const partColor = d3.scaleOrdinal()
    .domain(participants)
    .range(
      participants.length <= 8
        ? d3.schemeSet2
        : d3.schemeCategory10
    );

  // Shared y-scale (conditions on y-axis)
  const yScale = d3.scalePoint()
    .domain(conditions)
    .range([0, singleChartHeight])
    .padding(0.5);

  // x-scales
  const xAcc = d3.scaleLinear().domain([0,1]).range([0,chartWidth]);
  const rtExtent = d3.extent(data, d => d.mean_rt);
  const xRT  = d3.scaleLinear()
    .domain([rtExtent[0]*0.95, rtExtent[1]*1.05])
    .range([0,chartWidth]);

  // 5) Chart groups
  const accG = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  const rtG  = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top + singleChartHeight + chartSpacing})`);

  // 6) Draw one horizontal beeswarm
  function drawSwarm(g, metric, xScale, cls, xLabel) {
    const nodes = data.map(d => ({
      participant: d.participant,
      cond:        d.cond_cat,
      value:       d[metric],
      x:           xScale(d[metric]),
      y:           yScale(d.cond_cat)
    }));
    const sim = d3.forceSimulation(nodes)
      .force("x", d3.forceX(d => xScale(d.value)).strength(1))
      .force("y", d3.forceY(d => yScale(d.cond)).strength(0.1))
      .force("collide", d3.forceCollide(5))
      .stop();
    for (let i = 0; i < 120; i++) sim.tick();

    g.selectAll(`circle.${cls}`)
      .data(nodes)
      .enter().append("circle")
        .attr("class", cls)
        .attr("r", 4)
        .attr("cx", d => d.x)
        .attr("cy", d => d.y)
        .attr("fill", d => condColor(d.cond))
        .attr("opacity", 0.8);

    // X-axis
    g.append("g")
      .attr("transform", `translate(0,${singleChartHeight})`)
      .call(d3.axisBottom(xScale).ticks(5))
      .append("text")
        .attr("x", chartWidth/2)
        .attr("y", margin.bottom-10)
        .attr("text-anchor","middle")
        .attr("fill","#000")
        .text(xLabel);

    // Y-axis
    g.append("g")
      .call(d3.axisLeft(yScale))
      .append("text")
        .attr("transform","rotate(-90)")
        .attr("x",-singleChartHeight/2)
        .attr("y",-margin.left+15)
        .attr("text-anchor","middle")
        .attr("fill","#000")
        .text("Condition");
  }

  // 7) Draw both plots
  drawSwarm(accG, "accuracy", xAcc, "acc", "Accuracy");
  drawSwarm(rtG,  "mean_rt",  xRT,  "rt",  "Mean RT (ms)");

  // 8) Shared legend with hover & click
  let currentFilter = null;
  const legend = svg.append("g")
    .attr("transform", `translate(${margin.left + chartWidth + 20},${margin.top})`);

  const items = legend.selectAll(".legend-item")
    .data(participants)
    .enter().append("g")
      .attr("class","legend-item")
      .attr("transform",(d,i)=>`translate(0,${i*20})`)
      .style("cursor","pointer")
      // Hover: highlight this participant
      .on("mouseover", (_, p) => {
        svg.selectAll("circle")
          .attr("opacity",  d => d.participant===p ? 1 : 0.3)
          .attr("fill",     d => d.participant===p
                              ? partColor(d.participant)
                              : condColor(d.cond));
      })
      .on("mouseout", () => {
        if (!currentFilter) {
          svg.selectAll("circle")
            .attr("opacity", 0.8)
            .attr("fill",    d => condColor(d.cond));
        }
      })
      // Click: toggle filter
      .on("click", (_, p) => {
        if (currentFilter === p) {
          // Clear filter
          currentFilter = null;
          svg.selectAll("circle")
            .attr("display", null)
            .attr("opacity", 0.8)
            .attr("fill",    d => condColor(d.cond));
          // Restore legend items
          items
            .style("pointer-events","auto")
            .select("rect").attr("opacity",1);
          items.select("text").attr("opacity",1);
        } else if (!currentFilter) {
          // Apply filter
          currentFilter = p;
          svg.selectAll("circle")
            .attr("display", d => d.participant===p ? null : "none")
            .attr("fill",    d => partColor(d.participant))
            .attr("opacity", 1);
          // Fade & disable other legend entries
          items.style("pointer-events","none")
            .select("rect").attr("opacity",0.3);
          items.select("text").attr("opacity",0.3);
          // Keep this one active
          const sel = items.filter(d=>d===p);
          sel.style("pointer-events","auto")
             .select("rect").attr("opacity",1);
          sel.select("text").attr("opacity",1);
        }
      });

  // Legend swatches
  items.append("rect")
    .attr("width",12)
    .attr("height",12)
    .attr("fill", d=> partColor(d))
    .attr("stroke","#333");

  // Legend labels
  items.append("text")
    .attr("x", 18)
    .attr("y", 10)
    .attr("font-size","12px")
    .attr("fill","#000")
    .text(d=>d);

})