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

// document.addEventListener("DOMContentLoaded", () => {
//   const svg = d3.select("#eda-chart");
//   const width = +svg.attr("width");
//   const height = +svg.attr("height");
//   const margin = { top: 50, right: 100, bottom: 80, left: 60 };

//   const chartWidth = width - margin.left - margin.right;
//   const chartHeight = height - margin.top - margin.bottom;

//   const g = svg.append("g")
//     .attr("transform", `translate(${margin.left},${margin.top})`);

//   const x = d3.scaleBand().range([0, chartWidth]).padding(0.2);
//   const y = d3.scaleLinear().range([chartHeight, 0]);
//   const color = d3.scaleOrdinal(d3.schemeSet2);

//   const xAxisG = g.append("g")
//     .attr("class", "x-axis")
//     .attr("transform", `translate(0,${chartHeight})`);
//   const yAxisG = g.append("g")
//     .attr("class", "y-axis");

//   g.append("text")
//     .attr("class", "x-axis-title")
//     .attr("x", chartWidth / 2)
//     .attr("y", chartHeight + margin.bottom - 10)
//     .attr("text-anchor", "middle")
//     .style("font-size", "14px")
//     .text("Treatment and Test");

//   g.append("text")
//     .attr("class", "y-axis-title")
//     .attr("transform", "rotate(-90)")
//     .attr("x", -chartHeight / 2)
//     .attr("y", -margin.left + 15)
//     .attr("text-anchor", "middle")
//     .style("font-size", "14px")
//     .text("Mean Electrodermal Activity (microsiemens)");

//   function updateChart(participant) {
//     const subset = (participant === "All" || participant === null)
//       ? data
//       : data.filter(d => d.participant === participant);

//     const grouped = d3.groups(subset, d => d.condition)
//       .map(([condition, vals]) => ({
//         condition,
//         mean: d3.mean(vals, d => d.mean_eda),
//         sd: d3.deviation(vals, d => d.mean_eda)
//       }));

//     x.domain(grouped.map(d => d.condition));
//     y.domain([0, d3.max(grouped, d => d.mean + d.sd)]).nice();

//     xAxisG.call(d3.axisBottom(x))
//       .selectAll("text")
//       .attr("transform", "rotate(30)")
//       .style("text-anchor", "start");
//     yAxisG.call(d3.axisLeft(y));

//     const bars = g.selectAll(".bar")
//       .data(grouped, d => d.condition);

//     bars.exit().remove();

//     bars.enter().append("rect")
//         .attr("class", "bar")
//         .attr("x", d => x(d.condition))
//         .attr("width", x.bandwidth())
//         .attr("fill", d => color(d.condition))
//         .attr("y", d => y(d.mean))
//         .attr("height", d => chartHeight - y(d.mean))
//       .merge(bars)
//         .attr("x", d => x(d.condition))
//         .attr("width", x.bandwidth())
//         .attr("y", d => y(d.mean))
//         .attr("height", d => chartHeight - y(d.mean));

//     const capW = x.bandwidth() * 0.1;
//     const errors = g.selectAll(".error-group")
//       .data(grouped, d => d.condition);

//     errors.exit().remove();

//     const errorsEnter = errors.enter()
//       .append("g")
//       .attr("class", "error-group");

//     errorsEnter.append("line").attr("class", "error-line");
//     errorsEnter.append("line").attr("class", "cap-top");
//     errorsEnter.append("line").attr("class", "cap-bottom");

//     const allErrors = errorsEnter.merge(errors);

//     allErrors.select(".error-line")
//       .attr("x1", d => x(d.condition) + x.bandwidth() / 2)
//       .attr("x2", d => x(d.condition) + x.bandwidth() / 2)
//       .attr("y1", d => y(d.mean - d.sd))
//       .attr("y2", d => y(d.mean + d.sd))
//       .attr("stroke", "black")
//       .attr("stroke-width", 1.5);

//     allErrors.select(".cap-top")
//       .attr("x1", d => x(d.condition) + x.bandwidth() / 2 - capW / 2)
//       .attr("x2", d => x(d.condition) + x.bandwidth() / 2 + capW / 2)
//       .attr("y1", d => y(d.mean + d.sd))
//       .attr("y2", d => y(d.mean + d.sd))
//       .attr("stroke", "black")
//       .attr("stroke-width", 1.5);

//     allErrors.select(".cap-bottom")
//       .attr("x1", d => x(d.condition) + x.bandwidth() / 2 - capW / 2)
//       .attr("x2", d => x(d.condition) + x.bandwidth() / 2 + capW / 2)
//       .attr("y1", d => y(d.mean - d.sd))
//       .attr("y2", d => y(d.mean - d.sd))
//       .attr("stroke", "black")
//       .attr("stroke-width", 1.5);
//   }

//   let data;
//   d3.csv("data/df.csv", d3.autoType).then(raw => {
//     data = raw;

//     const parts = ["All", ...new Set(data.map(d => d.participant))];

//     const select = document.getElementById("participant-select");
//     select.innerHTML = "";

//     parts.forEach(p => {
//       const option = document.createElement("option");
//       option.value = p;
//       option.textContent = p;
//       select.appendChild(option);
//     });

//     select.addEventListener("change", function () {
//       updateChart(this.value);
//     });

//     updateChart("All");
//   });
// });

// // stuti chart edits 
// const svg = d3.select("#lineChart"),
//       width = +svg.attr("width"),
//       height = +svg.attr("height"),
//       margin = { top: 40, right: 80, bottom: 50, left: 80 },
//       innerWidth = width - margin.left - margin.right,
//       innerHeight = height - margin.top - margin.bottom;

// const chartGroup = svg.append("g")
//   .attr("transform", `translate(${margin.left}, ${margin.top})`);

// const subjects = ["3", "4", "6", "8", "11"];
// const filePaths = subjects.flatMap(id => [
//   { path: `data/behavioral_data/CalmingSubject${id}.csv`, music: "Calming", participant: id },
//   { path: `data/behavioral_data/VexingSubject${id}.csv`, music: "Vexing", participant: id }
// ]);

// Promise.all(filePaths.map(f =>
//   d3.csv(f.path, d3.autoType).then(data =>
//     data
//       .filter(d => d.Response_Time != null && !isNaN(d.Response_Time))
//       .map((d, i) => ({
//         Response_Time: d.Response_Time,
//         Trial: i + 1,
//         Music: f.music,
//         Participant: f.participant
//       }))
//   )
// )).then(datasets => {
//   let combinedData = datasets.flat();

