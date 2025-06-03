// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// // const svg = d3.select("#chart");
// const svg = d3.select("#eda-chart");
// const width = +svg.attr("width");
// const height = +svg.attr("height");
// const margin = { top: 50, right: 100, bottom: 80, left: 60 };

// const chartWidth  = width  - margin.left - margin.right;
// const chartHeight = height - margin.top  - margin.bottom;

// // a <g> that contains everything, shifted over by left+top margins
// const g = svg.append("g")
//   .attr("transform", `translate(${margin.left},${margin.top})`);

// // prepare scales (domains set inside update)
// const x = d3.scaleBand().range([0, chartWidth]).padding(0.2);
// const y = d3.scaleLinear().range([chartHeight, 0]);
// const color = d3.scaleOrdinal(d3.schemeSet2);

// // create “empty” axis groups so we can call them later
// const xAxisG = g.append("g")
//   .attr("class", "x-axis")
//   .attr("transform", `translate(0,${chartHeight})`);
// const yAxisG = g.append("g")
//   .attr("class", "y-axis");

// // X-axis title
// g.append("text")
// .attr("class", "x-axis-title")
// .attr("x", chartWidth / 2)                    
// .attr("y", chartHeight + margin.bottom - 10)   
// .attr("text-anchor", "middle")
// .style("font-size", "14px")
// .text("Treatment and Test");

// // Y-axis title
// g.append("text")
// .attr("class", "y-axis-title")
// .attr("transform", `rotate(-90)`)            
// .attr("x", -chartHeight / 2)                  
// .attr("y", -margin.left + 15)                 
// .attr("text-anchor", "middle")
// .style("font-size", "14px")
// .text("Mean Electrodermal Activity (microsiemens)");

// // the one function we’ll call on “All” or on a single participant
// function updateChart(participant) {

//   const subset = (participant === "All" || participant === null)
//   ? data
//   : data.filter(d => d.participant === participant);


//   // regroup + stats
//   const grouped = d3.groups(subset, d => d.condition)
//     .map(([condition, vals]) => ({
//       condition,
//       mean: d3.mean(vals, d => d.mean_eda),
//       sd:   d3.deviation(vals, d => d.mean_eda)
//     }));

//   // update domains
//   x.domain(grouped.map(d => d.condition));
//   y.domain([0, d3.max(grouped, d => d.mean + d.sd)]).nice();

//   // redraw axes
//   xAxisG.call(d3.axisBottom(x))
//     .selectAll("text")
//       .attr("transform", "rotate(30)")
//       .style("text-anchor", "start");
//   yAxisG.call(d3.axisLeft(y));

//   // --- BARS ---
//   const bars = g.selectAll(".bar")
//     .data(grouped, d => d.condition);

//   // remove old
//   bars.exit().remove();

//   // add new
//   bars.enter().append("rect")
//       .attr("class", "bar")
//       .attr("x", d => x(d.condition))
//       .attr("width", x.bandwidth())
//       .attr("fill", d => color(d.condition))
//       // set y/height immediately so no transition oddness
//       .attr("y", d => y(d.mean))
//       .attr("height", d => chartHeight - y(d.mean));

//   // update existing
//   bars
//     .attr("x", d => x(d.condition))
//     .attr("width", x.bandwidth())
//     .attr("y", d => y(d.mean))
//     .attr("height", d => chartHeight - y(d.mean));

//   // --- ERROR LINES & CAPS ---
//   const capW = x.bandwidth() * 0.1;
//   const errors = g.selectAll(".error-group")
//     .data(grouped, d => d.condition);

//   errors.exit().remove();

//   const errorsEnter = errors.enter()
//     .append("g")
//       .attr("class","error-group");

//   errorsEnter.append("line").attr("class","error-line");
//   errorsEnter.append("line").attr("class","cap-top");
//   errorsEnter.append("line").attr("class","cap-bottom");

//   const allErrors = errorsEnter.merge(errors);

//   allErrors.select(".error-line")
//     .attr("x1", d => x(d.condition) + x.bandwidth()/2)
//     .attr("x2", d => x(d.condition) + x.bandwidth()/2)
//     .attr("y1", d => y(d.mean - d.sd))
//     .attr("y2", d => y(d.mean + d.sd))
//     .attr("stroke","black")
//     .attr("stroke-width",1.5);

//   allErrors.select(".cap-top")
//     .attr("x1", d => x(d.condition)+x.bandwidth()/2 - capW/2)
//     .attr("x2", d => x(d.condition)+x.bandwidth()/2 + capW/2)
//     .attr("y1", d => y(d.mean + d.sd))
//     .attr("y2", d => y(d.mean + d.sd))
//     .attr("stroke","black")
//     .attr("stroke-width",1.5);

//   allErrors.select(".cap-bottom")
//     .attr("x1", d => x(d.condition)+x.bandwidth()/2 - capW/2)
//     .attr("x2", d => x(d.condition)+x.bandwidth()/2 + capW/2)
//     .attr("y1", d => y(d.mean - d.sd))
//     .attr("y2", d => y(d.mean - d.sd))
//     .attr("stroke","black")
//     .attr("stroke-width",1.5);

