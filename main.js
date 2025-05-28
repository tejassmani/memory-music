import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// const svg = d3.select("#chart");
const svg = d3.select("#eda-chart");
const width = +svg.attr("width");
const height = +svg.attr("height");
const margin = { top: 50, right: 100, bottom: 80, left: 60 };

const chartWidth  = width  - margin.left - margin.right;
const chartHeight = height - margin.top  - margin.bottom;

// a <g> that contains everything, shifted over by left+top margins
const g = svg.append("g")
  .attr("transform", `translate(${margin.left},${margin.top})`);

// prepare scales (domains set inside update)
const x = d3.scaleBand().range([0, chartWidth]).padding(0.2);
const y = d3.scaleLinear().range([chartHeight, 0]);
const color = d3.scaleOrdinal(d3.schemeSet2);

// create “empty” axis groups so we can call them later
const xAxisG = g.append("g")
  .attr("class", "x-axis")
  .attr("transform", `translate(0,${chartHeight})`);
const yAxisG = g.append("g")
  .attr("class", "y-axis");

// X-axis title
g.append("text")
.attr("class", "x-axis-title")
.attr("x", chartWidth / 2)                    
.attr("y", chartHeight + margin.bottom - 10)   
.attr("text-anchor", "middle")
.style("font-size", "14px")
.text("Treatment and Test");

// Y-axis title
g.append("text")
.attr("class", "y-axis-title")
.attr("transform", `rotate(-90)`)            
.attr("x", -chartHeight / 2)                  
.attr("y", -margin.left + 15)                 
.attr("text-anchor", "middle")
.style("font-size", "14px")
.text("Mean Electrodermal Activity (microsiemens)");

// the one function we’ll call on “All” or on a single participant
function updateChart(participant) {

  const subset = (participant === "All" || participant === null)
  ? data
  : data.filter(d => d.participant === participant);


  // regroup + stats
  const grouped = d3.groups(subset, d => d.condition)
    .map(([condition, vals]) => ({
      condition,
      mean: d3.mean(vals, d => d.mean_eda),
      sd:   d3.deviation(vals, d => d.mean_eda)
    }));

  // update domains
  x.domain(grouped.map(d => d.condition));
  y.domain([0, d3.max(grouped, d => d.mean + d.sd)]).nice();

  // redraw axes
  xAxisG.call(d3.axisBottom(x))
    .selectAll("text")
      .attr("transform", "rotate(30)")
      .style("text-anchor", "start");
  yAxisG.call(d3.axisLeft(y));

  // --- BARS ---
  const bars = g.selectAll(".bar")
    .data(grouped, d => d.condition);

  // remove old
  bars.exit().remove();

  // add new
  bars.enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.condition))
      .attr("width", x.bandwidth())
      .attr("fill", d => color(d.condition))
      // set y/height immediately so no transition oddness
      .attr("y", d => y(d.mean))
      .attr("height", d => chartHeight - y(d.mean));

  // update existing
  bars
    .attr("x", d => x(d.condition))
    .attr("width", x.bandwidth())
    .attr("y", d => y(d.mean))
    .attr("height", d => chartHeight - y(d.mean));

  // --- ERROR LINES & CAPS ---
  const capW = x.bandwidth() * 0.1;
  const errors = g.selectAll(".error-group")
    .data(grouped, d => d.condition);

  errors.exit().remove();

  const errorsEnter = errors.enter()
    .append("g")
      .attr("class","error-group");

  errorsEnter.append("line").attr("class","error-line");
  errorsEnter.append("line").attr("class","cap-top");
  errorsEnter.append("line").attr("class","cap-bottom");

  const allErrors = errorsEnter.merge(errors);

  allErrors.select(".error-line")
    .attr("x1", d => x(d.condition) + x.bandwidth()/2)
    .attr("x2", d => x(d.condition) + x.bandwidth()/2)
    .attr("y1", d => y(d.mean - d.sd))
    .attr("y2", d => y(d.mean + d.sd))
    .attr("stroke","black")
    .attr("stroke-width",1.5);

  allErrors.select(".cap-top")
    .attr("x1", d => x(d.condition)+x.bandwidth()/2 - capW/2)
    .attr("x2", d => x(d.condition)+x.bandwidth()/2 + capW/2)
    .attr("y1", d => y(d.mean + d.sd))
    .attr("y2", d => y(d.mean + d.sd))
    .attr("stroke","black")
    .attr("stroke-width",1.5);

  allErrors.select(".cap-bottom")
    .attr("x1", d => x(d.condition)+x.bandwidth()/2 - capW/2)
    .attr("x2", d => x(d.condition)+x.bandwidth()/2 + capW/2)
    .attr("y1", d => y(d.mean - d.sd))
    .attr("y2", d => y(d.mean - d.sd))
    .attr("stroke","black")
    .attr("stroke-width",1.5);

    document.getElementById("participant-select").addEventListener("change", function () {
  updateChart(this.value);
});


}

// load your data, build the clickable list, and render once
let data;
d3.csv("data/df.csv", d3.autoType).then(raw => {
  data = raw;

  // Dropdown-based participant list
  const parts = ["All"].concat(
    Array.from(new Set(data.map(d => d.participant)))
  );

  const select = document.getElementById("participant-select");
  select.innerHTML = "";
  parts.forEach(p => {
    const option = document.createElement("option");
    option.value = p;
    option.textContent = p;
    select.appendChild(option);
  });

  // Bind dropdown event
  select.addEventListener("change", function () {
    updateChart(this.value === "All" ? null : this.value);
  });

  // Initial render
  updateChart(null);
});