//   const xScale = d3.scaleLinear()
//     .domain([1, d3.max(combinedData, d => d.Trial)])
//     .range([0, innerWidth]);

//   const yScale = d3.scaleLinear()
//     .domain([d3.min(combinedData, d => d.Response_Time) - 50,
//              d3.max(combinedData, d => d.Response_Time) + 50])
//     .range([innerHeight, 0]);

//   const colorScale = d3.scaleOrdinal()
//     .domain(["Calming", "Vexing"])
//     .range(["#99ccff", "#ff9999"]);
//     // .range(["#1f77b4", "#d62728"]); // Blue and Red

//   const line = d3.line()
//     .x(d => xScale(d.Trial))
//     .y(d => yScale(d.Response_Time));

//   const tooltip = d3.select("body").append("div").attr("class", "tooltip");

//   function updateChart(selectedParticipant, selectedMusic) {
//     chartGroup.selectAll("*").remove();

//     let filteredData = combinedData;

//     if (selectedParticipant !== "All") {
//       filteredData = filteredData.filter(d => d.Participant === selectedParticipant);
//     }

//     if (selectedMusic !== "Both") {
//       filteredData = filteredData.filter(d => d.Music === selectedMusic);
//     }

//     const grouped = d3.groups(filteredData, d => `${d.Participant}-${d.Music}`);

//     // Axes
//     chartGroup.append("g")
//       .attr("transform", `translate(0, ${innerHeight})`)
//       .call(d3.axisBottom(xScale));

//     chartGroup.append("g")
//       .call(d3.axisLeft(yScale).ticks(6));

//     // Lines
//     chartGroup.selectAll(".line")
//       .data(grouped)
//       .enter()
//       .append("path")
//       .attr("fill", "none")
//       .attr("stroke", ([, values]) => colorScale(values[0].Music))
//       .attr("stroke-width", 2)
//       .attr("d", ([, values]) => line(values));

//     // Dots
//     chartGroup.selectAll(".dot")
//       .data(filteredData)
//       .enter()
//       .append("circle")
//       .attr("cx", d => xScale(d.Trial))
//       .attr("cy", d => yScale(d.Response_Time))
//       .attr("r", 4)
//       .attr("fill", d => colorScale(d.Music))
//       .on("mouseover", (event, d) => {
//         tooltip.transition().style("opacity", 1);
//         tooltip.html(
//           `<strong>Subject ${d.Participant}</strong><br>
//            Trial: ${d.Trial}<br>
//            Music: ${d.Music}<br>
//            Response: ${d.Response_Time.toFixed(1)}ms`
//         )
//         .style("left", (event.pageX + 10) + "px")
//         .style("top", (event.pageY - 28) + "px");
//       })
//       .on("mouseout", () => tooltip.transition().style("opacity", 0));
//   }

//   // Initial render
//   updateChart("All", "Both");

//   // Hook up dropdowns
//   d3.select("#participantFilter").on("change", function () {
//     updateChart(this.value, d3.select("#musicFilter").property("value"));
//   });

//   d3.select("#musicFilter").on("change", function () {
//     updateChart(d3.select("#participantFilter").property("value"), this.value);
//   });
// });

// // X Axis Label
// svg.append("text")
//   .attr("text-anchor", "middle")
//   .attr("x", width / 2)
//   .attr("y", height - 10)
//   .attr("font-size", "14px")
//   .text("Response Index (Trial Number)");

// // Y Axis Label
// svg.append("text")
//   .attr("text-anchor", "middle")
//   .attr("transform", `rotate(-90)`)
//   .attr("x", -height / 2)
//   .attr("y", 20)
//   .attr("font-size", "14px")
//   .text("Response Time (ms)");




// // stuti chart edits 

// const margin = { top: 60, right: 100, bottom: 50, left: 70 },
//       width = 800 - margin.left - margin.right,
//       height = 400 - margin.top - margin.bottom;

// const colorMap = {
//   "Calming": "#2196f3",
//   "Vexing": "#f44336"
// };

// function createLineChart(csvFile, metric, yLabel, containerId) {
//   d3.csv(csvFile).then(data => {
//     data.forEach(d => {
//       d.trial = +d.trial;
//       d[metric] = +d[metric];
//     });

//     const svg = d3.select(containerId)
//       .append("svg")
//       .attr("width", width + margin.left + margin.right)
//       .attr("height", height + margin.top + margin.bottom)
//       .append("g")
//       .attr("transform", `translate(${margin.left},${margin.top})`);

//     const x = d3.scaleLinear()
//       .domain([1, 16])
//       .range([0, width]);

//     const y = d3.scaleLinear()
//       .domain([0, d3.max(data, d => d[metric]) * 1.1])
//       .range([height, 0]);

//     const xAxis = d3.axisBottom(x).ticks(16).tickFormat(d3.format("d"));
//     const yAxis = d3.axisLeft(y);

//     // Horizontal gridlines
//     svg.append("g")
//       .attr("class", "grid")
//       .call(
//         d3.axisLeft(y)
//           .tickSize(-width)
//           .tickFormat("")
//       )
//       .attr("stroke-opacity", 0.1);

//     // Vertical gridlines
//     svg.append("g")
//       .attr("class", "grid")
//       .attr("transform", `translate(0,${height})`)
//       .call(
//         d3.axisBottom(x)
//           .tickSize(-height)
//           .tickFormat("")
//       )
//       .attr("stroke-opacity", 0.1);

//     svg.append("g")
//       .attr("transform", `translate(0,${height})`)
//       .call(xAxis);

//     svg.append("g")
//       .call(yAxis);

//     const line = d3.line()
//       .x(d => x(d.trial))
//       .y(d => y(d[metric]));

//     const grouped = d3.group(data, d => d.session_type);

//     for (const [key, values] of grouped.entries()) {
//       svg.append("path")
//         .datum(values)
//         .attr("fill", "none")
//         .attr("stroke", colorMap[key])
//         .attr("stroke-width", 2)
//         .attr("d", line);

//       // Add points
//       svg.selectAll(`.dot-${key}`)
//         .data(values)
//         .enter()
//         .append("circle")
//         .attr("cx", d => x(d.trial))
//         .attr("cy", d => y(d[metric]))
//         .attr("r", 4)
//         .attr("fill", colorMap[key]);
//     }

//     // Title and labels
//     svg.append("text")
//       .attr("x", width / 2)
//       .attr("y", -20)
//       .style("text-anchor", "middle")
//       .style("font-size", "18px")
//       .style("font-weight", "bold")
//       .text(`${yLabel} vs. Trial Number`);