//     document.getElementById("participant-select").addEventListener("change", function () {
//   updateChart(this.value);
// });


// }

// // load your data, build the clickable list, and render once
// let data;
// d3.csv("data/df.csv", d3.autoType).then(raw => {
//   data = raw;

//   // Dropdown-based participant list
//   const parts = ["All"].concat(
//     Array.from(new Set(data.map(d => d.participant)))
//   );

//   const select = document.getElementById("participant-select");
//   select.innerHTML = "";
//   parts.forEach(p => {
//     const option = document.createElement("option");
//     option.value = p;
//     option.textContent = p;
//     select.appendChild(option);
//   });

//   // Bind dropdown event
//   select.addEventListener("change", function () {
//     updateChart(this.value === "All" ? null : this.value);
//   });

//   // Initial render
//   updateChart(null);
// });

// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

document.addEventListener("DOMContentLoaded", () => {
  const svg = d3.select("#eda-chart");
  const width = +svg.attr("width");
  const height = +svg.attr("height");
  const margin = { top: 50, right: 100, bottom: 80, left: 60 };

  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleBand().range([0, chartWidth]).padding(0.2);
  const y = d3.scaleLinear().range([chartHeight, 0]);
  const color = d3.scaleOrdinal(d3.schemeSet2);

  const xAxisG = g.append("g")
    .attr("class", "x-axis")
    .attr("transform", `translate(0,${chartHeight})`);
  const yAxisG = g.append("g")
    .attr("class", "y-axis");

  g.append("text")
    .attr("class", "x-axis-title")
    .attr("x", chartWidth / 2)
    .attr("y", chartHeight + margin.bottom - 10)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Treatment and Test");

  g.append("text")
    .attr("class", "y-axis-title")
    .attr("transform", "rotate(-90)")
    .attr("x", -chartHeight / 2)
    .attr("y", -margin.left + 15)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .text("Mean Electrodermal Activity (microsiemens)");

  function updateChart(participant) {
    const subset = (participant === "All" || participant === null)
      ? data
      : data.filter(d => d.participant === participant);

    const grouped = d3.groups(subset, d => d.condition)
      .map(([condition, vals]) => ({
        condition,
        mean: d3.mean(vals, d => d.mean_eda),
        sd: d3.deviation(vals, d => d.mean_eda)
      }));

    x.domain(grouped.map(d => d.condition));
    y.domain([0, d3.max(grouped, d => d.mean + d.sd)]).nice();

    xAxisG.call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "rotate(30)")
      .style("text-anchor", "start");
    yAxisG.call(d3.axisLeft(y));

    const bars = g.selectAll(".bar")
      .data(grouped, d => d.condition);

    bars.exit().remove();

    bars.enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.condition))
        .attr("width", x.bandwidth())
        .attr("fill", d => color(d.condition))
        .attr("y", d => y(d.mean))
        .attr("height", d => chartHeight - y(d.mean))
      .merge(bars)
        .attr("x", d => x(d.condition))
        .attr("width", x.bandwidth())
        .attr("y", d => y(d.mean))
        .attr("height", d => chartHeight - y(d.mean));

    const capW = x.bandwidth() * 0.1;
    const errors = g.selectAll(".error-group")
      .data(grouped, d => d.condition);

    errors.exit().remove();

    const errorsEnter = errors.enter()
      .append("g")
      .attr("class", "error-group");

    errorsEnter.append("line").attr("class", "error-line");
    errorsEnter.append("line").attr("class", "cap-top");
    errorsEnter.append("line").attr("class", "cap-bottom");

    const allErrors = errorsEnter.merge(errors);

    allErrors.select(".error-line")
      .attr("x1", d => x(d.condition) + x.bandwidth() / 2)
      .attr("x2", d => x(d.condition) + x.bandwidth() / 2)
      .attr("y1", d => y(d.mean - d.sd))
      .attr("y2", d => y(d.mean + d.sd))
      .attr("stroke", "black")
      .attr("stroke-width", 1.5);

    allErrors.select(".cap-top")
      .attr("x1", d => x(d.condition) + x.bandwidth() / 2 - capW / 2)
      .attr("x2", d => x(d.condition) + x.bandwidth() / 2 + capW / 2)
      .attr("y1", d => y(d.mean + d.sd))
      .attr("y2", d => y(d.mean + d.sd))
      .attr("stroke", "black")
      .attr("stroke-width", 1.5);

    allErrors.select(".cap-bottom")
      .attr("x1", d => x(d.condition) + x.bandwidth() / 2 - capW / 2)
      .attr("x2", d => x(d.condition) + x.bandwidth() / 2 + capW / 2)
      .attr("y1", d => y(d.mean - d.sd))
      .attr("y2", d => y(d.mean - d.sd))
      .attr("stroke", "black")
      .attr("stroke-width", 1.5);
  }

  let data;
  d3.csv("data/df.csv", d3.autoType).then(raw => {
    data = raw;

    const parts = ["All", ...new Set(data.map(d => d.participant))];

    const select = document.getElementById("participant-select");
    select.innerHTML = "";

    parts.forEach(p => {
      const option = document.createElement("option");
      option.value = p;
      option.textContent = p;
      select.appendChild(option);
    });

    select.addEventListener("change", function () {
      updateChart(this.value);
    });

    updateChart("All");
  });
});

