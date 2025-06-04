import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// Load CSV (you can replace this with your CSV)
d3.csv("./data/df.csv", d3.autoType).then(data => {

  // Filter + sort
  const filtered = data
    .filter(d => d.participant === "3F" && d.mean_rt != null);

  filtered.sort((a, b) => {
    const isCalmingA = a.condition.startsWith("Calming") ? 0 : 1;
    const isCalmingB = b.condition.startsWith("Calming") ? 0 : 1;
    return isCalmingA - isCalmingB;
  });

  // Setup SVG
  const width = 600, height = 400, margin = { top: 40, right: 40, bottom: 40, left: 60 };
  const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const xScale = d3.scaleLinear()
    .domain([0, filtered.length - 1])
    .range([margin.left, width - margin.right]);

  const yScale = d3.scaleLinear()
    .domain([0, d3.max(filtered, d => d.mean_rt)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const line = d3.line()
    .x((d, i) => xScale(i))
    .y(d => yScale(d.mean_rt));

  // Draw line
  svg.append("path")
    .datum(filtered)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);

  // Axes
  const xAxis = d3.axisBottom(xScale)
    .ticks(filtered.length)
    .tickFormat(d => d);

  const yAxis = d3.axisLeft(yScale);

  // Gridlines
  svg.append("g")
    .attr("class", "grid")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(yScale)
      .tickSize(-(width - margin.left - margin.right))
      .tickFormat("")
    )
    .selectAll("line")
    .attr("stroke", "#ccc");

  svg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(xAxis)
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis);

  // Partition line
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

  // Interaction zones
  const totalTrials = filtered.length;

  const zone1_start = 0;
  const zone1_end = Math.min(6, calmingCount - 1);

  const zone2_size = 14;
  const zone2_center = calmingCount - 1;
  const zone2_start = Math.max(0, zone2_center - Math.floor(zone2_size / 2));
  const zone2_end = Math.min(totalTrials - 1, zone2_start + zone2_size - 1);

  const zone3_start = totalTrials - 7;
  const zone3_end = totalTrials - 1;

  addInteractionZone(zone1_start, zone1_end, 
    "Which Music Type Helps you Focus Earlier", 
    showZone1Plot);

  addInteractionZone(zone2_start, zone2_end, 
    "How Your Focus Shifts When Changing Music", 
    showZone2Plot);

  addInteractionZone(zone3_start, zone3_end, 
    "Which Music Type Keeps You Focused", 
    showZone3Plot);

  // Add interaction zone function
  function addInteractionZone(startIndex, endIndex, tooltipText, clickHandler) {
    const zoneX = xScale(startIndex);
    const zoneWidth = xScale(endIndex) - xScale(startIndex) + (xScale(1) - xScale(0));

    svg.append("rect")
      .attr("x", zoneX)
      .attr("y", margin.top)
      .attr("width", zoneWidth)
      .attr("height", height - margin.bottom - margin.top)
      .attr("fill", "transparent")
      .style("cursor", "pointer")
      .on("mouseover", function() {
        tooltip.style("visibility", "visible")
          .text(tooltipText);
      })
      .on("mousemove", function(event) {
        tooltip
          .style("top", (event.pageY - 20) + "px")
          .style("left", (event.pageX + 20) + "px");
      })
      .on("mouseout", function() {
        tooltip.style("visibility", "hidden");
      })
      .on("click", clickHandler);
  }

  // Tooltip
  const tooltip = d3.select("body").append("div")
    .style("position", "absolute")
    .style("background", "#f9f9f9")
    .style("padding", "6px 10px")
    .style("border", "1px solid #ccc")
    .style("border-radius", "4px")
    .style("visibility", "hidden")
    .style("pointer-events", "none")
    .style("font-size", "14px");

  // Click Handlers (with simple example subcharts!)
  function showZone1Plot() {
    console.log("Zone 1 clicked");
    showSubchart("Zone 1: Avg RT for First 7 Calming vs Vexing");
  }

  function showZone2Plot() {
    console.log("Zone 2 clicked");
    showSubchart("Zone 2: Line Plot of 14 Rounds around Partition");
  }

  function showZone3Plot() {
    console.log("Zone 3 clicked");
    showSubchart("Zone 3: Avg RT for Last 7 Calming vs Vexing");
  }

  // Show subchart with dummy content
  function showSubchart(titleText) {
    d3.select("#chart").style("display", "none");
    d3.select("#subchart").style("display", "block");
    d3.select("#backButton").style("display", "inline-block");

    // Simple example subchart
    const subSvg = d3.select("#subchart").html("").append("svg")
      .attr("width", width)
      .attr("height", height);

    subSvg.append("text")
      .attr("x", width / 2)
      .attr("y", height / 2)
      .attr("text-anchor", "middle")
      .attr("font-size", "18px")
      .text(titleText);
  }

  // Back button
  d3.select("#backButton")
    .on("click", () => {
      d3.select("#subchart").style("display", "none");
      d3.select("#chart").style("display", "block");
      d3.select("#backButton").style("display", "none");
    });

function averageMeanRT(trials) {
  return d3.mean(trials, d => d.mean_rt);
}

function drawBarplot(data, titleText) {
  const subSvg = d3.select("#subchart").html("").append("svg")
    .attr("width", width)
    .attr("height", height);

  subSvg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "18px")
    .text(titleText);

  const x = d3.scaleBand()
    .domain(data.map(d => d.type))
    .range([margin.left, width - margin.right])
    .padding(0.4);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.mean_rt)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  subSvg.append("g")
    .selectAll("rect")
    .data(data)
    .join("rect")
    .attr("x", d => x(d.type))
    .attr("y", d => y(d.mean_rt))
    .attr("width", x.bandwidth())
    .attr("height", d => y(0) - y(d.mean_rt))
    .attr("fill", "steelblue");

  subSvg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x));

  subSvg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));
}