//     svg.append("text")
//       .attr("x", width / 2)
//       .attr("y", height + 40)
//       .style("text-anchor", "middle")
//       .style("font-size", "14px")
//       .text("Trial Number");

//     svg.append("text")
//       .attr("transform", "rotate(-90)")
//       .attr("x", -height / 2)
//       .attr("y", -50)
//       .style("text-anchor", "middle")
//       .style("font-size", "14px")
//       .text(yLabel);

//     // Legend
//     const sessionTypes = ["Calming", "Vexing"];
//     const legend = svg.append("g")
//       .attr("transform", `translate(${width + 20}, 10)`);

//     sessionTypes.forEach((type, i) => {
//       const legendRow = legend.append("g")
//         .attr("transform", `translate(0, ${i * 25})`);

//       legendRow.append("rect")
//         .attr("width", 15)
//         .attr("height", 15)
//         .attr("fill", colorMap[type]);

//       legendRow.append("text")
//         .attr("x", 20)
//         .attr("y", 12)
//         .attr("text-anchor", "start")
//         .style("text-transform", "capitalize")
//         .text(type);
//     });
//   });
// }

// document.addEventListener("DOMContentLoaded", () => {
//   createLineChart("data/Behavioral_data/fixed_cleaned_accuracy.csv", "mean_accuracy", "Accuracy", "#accuracy-chart-container");
//   createLineChart("data/Behavioral_data/fixed_cleaned_response.csv", "mean_rt", "Response Time (ms)", "#response-chart-container");
// });

// WORKING CODE


// const margin = { top: 60, right: 160, bottom: 50, left: 70 },
//       width = 800 - margin.left - margin.right,
//       height = 400 - margin.top - margin.bottom;

// const colorMap = {
//   "Calming": "#2196f3",
//   "Vexing": "#f44336"
// };

// function createLineChart(csvFile, metric, yLabel, containerId) {
//   d3.csv(csvFile).then(data => {
//     data.forEach(d => {
//       d.trial = +d.trial;
//       d[metric] = +d[metric];
//     });

//     const svg = d3.select(containerId)
//       .append("svg")
//       .attr("width", width + margin.left + margin.right)
//       .attr("height", height + margin.top + margin.bottom)
//       .append("g")
//       .attr("transform", `translate(${margin.left},${margin.top})`);

//     const x = d3.scaleLinear().domain([1, 16]).range([0, width]);
//     const y = d3.scaleLinear()
//       .domain([0, d3.max(data, d => d[metric]) * 1.1])
//       .range([height, 0]);

//     const xAxis = d3.axisBottom(x).ticks(16).tickFormat(d3.format("d"));
//     const yAxis = d3.axisLeft(y);

//     // Horizontal & Vertical Gridlines
//     svg.append("g")
//       .attr("class", "grid")
//       .call(d3.axisLeft(y).tickSize(-width).tickFormat(""))
//       .attr("stroke-opacity", 0.1);

//     svg.append("g")
//       .attr("class", "grid")
//       .attr("transform", `translate(0,${height})`)
//       .call(d3.axisBottom(x).tickSize(-height).tickFormat(""))
//       .attr("stroke-opacity", 0.1);

//     svg.append("g").attr("transform", `translate(0,${height})`).call(xAxis);
//     svg.append("g").call(yAxis);

//     const line = d3.line().x(d => x(d.trial)).y(d => y(d[metric]));
//     const grouped = d3.group(data, d => d.session_type);

//     const tooltip = d3.select("body").append("div")
//       .attr("class", "tooltip")
//       .style("opacity", 0)
//       .style("position", "absolute")
//       .style("padding", "8px")
//       .style("background", "white")
//       .style("border", "1px solid #ccc")
//       .style("border-radius", "4px")
//       .style("font-size", "12px");

//     const sessionVisibility = { "Calming": true, "Vexing": true };

//     function updateChart() {
//       svg.selectAll(".line, .dot, .legendRow").remove();

//       for (const [key, values] of grouped.entries()) {
//         if (!sessionVisibility[key]) continue;

//         svg.append("path")
//           .datum(values)
//           .attr("class", "line")
//           .attr("fill", "none")
//           .attr("stroke", colorMap[key])
//           .attr("stroke-width", 2)
//           .attr("d", line);

//         svg.selectAll(`.dot-${key}`)
//           .data(values)
//           .enter()
//           .append("circle")
//           .attr("class", `dot dot-${key}`)
//           .attr("cx", d => x(d.trial))
//           .attr("cy", d => y(d[metric]))
//           .attr("r", 5)
//           .attr("fill", colorMap[key])
//           .attr("stroke", d => d.task_type === "1-back" ? "gray" : "black")
//           .attr("stroke-width", 1.5)
//           .on("mouseover", (event, d) => {
//             tooltip.transition().duration(200).style("opacity", .95);
//             tooltip.html(
//               `Trial: ${d.trial}<br>Type: ${d.session_type}<br>${yLabel}: ${d3.format(".2f")(d[metric])}<br>Task: ${d.task_type}`
//             ).style("left", (event.pageX + 10) + "px")
//              .style("top", (event.pageY - 30) + "px");

//             d3.selectAll(".line").style("opacity", 0.2);
//             d3.selectAll(`.dot`).style("opacity", 0.2);
//             d3.selectAll(`.dot-${d.session_type}`).style("opacity", 1);
//             d3.select(`.line-${d.session_type}`).style("opacity", 1);
//           })
//           .on("mouseout", () => {
//             tooltip.transition().duration(300).style("opacity", 0);
//             d3.selectAll(".line, .dot").style("opacity", 1);
//           });
//       }
//     }

//     // Initial chart render
//     updateChart();

//     // Title and Labels
//     svg.append("text")
//       .attr("x", width / 2)
//       .attr("y", -20)
//       .style("text-anchor", "middle")
//       .style("font-size", "18px")
//       .style("font-weight", "bold")
//       .text(`${yLabel} vs. Trial Number`);

//     svg.append("text")
//       .attr("x", width / 2)
//       .attr("y", height + 40)
//       .style("text-anchor", "middle")
//       .style("font-size", "14px")
//       .text("Trial Number");

//     svg.append("text")
//       .attr("transform", "rotate(-90)")
//       .attr("x", -height / 2)
//       .attr("y", -50)
//       .style("text-anchor", "middle")
//       .style("font-size", "14px")
//       .text(yLabel);

//     // Checkbox filters
//     const checkboxContainer = d3.select(containerId)
//       .append("div")
//       .style("margin-top", "10px");

//     ["Calming", "Vexing"].forEach(type => {
//       const label = checkboxContainer.append("label")
//         .style("margin-right", "20px");