// stuti chart edits 
const svg = d3.select("#lineChart"),
      width = +svg.attr("width"),
      height = +svg.attr("height"),
      margin = { top: 40, right: 80, bottom: 50, left: 80 },
      innerWidth = width - margin.left - margin.right,
      innerHeight = height - margin.top - margin.bottom;

const chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

const subjects = ["3", "4", "6", "8", "11"];
const filePaths = subjects.flatMap(id => [
  { path: `data/behavioral_data/CalmingSubject${id}.csv`, music: "Calming", participant: id },
  { path: `data/behavioral_data/VexingSubject${id}.csv`, music: "Vexing", participant: id }
]);

Promise.all(filePaths.map(f =>
  d3.csv(f.path, d3.autoType).then(data =>
    data
      .filter(d => d.Response_Time != null && !isNaN(d.Response_Time))
      .map((d, i) => ({
        Response_Time: d.Response_Time,
        Trial: i + 1,
        Music: f.music,
        Participant: f.participant
      }))
  )
)).then(datasets => {
  let combinedData = datasets.flat();

  const xScale = d3.scaleLinear()
    .domain([1, d3.max(combinedData, d => d.Trial)])
    .range([0, innerWidth]);

  const yScale = d3.scaleLinear()
    .domain([d3.min(combinedData, d => d.Response_Time) - 50,
             d3.max(combinedData, d => d.Response_Time) + 50])
    .range([innerHeight, 0]);

  const colorScale = d3.scaleOrdinal()
    .domain(["Calming", "Vexing"])
    .range(["#99ccff", "#ff9999"]);
    // .range(["#1f77b4", "#d62728"]); // Blue and Red

  const line = d3.line()
    .x(d => xScale(d.Trial))
    .y(d => yScale(d.Response_Time));

  const tooltip = d3.select("body").append("div").attr("class", "tooltip");

  function updateChart(selectedParticipant, selectedMusic) {
    chartGroup.selectAll("*").remove();

    let filteredData = combinedData;

    if (selectedParticipant !== "All") {
      filteredData = filteredData.filter(d => d.Participant === selectedParticipant);
    }

    if (selectedMusic !== "Both") {
      filteredData = filteredData.filter(d => d.Music === selectedMusic);
    }

    const grouped = d3.groups(filteredData, d => `${d.Participant}-${d.Music}`);

    // Axes
    chartGroup.append("g")
      .attr("transform", `translate(0, ${innerHeight})`)
      .call(d3.axisBottom(xScale));

    chartGroup.append("g")
      .call(d3.axisLeft(yScale).ticks(6));

    // Lines
    chartGroup.selectAll(".line")
      .data(grouped)
      .enter()
      .append("path")
      .attr("fill", "none")
      .attr("stroke", ([, values]) => colorScale(values[0].Music))
      .attr("stroke-width", 2)
      .attr("d", ([, values]) => line(values));

    // Dots
    chartGroup.selectAll(".dot")
      .data(filteredData)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.Trial))
      .attr("cy", d => yScale(d.Response_Time))
      .attr("r", 4)
      .attr("fill", d => colorScale(d.Music))
      .on("mouseover", (event, d) => {
        tooltip.transition().style("opacity", 1);
        tooltip.html(
          `<strong>Subject ${d.Participant}</strong><br>
           Trial: ${d.Trial}<br>
           Music: ${d.Music}<br>
           Response: ${d.Response_Time.toFixed(1)}ms`
        )
        .style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => tooltip.transition().style("opacity", 0));
  }

  // Initial render
  updateChart("All", "Both");

  // Hook up dropdowns
  d3.select("#participantFilter").on("change", function () {
    updateChart(this.value, d3.select("#musicFilter").property("value"));
  });

  d3.select("#musicFilter").on("change", function () {
    updateChart(d3.select("#participantFilter").property("value"), this.value);
  });
});

// X Axis Label
svg.append("text")
  .attr("text-anchor", "middle")
  .attr("x", width / 2)
  .attr("y", height - 10)
  .attr("font-size", "14px")
  .text("Response Index (Trial Number)");

// Y Axis Label
svg.append("text")
  .attr("text-anchor", "middle")
  .attr("transform", `rotate(-90)`)
  .attr("x", -height / 2)
  .attr("y", 20)
  .attr("font-size", "14px")
  .text("Response Time (ms)");




// stuti chart edits 