function drawLineplotWithPartition(trials, titleText) {
  const subSvg = d3.select("#subchart").html("").append("svg")
    .attr("width", width)
    .attr("height", height);

  subSvg.append("text")
    .attr("x", width / 2)
    .attr("y", 30)
    .attr("text-anchor", "middle")
    .attr("font-size", "18px")
    .text(titleText);

  const x = d3.scaleLinear()
    .domain([0, trials.length - 1])
    .range([margin.left, width - margin.right]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(trials, d => d.mean_rt)])
    .nice()
    .range([height - margin.bottom, margin.top]);

  const line = d3.line()
    .x((d, i) => x(i))
    .y(d => y(d.mean_rt));

  // Draw line
  subSvg.append("path")
    .datum(trials)
    .attr("fill", "none")
    .attr("stroke", "steelblue")
    .attr("stroke-width", 2)
    .attr("d", line);

  // Draw partition line in the middle of x axis if the center is known
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

  // X axis
  subSvg.append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(trials.length).tickFormat(d => d));

  // Y axis
  subSvg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));
}

function showZone1Plot() {
  console.log("Zone 1 clicked");
  d3.select("#chart").style("display", "none");
  d3.select("#subchart").style("display", "block");
  d3.select("#backButton").style("display", "inline-block");

  // Get first 7 calming
  const first7Calming = filtered.filter(d => d.condition.startsWith("Calming")).slice(0, 7);
  const first7Vexing = filtered.filter(d => d.condition.startsWith("Vexing")).slice(0, 7);

  const barData = [
    { type: "Calming", mean_rt: averageMeanRT(first7Calming) },
    { type: "Vexing", mean_rt: averageMeanRT(first7Vexing) }
  ];

  drawBarplot(barData, "First 7: Calming vs Vexing");
}


function showZone2Plot() {
  console.log("Zone 2 clicked");
  d3.select("#chart").style("display", "none");
  d3.select("#subchart").style("display", "block");
  d3.select("#backButton").style("display", "inline-block");

  const trials = filtered.slice(zone2_start, zone2_end + 1);

  drawLineplotWithPartition(trials, "Middle 14 Rounds: RT Over Time");
}

function showZone3Plot() {
  console.log("Zone 3 clicked");
  d3.select("#chart").style("display", "none");
  d3.select("#subchart").style("display", "block");
  d3.select("#backButton").style("display", "inline-block");

  // Get last 7 calming
  const last7Calming = filtered.filter(d => d.condition.startsWith("Calming")).slice(-7);
  const last7Vexing = filtered.filter(d => d.condition.startsWith("Vexing")).slice(-7);

  const barData = [
    { type: "Calming", mean_rt: averageMeanRT(last7Calming) },
    { type: "Vexing", mean_rt: averageMeanRT(last7Vexing) }
  ];

  drawBarplot(barData, "Last 7: Calming vs Vexing");
}


});