//       label.append("input")
//         .attr("type", "checkbox")
//         .property("checked", true)
//         .on("change", function () {
//           sessionVisibility[type] = this.checked;
//           updateChart();
//         });

//       label.append("span").text(` ${type}`);
//     });

//     // Add Task Type Legend
//     const legend = svg.append("g").attr("transform", `translate(${width + 20}, 10)`);

//     const sessionTypes = ["Calming", "Vexing"];
//     sessionTypes.forEach((type, i) => {
//       const row = legend.append("g")
//         .attr("class", "legendRow")
//         .attr("transform", `translate(0, ${i * 25})`);
//       row.append("rect").attr("width", 15).attr("height", 15).attr("fill", colorMap[type]);
//       row.append("text").attr("x", 20).attr("y", 12).text(type);
//     });

//     const taskLegend = svg.append("g").attr("transform", `translate(${width + 20}, 70)`);
//     [["1-back", "gray"], ["3-back", "black"]].forEach(([label, color], i) => {
//       const row = taskLegend.append("g")
//         .attr("class", "legendRow")
//         .attr("transform", `translate(0, ${i * 20})`);
//       row.append("circle").attr("r", 6).attr("cx", 7).attr("cy", 7)
//         .attr("fill", "white").attr("stroke", color).attr("stroke-width", 2);
//       row.append("text").attr("x", 20).attr("y", 11).text(label);
//     });
//   });
// }

// document.addEventListener("DOMContentLoaded", () => {
//   createLineChart("data/Behavioral_data/final_accuracy_with_task.csv", "mean_accuracy", "Accuracy", "#accuracy-chart-container");
//   createLineChart("data/Behavioral_data/final_response_with_task.csv", "mean_rt", "Response Time (ms)", "#response-chart-container");
// });

// main.js

// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// const margin = { top: 60, right: 160, bottom: 50, left: 70 },
//       width = 800 - margin.left - margin.right,
//       height = 400 - margin.top - margin.bottom;

// const colorMap = {
//   "Calming": "#2196f3",
//   "Vexing": "#f44336"
// };

// let fullData = [];

// Promise.all([
//   d3.csv("data/Behavioral_data/cleaned_df.csv", d3.autoType)
// ]).then(([rawData]) => {
//   fullData = rawData;

//   // Populate participant dropdown
//   const participants = [...new Set(fullData.map(d => d.participant_id))].sort();
//   const participantSelect = d3.select("#participant");
//   participants.forEach(p => {
//     participantSelect.append("option").attr("value", p).text(p);
//   });

//   // Initial draw
//   updateCharts();

//   // Add event listeners
//   d3.selectAll("#plot-target, #task-type, #x-axis, #participant").on("change", updateCharts);
//   d3.selectAll(".session-type").on("change", updateCharts);
//   d3.select("#trial-range").on("input", function() {
//     const val = +this.value;
//     d3.select("#trial-range-value").text(`1–${val}`);
//     updateCharts();
//   });
// });

// function updateCharts() {
//   const plotTarget = d3.select("#plot-target").node().value;
//   const taskFilter = d3.select("#task-type").node().value;
//   const participant = d3.select("#participant").node().value;
//   const xAxisChoice = d3.select("#x-axis").node().value;
//   const trialMax = +d3.select("#trial-range").node().value;
//   const sessionFilters = [];
//   d3.selectAll(".session-type").each(function() {
//     if (d3.select(this).property("checked")) {
//       sessionFilters.push(this.value);
//     }
//   });

//   const filtered = fullData.filter(d =>
//     (taskFilter === "both" || d.n_back.toLowerCase() === taskFilter) &&
//     (participant === "all" || d.participant_id === participant) &&
//     sessionFilters.includes(d.session_type) &&
//     (d.TrialNumber <= trialMax)
//   );

//   const accuracyData = aggregateData(filtered, xAxisChoice, "correct");
//   const responseData = aggregateData(filtered, xAxisChoice, "Response_Time");

//   if (plotTarget === "both" || plotTarget === "accuracy") {
//     drawChart("#accuracy-chart-container", accuracyData, xAxisChoice, "Accuracy", d => d.mean);
//   }
//   if (plotTarget === "both" || plotTarget === "response") {
//     drawChart("#response-chart-container", responseData, xAxisChoice, "Response Time (ms)", d => d.mean);
//   }
// }

// function aggregateData(data, xKey, metric) {
//   const nested = d3.rollups(
//     data,
//     v => {
//       const vals = v.map(d => +d[metric]);
//       return {
//         mean: d3.mean(vals),
//         std: d3.deviation(vals),
//         session: v[0].session_type
//       };
//     },
//     d => d[xKey],
//     d => d.session_type
//   );

//   return nested.flatMap(([xVal, sessions]) =>
//     sessions.map(([session, stats]) => ({
//       [xKey]: xVal,
//       session_type: session,
//       mean: stats.mean,
//       std: stats.std
//     }))
//   );
// }

// function drawChart(containerId, data, xKey, yLabel, yAccessor) {
//   d3.select(containerId).selectAll("svg").remove();

//   const svg = d3.select(containerId)
//     .append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", `translate(${margin.left},${margin.top})`);

//   const xValues = [...new Set(data.map(d => d[xKey]))].sort();
//   const x = d3.scalePoint().domain(xValues).range([0, width]);
//   const y = d3.scaleLinear()
//     .domain([0, d3.max(data, yAccessor) * 1.1])
//     .range([height, 0]);

//   svg.append("g")
//     .attr("transform", `translate(0,${height})`)
//     .call(d3.axisBottom(x));

//   svg.append("g").call(d3.axisLeft(y));

//   const line = d3.line()
//     .x(d => x(d[xKey]))
//     .y(d => y(yAccessor(d)));

//   const grouped = d3.group(data, d => d.session_type);

//   for (const [key, values] of grouped.entries()) {
//     svg.append("path")
//       .datum(values)
//       .attr("fill", "none")
//       .attr("stroke", colorMap[key])
//       .attr("stroke-width", 2)
//       .attr("d", line);

//     svg.selectAll(`.dot-${key}`)
//       .data(values)
//       .enter()
//       .append("circle")
//       .attr("cx", d => x(d[xKey]))
//       .attr("cy", d => y(yAccessor(d)))
//       .attr("r", 4)
//       .attr("fill", colorMap[key])
//       .append("title")
//       .text(d => `${xKey}: ${d[xKey]}\n${yLabel}: ${d3.format(".2f")(yAccessor(d))}\nType: ${d.session_type}`);
//   }

//   svg.append("text")
//     .attr("x", width / 2)
//     .attr("y", -20)
//     .style("text-anchor", "middle")
//     .style("font-size", "16px")
//     .style("font-weight", "bold")
//     .text(`${yLabel} by ${xKey}`);

//   svg.append("text")
//     .attr("x", width / 2)
//     .attr("y", height + 40)
//     .style("text-anchor", "middle")
//     .text(xKey);

//   svg.append("text")
//     .attr("transform", "rotate(-90)")
//     .attr("x", -height / 2)
//     .attr("y", -50)
//     .style("text-anchor", "middle")
//     .text(yLabel);
// }

// import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

// const margin = { top: 60, right: 160, bottom: 50, left: 70 },
//       width = 800 - margin.left - margin.right,
//       height = 400 - margin.top - margin.bottom;

// const colorMap = {
//   "Calming": "#2196f3",
//   "Vexing": "#f44336"
// };

// let fullData = [];

// // We’ll keep two “last-used” filter objects—one for Accuracy, one for Response.
// let accuracyFilters = {};
// let responseFilters = [];

// Promise.all([
//   d3.csv("data/Behavioral_data/cleaned_df.csv", d3.autoType)
// ]).then(([rawData]) => {
//   fullData = rawData;

//   // Populate the participant dropdown
//   const participants = [...new Set(fullData.map(d => d.participant_id))].sort();
//   const participantSelect = d3.select("#participant");
//   participants.forEach(pid => {
//     participantSelect
//       .append("option")
//       .attr("value", pid)
//       .text(pid);
//   });

//   // Initialize both filter objects from whatever the HTML inputs currently show
//   accuracyFilters = getCurrentFilters();
//   responseFilters = getCurrentFilters();

//   // Initial render
//   updateCharts();

//   // Event listeners on every input
//   d3.selectAll("#plot-target, #task-type, #x-axis, #participant").on("change", updateCharts);
//   d3.selectAll(".session-type").on("change", updateCharts);
//   d3.select("#trial-range").on("input", function () {
//     const val = +this.value;
//     d3.select("#trial-range-value").text(`1–${val}`);
//     updateCharts();
//   });
// });


// // Map whatever the dropdown says into the actual CSV key.
// // If the dropdown label/value contains “trial” (case‐insensitive), use "TrialNumber".
// // Otherwise assume "Stimulus_Letter".
// function mapXAxisChoice(rawValue) {
//   rawValue = rawValue.toLowerCase();
//   if (rawValue.includes("trial")) {
//     return "TrialNumber";
//   } else {
//     return "Stimulus_Letter";
//   }
// }


// // Read all HTML inputs into a JS object
// function getCurrentFilters() {
//   const taskFilterRaw  = d3.select("#task-type").node().value;     // "Both", "1-back", "3-back"
//   const participant    = d3.select("#participant").node().value;    // "All" or a specific subject
//   const xAxisRaw       = d3.select("#x-axis").node().value;         // e.g. "Trial Number" or "Stimulus Letter"
//   const xAxisChoice    = mapXAxisChoice(xAxisRaw);
//   const trialMax       = +d3.select("#trial-range").node().value;   // numeric up to 16
//   const sessionTypes   = [];
//   d3.selectAll(".session-type").each(function () {
//     if (d3.select(this).property("checked")) {
//       sessionTypes.push(this.value);  // “Calming” or “Vexing”
//     }
//   });

//   // Normalize n_back to lowercase so filters match
//   const taskFilter = taskFilterRaw.toLowerCase();

//   return {
//     taskFilter,      // "both", "1-back", or "3-back"
//     participant,     // "all" or specific ID
//     xAxisChoice,     // either "TrialNumber" or "Stimulus_Letter"
//     trialMax,        // number ≤ 16
//     sessionTypes     // array like ["Calming","Vexing"]
//   };
// }


// // Called whenever any input changes
// function updateCharts() {
//   const plotTarget    = d3.select("#plot-target").node().value; // "accuracy", "response", or "both"
//   const currentFilter = getCurrentFilters();

//   if (plotTarget === "accuracy") {
//     accuracyFilters = currentFilter;
//   } else if (plotTarget === "response") {
//     responseFilters = currentFilter;
//   } else {
//     // “both”
//     accuracyFilters = currentFilter;
//     responseFilters = currentFilter;
//   }

//   drawBothCharts();
// }


// // Remove and redraw both charts, each with its own filters
// function drawBothCharts() {
//   d3.select("#accuracy-chart-container").selectAll("*").remove();
//   d3.select("#response-chart-container").selectAll("*").remove();

//   const accFiltered = filterData(accuracyFilters);
//   const resFiltered = filterData(responseFilters);

//   const accAgg = aggregateData(accFiltered, accuracyFilters.xAxisChoice, "correct");
//   const resAgg = aggregateData(resFiltered, responseFilters.xAxisChoice, "Response_Time");

//   drawChart(
//     "#accuracy-chart-container",
//     accAgg,
//     accuracyFilters.xAxisChoice,
//     "Accuracy",
//     d => d.mean
//   );
//   drawChart(
//     "#response-chart-container",
//     resAgg,
//     responseFilters.xAxisChoice,
//     "Response Time (ms)",
//     d => d.mean
//   );
// }


// // Apply one filter‐set to fullData and return the subset
// function filterData(filters) {
//   return fullData.filter(d =>
//     // Task filter: either "both", or match the lowercase n_back
//     (filters.taskFilter === "both" || d.n_back.toLowerCase() === filters.taskFilter) &&
//     // Participant filter: "all" or exact match
//     (filters.participant === "all" || d.participant_id === filters.participant) &&
//     // Session type filter: array must include the row’s session_type
//     filters.sessionTypes.includes(d.session_type) &&
//     // TrialNumber filter: numeric ≤ trialMax AND exclude “rest” trial (9)
//     +d.TrialNumber <= filters.trialMax &&
//     +d.TrialNumber !== 9
//   );
// }


// // Group by xKey (number or letter) and session_type, compute mean & std
// function aggregateData(data, xKey, metric) {
//   // If xKey is "TrialNumber", coerce to Number; otherwise treat as string
//   const keyFn = xKey === "TrialNumber"
//     ? d => +d[xKey]
//     : d => d[xKey];

//   const nested = d3.rollups(
//     data,
//     v => {
//       const vals = v.map(d => +d[metric]);
//       return {
//         mean: d3.mean(vals),
//         std:  d3.deviation(vals)
//       };
//     },
//     keyFn,
//     d => d.session_type
//   );

//   return nested.flatMap(([xVal, sessions]) =>
//     sessions.map(([session, stats]) => ({
//       [xKey]: xVal,
//       session_type: session,
//       mean: stats.mean,
//       std: stats.std
//     }))
//   );
// }


// // Draw one chart into containerId using aggregated data
// function drawChart(containerId, data, xKey, yLabel, yAccessor) {
//   const svg = d3.select(containerId)
//     .append("svg")
//     .attr("width", width + margin.left + margin.right)
//     .attr("height", height + margin.top + margin.bottom)
//     .append("g")
//     .attr("transform", `translate(${margin.left},${margin.top})`);

//   // 1) Build x‐scale 🡲 two cases: numeric for TrialNumber, categorical for Stimulus_Letter
//   let x;
//   if (xKey === "TrialNumber") {
//     // Coerce to numbers, compute extent
//     const numericX = data.map(d => +d[xKey]);
//     const xExtent  = d3.extent(numericX); // [minTrial, maxTrial]
//     x = d3.scaleLinear()
//           .domain(xExtent)
//           .nice()
//           .range([0, width]);
//   } else {
//     // Categorical Stimulus_Letter → sort alphabetically
//     const letters = [...new Set(data.map(d => d[xKey]))].sort((a, b) => d3.ascending(a, b));
//     x = d3.scalePoint()
//           .domain(letters)
//           .range([0, width]);
//   }

//   // 2) Build y‐scale (always numeric)
//   const y = d3.scaleLinear()
//     .domain([0, d3.max(data, yAccessor) * 1.1])
//     .nice()
//     .range([height, 0]);

//   // 3) Draw axes
//   const xAxisGen = xKey === "TrialNumber"
//     ? d3.axisBottom(x).ticks(Math.min(16, data.length))
//     : d3.axisBottom(x);

//   svg.append("g")
//     .attr("transform", `translate(0,${height})`)
//     .call(xAxisGen);

//   svg.append("g")
//     .call(d3.axisLeft(y));

//   // 4) Build the line generator
//   const line = d3.line()
//     .defined(d => {
//       if (xKey === "TrialNumber") {
//         return !isNaN(+d[xKey]) && !isNaN(yAccessor(d));
//       } else {
//         return !isNaN(yAccessor(d));
//       }
//     })
//     .x(d => {
//       return xKey === "TrialNumber"
//         ? x(+d[xKey])
//         : x(d[xKey]);
//     })
//     .y(d => y(yAccessor(d)));

//   // 5) Group by session_type and sort appropriately
//   const grouped = d3.group(data, d => d.session_type);
//   for (const [session, values] of grouped.entries()) {
//     if (xKey === "TrialNumber") {
//       // Numeric sort by trial number
//       values.sort((a, b) => d3.ascending(+a[xKey], +b[xKey]));
//     } else {
//       // Lexicographic sort by letter
//       values.sort((a, b) => d3.ascending(a[xKey], b[xKey]));
//     }

//     // 5a) Draw the line for this session
//     svg.append("path")
//       .datum(values)
//       .attr("fill", "none")
//       .attr("stroke", colorMap[session])
//       .attr("stroke-width", 2)
//       .attr("d", line);

//     // 5b) Draw circles at each point
//     svg.selectAll(null)
//       .data(values)
//       .enter()
//       .append("circle")
//       .attr("cx", d => {
//         return xKey === "TrialNumber"
//           ? x(+d[xKey])
//           : x(d[xKey]);
//       })
//       .attr("cy", d => y(yAccessor(d)))
//       .attr("r", 4)
//       .attr("fill", colorMap[session])
//       .append("title")
//       .text(d =>
//         `${xKey}: ${xKey === "TrialNumber" ? +d[xKey] : d[xKey]}\n` +
//         `${yLabel}: ${d3.format(".2f")(yAccessor(d))}\n` +
//         `Session: ${d.session_type}`
//       );
//   }

//   // 6) Titles & Labels
//   svg.append("text")
//     .attr("x", width / 2)
//     .attr("y", -20)
//     .style("text-anchor", "middle")
//     .style("font-size", "16px")
//     .style("font-weight", "bold")
//     .text(`${yLabel} by ${xKey}`);

//   svg.append("text")
//     .attr("x", width / 2)
//     .attr("y", height + 40)
//     .style("text-anchor", "middle")
//     .text(xKey);

//   svg.append("text")
//     .attr("transform", "rotate(-90)")
//     .attr("x", -height / 2)
//     .attr("y", -50)
//     .style("text-anchor", "middle")
//     .text(yLabel);

//   // 7) Legend
//   const legend = svg.selectAll(".legend")
//     .data(Array.from(grouped.keys()))
//     .enter().append("g")
//     .attr("transform", (d, i) => `translate(${width + 20},${i * 25})`);

//   legend.append("rect")
//     .attr("x", 0)
//     .attr("width", 15)
//     .attr("height", 15)
//     .style("fill", d => colorMap[d]);

//   legend.append("text")
//     .attr("x", 20)
//     .attr("y", 12)
//     .text(d => d);
// }

import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

const margin = { top: 60, right: 160, bottom: 50, left: 70 },
      width  = 800 - margin.left - margin.right,
      height = 400 - margin.top - margin.bottom;

// Color mapping for session types
const colorMap = {
  "Calming": "#2196f3",
  "Vexing": "#f44336"
};

let fullData = [];

// Two separate “last-used” filter objects:
let accuracyFilters = {};
let responseFilters = {};

// Track which chart was active last (for “Both Charts” fallback)
let lastPlotTarget = "both";

Promise.all([
  d3.csv("data/Behavioral_data/cleaned_df.csv", d3.autoType)
]).then(([rawData]) => {
  fullData = rawData;

  // 1) Populate the Participant dropdown
  const participants = [...new Set(fullData.map(d => d.participant_id))].sort();
  const participantSelect = d3.select("#participant");
  participants.forEach(pid => {
    participantSelect
      .append("option")
      .attr("value", pid)
      .text(pid);
  });

  // 2) Initialize both filter objects from whatever the UI currently shows
  accuracyFilters = getCurrentFilters();
  responseFilters = getCurrentFilters();

  // 3) Draw both charts once on page load
  drawBothCharts();

  // 4) Listen for changes on the “Apply filters to” dropdown
  d3.select("#plot-target").on("change", onPlotTargetChange);

  // 5) Listen for changes on each filter input (task, session checkboxes, participant, X-Axis, trial‐range)
  d3.selectAll("#task-type, #x-axis, #participant").on("change", onAnyFilterChange);
  d3.selectAll(".session-type").on("change", onAnyFilterChange);
  d3.select("#trial-range").on("input", function() {
    const val = +this.value;
    d3.select("#trial-range-value").text(`1–${val}`);
    onAnyFilterChange();
  });
});


// ─────────────────────────────────────────────────────────────
// Map the raw X-Axis dropdown text into the CSV key.
// If the raw dropdown text “includes” the word “trial” (case-insensitive),
// return "TrialNumber". Otherwise return "Stimulus_Letter".
// ─────────────────────────────────────────────────────────────
function mapXAxisChoice(rawValue) {
  rawValue = rawValue.toLowerCase();
  if (rawValue.includes("trial")) {
    return "TrialNumber";
  } else {
    return "Stimulus_Letter";
  }
}


// ─────────────────────────────────────────────────────────────
// Read ALL UI inputs into a single JavaScript object:
//
//  • taskFilter:   “both” or “1-back” / “3-back”
//  • participant:  “all” or a specific subject ID
//  • rawXAxis:     whatever the X-Axis dropdown currently displays
//  • xAxisChoice:  the actual CSV column hidden behind that raw value
//  • trialMax:     the numeric slider value (≤ 16)
//  • sessionTypes: array of [“Calming”, “Vexing”] depending on which checkboxes are checked
//
// By storing **rawXAxis** alongside **xAxisChoice**, we can later
// restore exactly the same text in the dropdown (“Trial Number” vs “Stimulus Letter”).
// ─────────────────────────────────────────────────────────────
function getCurrentFilters() {
  const taskFilterRaw = d3.select("#task-type").node().value;     // e.g. “Both”, “1-back”, “3-back”
  const participant   = d3.select("#participant").node().value;    // e.g. “All” or “Subject11”
  const rawXAxis      = d3.select("#x-axis").node().value;         // e.g. “Trial Number” or “Stimulus Letter”
  const xAxisChoice   = mapXAxisChoice(rawXAxis);                  // → “TrialNumber” or “Stimulus_Letter”
  const trialMax      = +d3.select("#trial-range").node().value;   // numeric up to 16

  // Collect whichever session checkboxes are checked
  const sessionTypes = [];
  d3.selectAll(".session-type").each(function() {
    if (d3.select(this).property("checked")) {
      sessionTypes.push(this.value); // “Calming” or “Vexing”
    }
  });

  return {
    taskFilter:     taskFilterRaw.toLowerCase(), // “both”, “1-back”, or “3-back”
    participant,                                // “all” or actual ID
    rawXAxis,                                   // exactly what the dropdown currently shows
    xAxisChoice,                                // “TrialNumber” or “Stimulus_Letter”
    trialMax,                                   // number ≤ 16
    sessionTypes                                // [“Calming”, “Vexing”] or subset
  };
}


// ─────────────────────────────────────────────────────────────
// Restore UI inputs **exactly** from a given filter-object.
// In particular, set the X-Axis dropdown’s value to filters.rawXAxis
// so that it never “mystery-changes” under us.
// ─────────────────────────────────────────────────────────────
function restoreInputsFrom(filters) {
  // 1) Task Type dropdown
  d3.select("#task-type").property("value", filters.taskFilter);

  // 2) Participant dropdown
  d3.select("#participant").property("value", filters.participant);

  // 3) X-Axis dropdown: directly set its value to filters.rawXAxis (no guessing)
  d3.select("#x-axis").property("value", filters.rawXAxis);

  // 4) Trial-Range slider + label
  d3.select("#trial-range").property("value", filters.trialMax);
  d3.select("#trial-range-value").text(`1–${filters.trialMax}`);

  // 5) Session-Type checkboxes (two of them)
  d3.selectAll(".session-type").each(function() {
    const cb = d3.select(this);
    const val = cb.property("value"); // “Calming” or “Vexing”
    cb.property("checked", filters.sessionTypes.includes(val));
  });
}


// ─────────────────────────────────────────────────────────────
// Whenever **any** filter input changes (task, sessions, participant, X-Axis, trial range):
//  1) Read the UI into a “currentFilter” object
//  2) Depending on which chart is currently selected, stash that object into
//     either accuracyFilters or responseFilters (or both if “both charts”).
//  3) Update lastPlotTarget if we are NOT in “both charts” mode.
//  4) Redraw both charts with their respective filter sets.
// ─────────────────────────────────────────────────────────────
function onAnyFilterChange() {
  const plotTarget    = d3.select("#plot-target").node().value; // “Accuracy Only”, “Response Time Only”, or “Both Charts”
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

  // If the user explicitly chose Accuracy Only or Response Only,
  // remember which chart they were editing last.
  if (plotTarget === "accuracy" || plotTarget === "response") {
    lastPlotTarget = plotTarget;
  }

  drawBothCharts();
}


// ─────────────────────────────────────────────────────────────
// When the “Apply filters to” dropdown itself changes, we must:
//  1) Stash the UI’s current values into the filter set for whichever chart
//     was active just prior (tracked by lastPlotTarget).
//  2) Then restore the UI inputs from whichever filter‐object belongs to
//     the newly selected chart (or, if “Both Charts,” from whichever was last edited).
//  3) Finally, redraw both charts.
// ─────────────────────────────────────────────────────────────
function onPlotTargetChange() {
  const newTarget     = d3.select("#plot-target").node().value; // “accuracy”, “response”, or “both”
  const currentFilter = getCurrentFilters();

  // (1) Stash current UI into whichever filter was active prior:
  if (lastPlotTarget === "accuracy") {
    accuracyFilters = currentFilter;
  } else if (lastPlotTarget === "response") {
    responseFilters = currentFilter;
  } else {
    // lastPlotTarget was “both” (initially), so stash into both
    accuracyFilters = currentFilter;
    responseFilters = currentFilter;
  }

  // (2) Restore UI from the filter object for the newly selected target:
  if (newTarget === "accuracy") {
    restoreInputsFrom(accuracyFilters);
  } else if (newTarget === "response") {
    restoreInputsFrom(responseFilters);
  } else {
    // newTarget = “both charts” → restore from whichever was last edited
    if (lastPlotTarget === "accuracy") {
      restoreInputsFrom(accuracyFilters);
    } else if (lastPlotTarget === "response") {
      restoreInputsFrom(responseFilters);
    } else {
      // if lastPlotTarget was already “both” (first load), just restore accuracy by default
      restoreInputsFrom(accuracyFilters);
    }
  }

  // (3) Update lastPlotTarget to reflect the new selection
  lastPlotTarget = newTarget;

  // Redraw both charts using the (possibly updated) filter sets
  drawBothCharts();
}


// ─────────────────────────────────────────────────────────────
// Remove & redraw BOTH charts, each with its own filter set.
// ─────────────────────────────────────────────────────────────
function drawBothCharts() {
  d3.select("#accuracy-chart-container").selectAll("*").remove();
  d3.select("#response-chart-container").selectAll("*").remove();

  const accFiltered = filterData(accuracyFilters);
  const resFiltered = filterData(responseFilters);

  const accAgg = aggregateData(accFiltered, accuracyFilters.xAxisChoice, "correct");
  const resAgg = aggregateData(resFiltered, responseFilters.xAxisChoice, "Response_Time");

  drawChart(
    "#accuracy-chart-container",
    accAgg,
    accuracyFilters.xAxisChoice,
    "Accuracy",
    d => d.mean
  );
  drawChart(
    "#response-chart-container",
    resAgg,
    responseFilters.xAxisChoice,
    "Response Time (ms)",
    d => d.mean
  );
}


// ─────────────────────────────────────────────────────────────
// Apply one chart’s filter‐object to fullData and return the subset.
// Also exclude TrialNumber 9 (rest trial).
// ─────────────────────────────────────────────────────────────
function filterData(filters) {
  return fullData.filter(d =>
    // 1) Task filter: “both” or exact lowercase match of n_back
    (filters.taskFilter === "both" || d.n_back.toLowerCase() === filters.taskFilter) &&

    // 2) Participant filter: “all” or exact match
    (filters.participant === "all" || d.participant_id === filters.participant) &&

    // 3) Session‐type filter: row’s session_type must be in array
    filters.sessionTypes.includes(d.session_type) &&

    // 4) TrialNumber filter: numeric ≤ trialMax and not equal to 9
    +d.TrialNumber <= filters.trialMax &&
    +d.TrialNumber !== 9
  );
}


// ─────────────────────────────────────────────────────────────
// From filtered data, group by xKey and session_type, compute mean & std.
// ─────────────────────────────────────────────────────────────
function aggregateData(data, xKey, metric) {
  // If xKey is numeric, coerce; otherwise treat as string
  const keyFn = xKey === "TrialNumber"
    ? d => +d[xKey]
    : d => d[xKey];

  const nested = d3.rollups(
    data,
    v => {
      const vals = v.map(d => +d[metric]);
      return {
        mean: d3.mean(vals),
        std:  d3.deviation(vals)
      };
    },
    keyFn,
    d => d.session_type
  );

  return nested.flatMap(([xVal, sessions]) =>
    sessions.map(([session, stats]) => ({
      [xKey]: xVal,
      session_type: session,
      mean: stats.mean,
      std: stats.std
    }))
  );
}


// ─────────────────────────────────────────────────────────────
// Draw one chart into containerId using aggregated data.
// If xKey === “TrialNumber”, use a numeric scale; otherwise a categorical scale.
// ─────────────────────────────────────────────────────────────
function drawChart(containerId, data, xKey, yLabel, yAccessor) {
  const svg = d3.select(containerId)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // 1) Build x-scale
  let x;
  if (xKey === "TrialNumber") {
    const numericX = data.map(d => +d[xKey]);
    const xExtent  = d3.extent(numericX); // e.g. [1, 16]
    x = d3.scaleLinear()
          .domain(xExtent)
          .nice()
          .range([0, width]);
  } else {
    const letters = [...new Set(data.map(d => d[xKey]))]
                     .sort((a, b) => d3.ascending(a, b));
    x = d3.scalePoint()
          .domain(letters)
          .range([0, width]);
  }

  // 2) Build y-scale (always numeric)
  const y = d3.scaleLinear()
    .domain([0, d3.max(data, yAccessor) * 1.1])
    .nice()
    .range([height, 0]);

  // 3) Draw axes
  const xAxisGen = xKey === "TrialNumber"
    ? d3.axisBottom(x).ticks(Math.min(16, data.length))
    : d3.axisBottom(x);

  svg.append("g")
    .attr("transform", `translate(0,${height})`)
    .call(xAxisGen);

  svg.append("g")
    .call(d3.axisLeft(y));

  // 4) Build the line generator
  const line = d3.line()
    .defined(d => {
      if (xKey === "TrialNumber") {
        return !isNaN(+d[xKey]) && !isNaN(yAccessor(d));
      } else {
        return !isNaN(yAccessor(d));
      }
    })
    .x(d => (xKey === "TrialNumber" ? x(+d[xKey]) : x(d[xKey])))
    .y(d => y(yAccessor(d)));

  // 5) Group by session_type and sort appropriately
  const grouped = d3.group(data, d => d.session_type);
  for (const [session, values] of grouped.entries()) {
    if (xKey === "TrialNumber") {
      values.sort((a, b) => d3.ascending(+a[xKey], +b[xKey]));
    } else {
      values.sort((a, b) => d3.ascending(a[xKey], b[xKey]));
    }

    // 5a) Draw the line
    svg.append("path")
      .datum(values)
      .attr("fill", "none")
      .attr("stroke", colorMap[session])
      .attr("stroke-width", 2)
      .attr("d", line);

    // 5b) Draw circles at each point
    svg.selectAll(null)
      .data(values)
      .enter()
      .append("circle")
      .attr("cx", d => (xKey === "TrialNumber" ? x(+d[xKey]) : x(d[xKey])))
      .attr("cy", d => y(yAccessor(d)))
      .attr("r", 4)
      .attr("fill", colorMap[session])
      .append("title")
      .text(d =>
        `${xKey}: ${xKey === "TrialNumber" ? +d[xKey] : d[xKey]}\n` +
        `${yLabel}: ${d3.format(".2f")(yAccessor(d))}\n` +
        `Session: ${d.session_type}`
      );
  }

  // 6) Titles & Labels
  svg.append("text")
    .attr("x", width / 2)
    .attr("y", -20)
    .style("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold")
    .text(`${yLabel} by ${xKey}`);

  svg.append("text")
    .attr("x", width / 2)
    .attr("y", height + 40)
    .style("text-anchor", "middle")
    .text(xKey);

  svg.append("text")
    .attr("transform", "rotate(-90)")
    .attr("x", -height / 2)
    .attr("y", -50)
    .style("text-anchor", "middle")
    .text(yLabel);

  // 7) Legend
  const legend = svg.selectAll(".legend")
    .data(Array.from(grouped.keys()))
    .enter().append("g")
    .attr("transform", (d, i) => `translate(${width + 20},${i * 25})`);

  legend.append("rect")
    .attr("x", 0)
    .attr("width", 15)
    .attr("height", 15)
    .style("fill", d => colorMap[d]);

  legend.append("text")
    .attr("x", 20)
    .attr("y", 12)
    .text(d => d);
}
